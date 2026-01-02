import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Vehicle, Place, Route } from '../types';

export interface EstimateData {
  // Step 1: Customer Info
  customerName: string;
  customerPhone: string;
  proposedStartDate: Date;

  // Step 2: Vehicle & Rate Info
  selectedVehicle: Vehicle | null;
  numberOfDays: string;
  bataPerDay: string;
  ratePerKmOverride: string;
  minKmPerDayOverride: string;

  // Step 3: Route Info
  startPlace: Place | null;
  endPlace: Place | null;
  intermediateWaypoints: Place[];
  isRoundTrip: boolean;
  route: Route | null;

  // Step 4: Fare Details
  estimatedTolls: string;
  discount: string;
  notes: string;
}

interface EstimateContextType {
  data: EstimateData;
  updateData: (updates: Partial<EstimateData>) => void;
  resetData: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const initialData: EstimateData = {
  customerName: '',
  customerPhone: '',
  proposedStartDate: new Date(),
  selectedVehicle: null,
  numberOfDays: '1',
  bataPerDay: '',
  ratePerKmOverride: '',
  minKmPerDayOverride: '',
  startPlace: null,
  endPlace: null,
  intermediateWaypoints: [],
  isRoundTrip: false,
  route: null,
  estimatedTolls: '0',
  discount: '0',
  notes: '',
};

const EstimateContext = createContext<EstimateContextType | undefined>(undefined);

export function EstimateProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<EstimateData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = (updates: Partial<EstimateData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const resetData = () => {
    setData(initialData);
    setCurrentStep(0);
  };

  return (
    <EstimateContext.Provider
      value={{ data, updateData, resetData, currentStep, setCurrentStep }}
    >
      {children}
    </EstimateContext.Provider>
  );
}

export function useEstimate() {
  const context = useContext(EstimateContext);
  if (context === undefined) {
    throw new Error('useEstimate must be used within an EstimateProvider');
  }
  return context;
}
