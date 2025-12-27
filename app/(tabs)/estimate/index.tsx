import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useVehicles, useDriverSettings } from '../../../src/hooks';
import { VehicleSelector } from '../../../src/components/vehicles';
import { Button, Input, Card, DatePicker } from '../../../src/components/ui';
import { Vehicle } from '../../../src/types';

export default function EstimateStartScreen() {
  const router = useRouter();
  const { vehicles, isLoading } = useVehicles();
  const { settings: driverSettings } = useDriverSettings();

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [proposedStartDate, setProposedStartDate] = useState(new Date());

  // Vehicle and trip details
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [numberOfDays, setNumberOfDays] = useState('1');
  const [bataPerDay, setBataPerDay] = useState('');
  const [estimatedTolls, setEstimatedTolls] = useState('0');
  const [notes, setNotes] = useState('');

  // Set default bata from driver settings
  useEffect(() => {
    if (driverSettings.defaultBataPerDay && !bataPerDay) {
      setBataPerDay(driverSettings.defaultBataPerDay.toString());
    }
  }, [driverSettings.defaultBataPerDay]);

  const formatDateForStorage = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const handleNext = () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    if (!selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    const days = parseInt(numberOfDays);
    if (isNaN(days) || days < 1) {
      Alert.alert('Error', 'Please enter valid number of days');
      return;
    }

    router.push({
      pathname: '/(tabs)/estimate/route',
      params: {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        proposedStartDate: formatDateForStorage(proposedStartDate),
        vehicleId: selectedVehicle.id,
        numberOfDays: days.toString(),
        bataPerDay: bataPerDay || driverSettings.defaultBataPerDay.toString(),
        estimatedTolls: estimatedTolls || '0',
        notes: notes.trim(),
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Customer Details">
        <Input
          label="Customer Name *"
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
        />

        <Input
          label="Customer Phone (optional)"
          value={customerPhone}
          onChangeText={setCustomerPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />

        <DatePicker
          label="Proposed Start Date *"
          value={proposedStartDate}
          onChange={setProposedStartDate}
          mode="date"
          minimumDate={new Date()}
        />
      </Card>

      <Card title="Trip Details">
        <VehicleSelector
          vehicles={vehicles}
          selectedId={selectedVehicle?.id || null}
          onSelect={setSelectedVehicle}
        />

        <Input
          label="Number of Days"
          value={numberOfDays}
          onChangeText={setNumberOfDays}
          keyboardType="numeric"
          placeholder="1"
        />

        <Input
          label="Driver Bata per Day (₹)"
          value={bataPerDay}
          onChangeText={setBataPerDay}
          keyboardType="numeric"
          placeholder={driverSettings.defaultBataPerDay.toString()}
        />

        <Input
          label="Estimated Tolls (₹)"
          value={estimatedTolls}
          onChangeText={setEstimatedTolls}
          keyboardType="numeric"
          placeholder="0"
        />

        <Input
          label="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Any special instructions..."
          multiline
        />
      </Card>

      <Button
        title="Plan Route →"
        onPress={handleNext}
        disabled={!selectedVehicle || !customerName.trim()}
        style={styles.nextButton}
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
  nextButton: {
    marginTop: 16,
  },
});
