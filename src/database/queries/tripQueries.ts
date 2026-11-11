import {
  CreateTripInput,
  DashboardStats,
  Trip,
  TripStatus,
  TripWithProgress,
  UpdateTripInput,
} from '../../types';
import { deriveTripStatus } from '../../utils/dateUtils';
import { calculatePackingProgress } from '../../utils/progressUtils';
import { getDatabase, syncAutomaticTripStatuses } from '../index';

interface RawTripRow extends Trip {
  total_items: number;
  packed_items: number;
}

function hydrateTripProgress(row: RawTripRow): TripWithProgress {
  const metrics = calculatePackingProgress(row.packed_items ?? 0, row.total_items ?? 0);
  return {
    ...row,
    total_items: metrics.totalItems,
    packed_items: metrics.packedItems,
    remaining_items: metrics.remainingItems,
    progress_percentage: metrics.percentage,
  };
}

const TRIP_WITH_COUNTS_SELECT = `
  SELECT
    t.*,
    COUNT(pi.id) AS total_items,
    COALESCE(SUM(CASE WHEN pi.is_packed = 1 THEN 1 ELSE 0 END), 0) AS packed_items
  FROM trips t
  LEFT JOIN packing_items pi ON pi.trip_id = t.id
`;

export async function getAllTripsWithProgress(): Promise<TripWithProgress[]> {
  const db = await getDatabase();
  await syncAutomaticTripStatuses(db);
  const rows = await db.getAllAsync<RawTripRow>(
    `${TRIP_WITH_COUNTS_SELECT}
     GROUP BY t.id
     ORDER BY
       CASE t.status
         WHEN 'Ongoing' THEN 1
         WHEN 'Upcoming' THEN 2
         ELSE 3
       END ASC,
       t.departure_date ASC`
  );
  return rows.map(hydrateTripProgress);
}

export async function getTripByIdWithProgress(
  tripId: number
): Promise<TripWithProgress | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<RawTripRow>(
    `${TRIP_WITH_COUNTS_SELECT}
     WHERE t.id = ?
     GROUP BY t.id`,
    [tripId]
  );
  return row ? hydrateTripProgress(row) : null;
}

export async function getUpcomingHeroTrip(): Promise<TripWithProgress | null> {
  const db = await getDatabase();
  await syncAutomaticTripStatuses(db);
  const row = await db.getFirstAsync<RawTripRow>(
    `${TRIP_WITH_COUNTS_SELECT}
     WHERE t.status IN ('Ongoing', 'Upcoming')
     GROUP BY t.id
     ORDER BY
       CASE t.status WHEN 'Ongoing' THEN 0 ELSE 1 END ASC,
       t.departure_date ASC
     LIMIT 1`
  );
  return row ? hydrateTripProgress(row) : null;
}

export async function getRecentTrips(limit = 4): Promise<TripWithProgress[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RawTripRow>(
    `${TRIP_WITH_COUNTS_SELECT}
     GROUP BY t.id
     ORDER BY t.updated_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows.map(hydrateTripProgress);
}

export async function getCompletedHistoryTrips(): Promise<TripWithProgress[]> {
  const db = await getDatabase();
  await syncAutomaticTripStatuses(db);
  const rows = await db.getAllAsync<RawTripRow>(
    `${TRIP_WITH_COUNTS_SELECT}
     WHERE t.status = 'Completed'
     GROUP BY t.id
     ORDER BY t.return_date DESC`
  );
  return rows.map(hydrateTripProgress);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = await getDatabase();
  await syncAutomaticTripStatuses(db);

  const tripStats = await db.getFirstAsync<{
    totalTrips: number;
    upcomingTrips: number;
    ongoingTrips: number;
    completedTrips: number;
  }>(
    `SELECT
       COUNT(*) AS totalTrips,
       COALESCE(SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END), 0) AS upcomingTrips,
       COALESCE(SUM(CASE WHEN status = 'Ongoing' THEN 1 ELSE 0 END), 0) AS ongoingTrips,
       COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) AS completedTrips
     FROM trips`
  );

  const itemStats = await db.getFirstAsync<{
    totalItemsAllTrips: number;
    totalPackedItems: number;
  }>(
    `SELECT
       COUNT(*) AS totalItemsAllTrips,
       COALESCE(SUM(CASE WHEN is_packed = 1 THEN 1 ELSE 0 END), 0) AS totalPackedItems
     FROM packing_items`
  );

  return {
    totalTrips: tripStats?.totalTrips ?? 0,
    upcomingTrips: tripStats?.upcomingTrips ?? 0,
    ongoingTrips: tripStats?.ongoingTrips ?? 0,
    completedTrips: tripStats?.completedTrips ?? 0,
    totalItemsAllTrips: itemStats?.totalItemsAllTrips ?? 0,
    totalPackedItems: itemStats?.totalPackedItems ?? 0,
  };
}

export async function createTrip(input: CreateTripInput): Promise<number> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const computedStatus = deriveTripStatus(
    input.departure_date,
    input.return_date,
    input.status
  );

  const result = await db.runAsync(
    `INSERT INTO trips
      (trip_name, destination, destination_type, departure_date, return_date, trip_duration, trip_type, traveller_count, notes, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.trip_name.trim(),
      input.destination.trim(),
      input.destination_type,
      input.departure_date,
      input.return_date,
      input.trip_duration,
      input.trip_type,
      input.traveller_count,
      (input.notes ?? '').trim(),
      computedStatus,
      now,
      now,
    ]
  );

  return result.lastInsertRowId;
}

export async function updateTrip(
  tripId: number,
  input: UpdateTripInput
): Promise<void> {
  const db = await getDatabase();
  const existing = await db.getFirstAsync<Trip>(
    'SELECT * FROM trips WHERE id = ?',
    [tripId]
  );
  if (!existing) {
    throw new Error('Trip not found.');
  }

  const nextDeparture = input.departure_date ?? existing.departure_date;
  const nextReturn = input.return_date ?? existing.return_date;
  const nextStatus =
    input.status ?? deriveTripStatus(nextDeparture, nextReturn);
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE trips
     SET trip_name = ?,
         destination = ?,
         destination_type = ?,
         departure_date = ?,
         return_date = ?,
         trip_duration = ?,
         trip_type = ?,
         traveller_count = ?,
         notes = ?,
         status = ?,
         updated_at = ?
     WHERE id = ?`,
    [
      (input.trip_name ?? existing.trip_name).trim(),
      (input.destination ?? existing.destination).trim(),
      input.destination_type ?? existing.destination_type,
      nextDeparture,
      nextReturn,
      input.trip_duration ?? existing.trip_duration,
      input.trip_type ?? existing.trip_type,
      input.traveller_count ?? existing.traveller_count,
      (input.notes ?? existing.notes).trim(),
      nextStatus,
      now,
      tripId,
    ]
  );
}

export async function updateTripStatus(
  tripId: number,
  status: TripStatus
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE trips SET status = ?, updated_at = ? WHERE id = ?',
    [status, now, tripId]
  );
}

export async function deleteTrip(tripId: number): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM packing_items WHERE trip_id = ?', [tripId]);
    await db.runAsync('DELETE FROM trips WHERE id = ?', [tripId]);
  });
}
