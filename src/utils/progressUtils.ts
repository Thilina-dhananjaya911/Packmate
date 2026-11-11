import { CategoryProgress, ItemCategory, PackingItem } from '../types';

export interface ProgressMetrics {
  totalItems: number;
  packedItems: number;
  remainingItems: number;
  percentage: number;
}

/**
 * Packing Progress = (Number of Packed Items / Total Packing Items) * 100
 * Safely handles empty packing lists by returning 0%.
 */
export function calculatePackingProgress(
  packedCount: number,
  totalCount: number
): ProgressMetrics {
  const safeTotal = Math.max(0, totalCount);
  const safePacked = Math.min(Math.max(0, packedCount), safeTotal);
  const remaining = Math.max(0, safeTotal - safePacked);
  const percentage =
    safeTotal === 0 ? 0 : Math.round((safePacked / safeTotal) * 100);

  return {
    totalItems: safeTotal,
    packedItems: safePacked,
    remainingItems: remaining,
    percentage,
  };
}

export function calculateProgressFromItems(items: PackingItem[]): ProgressMetrics {
  const total = items.length;
  const packed = items.reduce((sum, item) => sum + (item.is_packed === 1 ? 1 : 0), 0);
  return calculatePackingProgress(packed, total);
}

export function computeCategoryProgress(
  items: PackingItem[],
  categories: ItemCategory[]
): CategoryProgress[] {
  return categories.map((cat) => {
    const catItems = items.filter((item) => item.category_id === cat.id);
    const metrics = calculateProgressFromItems(catItems);
    return {
      category_id: cat.id,
      category_name: cat.name,
      color_hex: cat.color_hex,
      icon_name: cat.icon_name,
      total: metrics.totalItems,
      packed: metrics.packedItems,
      remaining: metrics.remainingItems,
      percentage: metrics.percentage,
    };
  });
}
