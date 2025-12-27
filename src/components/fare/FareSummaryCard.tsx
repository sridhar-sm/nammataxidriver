import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../../utils/formatters';

interface FareSummaryCardProps {
  total: number;
  subtitle?: string;
  onPress?: () => void;
}

export function FareSummaryCard({ total, subtitle, onPress }: FareSummaryCardProps) {
  const content = (
    <View style={styles.card}>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.total}>{formatCurrency(total)}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  total: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
