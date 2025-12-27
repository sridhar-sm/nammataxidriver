import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVehicles, useFareCalculation } from '../../../src/hooks';
import { FareBreakdown } from '../../../src/components/fare';
import { Button, Card, LoadingSpinner } from '../../../src/components/ui';
import { formatDistance, formatCurrency } from '../../../src/utils/formatters';

export default function CalculateResultScreen() {
  const params = useLocalSearchParams<{
    vehicleId: string;
    actualKm: string;
    actualDays: string;
    bataPerDay: string;
    actualTolls: string;
  }>();
  const router = useRouter();
  const { getVehicle, isLoading } = useVehicles();
  const { calculateActualFare } = useFareCalculation();

  const vehicle = getVehicle(params.vehicleId);
  const actualKm = parseFloat(params.actualKm) || 0;
  const actualDays = parseInt(params.actualDays) || 1;
  const bataPerDay = parseFloat(params.bataPerDay) || 0;
  const actualTolls = parseFloat(params.actualTolls) || 0;

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.errorText}>Vehicle not found</Text>
        </Card>
      </View>
    );
  }

  const fareBreakdown = calculateActualFare({
    vehicleId: vehicle.id,
    ratePerKm: vehicle.ratePerKm,
    minKmPerDay: vehicle.minKmPerDay,
    actualDistanceKm: actualKm,
    actualDays,
    bataPerDay,
    actualTolls,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Trip Summary" style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Vehicle</Text>
          <Text style={styles.summaryValue}>{vehicle.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Type</Text>
          <Text style={styles.summaryValue}>
            {vehicle.carSize} • {vehicle.fuelType} • {vehicle.acOption}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Rate</Text>
          <Text style={styles.summaryValue}>{formatCurrency(vehicle.ratePerKm)}/km</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Min km/day</Text>
          <Text style={styles.summaryValue}>{vehicle.minKmPerDay} km</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Actual Distance</Text>
          <Text style={styles.summaryValue}>{formatDistance(actualKm)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Number of Days</Text>
          <Text style={styles.summaryValue}>{actualDays}</Text>
        </View>
      </Card>

      <FareBreakdown
        breakdown={fareBreakdown}
        ratePerKm={vehicle.ratePerKm}
        bataPerDay={bataPerDay}
        numberOfDays={actualDays}
      />

      <View style={styles.actions}>
        <Button
          title="New Calculation"
          onPress={() => router.replace('/(tabs)/calculate')}
          variant="outline"
          style={styles.actionButton}
        />
        <Button
          title="Back to Home"
          onPress={() => router.replace('/(tabs)')}
          style={styles.actionButton}
        />
      </View>
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
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
