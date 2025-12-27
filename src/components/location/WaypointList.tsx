import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Waypoint } from '../../types';

interface WaypointListProps {
  waypoints: Waypoint[];
  onWaypointPress: (waypoint: Waypoint, index: number) => void;
  onRemoveWaypoint: (index: number) => void;
}

export function WaypointList({
  waypoints,
  onWaypointPress,
  onRemoveWaypoint,
}: WaypointListProps) {
  if (waypoints.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No waypoints added</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {waypoints.map((waypoint, index) => (
        <View key={waypoint.id} style={styles.waypointContainer}>
          <View style={styles.lineContainer}>
            <View style={[styles.dot, waypoint.isStart && styles.startDot, waypoint.isEnd && styles.endDot]} />
            {index < waypoints.length - 1 && <View style={styles.line} />}
          </View>

          <TouchableOpacity
            style={styles.waypoint}
            onPress={() => onWaypointPress(waypoint, index)}
            activeOpacity={0.7}
          >
            <View style={styles.waypointContent}>
              <Text style={styles.waypointLabel}>
                {waypoint.isStart ? 'Start' : waypoint.isEnd ? 'End' : `Stop ${index}`}
              </Text>
              <Text style={styles.waypointName} numberOfLines={1}>
                {waypoint.place.shortName}
              </Text>
            </View>

            {!waypoint.isStart && !waypoint.isEnd && (
              <TouchableOpacity
                onPress={() => onRemoveWaypoint(index)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  waypointContainer: {
    flexDirection: 'row',
    minHeight: 60,
  },
  lineContainer: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8E8E93',
    marginTop: 4,
  },
  startDot: {
    backgroundColor: '#34C759',
  },
  endDot: {
    backgroundColor: '#FF3B30',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E5EA',
    marginTop: 4,
  },
  waypoint: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 8,
    marginBottom: 8,
  },
  waypointContent: {
    flex: 1,
  },
  waypointLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  waypointName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginTop: 2,
  },
  removeIcon: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 4,
  },
});
