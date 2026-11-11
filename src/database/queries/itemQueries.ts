import {
  CreatePackingItemInput,
  ItemCategory,
  PackingItem,
  UpdatePackingItemInput,
} from '../../types';
import { getDatabase } from '../index';

const ITEM_SELECT_WITH_CATEGORY = `
  SELECT
    pi.*,
    ic.name AS category_name,
    ic.color_hex AS category_color,
    ic.icon_name AS category_icon
  FROM packing_items pi
  INNER JOIN item_categories ic ON ic.id = pi.category_id
`;

export async function getAllCategories(): Promise<ItemCategory[]> {
  const db = await getDatabase();
  return db.getAllAsync<ItemCategory>(
    'SELECT * FROM item_categories ORDER BY sort_order ASC'
  );
}

export async function getItemsByTripId(tripId: number): Promise<PackingItem[]> {
  const db = await getDatabase();
  return db.getAllAsync<PackingItem>(
    `${ITEM_SELECT_WITH_CATEGORY}
     WHERE pi.trip_id = ?
     ORDER BY ic.sort_order ASC, pi.is_packed ASC, pi.is_essential DESC, pi.item_name ASC`,
    [tripId]
  );
}

export async function getPackingItemById(
  itemId: number
): Promise<PackingItem | null> {
  const db = await getDatabase();
  return db.getFirstAsync<PackingItem>(
    `${ITEM_SELECT_WITH_CATEGORY}
     WHERE pi.id = ?`,
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

export async function addPackingItem(
  input: CreatePackingItemInput
): Promise<number> {
  const db = await getDatabase();
  const cleanName = input.item_name.trim();
  if (!cleanName) {
    throw new Error('Item name cannot be empty.');
  }

  const duplicate = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM packing_items
     WHERE trip_id = ? AND LOWER(TRIM(item_name)) = LOWER(?)`,
    [input.trip_id, cleanName]
  );

  if (duplicate) {
    throw new Error(`"${cleanName}" is already in this trip's packing list.`);
  }

  const now = new Date().toISOString();
  const safeQty = Math.max(1, Math.min(99, Math.round(input.quantity || 1)));

  const res = await db.runAsync(
    `INSERT INTO packing_items
      (trip_id, item_name, category_id, quantity, is_packed, is_essential, notes, is_custom, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.trip_id,
      cleanName,
      input.category_id,
      safeQty,
      input.is_packed ?? 0,
      input.is_essential ?? 1,
      (input.notes ?? '').trim(),
      input.is_custom ?? 1,
      now,
    ]
  );

  await touchTripTimestamp(input.trip_id);
  return res.lastInsertRowId;
}

/**
 * Inserts multiple recommended or template items into a trip inside an atomic transaction,
 * automatically skipping any item whose normalized name already exists on the trip.
 * Returns { addedCount, skippedCount }.
 */
export async function addPackingItemsBatchDeduplicated(
  tripId: number,
  items: Omit<CreatePackingItemInput, 'trip_id'>[]
): Promise<{ addedCount: number; skippedCount: number }> {
  const db = await getDatabase();
  const existingRows = await db.getAllAsync<{ item_name: string }>(
    'SELECT item_name FROM packing_items WHERE trip_id = ?',
    [tripId]
  );

  const seenNames = new Set(
    existingRows.map((r) => r.item_name.trim().toLowerCase())
  );

  let addedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      const cleanName = item.item_name.trim();
      if (!cleanName) continue;
      const key = cleanName.toLowerCase();

      if (seenNames.has(key)) {
        skippedCount += 1;
        continue;
      }

      seenNames.add(key);
      const safeQty = Math.max(1, Math.min(99, Math.round(item.quantity || 1)));

      await db.runAsync(
        `INSERT INTO packing_items
          (trip_id, item_name, category_id, quantity, is_packed, is_essential, notes, is_custom, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tripId,
          cleanName,
          item.category_id,
          safeQty,
          item.is_packed ?? 0,
          item.is_essential ?? 1,
          (item.notes ?? '').trim(),
          item.is_custom ?? 0,
          now,
        ]
      );
      addedCount += 1;
    }

    await db.runAsync('UPDATE trips SET updated_at = ? WHERE id = ?', [
      now,
      tripId,
    ]);
  });

  return { addedCount, skippedCount };
}

