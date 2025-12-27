import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Place } from '../../types';

interface PlaceSearchInputProps {
  value: Place | null;
  onPress: () => void;
  placeholder?: string;
  label?: string;
}

export function PlaceSearchInput({
  value,
  onPress,
  placeholder = 'Search for a place...',
  label,
}: PlaceSearchInputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.input} onPress={onPress} activeOpacity={0.7}>
        {value ? (
          <View style={styles.placeContent}>
            <Text style={styles.placeName} numberOfLines={1}>
              {value.shortName}
            </Text>
            <Text style={styles.placeAddress} numberOfLines={1}>
              {value.displayName}
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Text style={styles.icon}>📍</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
  },
  placeContent: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  placeAddress: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholder: {
    flex: 1,
    fontSize: 16,
    color: '#8E8E93',
  },
  icon: {
    fontSize: 18,
    marginLeft: 8,
  },
});
