import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { STORAGE_KEYS } from '../constants/storage';
import { Vehicle, Trip, Place, DriverSettings, DEFAULT_DRIVER_SETTINGS } from '../types';
import {
  VehicleSchema,
  TripSchema,
  PlaceSchema,
  DriverSettingsSchema,
} from '../types/schemas';

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    throw error;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    throw error;
  }
}

function validateArray<T>(
  data: unknown,
  schema: z.ZodType<T>,
  entityName: string
): T[] {
  if (!Array.isArray(data)) {
    console.warn(`${entityName} data is not an array, returning empty array`);
    return [];
  }

  const validItems: T[] = [];
  const invalidCount = { count: 0 };

  for (const item of data) {
    const result = schema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    } else {
      invalidCount.count++;
      console.warn(`Invalid ${entityName} item skipped:`, result.error.issues);
    }
  }

  if (invalidCount.count > 0) {
    console.warn(`Skipped ${invalidCount.count} invalid ${entityName} items`);
  }

  return validItems;
}

// Vehicle operations
export async function getVehicles(): Promise<Vehicle[]> {
  const raw = await getItem<unknown[]>(STORAGE_KEYS.VEHICLES);
  if (!raw) return [];
  return validateArray(raw, VehicleSchema, 'Vehicle');
}

export async function saveVehicle(vehicle: Vehicle): Promise<void> {
  const vehicles = await getVehicles();
  const existingIndex = vehicles.findIndex((v) => v.id === vehicle.id);

  if (existingIndex >= 0) {
    vehicles[existingIndex] = vehicle;
  } else {
    vehicles.push(vehicle);
  }

  await setItem(STORAGE_KEYS.VEHICLES, vehicles);
}

export async function deleteVehicle(id: string): Promise<void> {
  const vehicles = await getVehicles();
  const filtered = vehicles.filter((v) => v.id !== id);
  await setItem(STORAGE_KEYS.VEHICLES, filtered);
}

// Trip operations
export async function getTrips(): Promise<Trip[]> {
  const raw = await getItem<unknown[]>(STORAGE_KEYS.TRIPS);
  if (!raw) return [];
  return validateArray(raw, TripSchema, 'Trip');
}

export async function saveTrip(trip: Trip): Promise<void> {
  const trips = await getTrips();
  const existingIndex = trips.findIndex((t) => t.id === trip.id);

  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.unshift(trip); // Add to beginning
  }

  await setItem(STORAGE_KEYS.TRIPS, trips);
}

export async function deleteTrip(id: string): Promise<void> {
  const trips = await getTrips();
  const filtered = trips.filter((t) => t.id !== id);
  await setItem(STORAGE_KEYS.TRIPS, filtered);
}

// Recent searches
export async function getRecentSearches(): Promise<Place[]> {
  const raw = await getItem<unknown[]>(STORAGE_KEYS.RECENT_SEARCHES);
  if (!raw) return [];
  return validateArray(raw, PlaceSchema, 'Place');
}

export async function addRecentSearch(place: Place): Promise<void> {
  const searches = await getRecentSearches();
  const filtered = searches.filter((p) => p.id !== place.id);
  filtered.unshift(place);
  const limited = filtered.slice(0, 10); // Keep only 10 recent
  await setItem(STORAGE_KEYS.RECENT_SEARCHES, limited);
}

export async function clearRecentSearches(): Promise<void> {
  await removeItem(STORAGE_KEYS.RECENT_SEARCHES);
}

// Driver settings
export async function getDriverSettings(): Promise<DriverSettings> {
  const raw = await getItem<unknown>(STORAGE_KEYS.DRIVER_SETTINGS);
  if (!raw) return DEFAULT_DRIVER_SETTINGS;

  const result = DriverSettingsSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }

  console.warn('Invalid driver settings, returning defaults:', result.error.issues);
  return DEFAULT_DRIVER_SETTINGS;
}

export async function saveDriverSettings(settings: DriverSettings): Promise<void> {
  await setItem(STORAGE_KEYS.DRIVER_SETTINGS, settings);
}