export async function updatePackingItem(
  itemId: number,
  input: UpdatePackingItemInput
): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<PackingItem>(
    'SELECT * FROM packing_items WHERE id = ?',
    [itemId]
  );
  if (!existing) {
    throw new Error('Packing item not found.');
  }

  const nextName =
    input.item_name !== undefined
      ? input.item_name.trim()
      : existing.item_name;
  if (!nextName) {
    throw new Error('Item name cannot be empty.');
  }

  if (nextName.toLowerCase() !== existing.item_name.trim().toLowerCase()) {
    const duplicate = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM packing_items
       WHERE trip_id = ? AND id != ? AND LOWER(TRIM(item_name)) = LOWER(?)`,
      [existing.trip_id, itemId, nextName]
    );
    if (duplicate) {
      throw new Error(`"${nextName}" already exists in this packing list.`);
    }
  }

  const nextQty =
    input.quantity !== undefined
      ? Math.max(1, Math.min(99, Math.round(input.quantity)))
      : existing.quantity;

  await db.runAsync(
    `UPDATE packing_items
     SET item_name = ?,
         category_id = ?,
         quantity = ?,
         is_packed = ?,
         is_essential = ?,
         notes = ?
     WHERE id = ?`,
    [
      nextName,
      input.category_id ?? existing.category_id,
      nextQty,
      input.is_packed ?? existing.is_packed,
      input.is_essential ?? existing.is_essential,
      input.notes !== undefined ? input.notes.trim() : existing.notes,
      itemId,
    ]
  );

  await touchTripTimestamp(existing.trip_id);
}

export async function togglePackingItemPacked(
  itemId: number,
  nextPacked?: boolean
): Promise<number> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ trip_id: number; is_packed: number }>(
    'SELECT trip_id, is_packed FROM packing_items WHERE id = ?',
    [itemId]
  );
  if (!existing) {
    throw new Error('Item not found.');
  }

  const targetVal =
    nextPacked !== undefined
      ? nextPacked
        ? 1
        : 0
      : existing.is_packed === 1
      ? 0
      : 1;

  await db.runAsync('UPDATE packing_items SET is_packed = ? WHERE id = ?', [
    targetVal,
    itemId,
  ]);
  await touchTripTimestamp(existing.trip_id);
  return targetVal;
}

export async function updatePackingItemQuantity(
  itemId: number,
  quantity: number
): Promise<void> {
  const safeQty = Math.max(1, Math.min(99, Math.round(quantity)));
  await updatePackingItem(itemId, { quantity: safeQty });
}

export async function deletePackingItem(itemId: number): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<{ trip_id: number }>(
    'SELECT trip_id FROM packing_items WHERE id = ?',
    [itemId]
  );
  await db.runAsync('DELETE FROM packing_items WHERE id = ?', [itemId]);
  if (existing) {
    await touchTripTimestamp(existing.trip_id);
  }
}

/**
 * Clones all packing items from a historical/existing trip into a newly created trip
 * with is_packed reset to 0, leaving the source historical trip 100% untouched.
 */
export async function cloneTripItemsToNewTrip(
  sourceTripId: number,
  targetTripId: number
): Promise<number> {
  const sourceItems = await getItemsByTripId(sourceTripId);
  if (sourceItems.length === 0) return 0;

  const { addedCount } = await addPackingItemsBatchDeduplicated(
    targetTripId,
    sourceItems.map((item) => ({
      item_name: item.item_name,
      category_id: item.category_id,
      quantity: item.quantity,
      is_packed: 0,
      is_essential: item.is_essential,
      notes: item.notes,
      is_custom: item.is_custom,
    }))
  );

  return addedCount;
}
