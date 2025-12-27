import { useCallback } from 'react';
import { FareInput, FareBreakdown, ActualFareInput } from '../types';
import { calculateFare, calculateActualFare } from '../utils/fareCalculator';

export function useFareCalculation() {
  const calculateEstimatedFare = useCallback((input: FareInput): FareBreakdown => {
    return calculateFare(input);
  }, []);

  const calculateActual = useCallback((input: ActualFareInput): FareBreakdown => {
    return calculateActualFare(input);
  }, []);

  return {
    calculateEstimatedFare,
    calculateActualFare: calculateActual,
  };
}
