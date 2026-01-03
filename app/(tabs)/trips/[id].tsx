import React, { useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
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
  AddEntryModal,
  CompleteTripModal,
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
import { spacing, borderRadius, fontSize, fontWeight, shadows, layout } from '../../../src/constants/spacing';

type ModalType = 'confirm' | 'start' | 'entry' | 'complete' | 'edit' | null;
type DetailTab = 'route' | 'details' | 'payment';

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
  const [activeTab, setActiveTab] = useState<DetailTab>('route');

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'route':
        return (
          <>
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
          </>
        );
      case 'details':
        return (
          <>
            <TripTollsCard tollEntries={trip.tollEntries} />
            <TripAdvancesCard advancePayments={trip.advancePayments || []} />
            {trip.notes && (
              <Card title="Notes">
                <Text style={styles.notesText}>{trip.notes}</Text>
              </Card>
            )}
          </>
        );
      case 'payment':
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TripDetailHeader
          status={trip.status}
          customerName={trip.customerName}
          customerPhone={trip.customerPhone}
          createdAt={trip.createdAt}
        />

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'route' && styles.tabActive]}
            onPress={() => setActiveTab('route')}
          >
            <Ionicons
              name="map-outline"
              size={18}
              color={activeTab === 'route' ? colors.primary : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'route' && styles.tabTextActive]}>
              Route
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'details' && styles.tabActive]}
            onPress={() => setActiveTab('details')}
          >
            <Ionicons
              name="list-outline"
              size={18}
              color={activeTab === 'details' ? colors.primary : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'payment' && styles.tabActive]}
            onPress={() => setActiveTab('payment')}
          >
            <Ionicons
              name="wallet-outline"
              size={18}
              color={activeTab === 'payment' ? colors.primary : colors.text.secondary}
            />
            <Text style={[styles.tabText, activeTab === 'payment' && styles.tabTextActive]}>
              Payment
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>{renderTabContent()}</View>
      </ScrollView>

      {/* Sticky Action Bar */}
      <View style={styles.actionBar}>
        {trip.status === 'proposed' && (
          <>
            <Button
              title="Confirm Trip"
              onPress={() => setModalType('confirm')}
              style={styles.primaryAction}
            />
            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setModalType('edit')}
              >
                <Ionicons name="pencil" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCopyToClipboard}>
                <Ionicons name="share-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
                <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {trip.status === 'confirmed' && (
          <>
            <Button
              title="Start Trip"
              onPress={() => setModalType('start')}
              style={styles.primaryAction}
            />
            <View style={styles.secondaryActions}>
              <TouchableOpacity style={styles.iconButton} onPress={handleCopyToClipboard}>
                <Ionicons name="share-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
                <Ionicons name="close-circle-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {trip.status === 'active' && (
          <>
            <Button
              title="Complete Trip"
              onPress={() => setModalType('complete')}
              style={styles.primaryAction}
            />
            <TouchableOpacity
              style={styles.addEntryButton}
              onPress={() => setModalType('entry')}
            >
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.addEntryText}>Add Entry</Text>
            </TouchableOpacity>
          </>
        )}

        {trip.status === 'completed' && (
          <>
            <Button
              title="Share Summary"
              onPress={handleCopyToClipboard}
              style={styles.primaryAction}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text.secondary} />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
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

      <AddEntryModal
        visible={modalType === 'entry'}
        onClose={() => setModalType(null)}
        onAddToll={handleAddToll}
        onAddAdvance={handleAddAdvance}
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

      <EditEstimateModal
        visible={modalType === 'edit'}
        onClose={() => setModalType(null)}
        onSave={handleEditEstimate}
        trip={trip}
        isSubmitting={isSubmitting}
      />
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
    padding: layout.screenPadding,
    paddingBottom: 120,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.danger,
    textAlign: 'center',
  },
  notesText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  // Tab Navigation
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary + '15',
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabContent: {
    gap: spacing.md,
  },
  // Sticky Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.secondary,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.lg,
  },
  primaryAction: {
    flex: 1,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addEntryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
});
