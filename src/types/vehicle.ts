export type CarSize = 'Hatchback' | 'Sedan' | 'SUV' | 'MUV' | 'Luxury';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';
export type ACOption = 'AC' | 'Non-AC';

export interface Vehicle {
  id: string;
  name: string;
  carSize: CarSize;
  fuelType: FuelType;
  acOption: ACOption;
  minKmPerDay: number;
  ratePerKm: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFormData {
  name: string;
  carSize: CarSize;
  fuelType: FuelType;
  acOption: ACOption;
  minKmPerDay: string;
  ratePerKm: string;
}
