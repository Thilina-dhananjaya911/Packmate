import { APP_INFO } from '../../constants';
import { DatabaseInfo, ThemeMode } from '../../types';
import { getDatabase, seedInitialDataIfNeeded, syncAutomaticTripStatuses } from '../index';
import { buildDemoJourneys } from '../seed/demoJourneys';

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [key]
  );
  return row ? row.value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, now]
  );
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const val = await getSetting('onboarding_completed');
  return val === '1';
}

export async function setOnboardingCompleted(completed: boolean): Promise<void> {
  await setSetting('onboarding_completed', completed ? '1' : '0');
}

export async function getThemeModeSetting(): Promise<ThemeMode> {
  const val = await getSetting('theme_mode');
  return val === 'dark' ? 'dark' : 'light';
}

export async function setThemeModeSetting(mode: ThemeMode): Promise<void> {
  await setSetting('theme_mode', mode);
}

export async function getDatabaseInfo(): Promise<DatabaseInfo> {
  const db = await getDatabase();

  const tripRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM trips'
  );
  const completedRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM trips WHERE status = 'Completed'"
  );
  const itemRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM packing_items'
  );
  const customRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM packing_items WHERE is_custom = 1'
  );
  const templateRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM packing_templates'
  );
  const templateItemRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM template_items'
  );
  const categoryRow = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM item_categories'
  );

  return {
    databaseName: APP_INFO.DATABASE_NAME,
    tripCount: tripRow?.count ?? 0,
    completedTripCount: completedRow?.count ?? 0,
    packingItemCount: itemRow?.count ?? 0,
    customItemCount: customRow?.count ?? 0,
    templateCount: templateRow?.count ?? 0,
    templateItemCount: templateItemRow?.count ?? 0,
    categoryCount: categoryRow?.count ?? 0,
  };
}

/**
 * Clears all user-created trips and packing items while preserving the 7 item categories
 * and 8 core packing templates.
 */
export async function clearUserApplicationData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM packing_items');
    await db.runAsync('DELETE FROM trips');
  });
  await seedInitialDataIfNeeded(db);
}

/**
 * Inserts realistic sample upcoming, ongoing, and completed journeys into SQLite
 * when triggered by the user from Profile & Settings. Avoids duplicating by trip_name.
 */
export async function loadSampleDemoJourneys(): Promise<number> {
  const db = await getDatabase();
  const demos = buildDemoJourneys();
  let insertedCount = 0;

  const categories = await db.getAllAsync<{ id: number; name: string }>(
    'SELECT id, name FROM item_categories'
  );
  const catMap = new Map<string, number>();
  for (const c of categories) {
    catMap.set(c.name, c.id);
  }

  await db.withTransactionAsync(async () => {
    const now = new Date().toISOString();

    for (const demo of demos) {
      const existing = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM trips WHERE LOWER(trip_name) = LOWER(?)',
        [demo.trip_name]
      );
      if (existing) {
        continue;
      }

      const res = await db.runAsync(
        `INSERT INTO trips
          (trip_name, destination, destination_type, departure_date, return_date, trip_duration, trip_type, traveller_count, notes, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          demo.trip_name,
          demo.destination,
          demo.destination_type,
          demo.departure_date,
          demo.return_date,
          demo.trip_duration,
          demo.trip_type,
          demo.traveller_count,
          demo.notes,
          demo.status,
          now,
          now,
        ]
      );

      const tripId = res.lastInsertRowId;
      insertedCount += 1;

      for (const item of demo.items) {
        const catId = catMap.get(item.category) ?? 1;
        await db.runAsync(
          `INSERT INTO packing_items
            (trip_id, item_name, category_id, quantity, is_packed, is_essential, notes, is_custom, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          [
            tripId,
            item.item_name,
            catId,
            item.quantity,
            item.is_packed,
            item.is_essential,
            item.notes ?? '',
            now,
          ]
        );
      }
    }
  });

  await syncAutomaticTripStatuses(db);
  return insertedCount;
}
