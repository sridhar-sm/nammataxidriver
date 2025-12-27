import { CarSize, FuelType, ACOption } from '../types';

export const CAR_SIZES: { value: CarSize; label: string }[] = [
  { value: 'Hatchback', label: 'Hatchback' },
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'MUV', label: 'MUV' },
  { value: 'Luxury', label: 'Luxury' },
];

export const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'CNG', label: 'CNG' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Hybrid', label: 'Hybrid' },
];

export const AC_OPTIONS: { value: ACOption; label: string }[] = [
  { value: 'AC', label: 'AC' },
  { value: 'Non-AC', label: 'Non-AC' },
];

export const DEFAULT_MIN_KM_PER_DAY = 250;
export const DEFAULT_RATE_PER_KM = 12;
export const DEFAULT_BATA_PER_DAY = 300;
