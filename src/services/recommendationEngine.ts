import { DESTINATION_KEYWORDS, TRIP_TYPES } from '../constants';
import {
  CategoryName,
  DestinationType,
  ItemCategory,
  RecommendationInput,
  RecommendedItem,
  ScalingRule,
  TemplateItem,
  TripType,
} from '../types';
import { getAllCategories } from '../database/queries/itemQueries';
import {
  getAllTemplates,
  getTemplateById,
  getTemplateByTripType,
  getTemplateItems,
} from '../database/queries/templateQueries';

/**
 * Infers destination environment offline using local keyword dictionaries
 * with fallback to the chosen trip type's default environment.
 */
export function inferDestinationType(
  destination: string,
  tripType: TripType
): DestinationType {
  const normalized = destination.trim().toLowerCase();
  if (normalized.length > 0) {
    const priorityOrder: DestinationType[] = [
      'Beach',
      'Mountain',
      'Nature',
      'International',
      'City',
      'Resort',
    ];
    for (const env of priorityOrder) {
      const keywords = DESTINATION_KEYWORDS[env];
      if (keywords.some((kw) => normalized.includes(kw))) {
        return env;
      }
    }
  }

  const tripMeta = TRIP_TYPES.find((t) => t.value === tripType);
  return tripMeta?.defaultDestinationType ?? 'General';
}

/**
 * Calculates recommended item quantity based on trip duration, scaling rule,
 * and number of travellers (individual vs shared items).
 */
export function calculateScaledQuantity(
  defaultQuantity: number,
  scalingRule: ScalingRule,
  perTraveller: boolean,
  tripDuration: number,
  travellerCount: number
): number {
  const days = Math.max(1, tripDuration);
  const travellers = Math.max(1, travellerCount);

  let perPersonQty = defaultQuantity;

  switch (scalingRule) {
    case 'daily':
      // Suggests enough for each day + 1 spare, capped at 10 for practical laundry cycles
      perPersonQty = Math.min(Math.max(defaultQuantity, days + 1), 10);
      break;
    case 'half_days':
      perPersonQty = Math.min(Math.max(defaultQuantity, Math.ceil(days / 2)), 7);
      break;
    case 'third_days':
      perPersonQty = Math.min(Math.max(defaultQuantity, Math.ceil(days / 3)), 5);
      break;
    case 'weekly':
      perPersonQty = Math.max(defaultQuantity, Math.ceil(days / 5));
      break;
    case 'fixed':
    default:
      perPersonQty = defaultQuantity;
      break;
  }

  const totalQty = perTraveller
    ? perPersonQty * travellers
    : travellers >= 4
    ? perPersonQty * Math.ceil(travellers / 3)
    : perPersonQty;

  return Math.max(1, Math.min(99, Math.round(totalQty)));
}

function normalizeDedupeKey(name: string): string {
  const lower = name.trim().toLowerCase();
  if (lower.includes('passport') && !lower.includes('photocop')) return 'canonical_passport';
  if (lower.includes('sunscreen')) return 'canonical_sunscreen';
  if (lower.includes('toothbrush')) return 'canonical_toothbrush_kit';
  if (lower.includes('sunglasses')) return 'canonical_sunglasses';
  if (lower.includes('first-aid') || lower.includes('medical kit')) return 'canonical_first_aid';
  if (lower.includes('universal') && lower.includes('adapter')) return 'canonical_power_adapter';
  return lower.replace(/[^a-z0-9]+/g, '_');
}

interface SupplementaryRuleItem {
  item_name: string;
  category_name: CategoryName;
  default_quantity: number;
  is_essential: boolean;
  scaling_rule: ScalingRule;
  per_traveller: boolean;
  reason: string;
}

