import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { FareBreakdown as FareBreakdownType } from '../../types';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils';

interface TripPaymentSummaryProps {
  fareBreakdown: FareBreakdownType;
  totalAdvances: number;
  isCompleted: boolean;
}

export function TripPaymentSummary({
  fareBreakdown,
  totalAdvances,
  isCompleted,
}: TripPaymentSummaryProps) {
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

  if (totalAdvances === 0) {
    return null;
  }

  return (
    <Card title="Payment Summary">
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{isCompleted ? 'Total Fare' : 'Estimated Fare'}</Text>
        <Text style={styles.detailValue}>{formatCurrency(fareBreakdown.grandTotal)}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Advances Received</Text>
        <Text style={[styles.detailValue, styles.advanceHighlight]}>
          {formatCurrency(totalAdvances)}
        </Text>
      </View>
      <View style={[styles.detailRow, styles.paymentTotalRow]}>
        <Text style={[styles.detailLabel, styles.paymentTotalLabel]}>{balanceLabel}</Text>
        <Text style={[styles.detailValue, styles.paymentTotalValue]}>
          {formatCurrency(balanceAmount)}
        </Text>
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
  advanceHighlight: {
    color: colors.success,
    fontWeight: '600',
  },
  paymentTotalRow: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  paymentTotalLabel: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  paymentTotalValue: {
    color: colors.text.primary,
    fontWeight: '700',
  },
});
