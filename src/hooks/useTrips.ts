import { useMemo } from 'react';
import { useTripsState, EarningsSummary } from './useTripsState';
import { createTripActions } from './useTripsActions';

// Re-export types
export type { EarningsSummary };

/**
 * Main hook for trip management
 * Combines state management with actions for a complete trip management solution
 */
export function useTrips() {
  const {
    trips,
    isLoading,
    error,
    setTrips,
    proposedTrips,
    confirmedTrips,
    activeTrips,
    completedTrips,
    earningsSummary,
    getTrip,
    getTripsByStatus,
    refreshTrips,
  } = useTripsState();

  // Create actions with current state
  const actions = useMemo(
    () => createTripActions(trips, setTrips),
    [trips, setTrips]
  );

  return {
    // State
    trips,
    isLoading,
    error,

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
    refreshTrips,
    ...actions,
  };
}
