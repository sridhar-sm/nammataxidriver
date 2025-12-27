import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Route } from '../../types';
import { formatDistance, formatDuration } from '../../utils/formatters';
import { Card } from '../ui';

interface RoutePreviewProps {
  route: Route;
}

export function RoutePreview({ route }: RoutePreviewProps) {
  return (
    <Card title="Route Summary">
      <View style={styles.totals}>
        <View style={styles.totalItem}>
          <Text style={styles.totalValue}>{formatDistance(route.totalDistanceKm)}</Text>
          <Text style={styles.totalLabel}>Total Distance</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalItem}>
          <Text style={styles.totalValue}>{formatDuration(route.totalDurationMinutes)}</Text>
          <Text style={styles.totalLabel}>Est. Duration</Text>
        </View>
      </View>

      {route.segments.length > 0 && (
        <View style={styles.segments}>
          <Text style={styles.segmentsTitle}>Route Segments</Text>
          {route.segments.map((segment, index) => (
            <View key={index} style={styles.segment}>
              <View style={styles.segmentRoute}>
                <Text style={styles.segmentFrom}>{segment.from.place.shortName}</Text>
                <Text style={styles.segmentArrow}>→</Text>
                <Text style={styles.segmentTo}>{segment.to.place.shortName}</Text>
              </View>
              <Text style={styles.segmentDistance}>
                {formatDistance(segment.distanceKm)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  totals: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalItem: {
    flex: 1,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  totalLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  segments: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
  },
  segmentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  segment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  segmentRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  segmentFrom: {
    fontSize: 14,
    color: '#1C1C1E',
    maxWidth: '40%',
  },
  segmentArrow: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 8,
  },
  segmentTo: {
    fontSize: 14,
    color: '#1C1C1E',
    maxWidth: '40%',
  },
  segmentDistance: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
});
