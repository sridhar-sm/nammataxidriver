import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TripStatus } from '../../types';

interface TripStatusBadgeProps {
  status: TripStatus;
}

const STATUS_CONFIG: Record<TripStatus, { label: string; color: string; bgColor: string }> = {
  proposed: { label: 'Proposed', color: '#FF9500', bgColor: '#FFF4E5' },
  confirmed: { label: 'Confirmed', color: '#007AFF', bgColor: '#E5F1FF' },
  active: { label: 'Active', color: '#34C759', bgColor: '#E5F9E9' },
  completed: { label: 'Completed', color: '#8E8E93', bgColor: '#F2F2F7' },
  cancelled: { label: 'Cancelled', color: '#FF3B30', bgColor: '#FFEBEA' },
};

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
