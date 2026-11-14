import {
  CreateTripEssentialInput,
  DepartureReadinessSummary,
  EssentialCategory,
  EssentialCategorySummary,
  EssentialItemDefinition,
  ForgetPreventionAlert,
  Trip,
  TripEssentialItem,
  UpdateTripEssentialInput,
} from '../../types';
import { getDatabase } from '../index';
import { SEED_ESSENTIAL_CATEGORIES, SEED_ESSENTIAL_DEFINITIONS } from '../seed/essentialSeedData';

const ESSENTIAL_ITEM_SELECT = `
  SELECT
    tei.*,
    ec.name AS category_name,
    ec.color_hex AS category_color,
    ec.icon_name AS category_icon
  FROM trip_essential_items tei
  INNER JOIN essential_categories ec ON ec.id = tei.category_id
`;

export async function getAllEssentialCategories(): Promise<EssentialCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<EssentialCategory>(
    'SELECT * FROM essential_categories ORDER BY sort_order ASC'
  );
}

export async function getEssentialDefinitions(): Promise<EssentialItemDefinition[]> {
  const db = await getDatabase();
  return db.getAllAsync<EssentialItemDefinition>(
    `SELECT eid.*, ec.name AS category_name
     FROM essential_item_definitions eid
     INNER JOIN essential_categories ec ON ec.id = eid.category_id
     ORDER BY ec.sort_order ASC, eid.is_critical DESC, eid.item_name ASC`
  );
}

export async function getTripEssentialItems(tripId: number): Promise<TripEssentialItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<TripEssentialItem>(
    `${ESSENTIAL_ITEM_SELECT}
     WHERE tei.trip_id = ?
     ORDER BY
       tei.is_critical DESC,
       CASE tei.priority
         WHEN 'Critical' THEN 1
         WHEN 'High' THEN 2
         ELSE 3
       END ASC,
       ec.sort_order ASC,
       tei.is_checked ASC,
       tei.item_name ASC`,
    [tripId]
  );
}

export async function getTripEssentialItemById(itemId: number): Promise<TripEssentialItem | null> {
  const db = await getDatabase();
  return db.getFirstAsync<TripEssentialItem>(
    `${ESSENTIAL_ITEM_SELECT} WHERE tei.id = ?`,
    [itemId]
  );
}

async function touchTripTimestamp(tripId: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE trips SET updated_at = ? WHERE id = ?', [
    new Date().toISOString(),
    tripId,
  ]);
}

export async function addTripEssentialItem(
  input: CreateTripEssentialInput
): Promise<number> {
  const db = await getDatabase();
  const cleanName = input.item_name.trim();
  if (!cleanName) {
    throw new Error('Essential item name cannot be empty.');
  }

  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM trip_essential_items
     WHERE trip_id = ? AND LOWER(TRIM(item_name)) = LOWER(?)`,
    [input.trip_id, cleanName]
  );
  if (existing) {
    throw new Error(`"${cleanName}" already exists in your Don't Forget checklist.`);
  }

  const now = new Date().toISOString();
  const res = await db.runAsync(
    `INSERT INTO trip_essential_items
      (trip_id, definition_id, category_id, item_name, notes, scope, is_critical, priority, is_checked, is_verified, is_custom, verified_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, '', ?, ?)`,
    [
      input.trip_id,
      input.definition_id ?? null,
      input.category_id,
      cleanName,
      (input.notes ?? '').trim(),
      input.scope ?? 'general',
      input.is_critical ?? 0,
      input.priority ?? 'Standard',
      input.is_custom ?? 1,
      now,
      now,
    ]
  );

  await touchTripTimestamp(input.trip_id);
  return res.lastInsertRowId;
}

