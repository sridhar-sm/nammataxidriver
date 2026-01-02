import { Route } from './location';
import { FareBreakdown } from './fare';
import { Vehicle } from './vehicle';

// Trip lifecycle: proposed -> confirmed -> active -> completed (or cancelled at any point)
export type TripStatus = 'proposed' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface TollEntry {
  id: string;
  amount: number;
  location: string;
  timestamp: string;
}

export interface AdvancePayment {
  id: string;
  amount: number;
  reason: string;
  timestamp: string;
}

export interface OdometerReading {
  value: number;
  timestamp: string;
  type: 'start' | 'end';
}

export interface Trip {
  id: string;

  // Customer info
  customerName: string;
  customerPhone?: string;

  // Vehicle info
  vehicleId: string;
  vehicleSnapshot: Vehicle;

  // Status
  status: TripStatus;

  // Route
  route?: Route;
  startLocationName?: string;
  endLocationName?: string;
  isRoundTrip: boolean;

  // Dates and times
  proposedStartDate: string;
  confirmedStartTime?: string;
  confirmedEndTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;

  // Trip parameters
  numberOfDays: number;
  bataPerDay: number;

  // Estimated values (from proposal)
  estimatedDistanceKm: number;
  estimatedTolls: number;
  estimatedFareBreakdown: FareBreakdown;
  discount: number;
  ratePerKmOverride?: number;
  minKmPerDayOverride?: number;

  // Actual values (filled during/after trip)
  actualDistanceKm?: number;
  actualDays?: number;
  odometerStart?: OdometerReading;
  odometerEnd?: OdometerReading;
  tollEntries: TollEntry[];
  advancePayments: AdvancePayment[];
  actualFareBreakdown?: FareBreakdown;

  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripSummary {
  id: string;
  customerName: string;
  vehicleName: string;
  status: TripStatus;
  startLocationName: string;
  endLocationName: string;
  proposedStartDate: string;
  estimatedDistanceKm: number;
  estimatedTotal: number;
  actualTotal?: number;
  createdAt: string;
}

export interface TripProposalFormData {
  customerName: string;
  customerPhone?: string;
  vehicleId: string;
  proposedStartDate: string;
  numberOfDays: string;
  bataPerDay: string;
  estimatedTolls: string;
  notes?: string;
  discount?: string;
  ratePerKmOverride?: string;
  minKmPerDayOverride?: string;
}

export interface TripConfirmationData {
  confirmedStartTime: string;
  confirmedEndTime?: string;
}

export interface TripStartData {
  odometerStart: number;
  actualStartTime: string;
}

export interface TripEndData {
  odometerEnd: number;
  actualEndTime: string;
}
