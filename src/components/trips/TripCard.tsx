import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../../types';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { TripStatusBadge } from './TripStatusBadge';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../../constants/spacing';

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
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.startLocationName || 'Start location'}
          </Text>
        </View>
        <View style={styles.routeArrow}>
          <Ionicons
            name={trip.isRoundTrip ? 'swap-horizontal' : 'arrow-forward'}
            size={16}
            color={colors.text.secondary}
          />
        </View>
        <View style={styles.routePoint}>
          <Ionicons name="flag" size={14} color={colors.success} />
          <Text style={styles.routeText} numberOfLines={1}>
            {trip.endLocationName || 'End location'}
            {trip.isRoundTrip && ' (Round trip)'}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.detailValue}>{formatDate(trip.proposedStartDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.detailValue}>{formatDistance(displayDistance)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.detailValue}>{displayDays} day{displayDays !== 1 ? 's' : ''}</Text>
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
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  customerName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  vehicleName: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  routePoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  routeText: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  routeArrow: {
    paddingHorizontal: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.primary,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
