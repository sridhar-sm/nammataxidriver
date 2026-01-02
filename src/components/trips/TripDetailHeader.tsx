import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { TripStatusBadge } from './TripStatusBadge';
import { TripStatus } from '../../types';
import { colors } from '../../constants/colors';
import { formatDate } from '../../utils';

interface TripDetailHeaderProps {
  status: TripStatus;
  customerName: string;
  customerPhone?: string;
  createdAt: string;
}

export function TripDetailHeader({
  status,
  customerName,
  customerPhone,
  createdAt,
}: TripDetailHeaderProps) {
  return (
    <Card style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <TripStatusBadge status={status} />
        <Text style={styles.createdAt}>Created {formatDate(createdAt)}</Text>
      </View>
      <Text style={styles.customerName}>{customerName}</Text>
      {customerPhone && <Text style={styles.customerPhone}>{customerPhone}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
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
    color: colors.text.secondary,
  },
  customerName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  customerPhone: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
});
