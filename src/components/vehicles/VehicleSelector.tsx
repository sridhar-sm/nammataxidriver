import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Vehicle } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (vehicle: Vehicle) => void;
  label?: string;
  placeholder?: string;
}

export function VehicleSelector({
  vehicles,
  selectedId,
  onSelect,
  label = 'Select Vehicle',
  placeholder = 'Choose a vehicle...',
}: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedId);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        {selectedVehicle ? (
          <View style={styles.selectedContent}>
            <Text style={styles.selectedName}>{selectedVehicle.name}</Text>
            <Text style={styles.selectedDetails}>
              {selectedVehicle.carSize} • {formatCurrency(selectedVehicle.ratePerKm)}/km
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            {vehicles.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No vehicles added yet.</Text>
                <Text style={styles.emptySubtext}>
                  Add a vehicle in the Vehicles tab first.
                </Text>
              </View>
            ) : (
              <FlatList
                data={vehicles}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.id === selectedId && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      setIsOpen(false);
                    }}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.optionName}>{item.name}</Text>
                      <Text style={styles.optionDetails}>
                        {item.carSize} • {item.fuelType} • {item.acOption}
                      </Text>
                      <Text style={styles.optionRate}>
                        {formatCurrency(item.ratePerKm)}/km • Min {item.minKmPerDay} km/day
                      </Text>
                    </View>
                    {item.id === selectedId && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 6,
  },
  selector: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  selectedContent: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  selectedDetails: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  placeholder: {
    fontSize: 16,
    color: '#8E8E93',
  },
  chevron: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  optionSelected: {
    backgroundColor: '#F2F2F7',
  },
  optionContent: {
    flex: 1,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  optionDetails: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  optionRate: {
    fontSize: 13,
    color: '#007AFF',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
});
