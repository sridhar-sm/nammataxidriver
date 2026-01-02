export interface FareInput {
  vehicleId: string;
  ratePerKm: number;
  minKmPerDay: number;
  totalDistanceKm: number;
  numberOfDays: number;
  bataPerDay: number;
  estimatedTolls: number;
  discount?: number;
}

export interface FareBreakdown {
  actualDistance: number;
  chargeableDistance: number;
  distanceCharges: number;
  totalBata: number;
  totalTolls: number;
  subtotal: number;
  discount: number;
  grandTotal: number;
}

export interface ActualFareInput {
  vehicleId: string;
  ratePerKm: number;
  minKmPerDay: number;
  actualDistanceKm: number;
  actualDays: number;
  actualTolls: number;
  bataPerDay: number;
  discount?: number;
}