export async function updateTripEssentialItem(
  itemId: number,
  input: UpdateTripEssentialInput
): Promise<void> {
  const db = await getDatabase();
  const current = await db.getFirstAsync<TripEssentialItem>(
    'SELECT * FROM trip_essential_items WHERE id = ?',
    [itemId]
  );
  if (!current) {
    throw new Error('Essential item not found.');
  }

  const nextName = input.item_name !== undefined ? input.item_name.trim() : current.item_name;
  if (!nextName) {
    throw new Error('Item name cannot be empty.');
  }

  if (nextName.toLowerCase() !== current.item_name.trim().toLowerCase()) {
    const dup = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM trip_essential_items
       WHERE trip_id = ? AND id != ? AND LOWER(TRIM(item_name)) = LOWER(?)`,
      [current.trip_id, itemId, nextName]
    );
    if (dup) {
      throw new Error(`"${nextName}" already exists in this trip's checklist.`);
    }
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE trip_essential_items
     SET item_name = ?,
         category_id = ?,
         notes = ?,
         scope = ?,
         is_critical = ?,
         priority = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      nextName,
      input.category_id ?? current.category_id,
      input.notes !== undefined ? input.notes.trim() : current.notes,
      input.scope ?? current.scope,
      input.is_critical !== undefined ? input.is_critical : current.is_critical,
      input.priority ?? current.priority,
      now,
      itemId,
    ]
  );

  await touchTripTimestamp(current.trip_id);
}

export async function deleteTripEssentialItem(itemId: number): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ trip_id: number }>(
    'SELECT trip_id FROM trip_essential_items WHERE id = ?',
    [itemId]
  );
  await db.runAsync('DELETE FROM trip_essential_items WHERE id = ?', [itemId]);
  if (row) {
    await touchTripTimestamp(row.trip_id);
  }
}

export async function toggleEssentialItemChecked(
  itemId: number,
  nextChecked?: boolean
): Promise<{ isChecked: number; isVerified: number }> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ trip_id: number; is_checked: number; is_verified: number; is_critical: number }>(
    'SELECT trip_id, is_checked, is_verified, is_critical FROM trip_essential_items WHERE id = ?',
    [itemId]
  );
  if (!row) throw new Error('Item not found.');

  const targetChecked =
    nextChecked !== undefined
      ? nextChecked ? 1 : 0
      : row.is_checked === 1 ? 0 : 1;

  // If unchecking, verification is also cleared automatically
  const targetVerified = targetChecked === 0 ? 0 : row.is_verified;
  const verifiedAt = targetVerified === 1 ? new Date().toISOString() : '';
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE trip_essential_items
     SET is_checked = ?, is_verified = ?, verified_at = ?, updated_at = ?
     WHERE id = ?`,
    [targetChecked, targetVerified, verifiedAt, now, itemId]
  );

  await touchTripTimestamp(row.trip_id);
  return { isChecked: targetChecked, isVerified: targetVerified };
}

export async function verifyCriticalItem(itemId: number): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ trip_id: number; is_critical: number }>(
    'SELECT trip_id, is_critical FROM trip_essential_items WHERE id = ?',
    [itemId]
  );
  if (!row) throw new Error('Item not found.');

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE trip_essential_items
     SET is_checked = 1, is_verified = 1, verified_at = ?, updated_at = ?
     WHERE id = ?`,
    [now, now, itemId]
  );

  await touchTripTimestamp(row.trip_id);
}

export async function unverifyCriticalItem(itemId: number): Promise<void> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ trip_id: number }>(
    'SELECT trip_id FROM trip_essential_items WHERE id = ?',
    [itemId]
  );
  if (!row) throw new Error('Item not found.');

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE trip_essential_items
     SET is_verified = 0, verified_at = '', updated_at = ?
     WHERE id = ?`,
    [now, itemId]
  );

  await touchTripTimestamp(row.trip_id);
}

export async function resetAllEssentialItemsForTrip(tripId: number): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE trip_essential_items
     SET is_checked = 0, is_verified = 0, verified_at = '', updated_at = ?
     WHERE trip_id = ?`,
    [now, tripId]
  );
  await touchTripTimestamp(tripId);
}

