import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useTrips } from '../../../src/hooks';
import {
  TripDetailHeader,
  TripRouteCard,
  TripDetailsCard,
  TripOdometerCard,
  TripTollsCard,
  TripAdvancesCard,
  TripPaymentSummary,
  ConfirmTripModal,
  StartTripModal,
  AddTollModal,
  CompleteTripModal,
  AddAdvanceModal,
  EditEstimateModal,
} from '../../../src/components/trips';
import { FareBreakdown } from '../../../src/components/fare';
import { Button, Card, LoadingSpinner } from '../../../src/components/ui';
import {
  formatCurrency,
  formatDistance,
  formatDate,
  showAlert,
  calculateCalendarDaysSpanned,
} from '../../../src/utils';
import { colors } from '../../../src/constants/colors';

type ModalType = 'confirm' | 'start' | 'toll' | 'complete' | 'advance' | 'edit' | null;

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const {
    getTrip,
    confirmTrip,
    startTrip,
    addTollEntry,
    addAdvancePayment,
    completeTrip,
    cancelTrip,
    updateProposal,
    isLoading,
    refreshTrips,
  } = useTrips();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trip = getTrip(id);

  useLayoutEffect(() => {
    if (trip) {
      navigation.setOptions({ title: trip.customerName });
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

  const isCompleted = trip.status === 'completed';
  const isActive = trip.status === 'active';
  const fareBreakdown =
    isCompleted && trip.actualFareBreakdown
      ? trip.actualFareBreakdown
      : trip.estimatedFareBreakdown;
  const distance =
    isCompleted && trip.actualDistanceKm ? trip.actualDistanceKm : trip.estimatedDistanceKm;
  const totalTolls = trip.tollEntries.reduce((sum, t) => sum + t.amount, 0);
  const totalAdvances = (trip.advancePayments || []).reduce((sum, p) => sum + p.amount, 0);
  const actualDays =
    isCompleted && (trip.actualDays || (trip.actualStartTime && trip.actualEndTime))
      ? trip.actualDays ?? calculateCalendarDaysSpanned(trip.actualStartTime, trip.actualEndTime)
      : undefined;
  const displayDays = isCompleted && actualDays ? actualDays : trip.numberOfDays;

  // Modal handlers
  const handleConfirm = async (data: {
    confirmedStartTime: string;
    confirmedEndTime?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await confirmTrip(id, data);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to confirm trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStart = async (data: { odometerStart: number; actualStartTime: string }) => {
    setIsSubmitting(true);
    try {
      await startTrip(id, data);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to start trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToll = async (amount: number, location: string) => {
    setIsSubmitting(true);
    try {
      await addTollEntry(id, amount, location);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to add toll');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (data: { odometerEnd: number; actualEndTime: string }) => {
    setIsSubmitting(true);
    try {
      await completeTrip(id, data);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to complete trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAdvance = async (amount: number, reason: string) => {
    setIsSubmitting(true);
    try {
      await addAdvancePayment(id, amount, reason);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to add advance payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    showAlert('Cancel Trip', 'Are you sure you want to cancel this trip?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelTrip(id);
            router.back();
          } catch {
            showAlert('Error', 'Failed to cancel trip');
          }
        },
      },
    ]);
  };

  const handleEditEstimate = async (data: {
    numberOfDays: number;
    bataPerDay: number;
    estimatedTolls: number;
    discount: number;
    notes?: string;
  }) => {
    setIsSubmitting(true);
    try {
      await updateProposal(id, data);
      setModalType(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to update estimate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppText = () => {
    const balanceDue = fareBreakdown.grandTotal - totalAdvances;
    const balanceLabel =
      balanceDue < 0
        ? isCompleted
          ? 'Refund Due'
          : 'Estimated Refund Due'
        : isCompleted
          ? 'Balance Due'
          : 'Estimated Balance Due';
    const balanceAmount = Math.abs(balanceDue);

    let text = '';
    if (trip.status === 'proposed') {
      text = `*Trip Estimate*\n`;
      text += `Customer: ${trip.customerName}\n`;
      text += `Date: ${formatDate(trip.proposedStartDate)}\n`;
      text += `Route: ${trip.startLocationName || 'TBD'} ${trip.isRoundTrip ? '<->' : '->'} ${trip.endLocationName || 'TBD'}\n`;
      text += `\n*Estimate Details*\n`;
      text += `Distance: ${formatDistance(distance)}\n`;
      text += `Days: ${displayDays}\n`;
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
        text += `*${balanceLabel}: ${formatCurrency(balanceAmount)}*`;
      }
    }
    return text;
  };

  const handleCopyToClipboard = async () => {
    const text = generateWhatsAppText();
    await Clipboard.setStringAsync(text);
    showAlert('Copied', 'Trip details copied to clipboard');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TripDetailHeader
        status={trip.status}
        customerName={trip.customerName}
        customerPhone={trip.customerPhone}
        createdAt={trip.createdAt}
      />

      <TripRouteCard
        startLocationName={trip.startLocationName}
        endLocationName={trip.endLocationName}
        isRoundTrip={trip.isRoundTrip}
        route={trip.route}
      />

      <TripDetailsCard
        vehicleSnapshot={trip.vehicleSnapshot}
        proposedStartDate={trip.proposedStartDate}
        numberOfDays={displayDays}
        bataPerDay={trip.bataPerDay}
      />

      {(trip.status === 'active' || trip.status === 'completed') && (
        <TripOdometerCard
          odometerStart={trip.odometerStart}
          odometerEnd={trip.odometerEnd}
          actualDistanceKm={trip.actualDistanceKm}
        />
      )}

      <TripTollsCard tollEntries={trip.tollEntries} />

      <TripAdvancesCard advancePayments={trip.advancePayments || []} />

      {trip.status === 'completed' && trip.actualFareBreakdown ? (
        <FareBreakdown
          breakdown={trip.actualFareBreakdown}
          ratePerKm={trip.vehicleSnapshot.ratePerKm}
          bataPerDay={trip.bataPerDay}
          numberOfDays={displayDays}
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

      {(isCompleted || isActive) && (
        <TripPaymentSummary
          fareBreakdown={fareBreakdown}
          totalAdvances={totalAdvances}
          isCompleted={isCompleted}
        />
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
              title="Edit Estimate"
              onPress={() => setModalType('edit')}
              variant="secondary"
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

      {/* Modals */}
      <ConfirmTripModal
        visible={modalType === 'confirm'}
        onClose={() => setModalType(null)}
        onConfirm={handleConfirm}
        proposedStartDate={trip.proposedStartDate}
        isSubmitting={isSubmitting}
      />

      <StartTripModal
        visible={modalType === 'start'}
        onClose={() => setModalType(null)}
        onStart={handleStart}
        isSubmitting={isSubmitting}
      />

      <AddTollModal
        visible={modalType === 'toll'}
        onClose={() => setModalType(null)}
        onAdd={handleAddToll}
        isSubmitting={isSubmitting}
      />

      <CompleteTripModal
        visible={modalType === 'complete'}
        onClose={() => setModalType(null)}
        onComplete={handleComplete}
        odometerStart={trip.odometerStart?.value}
        actualStartTime={trip.actualStartTime}
        isSubmitting={isSubmitting}
      />

      <AddAdvanceModal
        visible={modalType === 'advance'}
        onClose={() => setModalType(null)}
        onAdd={handleAddAdvance}
        isSubmitting={isSubmitting}
      />

      <EditEstimateModal
        visible={modalType === 'edit'}
        onClose={() => setModalType(null)}
        onSave={handleEditEstimate}
        trip={trip}
        isSubmitting={isSubmitting}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 16,
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
  actionButton: {
    width: '100%',
  },
});
