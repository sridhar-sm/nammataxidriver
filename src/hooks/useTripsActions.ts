import { v4 as uuidv4 } from 'uuid';
import {
  Trip,
  TripProposalFormData,
  TripConfirmationData,
  TripStartData,
  TripEndData,
  TollEntry,
  AdvancePayment,
} from '../types';
import { Vehicle } from '../types/vehicle';
import { Route } from '../types/location';
import * as storage from '../services/storage';
import { calculateFare } from '../utils/fareCalculator';
import { calculateCalendarDaysSpanned } from '../utils/date';

type SetTrips = React.Dispatch<React.SetStateAction<Trip[]>>;

/**
 * Hook factory for trip actions
 * Returns action functions that operate on trip state
 */
export function createTripActions(trips: Trip[], setTrips: SetTrips) {
  // Create a new trip proposal
  const createProposal = async (
    data: TripProposalFormData,
    vehicle: Vehicle,
    route: Route | undefined,
    estimatedDistanceKm: number,
    isRoundTrip: boolean
  ): Promise<Trip> => {
    const now = new Date().toISOString();
    const numberOfDays = parseInt(data.numberOfDays) || 1;
    const bataPerDay = parseFloat(data.bataPerDay) || 0;
    const estimatedTolls = parseFloat(data.estimatedTolls) || 0;
    const discount = parseFloat(data.discount || '0') || 0;
    const ratePerKmOverride = data.ratePerKmOverride
      ? parseFloat(data.ratePerKmOverride)
      : undefined;
    const minKmPerDayOverride = data.minKmPerDayOverride
      ? parseFloat(data.minKmPerDayOverride)
      : undefined;

    const effectiveRatePerKm = ratePerKmOverride ?? vehicle.ratePerKm;
    const effectiveMinKm = minKmPerDayOverride ?? vehicle.minKmPerDay;

    const fareBreakdown = calculateFare({
      vehicleId: vehicle.id,
      ratePerKm: effectiveRatePerKm,
      minKmPerDay: effectiveMinKm,
      totalDistanceKm: estimatedDistanceKm,
      numberOfDays,
      bataPerDay,
      estimatedTolls,
      discount,
    });

    const startLocation = route?.waypoints.find((w) => w.isStart)?.place.shortName;
    const endLocation = route?.waypoints.find((w) => w.isEnd)?.place.shortName;

    const trip: Trip = {
      id: uuidv4(),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      vehicleId: vehicle.id,
      vehicleSnapshot: vehicle,
      status: 'proposed',
      route,
      startLocationName: startLocation,
      endLocationName: isRoundTrip ? startLocation : endLocation,
      isRoundTrip,
      proposedStartDate: data.proposedStartDate,
      numberOfDays,
      bataPerDay,
      estimatedDistanceKm,
      estimatedTolls,
      estimatedFareBreakdown: fareBreakdown,
      discount,
      ratePerKmOverride,
      minKmPerDayOverride,
      tollEntries: [],
      advancePayments: [],
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    await storage.saveTrip(trip);
    setTrips((prev) => [trip, ...prev]);
    return trip;
  };

  // Confirm a proposed trip
  const confirmTrip = async (
    tripId: string,
    data: TripConfirmationData
  ): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'proposed') throw new Error('Trip is not in proposed status');

    const updated: Trip = {
      ...trip,
      status: 'confirmed',
      confirmedStartTime: data.confirmedStartTime,
      confirmedEndTime: data.confirmedEndTime,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Start an active trip
  const startTrip = async (tripId: string, data: TripStartData): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'confirmed') throw new Error('Trip must be confirmed first');

    const updated: Trip = {
      ...trip,
      status: 'active',
      actualStartTime: data.actualStartTime,
      odometerStart: {
        value: data.odometerStart,
        timestamp: data.actualStartTime,
        type: 'start',
      },
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Add toll entry to active trip
  const addTollEntry = async (
    tripId: string,
    amount: number,
    location: string
  ): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'active') throw new Error('Trip is not active');

    const tollEntry: TollEntry = {
      id: uuidv4(),
      amount,
      location,
      timestamp: new Date().toISOString(),
    };

    const updated: Trip = {
      ...trip,
      tollEntries: [...trip.tollEntries, tollEntry],
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Add advance payment to active trip
  const addAdvancePayment = async (
    tripId: string,
    amount: number,
    reason: string
  ): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'active') throw new Error('Trip is not active');

    const payment: AdvancePayment = {
      id: uuidv4(),
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    const updated: Trip = {
      ...trip,
      advancePayments: [...(trip.advancePayments || []), payment],
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Complete a trip
  const completeTrip = async (tripId: string, data: TripEndData): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'active') throw new Error('Trip is not active');

    const odometerStart = trip.odometerStart?.value || 0;
    const actualDistanceKm = data.odometerEnd - odometerStart;
    const totalTolls = trip.tollEntries.reduce((sum, t) => sum + t.amount, 0);
    const actualDays =
      calculateCalendarDaysSpanned(trip.actualStartTime, data.actualEndTime) ??
      trip.numberOfDays;

    const actualFareBreakdown = calculateFare({
      vehicleId: trip.vehicleId,
      ratePerKm: trip.vehicleSnapshot.ratePerKm,
      minKmPerDay: trip.vehicleSnapshot.minKmPerDay,
      totalDistanceKm: actualDistanceKm,
      numberOfDays: actualDays,
      bataPerDay: trip.bataPerDay,
      estimatedTolls: totalTolls,
    });

    const updated: Trip = {
      ...trip,
      status: 'completed',
      actualEndTime: data.actualEndTime,
      odometerEnd: {
        value: data.odometerEnd,
        timestamp: data.actualEndTime,
        type: 'end',
      },
      actualDistanceKm,
      actualDays,
      actualFareBreakdown,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Cancel a trip
  const cancelTrip = async (tripId: string): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status === 'completed') throw new Error('Cannot cancel completed trip');

    const updated: Trip = {
      ...trip,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  // Delete a trip
  const deleteTrip = async (tripId: string): Promise<void> => {
    await storage.deleteTrip(tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  // Update a proposed trip (for editing estimates)
  interface UpdateProposalData {
    numberOfDays?: number;
    bataPerDay?: number;
    estimatedTolls?: number;
    discount?: number;
    notes?: string;
  }

  const updateProposal = async (
    tripId: string,
    updates: UpdateProposalData
  ): Promise<Trip> => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) throw new Error('Trip not found');
    if (trip.status !== 'proposed') throw new Error('Can only edit proposed trips');

    const numberOfDays = updates.numberOfDays ?? trip.numberOfDays;
    const bataPerDay = updates.bataPerDay ?? trip.bataPerDay;
    const estimatedTolls = updates.estimatedTolls ?? trip.estimatedTolls;
    const discount = updates.discount ?? trip.discount;

    const effectiveRatePerKm = trip.ratePerKmOverride ?? trip.vehicleSnapshot.ratePerKm;
    const effectiveMinKm = trip.minKmPerDayOverride ?? trip.vehicleSnapshot.minKmPerDay;

    const fareBreakdown = calculateFare({
      vehicleId: trip.vehicleId,
      ratePerKm: effectiveRatePerKm,
      minKmPerDay: effectiveMinKm,
      totalDistanceKm: trip.estimatedDistanceKm,
      numberOfDays,
      bataPerDay,
      estimatedTolls,
      discount,
    });

    const updated: Trip = {
      ...trip,
      numberOfDays,
      bataPerDay,
      estimatedTolls,
      discount,
      notes: updates.notes ?? trip.notes,
      estimatedFareBreakdown: fareBreakdown,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveTrip(updated);
    setTrips((prev) => prev.map((t) => (t.id === tripId ? updated : t)));
    return updated;
  };

  return {
    createProposal,
    updateProposal,
    confirmTrip,
    startTrip,
    addTollEntry,
    addAdvancePayment,
    completeTrip,
    cancelTrip,
    deleteTrip,
  };
}
