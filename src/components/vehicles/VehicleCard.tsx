import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Vehicle } from '../../types';
import { formatCurrency, showAlert } from '../../utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onPress: () => void;
  onDelete: () => void;
}

export function VehicleCard({ vehicle, onPress, onDelete }: VehicleCardProps) {
  const handleDelete = () => {
    showAlert(
      'Delete Vehicle',
      `Are you sure you want to delete "${vehicle.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{vehicle.name}</Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.deleteIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{vehicle.carSize}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{vehicle.fuelType}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{vehicle.acOption}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>{formatCurrency(vehicle.ratePerKm)}/km</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Min km/day</Text>
          <Text style={styles.detailValue}>{vehicle.minKmPerDay} km</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  deleteIcon: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 4,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#3C3C43',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
});
