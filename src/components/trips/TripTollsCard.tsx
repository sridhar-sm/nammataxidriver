import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { TollEntry } from '../../types';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDateTime } from '../../utils';

interface TripTollsCardProps {
  tollEntries: TollEntry[];
}

export function TripTollsCard({ tollEntries }: TripTollsCardProps) {
  const totalTolls = tollEntries.reduce((sum, t) => sum + t.amount, 0);

  if (tollEntries.length === 0) {
    return null;
  }

  return (
    <Card title={`Tolls (${tollEntries.length})`}>
      {tollEntries.map((toll) => (
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
        <Text style={[styles.detailValue, styles.highlight]}>{formatCurrency(totalTolls)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tollEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  tollLocation: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  tollTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  tollAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tollTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  highlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
