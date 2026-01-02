import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { colors } from '../../constants/colors';

interface TripRouteCardProps {
  startLocationName?: string;
  endLocationName?: string;
  isRoundTrip: boolean;
}

export function TripRouteCard({
  startLocationName,
  endLocationName,
  isRoundTrip,
}: TripRouteCardProps) {
  return (
    <Card title="Route">
      <View style={styles.routeInfo}>
        <View style={styles.routePoint}>
          <Text style={styles.routeLabel}>From</Text>
          <Text style={styles.routeValue}>{startLocationName || 'Not set'}</Text>
        </View>
        <Text style={styles.routeArrow}>{isRoundTrip ? '↔️' : '→'}</Text>
        <View style={styles.routePoint}>
          <Text style={styles.routeLabel}>To</Text>
          <Text style={styles.routeValue}>
            {endLocationName || 'Not set'}
            {isRoundTrip && ' (Round trip)'}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routePoint: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
  },
  routeArrow: {
    fontSize: 24,
    marginHorizontal: 16,
  },
});
