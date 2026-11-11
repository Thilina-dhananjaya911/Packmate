import { useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { getItemsByTripId } from '../database/queries/itemQueries';
import { getTripByIdWithProgress } from '../database/queries/tripQueries';
import { PackingItem, TripWithProgress } from '../types';

export function useTripDetailsData(tripId: number) {
  const { dataVersion } = useAppContext();
  const [trip, setTrip] = useState<TripWithProgress | null>(null);
  const [items, setItems] = useState<PackingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [tripRow, itemRows] = await Promise.all([
        getTripByIdWithProgress(tripId),
        getItemsByTripId(tripId),
      ]);
      setTrip(tripRow);
      setItems(itemRows);
    } catch (err) {
      console.error('[PACKMATE Hook] Failed loading trip data:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    reload();
  }, [reload, dataVersion]);

  return { trip, items, loading, reload };
}
