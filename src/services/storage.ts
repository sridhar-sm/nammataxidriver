import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storage';
import { Vehicle, Trip, Place, DriverSettings, DEFAULT_DRIVER_SETTINGS } from '../types';

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

// Vehicle operations
export async function getVehicles(): Promise<Vehicle[]> {
  return (await getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES)) || [];
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
  return (await getItem<Trip[]>(STORAGE_KEYS.TRIPS)) || [];
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
  return (await getItem<Place[]>(STORAGE_KEYS.RECENT_SEARCHES)) || [];
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
  return (await getItem<DriverSettings>(STORAGE_KEYS.DRIVER_SETTINGS)) || DEFAULT_DRIVER_SETTINGS;
}

export async function saveDriverSettings(settings: DriverSettings): Promise<void> {
  await setItem(STORAGE_KEYS.DRIVER_SETTINGS, settings);
}
