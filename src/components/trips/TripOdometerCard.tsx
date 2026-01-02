import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { OdometerReading } from '../../types';
import { colors } from '../../constants/colors';
import { formatDistance } from '../../utils';

interface TripOdometerCardProps {
  odometerStart?: OdometerReading;
  odometerEnd?: OdometerReading;
  actualDistanceKm?: number;
}

export function TripOdometerCard({
  odometerStart,
  odometerEnd,
  actualDistanceKm,
}: TripOdometerCardProps) {
  return (
    <Card title="Odometer">
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Start Reading</Text>
        <Text style={styles.detailValue}>
          {odometerStart?.value.toLocaleString() || '-'} km
        </Text>
      </View>
      {odometerEnd && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>End Reading</Text>
          <Text style={styles.detailValue}>{odometerEnd.value.toLocaleString()} km</Text>
        </View>
      )}
      {actualDistanceKm !== undefined && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Actual Distance</Text>
          <Text style={[styles.detailValue, styles.highlight]}>
            {formatDistance(actualDistanceKm)}
          </Text>
        </View>
      )}
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
  highlight: {
    color: colors.primary,
    fontWeight: '600',
  },
});