function getSupplementaryRules(input: RecommendationInput): SupplementaryRuleItem[] {
  const extras: SupplementaryRuleItem[] = [];
  const inferredEnv = inferDestinationType(input.destination, input.tripType);
  const effectiveEnv =
    input.destinationType !== 'General' ? input.destinationType : inferredEnv;

  if (effectiveEnv === 'Beach' || inferredEnv === 'Beach') {
    extras.push(
      {
        item_name: 'Swimwear / Swim Trunks',
        category_name: 'Clothing',
        default_quantity: 2,
        is_essential: true,
        scaling_rule: 'third_days',
        per_traveller: true,
        reason: 'Coastal destination rule',
      },
      {
        item_name: 'Reef-Safe Sunscreen SPF 50+',
        category_name: 'Toiletries',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'weekly',
        per_traveller: false,
        reason: 'Coastal UV protection',
      },
      {
        item_name: 'Flip-Flops / Beach Sandals',
        category_name: 'Accessories',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'fixed',
        per_traveller: true,
        reason: 'Beach footwear essential',
      }
    );
  }

  if (effectiveEnv === 'Mountain' || inferredEnv === 'Mountain') {
    extras.push(
      {
        item_name: 'Insulated Warm Down / Windproof Jacket',
        category_name: 'Clothing',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'fixed',
        per_traveller: true,
        reason: 'Highland cool-climate rule',
      },
      {
        item_name: 'Thermal Base Layer Set (Top & Bottom)',
        category_name: 'Clothing',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'half_days',
        per_traveller: true,
        reason: 'Mountain temperature layering',
      },
      {
        item_name: 'Warm Knit Beanie, Gloves & Trail Cap',
        category_name: 'Accessories',
        default_quantity: 1,
        is_essential: false,
        scaling_rule: 'fixed',
        per_traveller: true,
        reason: 'Cold-weather accessory',
      }
    );
  }

  if (
    effectiveEnv === 'International' ||
    inferredEnv === 'International' ||
    input.destination.includes(',')
  ) {
    extras.push(
      {
        item_name: 'Valid Passport (6+ Months Validity)',
        category_name: 'Documents',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'fixed',
        per_traveller: true,
        reason: 'Cross-border travel requirement',
      },
      {
        item_name: 'Universal Multi-Country Power Adapter',
        category_name: 'Electronics',
        default_quantity: 1,
        is_essential: true,
        scaling_rule: 'fixed',
        per_traveller: false,
        reason: 'International socket compatibility',
      }
    );
  }

  if (input.tripDuration >= 7) {
    extras.push({
      item_name: 'Travel Laundry Detergent Sheets & Laundry Bag',
      category_name: 'Travel Essentials',
      default_quantity: 1,
      is_essential: false,
      scaling_rule: 'fixed',
      per_traveller: false,
      reason: `Extended ${input.tripDuration}-day stay rule`,
    });
  }

  if (input.travellerCount >= 2) {
    extras.push({
      item_name: 'Multi-Port USB Charging Hub',
      category_name: 'Electronics',
      default_quantity: 1,
      is_essential: false,
      scaling_rule: 'fixed',
      per_traveller: false,
      reason: `Shared charger for ${input.travellerCount} travellers`,
    });
  }

  return extras;
}

/**
 * Pure recommendation computation over template items and categories (easily unit-tested).
 */
export function buildRecommendationsFromTemplateItems(
  baseItems: TemplateItem[],
  categories: ItemCategory[],
  input: RecommendationInput,
  templateLabel: string,
  includeSupplementary = true
): RecommendedItem[] {
  const catByName = new Map<CategoryName, ItemCategory>();
  const catOrderById = new Map<number, number>();
  for (const cat of categories) {
    catByName.set(cat.name, cat);
    catOrderById.set(cat.id, cat.sort_order);
  }

  const merged = new Map<string, RecommendedItem>();

  for (const item of baseItems) {
    const qty = calculateScaledQuantity(
      item.default_quantity,
      item.scaling_rule,
      item.per_traveller === 1,
      input.tripDuration,
      input.travellerCount
    );
    const dedupeKey = normalizeDedupeKey(item.item_name);

    merged.set(dedupeKey, {
      key: dedupeKey,
      item_name: item.item_name,
      category_id: item.category_id,
      category_name: item.category_name,
      category_color: item.category_color,
      quantity: qty,
      is_essential: item.is_essential === 1,
      reason: `${templateLabel} template`,
      selected: true,
    });
  }

  if (includeSupplementary) {
    const extras = getSupplementaryRules(input);
    for (const extra of extras) {
      const cat = catByName.get(extra.category_name);
      if (!cat) continue;

      const qty = calculateScaledQuantity(
        extra.default_quantity,
        extra.scaling_rule,
        extra.per_traveller,
        input.tripDuration,
        input.travellerCount
      );
      const dedupeKey = normalizeDedupeKey(extra.item_name);
      const existing = merged.get(dedupeKey);

      if (existing) {
        existing.quantity = Math.max(existing.quantity, qty);
        existing.is_essential = existing.is_essential || extra.is_essential;
      } else {
        merged.set(dedupeKey, {
          key: dedupeKey,
          item_name: extra.item_name,
          category_id: cat.id,
          category_name: cat.name,
          category_color: cat.color_hex,
          quantity: qty,
          is_essential: extra.is_essential,
          reason: extra.reason,
          selected: true,
        });
      }
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (a.is_essential !== b.is_essential) {
      return a.is_essential ? -1 : 1;
    }
    const orderA = catOrderById.get(a.category_id) ?? 99;
    const orderB = catOrderById.get(b.category_id) ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.item_name.localeCompare(b.item_name);
  });
}

/**
 * Generates an intelligent, deduplicated offline packing recommendation list
 * from SQLite templates + local destination/duration/traveller rules.
 */
export async function generateIntelligentPackingList(
  input: RecommendationInput,
  explicitTemplateId?: number
): Promise<{
  templateName: string;
  items: RecommendedItem[];
}> {
  const categories = await getAllCategories();

  let template = explicitTemplateId
    ? await getTemplateById(explicitTemplateId)
    : await getTemplateByTripType(input.tripType);

  if (!template) {
    const all = await getAllTemplates();
    template = all[0] ?? null;
  }

  if (!template) {
    return { templateName: input.tripType, items: [] };
  }

  const baseItems = await getTemplateItems(template.id);
  const items = buildRecommendationsFromTemplateItems(
    baseItems,
    categories,
    input,
    template.template_name,
    true
  );

  return {
    templateName: template.template_name,
    items,
  };
}
