import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Trip } from '../../types';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { TripStatusBadge } from './TripStatusBadge';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onLongPress?: () => void;
}

export function TripCard({ trip, onPress, onLongPress }: TripCardProps) {
  const totalAdvances = (trip.advancePayments || []).reduce((sum, p) => sum + p.amount, 0);
  const isCompleted = trip.status === 'completed';
  const isActive = trip.status === 'active';
  const baseTotal =
    isCompleted && trip.actualFareBreakdown
      ? trip.actualFareBreakdown.grandTotal
      : trip.estimatedFareBreakdown.grandTotal;
  const showBalance = (isCompleted || isActive) && totalAdvances > 0;
  const balanceDue = baseTotal - totalAdvances;
  const displayTotal = showBalance ? Math.abs(balanceDue) : baseTotal;
  const totalLabel = showBalance
    ? balanceDue < 0
      ? isCompleted
        ? 'Refund Due'
        : 'Est. Refund Due'
      : isCompleted
        ? 'Balance Due'
        : 'Estimated Balance Due'
    : isCompleted
      ? 'Final Fare'
      : 'Estimated';

  const displayDistance =
    isCompleted && trip.actualDistanceKm
      ? trip.actualDistanceKm
      : trip.estimatedDistanceKm;
  const displayDays =
    isCompleted && trip.actualDays
      ? trip.actualDays
      : trip.numberOfDays;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.customerName}>{trip.customerName}</Text>
          <Text style={styles.vehicleName}>{trip.vehicleSnapshot.name}</Text>
        </View>
        <TripStatusBadge status={trip.status} />
      </View>

      <View style={styles.route}>
        <View style={styles.routePoint}>
          <Text style={styles.routeIcon}>📍</Text>
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.startLocationName || 'Start location'}
          </Text>
        </View>
        <View style={styles.routeArrow}>
          <Text style={styles.arrowText}>
            {trip.isRoundTrip ? '↔️' : '→'}
          </Text>
        </View>
        <View style={styles.routePoint}>
          <Text style={styles.routeIcon}>🏁</Text>
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.endLocationName || 'End location'}
            {trip.isRoundTrip && ' (Round trip)'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(trip.proposedStartDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Distance</Text>
          <Text style={styles.detailValue}>{formatDistance(displayDistance)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Days</Text>
          <Text style={styles.detailValue}>{displayDays}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>{totalLabel}</Text>
        <Text style={styles.totalValue}>{formatCurrency(displayTotal)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  vehicleName: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  routePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  routeText: {
    fontSize: 13,
    color: '#3C3C43',
    flex: 1,
  },
  routeArrow: {
    paddingHorizontal: 8,
  },
  arrowText: {
    fontSize: 16,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
});
