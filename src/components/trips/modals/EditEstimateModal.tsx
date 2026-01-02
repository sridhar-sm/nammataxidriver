import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, ScrollView, Text } from 'react-native';
import { Button, Card, Input } from '../../ui';
import { FareBreakdown } from '../../fare';
import { Trip } from '../../../types';
import { calculateFare } from '../../../utils/fareCalculator';
import { formatCurrency, formatDistance } from '../../../utils/formatters';
import { colors } from '../../../constants/colors';

interface EditEstimateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: {
    numberOfDays: number;
    bataPerDay: number;
    estimatedTolls: number;
    discount: number;
    notes?: string;
  }) => Promise<void>;
  trip: Trip;
  isSubmitting: boolean;
}

export function EditEstimateModal({
  visible,
  onClose,
  onSave,
  trip,
  isSubmitting,
}: EditEstimateModalProps) {
  const [numberOfDays, setNumberOfDays] = useState('');
  const [bataPerDay, setBataPerDay] = useState('');
  const [estimatedTolls, setEstimatedTolls] = useState('');
  const [discount, setDiscount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible && trip) {
      setNumberOfDays(trip.numberOfDays.toString());
      setBataPerDay(trip.bataPerDay.toString());
      setEstimatedTolls(trip.estimatedTolls.toString());
      setDiscount((trip.discount || 0).toString());
      setNotes(trip.notes || '');
    }
  }, [visible, trip]);

  const effectiveRatePerKm = trip.ratePerKmOverride ?? trip.vehicleSnapshot.ratePerKm;
  const effectiveMinKm = trip.minKmPerDayOverride ?? trip.vehicleSnapshot.minKmPerDay;

  const parsedDays = parseInt(numberOfDays) || trip.numberOfDays;
  const parsedBata = parseFloat(bataPerDay) || trip.bataPerDay;
  const parsedTolls = parseFloat(estimatedTolls) || 0;
  const parsedDiscount = parseFloat(discount) || 0;

  const previewBreakdown = calculateFare({
    vehicleId: trip.vehicleId,
    ratePerKm: effectiveRatePerKm,
    minKmPerDay: effectiveMinKm,
    totalDistanceKm: trip.estimatedDistanceKm,
    numberOfDays: parsedDays,
    bataPerDay: parsedBata,
    estimatedTolls: parsedTolls,
    discount: parsedDiscount,
  });

  const handleSave = async () => {
    await onSave({
      numberOfDays: parsedDays,
      bataPerDay: parsedBata,
      estimatedTolls: parsedTolls,
      discount: parsedDiscount,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="Cancel" onPress={onClose} variant="outline" />
          <Text style={styles.headerTitle}>Edit Estimate</Text>
          <Button
            title="Save"
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
          />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Card title="Trip Summary">
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoValue}>{trip.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Route</Text>
              <Text style={styles.infoValue}>
                {trip.startLocationName} {trip.isRoundTrip ? '<->' : '->'} {trip.endLocationName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>{formatDistance(trip.estimatedDistanceKm)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vehicle</Text>
              <Text style={styles.infoValue}>{trip.vehicleSnapshot.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rate</Text>
              <Text style={styles.infoValue}>{formatCurrency(effectiveRatePerKm)}/km</Text>
            </View>
          </Card>

          <Card title="Edit Values">
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
            />
            <Input
              label="Estimated Tolls (₹)"
              value={estimatedTolls}
              onChangeText={setEstimatedTolls}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="Discount (₹)"
              value={discount}
              onChangeText={setDiscount}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions..."
              multiline
            />
          </Card>

          <Text style={styles.previewTitle}>Updated Fare Preview</Text>
          <FareBreakdown
            breakdown={previewBreakdown}
            ratePerKm={effectiveRatePerKm}
            bataPerDay={parsedBata}
            numberOfDays={parsedDays}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
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
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
});
