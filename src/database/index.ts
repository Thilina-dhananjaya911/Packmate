import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { APP_INFO } from '../constants';
import { DATABASE_SCHEMA_SQL } from './migrations/schema';
import { SEED_CATEGORIES, SEED_TEMPLATES } from './seed/seedData';
import { getTodayISO } from '../utils/dateUtils';

interface PackmateGlobalScope {
  __PACKMATE_SQLITE_DB__?: SQLite.SQLiteDatabase;
  __PACKMATE_SQLITE_INIT_PROMISE__?: Promise<SQLite.SQLiteDatabase>;
  __PACKMATE_SQLITE_UNLOAD_REGISTERED__?: boolean;
}

function getGlobalScope(): PackmateGlobalScope {
  return globalThis as unknown as PackmateGlobalScope;
}

/**
 * Checks whether an error is caused by exclusive OPFS FileSystemSyncAccessHandle locks.
 * In Chrome / WebAssembly SQLite, opening OPFS files with createSyncAccessHandle throws
 * if a previous worker or another tab has not yet released the exclusive handle lock.
 */
function isSyncAccessHandleLockError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: string }).name)
      : '';
  return (
    name === 'NoModificationAllowedError' ||
    msg.includes('createSyncAccessHandle') ||
    msg.includes('Access Handles cannot be created') ||
    msg.includes('another open Access Handle') ||
    msg.includes('NoModificationAllowedError')
  );
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Opens the SQLite database with backoff retry on Web when transient OPFS
 * access handle locks occur (e.g., during page reload, Fast Refresh, or Chrome DevTools
 * mobile emulation toggling while the previous worker is terminating).
 */
async function openSQLiteDatabaseWithRetry(): Promise<SQLite.SQLiteDatabase> {
  const isWeb = Platform.OS === 'web';
  const maxAttempts = isWeb ? 8 : 1;
  const initialDelayMs = 120;

  let delay = initialDelayMs;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const db = await SQLite.openDatabaseAsync(APP_INFO.DATABASE_NAME);
      return db;
    } catch (err) {
      lastError = err;
      if (isWeb && isSyncAccessHandleLockError(err) && attempt < maxAttempts) {
        console.warn(
          `[PACKMATE DB] OPFS access handle is locked (attempt ${attempt}/${maxAttempts}). Retrying in ${delay}ms...`
        );
        await waitMs(delay);
        delay = Math.min(Math.round(delay * 1.5), 800);
      } else {
        break;
      }
    }
  }

  if (isWeb && isSyncAccessHandleLockError(lastError)) {
    console.error(
      '[PACKMATE DB] Multiple browser tabs, workers, or emulation contexts are holding the SQLite database lock.'
    );
    throw new Error(
      'PACKMATE database is locked by another open browser tab, window, or worker session. ' +
      'Please close other PACKMATE tabs or windows and reload.'
    );
  }

  throw lastError;
}

function attachWebTeardown(db: SQLite.SQLiteDatabase): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }
  const scope = getGlobalScope();
  if (scope.__PACKMATE_SQLITE_UNLOAD_REGISTERED__) {
    return;
  }
  scope.__PACKMATE_SQLITE_UNLOAD_REGISTERED__ = true;

  const teardown = () => {
    try {
      const activeDb = scope.__PACKMATE_SQLITE_DB__;
      if (activeDb) {
        activeDb.closeAsync().catch(() => {});
      }
    } catch {
      // Ignore errors on page unload
    }
  };

  window.addEventListener('beforeunload', teardown);
  window.addEventListener('pagehide', teardown);
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  const scope = getGlobalScope();

  // Return existing singleton connection if already initialized
  if (scope.__PACKMATE_SQLITE_DB__) {
    return scope.__PACKMATE_SQLITE_DB__;
  }

  // Return existing in-flight initialization promise if initialization is underway
  if (scope.__PACKMATE_SQLITE_INIT_PROMISE__) {
    return scope.__PACKMATE_SQLITE_INIT_PROMISE__;
  }

  scope.__PACKMATE_SQLITE_INIT_PROMISE__ = (async () => {
    try {
      const db = await openSQLiteDatabaseWithRetry();
      if (Platform.OS !== 'web') {
        await db.execAsync('PRAGMA journal_mode = WAL;');
      }
      await db.execAsync(DATABASE_SCHEMA_SQL);
      await seedInitialDataIfNeeded(db);
      await syncAutomaticTripStatuses(db);
      scope.__PACKMATE_SQLITE_DB__ = db;
      attachWebTeardown(db);
      return db;
    } catch (error) {
      scope.__PACKMATE_SQLITE_INIT_PROMISE__ = undefined;
      console.error('[PACKMATE DB] Initialization error:', error);
      throw error;
    }
  })();

  return scope.__PACKMATE_SQLITE_INIT_PROMISE__;
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
