import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { AdvancePayment } from '../../types';
import { colors } from '../../constants/colors';
import { formatCurrency, formatDateTime } from '../../utils';

interface TripAdvancesCardProps {
  advancePayments: AdvancePayment[];
}

export function TripAdvancesCard({ advancePayments }: TripAdvancesCardProps) {
  const totalAdvances = advancePayments.reduce((sum, p) => sum + p.amount, 0);

  if (advancePayments.length === 0) {
    return null;
  }

  return (
    <Card title={`Advance Payments (${advancePayments.length})`}>
      {advancePayments.map((payment) => (
        <View key={payment.id} style={styles.paymentEntry}>
          <View>
            <Text style={styles.paymentReason}>{payment.reason}</Text>
            <Text style={styles.paymentTime}>{formatDateTime(payment.timestamp)}</Text>
          </View>
          <Text style={[styles.paymentAmount, styles.advanceAmount]}>
            {formatCurrency(payment.amount)}
          </Text>
        </View>
      ))}
      <View style={[styles.detailRow, styles.totalRow]}>
        <Text style={styles.detailLabel}>Total Advances</Text>
        <Text style={[styles.detailValue, styles.advanceHighlight]}>
          {formatCurrency(totalAdvances)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  paymentEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.primary,
  },
  paymentReason: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  paymentTime: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  advanceAmount: {
    color: colors.success,
  },
  totalRow: {
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
  advanceHighlight: {
    color: colors.success,
    fontWeight: '600',
  },
});
