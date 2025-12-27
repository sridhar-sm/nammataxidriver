import { useState, useCallback } from 'react';
import { Route, Waypoint } from '../types';
import { calculateRoute } from '../services/osrm';

export function useRouteCalculation() {
  const [route, setRoute] = useState<Route | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const calculate = useCallback(async (waypoints: Waypoint[]): Promise<Route | null> => {
    if (waypoints.length < 2) {
      setError(new Error('At least 2 waypoints required'));
      return null;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const result = await calculateRoute(waypoints);
      setRoute(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Route calculation failed');
      setError(error);
      setRoute(null);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return {
    route,
    isCalculating,
    error,
    calculateRoute: calculate,
    clearRoute,
  };
}
