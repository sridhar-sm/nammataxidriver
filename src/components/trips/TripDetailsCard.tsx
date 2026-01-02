import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { Vehicle } from '../../types';
import { colors } from '../../constants/colors';
import { formatDate, formatCurrency } from '../../utils';

interface TripDetailsCardProps {
  vehicleSnapshot: Vehicle;
  proposedStartDate: string;
  numberOfDays: number;
  bataPerDay: number;
}

export function TripDetailsCard({
  vehicleSnapshot,
  proposedStartDate,
  numberOfDays,
  bataPerDay,
}: TripDetailsCardProps) {
  return (
    <Card title="Trip Details">
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Vehicle</Text>
        <Text style={styles.detailValue}>{vehicleSnapshot.name}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Start Date</Text>
        <Text style={styles.detailValue}>{formatDate(proposedStartDate)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Duration</Text>
        <Text style={styles.detailValue}>{numberOfDays} days</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Rate</Text>
        <Text style={styles.detailValue}>{formatCurrency(vehicleSnapshot.ratePerKm)}/km</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Bata/Day</Text>
        <Text style={styles.detailValue}>{formatCurrency(bataPerDay)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  detailLabel: {
    fontSize: 15,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
});
