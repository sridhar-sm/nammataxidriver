import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEstimate } from '../../../src/contexts';
import { useDriverSettings } from '../../../src/hooks';
import { EstimateHeader } from '../../../src/components/estimate';
import { Button, Input, Card, DatePicker } from '../../../src/components/ui';
import { showAlert } from '../../../src/utils/alert';
import { colors } from '../../../src/constants/colors';

export default function CustomerInfoScreen() {
  const router = useRouter();
  const { data, updateData, setCurrentStep, resetData } = useEstimate();
  const { settings: driverSettings } = useDriverSettings();

  useEffect(() => {
    setCurrentStep(0);
  }, []);

  useEffect(() => {
    if (driverSettings.defaultBataPerDay && !data.bataPerDay) {
      updateData({ bataPerDay: driverSettings.defaultBataPerDay.toString() });
    }
  }, [driverSettings.defaultBataPerDay]);

  const handleNext = () => {
    if (!data.customerName.trim()) {
      showAlert('Error', 'Please enter customer name');
      return;
    }

    router.push('/(tabs)/estimate/vehicle');
  };

  const handleReset = () => {
    resetData();
  };

  return (
    <View style={styles.container}>
      <EstimateHeader
        currentStep={0}
        title="Customer Info"
        showBackButton={false}
      />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card title="Customer Details">
          <Input
            label="Customer Name *"
            value={data.customerName}
            onChangeText={(text) => updateData({ customerName: text })}
            placeholder="Enter customer name"
            autoFocus
          />

          <Input
            label="Customer Phone (optional)"
            value={data.customerPhone}
            onChangeText={(text) => updateData({ customerPhone: text })}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </Card>

        <Card title="Trip Date">
          <DatePicker
            label="Proposed Start Date *"
            value={data.proposedStartDate}
            onChange={(date) => updateData({ proposedStartDate: date })}
            mode="date"
            minimumDate={new Date()}
          />
        </Card>

        <View style={styles.actions}>
          <Button
            title="Next: Select Vehicle →"
            onPress={handleNext}
            disabled={!data.customerName.trim()}
          />
          {(data.customerName || data.customerPhone) && (
            <Button
              title="Start Over"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
            />
          )}
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
  actions: {
    marginTop: 16,
    gap: 12,
  },
  resetButton: {
    marginTop: 8,
  },
});
