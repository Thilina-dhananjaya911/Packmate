import { LuggageType, ProfileStats, SaveProfileInput, TravelStyle, UserProfile } from '../../types';
import { getDatabase } from '../index';

interface RawUserProfileRow {
  id: number;
  full_name: string;
  country: string;
  email: string | null;
  phone: string | null;
  avatar: string;
  travel_style: string;
  luggage_type: string;
  weight_limit: number;
  created_at: string;
  updated_at: string;
}

function mapRowToUserProfile(row: RawUserProfileRow): UserProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    country: row.country,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    avatar: row.avatar || 'avatar-explorer',
    travelStyle: (row.travel_style as TravelStyle) || 'General Travel',
    luggageType: (row.luggage_type as LuggageType) || 'Backpack',
    weightLimit: Number(row.weight_limit) || 20.0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Retrieves the single local user profile from SQLite, or returns null if not set up yet.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawUserProfileRow>(
    'SELECT * FROM user_profile WHERE id = 1'
  );
  return row ? mapRowToUserProfile(row) : null;
}

/**
 * Checks whether a local user profile already exists.
 */
export async function hasUserProfile(): Promise<boolean> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_profile WHERE id = 1'
  );
  return (row?.count ?? 0) > 0;
}

/**
 * Saves or replaces the single local user profile (id = 1).
 */
export async function saveUserProfile(input: SaveProfileInput): Promise<UserProfile> {
  const db = await getDatabase();
  const existing = await getUserProfile();
  const now = new Date().toISOString();
  const createdAt = existing?.createdAt ?? now;

  const trimmedName = input.fullName.trim();
  const trimmedCountry = input.country.trim();
  const trimmedEmail = input.email ? input.email.trim() : null;
  const trimmedPhone = input.phone ? input.phone.trim() : null;
  const avatar = input.avatar || 'avatar-explorer';
  const travelStyle = input.travelStyle || 'General Travel';
  const luggageType = input.luggageType || 'Backpack';
  const weightLimit = Math.max(1, Number(input.weightLimit) || 20.0);

  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile
      (id, full_name, country, email, phone, avatar, travel_style, luggage_type, weight_limit, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trimmedName,
      trimmedCountry,
      trimmedEmail,
      trimmedPhone,
      avatar,
      travelStyle,
      luggageType,
      weightLimit,
      createdAt,
      now,
    ]
  );

  const saved = await getUserProfile();
  if (!saved) {
    throw new Error('Failed to retrieve saved user profile from SQLite.');
  }
  return saved;
}

/**
 * Updates partial fields of the existing user profile.
 */
export async function updateUserProfile(
  input: Partial<SaveProfileInput>
): Promise<UserProfile> {
  const existing = await getUserProfile();
  if (!existing) {
    throw new Error('No local user profile found to update.');
  }

  return saveUserProfile({
    fullName: input.fullName ?? existing.fullName,
    country: input.country ?? existing.country,
    email: input.email !== undefined ? input.email : existing.email,
    phone: input.phone !== undefined ? input.phone : existing.phone,
    avatar: input.avatar ?? existing.avatar,
    travelStyle: input.travelStyle ?? existing.travelStyle,
    luggageType: input.luggageType ?? existing.luggageType,
    weightLimit: input.weightLimit ?? existing.weightLimit,
  });
}

/**
 * Resets ONLY the user profile row.
 * Strictly preserves trips, packing items, templates, and categories.
 */
export async function resetUserProfile(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM user_profile WHERE id = 1');
}

/**
 * Dynamically computes real profile statistics from SQLite trips and packing items.
 */
export async function getProfileStats(): Promise<ProfileStats> {
  const db = await getDatabase();

  const tripStats = await db.getFirstAsync<{
    totalTrips: number;
    completedTrips: number;
  }>(
    `SELECT
       COUNT(*) as totalTrips,
       COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) as completedTrips
     FROM trips`
  );

  const itemStats = await db.getFirstAsync<{
    totalItems: number;
    packedItems: number;
  }>(
    `SELECT
       COUNT(*) as totalItems,
       COALESCE(SUM(CASE WHEN is_packed = 1 THEN 1 ELSE 0 END), 0) as packedItems
     FROM packing_items`
  );

  const totalTrips = tripStats?.totalTrips ?? 0;
  const completedTrips = tripStats?.completedTrips ?? 0;
  const totalItems = itemStats?.totalItems ?? 0;
  const totalPackedItems = itemStats?.packedItems ?? 0;
  const completionRate =
    totalItems > 0 ? Math.round((totalPackedItems / totalItems) * 100) : 0;

  return {
    totalTrips,
    completedTrips,
    totalPackedItems,
    completionRate,
  };
}
