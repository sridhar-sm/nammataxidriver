import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle, VehicleFormData } from '../types';
import * as storage from '../services/storage';

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadVehicles = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storage.getVehicles();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load vehicles'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = async (data: VehicleFormData): Promise<Vehicle> => {
    const now = new Date().toISOString();
    const vehicle: Vehicle = {
      id: uuidv4(),
      name: data.name,
      carSize: data.carSize,
      fuelType: data.fuelType,
      acOption: data.acOption,
      minKmPerDay: parseFloat(data.minKmPerDay) || 0,
      ratePerKm: parseFloat(data.ratePerKm) || 0,
      createdAt: now,
      updatedAt: now,
    };

    await storage.saveVehicle(vehicle);
    setVehicles((prev) => [...prev, vehicle]);
    return vehicle;
  };

  const updateVehicle = async (id: string, data: VehicleFormData): Promise<Vehicle> => {
    const existing = vehicles.find((v) => v.id === id);
    if (!existing) {
      throw new Error('Vehicle not found');
    }

    const updated: Vehicle = {
      ...existing,
      name: data.name,
      carSize: data.carSize,
      fuelType: data.fuelType,
      acOption: data.acOption,
      minKmPerDay: parseFloat(data.minKmPerDay) || 0,
      ratePerKm: parseFloat(data.ratePerKm) || 0,
      updatedAt: new Date().toISOString(),
    };

    await storage.saveVehicle(updated);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
    return updated;
  };

  const deleteVehicle = async (id: string): Promise<void> => {
    await storage.deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const getVehicle = (id: string): Vehicle | undefined => {
    return vehicles.find((v) => v.id === id);
  };

  return {
    vehicles,
    isLoading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
    refreshVehicles: loadVehicles,
  };
}