/**
 * Intelligent rule-based offline generator that determines which essential items
 * apply to a specific trip based on destination, destination environment, duration, and trip type.
 * Populates trip_essential_items without duplicating already present items.
 */
export async function generateAndSyncTripEssentials(trip: Trip): Promise<{ added: number; total: number }> {
  const db = await getDatabase();
  const definitions = await getEssentialDefinitions();
  const existingItems = await db.getAllAsync<{ item_name: string }>(
    'SELECT item_name FROM trip_essential_items WHERE trip_id = ?',
    [trip.id]
  );
  const seenNames = new Set(existingItems.map((i) => i.item_name.trim().toLowerCase()));

  const destLower = trip.destination.toLowerCase();
  const isCrossBorder =
    trip.trip_type === 'International Travel' ||
    trip.destination_type === 'International' ||
    destLower.includes('bali') ||
    destLower.includes('singapore') ||
    destLower.includes('tokyo') ||
    destLower.includes('japan') ||
    destLower.includes('maldives') ||
    destLower.includes('europe') ||
    destLower.includes('dubai') ||
    destLower.includes('thailand') ||
    destLower.includes('bangkok') ||
    destLower.includes(',');

  let addedCount = 0;
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const def of definitions) {
      const normalizedName = def.item_name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) continue;

      // Evaluate applicability rules
      let shouldInclude = false;

      if (def.scope === 'general') {
        shouldInclude = true;
      } else if (def.scope === 'trip_specific') {
        const tripTypes = def.applicable_trip_types ? def.applicable_trip_types.split(',') : [];
        const destTypes = def.applicable_dest_types ? def.applicable_dest_types.split(',') : [];

        const matchesTripType = tripTypes.length === 0 || tripTypes.includes(trip.trip_type);
        const matchesDestType = destTypes.length === 0 || destTypes.includes(trip.destination_type);

        if (matchesTripType && matchesDestType) {
          shouldInclude = true;
        }

        // Cross-border specific boost
        if (isCrossBorder && (normalizedName.includes('visa') || normalizedName.includes('passport') || normalizedName.includes('adapter') || normalizedName.includes('currency'))) {
          shouldInclude = true;
        }

        // Coastal specific boost
        if ((destLower.includes('beach') || destLower.includes('coast') || trip.destination_type === 'Beach') &&
            (normalizedName.includes('sunscreen') || normalizedName.includes('swimwear'))) {
          shouldInclude = true;
        }

        // Alpine / trek specific boost
        if ((destLower.includes('mountain') || destLower.includes('ella') || destLower.includes('trek') || trip.destination_type === 'Mountain') &&
            (normalizedName.includes('hiking') || normalizedName.includes('jacket') || normalizedName.includes('headlamp'))) {
          shouldInclude = true;
        }

        // Business specific boost
        if (trip.trip_type === 'Business Trip' && (normalizedName.includes('laptop') || normalizedName.includes('formal'))) {
          shouldInclude = true;
        }
      }

      if (shouldInclude) {
        await db.runAsync(
          `INSERT INTO trip_essential_items
            (trip_id, definition_id, category_id, item_name, notes, scope, is_critical, priority, is_checked, is_verified, is_custom, verified_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, '', ?, ?, ?, 0, 0, 0, '', ?, ?)`,
          [
            trip.id,
            def.id,
            def.category_id,
            def.item_name,
            def.scope,
            def.is_critical,
            def.priority,
            now,
            now,
          ]
        );
        seenNames.add(normalizedName);
        addedCount += 1;
      }
    }

    if (addedCount > 0) {
      await db.runAsync('UPDATE trips SET updated_at = ? WHERE id = ?', [now, trip.id]);
    }
  });

  const totalCount = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM trip_essential_items WHERE trip_id = ?',
    [trip.id]
  );

  return { added: addedCount, total: totalCount?.count ?? 0 };
}

