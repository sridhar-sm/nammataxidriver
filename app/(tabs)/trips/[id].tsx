import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTrips, useVehicles } from '../../../src/hooks';
import { TripStatusBadge } from '../../../src/components/trips';
import { FareBreakdown } from '../../../src/components/fare';
import { Button, Card, Input, LoadingSpinner } from '../../../src/components/ui';
import { formatCurrency, formatDistance } from '../../../src/utils/formatters';

type ModalType = 'confirm' | 'start' | 'toll' | 'complete' | 'advance' | null;

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { getTrip, confirmTrip, startTrip, addTollEntry, addAdvancePayment, completeTrip, cancelTrip, isLoading, refreshTrips } =
    useTrips();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form states
  const [confirmedStartTime, setConfirmedStartTime] = useState('');
  const [confirmedEndTime, setConfirmedEndTime] = useState('');
  const [odometerStart, setOdometerStart] = useState('');
  const [odometerEnd, setOdometerEnd] = useState('');
  const [tollAmount, setTollAmount] = useState('');
  const [tollLocation, setTollLocation] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  const trip = getTrip(id);

  useLayoutEffect(() => {
    if (trip) {
      navigation.setOptions({
        title: trip.customerName,
      });
    }
  }, [navigation, trip]);

  if (isLoading && !trip) {
    return <LoadingSpinner message="Loading trip..." />;
  }

  if (!trip) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.errorText}>Trip not found</Text>
        </Card>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleConfirm = async () => {
    if (!confirmedStartTime) {
      Alert.alert('Error', 'Please enter start time');
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmTrip(id, {
        confirmedStartTime: new Date(confirmedStartTime).toISOString(),
        confirmedEndTime: confirmedEndTime
          ? new Date(confirmedEndTime).toISOString()
          : undefined,
      });
      setModalType(null);
      refreshTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = async () => {
    const odometer = parseFloat(odometerStart);
    if (isNaN(odometer) || odometer <= 0) {
      Alert.alert('Error', 'Please enter valid odometer reading');
      return;
    }
    setIsSubmitting(true);
    try {
      await startTrip(id, {
        odometerStart: odometer,
        actualStartTime: new Date().toISOString(),
      });
      setModalType(null);
      refreshTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to start trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToll = async () => {
    const amount = parseFloat(tollAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter valid toll amount');
      return;
    }
    if (!tollLocation.trim()) {
      Alert.alert('Error', 'Please enter toll location');
      return;
    }
    setIsSubmitting(true);
    try {
      await addTollEntry(id, amount, tollLocation.trim());
      setTollAmount('');
      setTollLocation('');
      setModalType(null);
      refreshTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to add toll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    const odometer = parseFloat(odometerEnd);
    if (isNaN(odometer) || odometer <= 0) {
      Alert.alert('Error', 'Please enter valid odometer reading');
      return;
    }
    if (trip.odometerStart && odometer < trip.odometerStart.value) {
      Alert.alert('Error', 'End odometer must be greater than start');
      return;
    }
    setIsSubmitting(true);
    try {
      await completeTrip(id, {
        odometerEnd: odometer,
        actualEndTime: new Date().toISOString(),
      });
      setModalType(null);
      refreshTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Trip', 'Are you sure you want to cancel this trip?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelTrip(id);
            router.back();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel trip');
          }
        },
      },
    ]);
  };

  const handleAddAdvance = async () => {
    const amount = parseFloat(advanceAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter valid amount');
      return;
    }
    if (!advanceReason.trim()) {
      Alert.alert('Error', 'Please enter payment reason');
      return;
    }
    setIsSubmitting(true);
    try {
      await addAdvancePayment(id, amount, advanceReason.trim());
      setAdvanceAmount('');
      setAdvanceReason('');
      setModalType(null);
      refreshTrips();
    } catch (error) {
      Alert.alert('Error', 'Failed to add advance payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalTolls = trip.tollEntries.reduce((sum, t) => sum + t.amount, 0);
  const totalAdvances = (trip.advancePayments || []).reduce((sum, p) => sum + p.amount, 0);

  const generateWhatsAppText = () => {
    const fareBreakdown = trip.status === 'completed' && trip.actualFareBreakdown
      ? trip.actualFareBreakdown
      : trip.estimatedFareBreakdown;
    const distance = trip.status === 'completed' && trip.actualDistanceKm
      ? trip.actualDistanceKm
      : trip.estimatedDistanceKm;
    const balance = fareBreakdown.grandTotal - totalAdvances;

    let text = '';
    if (trip.status === 'proposed') {
      text = `*Trip Estimate*\n`;
      text += `Customer: ${trip.customerName}\n`;
      text += `Date: ${formatDate(trip.proposedStartDate)}\n`;
      text += `Route: ${trip.startLocationName || 'TBD'} ${trip.isRoundTrip ? '<->' : '->'} ${trip.endLocationName || 'TBD'}\n`;
      text += `\n*Estimate Details*\n`;
      text += `Distance: ${formatDistance(distance)}\n`;
      text += `Days: ${trip.numberOfDays}\n`;
      text += `Vehicle: ${trip.vehicleSnapshot.name}\n`;
      text += `Rate: ${formatCurrency(trip.vehicleSnapshot.ratePerKm)}/km\n`;
      text += `\n*Fare Breakdown*\n`;
      text += `Distance Charges: ${formatCurrency(fareBreakdown.distanceCharges)}\n`;
      text += `Driver Bata: ${formatCurrency(fareBreakdown.totalBata)}\n`;
      text += `Tolls (Est.): ${formatCurrency(trip.estimatedTolls)}\n`;
      text += `\n*Total Estimate: ${formatCurrency(fareBreakdown.grandTotal)}*`;
    } else if (trip.status === 'confirmed') {
      text = `*Trip Confirmed*\n`;
      text += `Customer: ${trip.customerName}\n`;
      text += `Date: ${formatDate(trip.proposedStartDate)}\n`;
      text += `Route: ${trip.startLocationName || 'TBD'} ${trip.isRoundTrip ? '<->' : '->'} ${trip.endLocationName || 'TBD'}\n`;
      text += `Vehicle: ${trip.vehicleSnapshot.name}\n`;
      text += `\n*Estimated Fare: ${formatCurrency(fareBreakdown.grandTotal)}*`;
    } else if (trip.status === 'completed') {
      text = `*Trip Completed*\n`;
      text += `Customer: ${trip.customerName}\n`;
      text += `Route: ${trip.startLocationName} ${trip.isRoundTrip ? '<->' : '->'} ${trip.endLocationName}\n`;
      text += `\n*Actual Details*\n`;
      text += `Distance: ${formatDistance(distance)}\n`;
      text += `Days: ${trip.numberOfDays}\n`;
      text += `\n*Fare Breakdown*\n`;
      text += `Distance Charges: ${formatCurrency(fareBreakdown.distanceCharges)}\n`;
      text += `Driver Bata: ${formatCurrency(fareBreakdown.totalBata)}\n`;
      text += `Tolls: ${formatCurrency(totalTolls)}\n`;
      text += `\n*Total Fare: ${formatCurrency(fareBreakdown.grandTotal)}*\n`;
      if (totalAdvances > 0) {
        text += `\nAdvances Received: ${formatCurrency(totalAdvances)}\n`;
        text += `*Balance Due: ${formatCurrency(balance)}*`;
      }
    }
    return text;
  };

  const handleCopyToClipboard = async () => {
    const text = generateWhatsAppText();
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Trip details copied to clipboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Header */}
      <Card style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <TripStatusBadge status={trip.status} />
          <Text style={styles.createdAt}>Created {formatDate(trip.createdAt)}</Text>
        </View>
        <Text style={styles.customerName}>{trip.customerName}</Text>
        {trip.customerPhone && (
          <Text style={styles.customerPhone}>{trip.customerPhone}</Text>
        )}
      </Card>

      {/* Route Info */}
      <Card title="Route">
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <Text style={styles.routeLabel}>From</Text>
            <Text style={styles.routeValue}>
              {trip.startLocationName || 'Not set'}
            </Text>
          </View>
          <Text style={styles.routeArrow}>{trip.isRoundTrip ? '↔️' : '→'}</Text>
          <View style={styles.routePoint}>
            <Text style={styles.routeLabel}>To</Text>
            <Text style={styles.routeValue}>
              {trip.endLocationName || 'Not set'}
              {trip.isRoundTrip && ' (Round trip)'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Trip Details */}
      <Card title="Trip Details">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Vehicle</Text>
          <Text style={styles.detailValue}>{trip.vehicleSnapshot.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Start Date</Text>
          <Text style={styles.detailValue}>{formatDate(trip.proposedStartDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>{trip.numberOfDays} days</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(trip.vehicleSnapshot.ratePerKm)}/km
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Bata/Day</Text>
          <Text style={styles.detailValue}>{formatCurrency(trip.bataPerDay)}</Text>
        </View>
      </Card>

      {/* Odometer Readings (if active/completed) */}
      {(trip.status === 'active' || trip.status === 'completed') && (
        <Card title="Odometer">
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start Reading</Text>
            <Text style={styles.detailValue}>
              {trip.odometerStart?.value.toLocaleString() || '-'} km
            </Text>
          </View>
          {trip.odometerEnd && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Reading</Text>
              <Text style={styles.detailValue}>
                {trip.odometerEnd.value.toLocaleString()} km
              </Text>
            </View>
          )}
          {trip.actualDistanceKm && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Actual Distance</Text>
              <Text style={[styles.detailValue, styles.highlight]}>
                {formatDistance(trip.actualDistanceKm)}
              </Text>
            </View>
          )}
        </Card>
      )}

      {/* Toll Entries */}
      {trip.tollEntries.length > 0 && (
        <Card title={`Tolls (${trip.tollEntries.length})`}>
          {trip.tollEntries.map((toll) => (
            <View key={toll.id} style={styles.tollEntry}>
              <View>
                <Text style={styles.tollLocation}>{toll.location}</Text>
                <Text style={styles.tollTime}>{formatDateTime(toll.timestamp)}</Text>
              </View>
              <Text style={styles.tollAmount}>{formatCurrency(toll.amount)}</Text>
            </View>
          ))}
          <View style={[styles.detailRow, styles.tollTotal]}>
            <Text style={styles.detailLabel}>Total Tolls</Text>
            <Text style={[styles.detailValue, styles.highlight]}>
              {formatCurrency(totalTolls)}
            </Text>
          </View>
        </Card>
      )}

      {/* Advance Payments */}
      {(trip.advancePayments || []).length > 0 && (
        <Card title={`Advance Payments (${trip.advancePayments.length})`}>
          {trip.advancePayments.map((payment) => (
            <View key={payment.id} style={styles.tollEntry}>
              <View>
                <Text style={styles.tollLocation}>{payment.reason}</Text>
                <Text style={styles.tollTime}>{formatDateTime(payment.timestamp)}</Text>
              </View>
              <Text style={[styles.tollAmount, styles.advanceAmount]}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}
          <View style={[styles.detailRow, styles.tollTotal]}>
            <Text style={styles.detailLabel}>Total Advances</Text>
            <Text style={[styles.detailValue, styles.advanceHighlight]}>
              {formatCurrency(totalAdvances)}
            </Text>
          </View>
        </Card>
      )}

      {/* Fare Breakdown */}
      {trip.status === 'completed' && trip.actualFareBreakdown ? (
        <FareBreakdown
          breakdown={trip.actualFareBreakdown}
          ratePerKm={trip.vehicleSnapshot.ratePerKm}
          bataPerDay={trip.bataPerDay}
          numberOfDays={trip.numberOfDays}
        />
      ) : (
        <Card title="Estimated Fare">
          <FareBreakdown
            breakdown={trip.estimatedFareBreakdown}
            ratePerKm={trip.vehicleSnapshot.ratePerKm}
            bataPerDay={trip.bataPerDay}
            numberOfDays={trip.numberOfDays}
          />
        </Card>
      )}

      {/* Actions based on status */}
      <View style={styles.actions}>
        {trip.status === 'proposed' && (
          <>
            <Button
              title="Confirm Trip"
              onPress={() => setModalType('confirm')}
              style={styles.actionButton}
            />
            <Button
              title="Copy for WhatsApp"
              onPress={handleCopyToClipboard}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.actionButton}
            />
          </>
        )}

        {trip.status === 'confirmed' && (
          <>
            <Button
              title="Start Trip"
              onPress={() => setModalType('start')}
              style={styles.actionButton}
            />
            <Button
              title="Copy for WhatsApp"
              onPress={handleCopyToClipboard}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="outline"
              style={styles.actionButton}
            />
          </>
        )}

        {trip.status === 'active' && (
          <>
            <Button
              title="Add Toll"
              onPress={() => setModalType('toll')}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Add Advance Payment"
              onPress={() => setModalType('advance')}
              variant="secondary"
              style={styles.actionButton}
            />
            <Button
              title="Complete Trip"
              onPress={() => setModalType('complete')}
              style={styles.actionButton}
            />
          </>
        )}

        {trip.status === 'completed' && (
          <>
            <Button
              title="Copy for WhatsApp"
              onPress={handleCopyToClipboard}
              style={styles.actionButton}
            />
            <Button
              title="Back to Trips"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
          </>
        )}
      </View>

      {/* Confirm Modal */}
      <Modal visible={modalType === 'confirm'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card title="Confirm Trip" style={styles.modalCard}>
            <Input
              label="Confirmed Start Date & Time"
              value={confirmedStartTime}
              onChangeText={setConfirmedStartTime}
              placeholder="YYYY-MM-DD HH:MM"
            />
            <Input
              label="Confirmed End Date & Time (optional)"
              value={confirmedEndTime}
              onChangeText={setConfirmedEndTime}
              placeholder="YYYY-MM-DD HH:MM"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalType(null)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={handleConfirm}
                loading={isSubmitting}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Start Trip Modal */}
      <Modal visible={modalType === 'start'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card title="Start Trip" style={styles.modalCard}>
            <Input
              label="Current Odometer Reading (km)"
              value={odometerStart}
              onChangeText={setOdometerStart}
              keyboardType="numeric"
              placeholder="e.g., 45230"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalType(null)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Start Trip"
                onPress={handleStart}
                loading={isSubmitting}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Add Toll Modal */}
      <Modal visible={modalType === 'toll'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card title="Add Toll" style={styles.modalCard}>
            <Input
              label="Toll Amount (₹)"
              value={tollAmount}
              onChangeText={setTollAmount}
              keyboardType="numeric"
              placeholder="e.g., 125"
            />
            <Input
              label="Toll Location"
              value={tollLocation}
              onChangeText={setTollLocation}
              placeholder="e.g., Bangalore-Chennai Highway"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalType(null)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Toll"
                onPress={handleAddToll}
                loading={isSubmitting}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Complete Trip Modal */}
      <Modal visible={modalType === 'complete'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card title="Complete Trip" style={styles.modalCard}>
            <Text style={styles.modalHint}>
              Start odometer: {trip.odometerStart?.value.toLocaleString() || 0} km
            </Text>
            <Input
              label="End Odometer Reading (km)"
              value={odometerEnd}
              onChangeText={setOdometerEnd}
              keyboardType="numeric"
              placeholder="e.g., 45680"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalType(null)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Complete"
                onPress={handleComplete}
                loading={isSubmitting}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Add Advance Payment Modal */}
      <Modal visible={modalType === 'advance'} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Card title="Add Advance Payment" style={styles.modalCard}>
            <Input
              label="Amount"
              value={advanceAmount}
              onChangeText={setAdvanceAmount}
              keyboardType="numeric"
              placeholder="e.g., 5000"
            />
            <Input
              label="Payment Reason"
              value={advanceReason}
              onChangeText={setAdvanceReason}
              placeholder="e.g., Fuel advance, Initial payment"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setModalType(null)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add Payment"
                onPress={handleAddAdvance}
                loading={isSubmitting}
                style={styles.modalButton}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  createdAt: {
    fontSize: 12,
    color: '#8E8E93',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  customerPhone: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePoint: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  routeArrow: {
    fontSize: 24,
    marginHorizontal: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  detailLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  highlight: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tollEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tollLocation: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  tollTime: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  tollAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  tollTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  advanceAmount: {
    color: '#34C759',
  },
  advanceHighlight: {
    color: '#34C759',
    fontWeight: '600',
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
  },
  modalHint: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});
