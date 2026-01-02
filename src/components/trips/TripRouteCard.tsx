import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { Route, Waypoint } from '../../types';
import { colors } from '../../constants/colors';

interface TripRouteCardProps {
  startLocationName?: string;
  endLocationName?: string;
  isRoundTrip: boolean;
  route?: Route;
}

export function TripRouteCard({
  startLocationName,
  endLocationName,
  isRoundTrip,
  route,
}: TripRouteCardProps) {
  const intermediateWaypoints = route?.waypoints.filter(
    (w) => !w.isStart && !w.isEnd
  ) || [];

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

      {intermediateWaypoints.length > 0 && (
        <View style={styles.waypointsSection}>
          <Text style={styles.waypointsTitle}>Via</Text>
          <View style={styles.waypointsList}>
            {intermediateWaypoints.map((waypoint, index) => (
              <View key={waypoint.id} style={styles.waypointItem}>
                <View style={styles.waypointDot}>
                  <Text style={styles.waypointNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.waypointName} numberOfLines={1}>
                  {waypoint.place.shortName}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
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
  waypointsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  waypointsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  waypointsList: {
    gap: 6,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waypointDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  waypointNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  waypointName: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
});