export async function getDepartureReadinessSummary(tripId: number): Promise<DepartureReadinessSummary> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    totalItems: number;
    checkedItems: number;
    verifiedCriticalItems: number;
    totalCriticalItems: number;
    unverifiedCriticalItems: number;
    missingItems: number;
    remainingImportantItems: number;
  }>(
    `SELECT
       COUNT(*) AS totalItems,
       COALESCE(SUM(CASE WHEN is_checked = 1 THEN 1 ELSE 0 END), 0) AS checkedItems,
       COALESCE(SUM(CASE WHEN is_critical = 1 AND is_verified = 1 THEN 1 ELSE 0 END), 0) AS verifiedCriticalItems,
       COALESCE(SUM(CASE WHEN is_critical = 1 THEN 1 ELSE 0 END), 0) AS totalCriticalItems,
       COALESCE(SUM(CASE WHEN is_critical = 1 AND is_verified = 0 THEN 1 ELSE 0 END), 0) AS unverifiedCriticalItems,
       COALESCE(SUM(CASE WHEN is_checked = 0 THEN 1 ELSE 0 END), 0) AS missingItems,
       COALESCE(SUM(CASE WHEN (priority IN ('Critical', 'High')) AND (is_checked = 0 OR (is_critical = 1 AND is_verified = 0)) THEN 1 ELSE 0 END), 0) AS remainingImportantItems
     FROM trip_essential_items
     WHERE trip_id = ?`,
    [tripId]
  );

  const total = row?.totalItems ?? 0;
  const checked = row?.checkedItems ?? 0;
  const totalCrit = row?.totalCriticalItems ?? 0;
  const verCrit = row?.verifiedCriticalItems ?? 0;
  const missing = row?.missingItems ?? 0;
  const unverCrit = row?.unverifiedCriticalItems ?? 0;
  const remImp = row?.remainingImportantItems ?? 0;

  // Formula: Weighted blend of checked items and verified critical items
  let readinessPercentage = 0;
  if (total > 0) {
    if (totalCrit > 0) {
      const checkedScore = (checked / total) * 60;
      const verifiedScore = (verCrit / totalCrit) * 40;
      readinessPercentage = Math.min(100, Math.round(checkedScore + verifiedScore));
    } else {
      readinessPercentage = Math.round((checked / total) * 100);
    }
  }

  // Strictly ready only if 100% of items are checked and 100% of critical items are verified
  const isFullyReady = total > 0 && missing === 0 && unverCrit === 0;
  if (isFullyReady) {
    readinessPercentage = 100;
  } else if (readinessPercentage === 100 && (missing > 0 || unverCrit > 0)) {
    readinessPercentage = 98; // Prevent false 100% when criticals unverified
  }

  return {
    tripId,
    totalItems: total,
    checkedItems: checked,
    verifiedCriticalItems: verCrit,
    totalCriticalItems: totalCrit,
    unverifiedCriticalItems: unverCrit,
    missingItems: missing,
    remainingImportantItems: remImp,
    readinessPercentage,
    isFullyReady,
  };
}

export async function getTripEssentialCategorySummaries(tripId: number): Promise<EssentialCategorySummary[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<EssentialCategorySummary>(
    `SELECT
       ec.id AS category_id,
       ec.name AS category_name,
       ec.icon_name,
       ec.color_hex,
       COUNT(tei.id) AS total,
       COALESCE(SUM(CASE WHEN tei.is_checked = 1 THEN 1 ELSE 0 END), 0) AS checked,
       COALESCE(SUM(CASE WHEN tei.is_critical = 1 AND tei.is_verified = 1 THEN 1 ELSE 0 END), 0) AS verifiedCritical,
       COALESCE(SUM(CASE WHEN tei.is_critical = 1 THEN 1 ELSE 0 END), 0) AS totalCritical,
       COALESCE(SUM(CASE WHEN tei.is_checked = 0 THEN 1 ELSE 0 END), 0) AS missing
     FROM essential_categories ec
     LEFT JOIN trip_essential_items tei ON tei.category_id = ec.id AND tei.trip_id = ?
     GROUP BY ec.id
     ORDER BY ec.sort_order ASC`,
    [tripId]
  );
  return rows;
}

