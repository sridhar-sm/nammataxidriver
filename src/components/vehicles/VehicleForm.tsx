import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { VehicleFormData, CarSize, FuelType, ACOption } from '../../types';
import { CAR_SIZES, FUEL_TYPES, AC_OPTIONS, DEFAULT_MIN_KM_PER_DAY, DEFAULT_RATE_PER_KM } from '../../constants';
import { Button, Input, Select } from '../ui';

interface VehicleFormProps {
  initialData?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function VehicleForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Vehicle',
}: VehicleFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [carSize, setCarSize] = useState<CarSize>(initialData?.carSize || 'Sedan');
  const [fuelType, setFuelType] = useState<FuelType>(initialData?.fuelType || 'Diesel');
  const [acOption, setAcOption] = useState<ACOption>(initialData?.acOption || 'AC');
  const [minKmPerDay, setMinKmPerDay] = useState(
    initialData?.minKmPerDay || DEFAULT_MIN_KM_PER_DAY.toString()
  );
  const [ratePerKm, setRatePerKm] = useState(
    initialData?.ratePerKm || DEFAULT_RATE_PER_KM.toString()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const minKm = parseFloat(minKmPerDay);
    if (isNaN(minKm) || minKm <= 0) {
      newErrors.minKmPerDay = 'Enter a valid number greater than 0';
    }

    const rate = parseFloat(ratePerKm);
    if (isNaN(rate) || rate <= 0) {
      newErrors.ratePerKm = 'Enter a valid number greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    await onSubmit({
      name: name.trim(),
      carSize,
      fuelType,
      acOption,
      minKmPerDay,
      ratePerKm,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Vehicle Name"
        value={name}
        onChangeText={setName}
        placeholder="e.g., My Swift Dzire"
        error={errors.name}
      />

      <Select
        label="Car Size"
        options={CAR_SIZES}
        value={carSize}
        onChange={setCarSize}
      />

      <Select
        label="Fuel Type"
        options={FUEL_TYPES}
        value={fuelType}
        onChange={setFuelType}
      />

      <Select
        label="AC Option"
        options={AC_OPTIONS}
        value={acOption}
        onChange={setAcOption}
      />

      <Input
        label="Minimum km per day"
        value={minKmPerDay}
        onChangeText={setMinKmPerDay}
        placeholder="250"
        keyboardType="numeric"
        error={errors.minKmPerDay}
      />

      <Input
        label="Rate per km (₹)"
        value={ratePerKm}
        onChangeText={setRatePerKm}
        placeholder="12"
        keyboardType="numeric"
        error={errors.ratePerKm}
      />

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
