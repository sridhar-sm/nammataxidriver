import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useVehicles } from '../../../src/hooks';
import { VehicleSelector } from '../../../src/components/vehicles';
import { Button, Input, Card } from '../../../src/components/ui';
import { DEFAULT_BATA_PER_DAY } from '../../../src/constants';
import { Vehicle } from '../../../src/types';
import { showAlert } from '../../../src/utils/alert';

export default function CalculateStartScreen() {
  const router = useRouter();
  const { vehicles, isLoading } = useVehicles();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [actualKm, setActualKm] = useState('');
  const [actualDays, setActualDays] = useState('1');
  const [bataPerDay, setBataPerDay] = useState(DEFAULT_BATA_PER_DAY.toString());
  const [actualTolls, setActualTolls] = useState('0');

  const handleCalculate = () => {
    if (!selectedVehicle) {
      showAlert('Error', 'Please select a vehicle');
      return;
    }

    const km = parseFloat(actualKm);
    if (isNaN(km) || km <= 0) {
      showAlert('Error', 'Please enter valid kilometers');
      return;
    }

    const days = parseInt(actualDays);
    if (isNaN(days) || days < 1) {
      showAlert('Error', 'Please enter valid number of days');
      return;
    }

    router.push({
      pathname: '/(tabs)/calculate/result',
      params: {
        vehicleId: selectedVehicle.id,
        actualKm: km.toString(),
        actualDays: days.toString(),
        bataPerDay: bataPerDay || '0',
        actualTolls: actualTolls || '0',
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Post-Trip Details">
        <VehicleSelector
          vehicles={vehicles}
          selectedId={selectedVehicle?.id || null}
          onSelect={setSelectedVehicle}
        />

        <Input
          label="Actual Kilometers Traveled"
          value={actualKm}
          onChangeText={setActualKm}
          keyboardType="numeric"
          placeholder="Enter total km"
        />

        <Input
          label="Number of Days"
          value={actualDays}
          onChangeText={setActualDays}
          keyboardType="numeric"
          placeholder="1"
        />

        <Input
          label="Driver Bata per Day (₹)"
          value={bataPerDay}
          onChangeText={setBataPerDay}
          keyboardType="numeric"
          placeholder={DEFAULT_BATA_PER_DAY.toString()}
        />

        <Input
          label="Actual Tolls Paid (₹)"
          value={actualTolls}
          onChangeText={setActualTolls}
          keyboardType="numeric"
          placeholder="0"
        />
      </Card>

      <Button
        title="Calculate Final Fare"
        onPress={handleCalculate}
        disabled={!selectedVehicle || !actualKm}
        style={styles.calculateButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  calculateButton: {
    marginTop: 16,
  },
});
