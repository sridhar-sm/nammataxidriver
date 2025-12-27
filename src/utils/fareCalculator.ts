import { FareInput, FareBreakdown, ActualFareInput } from '../types';

export function calculateFare(input: FareInput): FareBreakdown {
  const {
    ratePerKm,
    minKmPerDay,
    totalDistanceKm,
    numberOfDays,
    bataPerDay,
    estimatedTolls,
  } = input;

  // Calculate minimum chargeable distance
  const minimumChargeableDistance = minKmPerDay * numberOfDays;

  // Chargeable distance is the greater of actual or minimum
  const chargeableDistance = Math.max(totalDistanceKm, minimumChargeableDistance);

  // Distance charges
  const distanceCharges = chargeableDistance * ratePerKm;

  // Bata (driver allowance)
  const totalBata = bataPerDay * numberOfDays;

  // Totals
  const subtotal = distanceCharges + totalBata;
  const grandTotal = subtotal + estimatedTolls;

  return {
    actualDistance: totalDistanceKm,
    chargeableDistance,
    distanceCharges,
    totalBata,
    totalTolls: estimatedTolls,
    subtotal,
    grandTotal,
  };
}

export function calculateActualFare(input: ActualFareInput): FareBreakdown {
  return calculateFare({
    vehicleId: input.vehicleId,
    ratePerKm: input.ratePerKm,
    minKmPerDay: input.minKmPerDay,
    totalDistanceKm: input.actualDistanceKm,
    numberOfDays: input.actualDays,
    bataPerDay: input.bataPerDay,
    estimatedTolls: input.actualTolls,
  });
}
