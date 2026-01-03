import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trip, TripStatus } from '../types';
import * as storage from '../services/storage';

export interface EarningsSummary {
  today: {
    totalEarnings: number;
    tripCount: number;
    totalDistance: number;
  };
  thisWeek: {
    totalEarnings: number;
    tripCount: number;
    totalDistance: number;
  };
  thisMonth: {
    totalEarnings: number;
    tripCount: number;
    totalDistance: number;
  };
  allTime: {
    totalEarnings: number;
    tripCount: number;
    totalDistance: number;
    pendingAmount: number;
  };
}

/**
 * Hook for managing trip state and queries
 * Handles loading, filtering, and calculating derived data
 */
export function useTripsState() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadTrips = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storage.getTrips();
      setTrips(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load trips'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Get trips by status
  const getTripsByStatus = useCallback(
    (status: TripStatus) => trips.filter((t) => t.status === status),
    [trips]
  );

  const proposedTrips = useMemo(() => getTripsByStatus('proposed'), [getTripsByStatus]);
  const confirmedTrips = useMemo(() => getTripsByStatus('confirmed'), [getTripsByStatus]);
  const activeTrips = useMemo(() => getTripsByStatus('active'), [getTripsByStatus]);
  const completedTrips = useMemo(() => getTripsByStatus('completed'), [getTripsByStatus]);

  // Calculate earnings summary
  const earningsSummary = useMemo((): EarningsSummary => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const calculatePeriodEarnings = (startDate: Date) => {
      return completedTrips
        .filter((trip) => {
          const completionDate = trip.actualEndTime ? new Date(trip.actualEndTime) : null;
          return completionDate && completionDate >= startDate;
        })
        .reduce(
          (acc, trip) => {
            const earnings = trip.actualFareBreakdown?.grandTotal || 0;
            const distance = trip.actualDistanceKm || 0;
            return {
              totalEarnings: acc.totalEarnings + earnings,
              tripCount: acc.tripCount + 1,
              totalDistance: acc.totalDistance + distance,
            };
          },
          { totalEarnings: 0, tripCount: 0, totalDistance: 0 }
        );
    };

    const allTimeStats = completedTrips.reduce(
      (acc, trip) => {
        const earnings = trip.actualFareBreakdown?.grandTotal || 0;
        const distance = trip.actualDistanceKm || 0;
        const advances = (trip.advancePayments || []).reduce((sum, p) => sum + p.amount, 0);
        const pending = earnings - advances;
        return {
          totalEarnings: acc.totalEarnings + earnings,
          tripCount: acc.tripCount + 1,
          totalDistance: acc.totalDistance + distance,
          pendingAmount: acc.pendingAmount + (pending > 0 ? pending : 0),
        };
      },
      { totalEarnings: 0, tripCount: 0, totalDistance: 0, pendingAmount: 0 }
    );

    return {
      today: calculatePeriodEarnings(startOfToday),
      thisWeek: calculatePeriodEarnings(startOfWeek),
      thisMonth: calculatePeriodEarnings(startOfMonth),
      allTime: allTimeStats,
    };
  }, [completedTrips]);

  // Get a single trip
  const getTrip = useCallback(
    (tripId: string): Trip | undefined => {
      return trips.find((t) => t.id === tripId);
    },
    [trips]
  );

  return {
    // State
    trips,
    isLoading,
    error,
    setTrips,

    // Filtered lists
    proposedTrips,
    confirmedTrips,
    activeTrips,
    completedTrips,

    // Computed data
    earningsSummary,

    // Queries
    getTrip,
    getTripsByStatus,

    // Actions
    refreshTrips: loadTrips,
  };
}
