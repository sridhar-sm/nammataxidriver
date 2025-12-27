import React, { useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useVehicles } from '../../../src/hooks';
import { VehicleForm } from '../../../src/components/vehicles';
import { LoadingSpinner } from '../../../src/components/ui';
import { VehicleFormData } from '../../../src/types';

export default function VehicleEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { vehicles, isLoading, addVehicle, updateVehicle, getVehicle } = useVehicles();
  const [isSaving, setIsSaving] = useState(false);

  const isNew = id === 'new';
  const vehicle = isNew ? undefined : getVehicle(id);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isNew ? 'Add Vehicle' : 'Edit Vehicle',
    });
  }, [navigation, isNew]);

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isNew && !vehicle) {
    Alert.alert('Error', 'Vehicle not found', [
      { text: 'OK', onPress: () => router.back() },
    ]);
    return null;
  }

  const initialData: Partial<VehicleFormData> | undefined = vehicle
    ? {
        name: vehicle.name,
        carSize: vehicle.carSize,
        fuelType: vehicle.fuelType,
        acOption: vehicle.acOption,
        minKmPerDay: vehicle.minKmPerDay.toString(),
        ratePerKm: vehicle.ratePerKm.toString(),
      }
    : undefined;

  const handleSubmit = async (data: VehicleFormData) => {
    setIsSaving(true);
    try {
      if (isNew) {
        await addVehicle(data);
      } else {
        await updateVehicle(id, data);
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <VehicleForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        submitLabel={isNew ? 'Add Vehicle' : 'Save Changes'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});
