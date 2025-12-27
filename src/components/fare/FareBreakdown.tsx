import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FareBreakdown as FareBreakdownType } from '../../types';
import { formatCurrency, formatDistance } from '../../utils/formatters';
import { Card } from '../ui';

interface FareBreakdownProps {
  breakdown: FareBreakdownType;
  ratePerKm: number;
  bataPerDay: number;
  numberOfDays: number;
}

export function FareBreakdown({
  breakdown,
  ratePerKm,
  bataPerDay,
  numberOfDays,
}: FareBreakdownProps) {
  const showMinimumNote = breakdown.chargeableDistance > breakdown.actualDistance;

  return (
    <Card title="Fare Breakdown">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distance Charges</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Actual distance</Text>
          <Text style={styles.value}>{formatDistance(breakdown.actualDistance)}</Text>
        </View>

        {showMinimumNote && (
          <View style={styles.row}>
            <Text style={styles.label}>Chargeable distance (min)</Text>
            <Text style={styles.value}>{formatDistance(breakdown.chargeableDistance)}</Text>
          </View>
        )}

        <View style={styles.row}>
          <Text style={styles.label}>
            {formatDistance(breakdown.chargeableDistance)} × {formatCurrency(ratePerKm)}
          </Text>
          <Text style={styles.value}>{formatCurrency(breakdown.distanceCharges)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Driver Allowance (Bata)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>
            {numberOfDays} days × {formatCurrency(bataPerDay)}
          </Text>
          <Text style={styles.value}>{formatCurrency(breakdown.totalBata)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Tolls</Text>
          <Text style={styles.value}>{formatCurrency(breakdown.totalTolls)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue}>{formatCurrency(breakdown.subtotal)}</Text>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>{formatCurrency(breakdown.grandTotal)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 15,
    color: '#3C3C43',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 4,
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C3C43',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalSection: {
    backgroundColor: '#007AFF',
    marginHorizontal: -16,
    marginBottom: -16,
    marginTop: 12,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