export async function getForgetPreventionAlerts(tripId: number): Promise<ForgetPreventionAlert[]> {
  const db = await getDatabase();
  const items = await getTripEssentialItems(tripId);
  const alerts: ForgetPreventionAlert[] = [];

  // Critical items that have not been verified
  const unverifiedCritical = items.filter((i) => i.is_critical === 1 && i.is_verified === 0);
  for (const item of unverifiedCritical) {
    const itemNameLower = item.item_name.toLowerCase();
    let message = `Your ${item.item_name} has not been verified yet. Check and confirm before leaving home.`;
    if (itemNameLower.includes('passport')) {
      message = 'Your passport has not been physically verified yet! You will be denied boarding without it.';
    } else if (itemNameLower.includes('ticket') || itemNameLower.includes('boarding pass')) {
      message = 'You haven’t confirmed your travel tickets & boarding passes.';
    } else if (itemNameLower.includes('key')) {
      message = 'Your house keys are still unverified. Double-check before locking your doors.';
    } else if (itemNameLower.includes('medicine')) {
      message = 'Remember to pack your essential prescription medicines.';
    } else if (itemNameLower.includes('phone') || itemNameLower.includes('charger')) {
      message = `Your ${item.item_name} has not been confirmed packed.`;
    }

    alerts.push({
      id: `crit_${item.id}`,
      itemId: item.id,
      title: 'Critical Item Unverified',
      message,
      severity: 'critical',
      categoryName: item.category_name,
    });
  }

  // High priority unchecked items
  const uncheckedHigh = items.filter((i) => i.is_critical === 0 && i.priority === 'High' && i.is_checked === 0);
  for (const item of uncheckedHigh.slice(0, 3)) {
    alerts.push({
      id: `high_${item.id}`,
      itemId: item.id,
      title: 'Important Item Missing',
      message: `Don’t forget to pack: ${item.item_name}`,
      severity: 'warning',
      categoryName: item.category_name,
    });
  }

  if (items.length > 0 && alerts.length === 0) {
    alerts.push({
      id: 'all_ready',
      title: 'Departure Ready!',
      message: 'All critical items are verified and departure essentials are safely packed.',
      severity: 'info',
    });
  }

  return alerts;
}

/**
 * Seeds default essential categories and definitions idempotently.
 */
export async function seedEssentialDataIfNeeded(db: any): Promise<void> {
  const catCount = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM essential_categories'
  );
  const defCount = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM essential_item_definitions'
  );

  if ((catCount?.count ?? 0) >= 6 && (defCount?.count ?? 0) >= 30) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const cat of SEED_ESSENTIAL_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO essential_categories (name, icon_name, color_hex, description, sort_order)
         VALUES (?, ?, ?, ?, ?)`,
        [cat.name, cat.icon_name, cat.color_hex, cat.description, cat.sort_order]
      );
    }

    const categories = await db.getAllAsync(
      'SELECT id, name FROM essential_categories'
    );
    const catMap = new Map<string, number>();
    for (const c of categories) {
      catMap.set(c.name, c.id);
    }

    for (const def of SEED_ESSENTIAL_DEFINITIONS) {
      const catId = catMap.get(def.category);
      if (!catId) continue;

      const appTrips = def.applicable_trip_types ? def.applicable_trip_types.join(',') : '';
      const appDests = def.applicable_dest_types ? def.applicable_dest_types.join(',') : '';

      await db.runAsync(
        `INSERT OR IGNORE INTO essential_item_definitions
          (category_id, item_name, description, is_critical, priority, scope, applicable_trip_types, applicable_dest_types, min_duration, is_default_selected)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          catId,
          def.item_name,
          def.description,
          def.is_critical ? 1 : 0,
          def.priority,
          def.scope,
          appTrips,
          appDests,
          def.min_duration ?? 1,
          def.is_default_selected !== false ? 1 : 0,
        ]
      );
    }
  });
}
