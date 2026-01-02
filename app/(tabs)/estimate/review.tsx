import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useEstimate } from '../../../src/contexts';
import { useTrips, useDriverSettings } from '../../../src/hooks';
import { EstimateHeader } from '../../../src/components/estimate';
import { FareBreakdown } from '../../../src/components/fare';
import { Button, Input, Card } from '../../../src/components/ui';
import { formatDistance, formatCurrency, formatDate } from '../../../src/utils/formatters';
import { calculateFare } from '../../../src/utils/fareCalculator';
import { showAlert } from '../../../src/utils/alert';
import { colors } from '../../../src/constants/colors';

export default function ReviewScreen() {
  const router = useRouter();
  const { data, updateData, setCurrentStep, resetData } = useEstimate();
  const { createProposal } = useTrips();
  const { settings: driverSettings } = useDriverSettings();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCurrentStep(3);
  }, []);

  const vehicle = data.selectedVehicle;
  const route = data.route;

  if (!vehicle || !route) {
    return (
      <View style={styles.container}>
        <EstimateHeader currentStep={3} title="Review" />
        <View style={styles.content}>
          <Card>
            <Text style={styles.errorText}>
              Missing vehicle or route information. Please go back and complete all steps.
            </Text>
          </Card>
        </View>
      </View>
    );
  }

  const numberOfDays = parseInt(data.numberOfDays) || 1;
  const bataPerDay = parseFloat(data.bataPerDay) || driverSettings.defaultBataPerDay || 0;
  const estimatedTolls = parseFloat(data.estimatedTolls) || 0;
  const discount = parseFloat(data.discount) || 0;

  const effectiveRatePerKm = data.ratePerKmOverride
    ? parseFloat(data.ratePerKmOverride)
    : vehicle.ratePerKm;
  const effectiveMinKm = data.minKmPerDayOverride
    ? parseFloat(data.minKmPerDayOverride)
    : vehicle.minKmPerDay;

  const fareBreakdown = calculateFare({
    vehicleId: vehicle.id,
    ratePerKm: effectiveRatePerKm,
    minKmPerDay: effectiveMinKm,
    totalDistanceKm: route.totalDistanceKm,
    numberOfDays,
    bataPerDay,
    estimatedTolls,
    discount,
  });

  const handleSaveProposal = async () => {
    setIsSaving(true);
    try {
      const vehicleWithOverrides = {
        ...vehicle,
        ratePerKm: effectiveRatePerKm,
        minKmPerDay: effectiveMinKm,
      };

      const trip = await createProposal(
        {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          vehicleId: vehicle.id,
          proposedStartDate: data.proposedStartDate.toISOString().split('T')[0],
          numberOfDays: numberOfDays.toString(),
          bataPerDay: bataPerDay.toString(),
          estimatedTolls: estimatedTolls.toString(),
          notes: data.notes,
          discount: discount.toString(),
          ratePerKmOverride: data.ratePerKmOverride || undefined,
          minKmPerDayOverride: data.minKmPerDayOverride || undefined,
        },
        vehicleWithOverrides,
        route,
        route.totalDistanceKm,
        data.isRoundTrip
      );

      resetData();
      router.replace(`/(tabs)/trips/${trip.id}`);
    } catch (err) {
      showAlert('Error', 'Failed to save trip proposal');
    } finally {
      setIsSaving(false);
    }
  };

  const hasRateOverride = data.ratePerKmOverride || data.minKmPerDayOverride;

  return (
    <View style={styles.container}>
      <EstimateHeader currentStep={3} title="Review Estimate" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card title="Customer">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name</Text>
            <Text style={styles.infoValue}>{data.customerName}</Text>
          </View>
          {data.customerPhone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{data.customerPhone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Proposed Date</Text>
            <Text style={styles.infoValue}>{formatDate(data.proposedStartDate.toISOString())}</Text>
          </View>
        </Card>

        <Card title="Vehicle">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoValue}>{vehicle.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>
              {vehicle.carSize} • {vehicle.fuelType} • {vehicle.acOption}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rate</Text>
            <Text style={[styles.infoValue, hasRateOverride && styles.overrideValue]}>
              {formatCurrency(effectiveRatePerKm)}/km
              {hasRateOverride && data.ratePerKmOverride && ' (custom)'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Min km/day</Text>
            <Text style={[styles.infoValue, hasRateOverride && styles.overrideValue]}>
              {effectiveMinKm} km
              {hasRateOverride && data.minKmPerDayOverride && ' (custom)'}
            </Text>
          </View>
        </Card>

        <Card title="Route">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>From</Text>
            <Text style={styles.infoValue}>{data.startPlace?.shortName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>To</Text>
            <Text style={styles.infoValue}>
              {data.endPlace?.shortName}
              {data.isRoundTrip && ' (Round trip)'}
            </Text>
          </View>
          {data.intermediateWaypoints.length > 0 && (
            <View style={styles.waypointsInfo}>
              <Text style={styles.waypointsLabel}>Via:</Text>
              {data.intermediateWaypoints.map((wp, index) => (
                <Text key={index} style={styles.waypointText}>
                  {index + 1}. {wp.shortName}
                </Text>
              ))}
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Distance</Text>
            <Text style={styles.infoValue}>{formatDistance(route.totalDistanceKm)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Number of Days</Text>
            <Text style={styles.infoValue}>{numberOfDays}</Text>
          </View>
        </Card>

        <Card title="Additional Charges">
          <Input
            label="Estimated Tolls (₹)"
            value={data.estimatedTolls}
            onChangeText={(text) => updateData({ estimatedTolls: text })}
            keyboardType="numeric"
            placeholder="0"
          />
          <Input
            label="Discount (₹)"
            value={data.discount}
            onChangeText={(text) => updateData({ discount: text })}
            keyboardType="numeric"
            placeholder="0"
          />
          <Input
            label="Notes (optional)"
            value={data.notes}
            onChangeText={(text) => updateData({ notes: text })}
            placeholder="Any special instructions..."
            multiline
          />
        </Card>

        <FareBreakdown
          breakdown={fareBreakdown}
          ratePerKm={effectiveRatePerKm}
          bataPerDay={bataPerDay}
          numberOfDays={numberOfDays}
        />

        <View style={styles.actions}>
          <Button
            title="Save Trip Proposal"
            onPress={handleSaveProposal}
            loading={isSaving}
          />
          <Button
            title="Start New Estimate"
            onPress={() => {
              resetData();
              router.replace('/(tabs)/estimate');
            }}
            variant="outline"
            style={styles.newEstimateButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  overrideValue: {
    color: '#2E7D32',
  },
  waypointsInfo: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
  },
  waypointsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
  },
  waypointText: {
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 2,
    paddingLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  newEstimateButton: {
    marginTop: 8,
  },
});
