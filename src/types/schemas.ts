import { z } from 'zod';

// Vehicle schemas
export const CarSizeSchema = z.enum(['Hatchback', 'Sedan', 'SUV', 'MUV', 'Luxury']);
export const FuelTypeSchema = z.enum(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid']);
export const ACOptionSchema = z.enum(['AC', 'Non-AC']);

export const VehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  carSize: CarSizeSchema,
  fuelType: FuelTypeSchema,
  acOption: ACOptionSchema,
  minKmPerDay: z.number().positive(),
  ratePerKm: z.number().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Location schemas
export const CoordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const PlaceSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  shortName: z.string(),
  coordinates: CoordinatesSchema,
  type: z.string(),
});

export const WaypointSchema = z.object({
  id: z.string(),
  place: PlaceSchema,
  order: z.number(),
  isStart: z.boolean(),
  isEnd: z.boolean(),
});

export const RouteSegmentSchema = z.object({
  from: WaypointSchema,
  to: WaypointSchema,
  distanceKm: z.number(),
  durationMinutes: z.number(),
});

export const RouteSchema = z.object({
  waypoints: z.array(WaypointSchema),
  segments: z.array(RouteSegmentSchema),
  totalDistanceKm: z.number(),
  totalDurationMinutes: z.number(),
});

// Fare schemas
export const FareBreakdownSchema = z.object({
  actualDistance: z.number(),
  chargeableDistance: z.number(),
  distanceCharges: z.number(),
  totalBata: z.number(),
  totalTolls: z.number(),
  subtotal: z.number(),
  grandTotal: z.number(),
});

// Trip schemas
export const TripStatusSchema = z.enum(['proposed', 'confirmed', 'active', 'completed', 'cancelled']);

export const TollEntrySchema = z.object({
  id: z.string(),
  amount: z.number(),
  location: z.string(),
  timestamp: z.string(),
});

export const AdvancePaymentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  reason: z.string(),
  timestamp: z.string(),
});

export const OdometerReadingSchema = z.object({
  value: z.number(),
  timestamp: z.string(),
  type: z.enum(['start', 'end']),
});

export const TripSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerPhone: z.string().optional(),
  vehicleId: z.string(),
  vehicleSnapshot: VehicleSchema,
  status: TripStatusSchema,
  route: RouteSchema.optional(),
  startLocationName: z.string().optional(),
  endLocationName: z.string().optional(),
  isRoundTrip: z.boolean(),
  proposedStartDate: z.string(),
  confirmedStartTime: z.string().optional(),
  confirmedEndTime: z.string().optional(),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
  numberOfDays: z.number().positive(),
  bataPerDay: z.number().nonnegative(),
  estimatedDistanceKm: z.number().nonnegative(),
  estimatedTolls: z.number().nonnegative(),
  estimatedFareBreakdown: FareBreakdownSchema,
  actualDistanceKm: z.number().optional(),
  actualDays: z.number().optional(),
  odometerStart: OdometerReadingSchema.optional(),
  odometerEnd: OdometerReadingSchema.optional(),
  tollEntries: z.array(TollEntrySchema),
  advancePayments: z.array(AdvancePaymentSchema),
  actualFareBreakdown: FareBreakdownSchema.optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Driver settings schema
export const DriverSettingsSchema = z.object({
  name: z.string(),
  phone: z.string(),
  defaultBataPerDay: z.number().nonnegative(),
});

// Type exports from schemas
export type VehicleFromSchema = z.infer<typeof VehicleSchema>;
export type TripFromSchema = z.infer<typeof TripSchema>;
export type PlaceFromSchema = z.infer<typeof PlaceSchema>;
export type DriverSettingsFromSchema = z.infer<typeof DriverSettingsSchema>;
