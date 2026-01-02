import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useEstimate } from '../../../src/contexts';
import { useVehicles, useDriverSettings } from '../../../src/hooks';
import { EstimateHeader } from '../../../src/components/estimate';
import { VehicleSelector } from '../../../src/components/vehicles';
import { Button, Input, Card } from '../../../src/components/ui';
import { showAlert } from '../../../src/utils/alert';
import { formatCurrency } from '../../../src/utils/formatters';
import { colors } from '../../../src/constants/colors';

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useEstimate();
  const { vehicles } = useVehicles();
  const { settings: driverSettings } = useDriverSettings();
  const [showRateOverride, setShowRateOverride] = useState(false);

  useEffect(() => {
    setCurrentStep(1);
  }, []);

  useEffect(() => {
    if (data.selectedVehicle) {
      const hasOverrides = data.ratePerKmOverride || data.minKmPerDayOverride;
      setShowRateOverride(!!hasOverrides);
    }
  }, [data.selectedVehicle]);

  const handleNext = () => {
    if (!data.selectedVehicle) {
      showAlert('Error', 'Please select a vehicle');
      return;
    }

    const days = parseInt(data.numberOfDays);
    if (isNaN(days) || days < 1) {
      showAlert('Error', 'Please enter valid number of days');
      return;
    }

    router.push('/(tabs)/estimate/route');
  };

  const effectiveRatePerKm = data.ratePerKmOverride
    ? parseFloat(data.ratePerKmOverride)
    : data.selectedVehicle?.ratePerKm || 0;

  const effectiveMinKm = data.minKmPerDayOverride
    ? parseFloat(data.minKmPerDayOverride)
    : data.selectedVehicle?.minKmPerDay || 0;

  return (
    <View style={styles.container}>
      <EstimateHeader currentStep={1} title="Select Vehicle" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card title="Vehicle">
          <VehicleSelector
            vehicles={vehicles}
            selectedId={data.selectedVehicle?.id || null}
            onSelect={(vehicle) => {
              updateData({
                selectedVehicle: vehicle,
                ratePerKmOverride: '',
                minKmPerDayOverride: '',
              });
              setShowRateOverride(false);
            }}
          />
        </Card>

        {data.selectedVehicle && (
          <Card title="Rate Information">
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Default Rate</Text>
              <Text style={styles.rateValue}>
                {formatCurrency(data.selectedVehicle.ratePerKm)}/km
              </Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={styles.rateLabel}>Default Min km/day</Text>
              <Text style={styles.rateValue}>{data.selectedVehicle.minKmPerDay} km</Text>
            </View>

            <View style={styles.overrideToggle}>
              <Text style={styles.overrideLabel}>Adjust rates for this trip</Text>
              <Switch
                value={showRateOverride}
                onValueChange={(value) => {
                  setShowRateOverride(value);
                  if (!value) {
                    updateData({ ratePerKmOverride: '', minKmPerDayOverride: '' });
                  }
                }}
                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
              />
            </View>

            {showRateOverride && (
              <View style={styles.overrideInputs}>
                <Input
                  label="Rate per km (override)"
                  value={data.ratePerKmOverride}
                  onChangeText={(text) => updateData({ ratePerKmOverride: text })}
                  keyboardType="numeric"
                  placeholder={data.selectedVehicle.ratePerKm.toString()}
                />
                <Input
                  label="Min km per day (override)"
                  value={data.minKmPerDayOverride}
                  onChangeText={(text) => updateData({ minKmPerDayOverride: text })}
                  keyboardType="numeric"
                  placeholder={data.selectedVehicle.minKmPerDay.toString()}
                />
                {(data.ratePerKmOverride || data.minKmPerDayOverride) && (
                  <View style={styles.effectiveRates}>
                    <Text style={styles.effectiveTitle}>Effective Rates for This Trip:</Text>
                    <View style={styles.effectiveRow}>
                      <Text style={styles.effectiveLabel}>Rate/km:</Text>
                      <Text style={styles.effectiveValue}>
                        {formatCurrency(effectiveRatePerKm)}
                      </Text>
                    </View>
                    <View style={styles.effectiveRow}>
                      <Text style={styles.effectiveLabel}>Min km/day:</Text>
                      <Text style={styles.effectiveValue}>{effectiveMinKm} km</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </Card>
        )}

        <Card title="Trip Duration">
          <Input
            label="Number of Days"
            value={data.numberOfDays}
            onChangeText={(text) => updateData({ numberOfDays: text })}
            keyboardType="numeric"
            placeholder="1"
          />

          <Input
            label="Driver Bata per Day (₹)"
            value={data.bataPerDay}
            onChangeText={(text) => updateData({ bataPerDay: text })}
            keyboardType="numeric"
            placeholder={driverSettings.defaultBataPerDay?.toString() || '300'}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Next: Plan Route →"
            onPress={handleNext}
            disabled={!data.selectedVehicle}
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
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  rateLabel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  overrideToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  overrideLabel: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  overrideInputs: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  effectiveRates: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  effectiveTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  effectiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  effectiveLabel: {
    fontSize: 14,
    color: '#2E7D32',
  },
  effectiveValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },
  actions: {
    marginTop: 16,
  },
});
