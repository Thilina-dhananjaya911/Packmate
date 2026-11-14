import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { APP_INFO } from '../constants';
import { DATABASE_SCHEMA_SQL } from './migrations/schema';
import { SEED_CATEGORIES, SEED_TEMPLATES } from './seed/seedData';
import { getTodayISO } from '../utils/dateUtils';
import { seedEssentialDataIfNeeded } from './queries/essentialQueries';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(APP_INFO.DATABASE_NAME);
      if (Platform.OS !== 'web') {
        await db.execAsync('PRAGMA journal_mode = WAL;');
      }
      await db.execAsync(DATABASE_SCHEMA_SQL);
      await seedInitialDataIfNeeded(db);
      await seedEssentialDataIfNeeded(db);
      await syncAutomaticTripStatuses(db);
      dbInstance = db;
      return db;
    } catch (error) {
      initPromise = null;
      console.error('[PACKMATE DB] Initialization error:', error);
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Seeds the 7 item categories and 8 packing templates (158 items) idempotently on first launch.
 * Never resets existing user trips or packing items. Starts with 0 user trips.
 */
export async function seedInitialDataIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const existingCategories = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM item_categories'
  );
  const existingTemplates = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM packing_templates'
  );

  if ((existingCategories?.count ?? 0) >= 7 && (existingTemplates?.count ?? 0) >= 8) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const cat of SEED_CATEGORIES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO item_categories (name, icon_name, color_hex, sort_order)
         VALUES (?, ?, ?, ?)`,
        [cat.name, cat.icon_name, cat.color_hex, cat.sort_order]
      );
    }

    const categories = await db.getAllAsync<{ id: number; name: string }>(
      'SELECT id, name FROM item_categories'
    );
    const categoryIdByName = new Map<string, number>();
    for (const c of categories) {
      categoryIdByName.set(c.name, c.id);
    }

    for (const tpl of SEED_TEMPLATES) {
      const existingTpl = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM packing_templates WHERE template_name = ?',
        [tpl.template_name]
      );

      let templateId = existingTpl?.id;

      if (!templateId) {
        const result = await db.runAsync(
          `INSERT INTO packing_templates
            (template_name, trip_type, destination_type, description, icon_name, accent_color, recommended_duration)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            tpl.template_name,
            tpl.trip_type,
            tpl.destination_type,
            tpl.description,
            tpl.icon_name,
            tpl.accent_color,
            tpl.recommended_duration,
          ]
        );
        templateId = result.lastInsertRowId;
      }

      const existingTplItems = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM template_items WHERE template_id = ?',
        [templateId]
      );

      if ((existingTplItems?.count ?? 0) === 0) {
        for (const item of tpl.items) {
          const catId = categoryIdByName.get(item.category);
          if (!catId) continue;

          await db.runAsync(
            `INSERT INTO template_items
              (template_id, item_name, category_id, default_quantity, is_essential, scaling_rule, per_traveller)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              templateId,
              item.item_name,
              catId,
              item.default_quantity,
              item.is_essential ? 1 : 0,
              item.scaling_rule,
              item.per_traveller ? 1 : 0,
            ]
          );
        }
      }
    }

    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
      ['seed_version', APP_INFO.SEED_VERSION, now]
    );
  });
}

/**
 * Automatically updates trip statuses based on current local date without overwriting
 * trips already explicitly marked 'Completed'.
 */
export async function syncAutomaticTripStatuses(db: SQLite.SQLiteDatabase): Promise<void> {
  const today = getTodayISO();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE trips
     SET status = 'Completed', updated_at = ?
     WHERE return_date < ? AND status != 'Completed'`,
    [now, today]
  );

  await db.runAsync(
    `UPDATE trips
     SET status = 'Ongoing', updated_at = ?
     WHERE departure_date <= ? AND return_date >= ? AND status = 'Upcoming'`,
    [now, today, today]
  );

  await db.runAsync(
    `UPDATE trips
     SET status = 'Upcoming', updated_at = ?
     WHERE departure_date > ? AND status = 'Ongoing'`,
    [now, today]
  );
}
