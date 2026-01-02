import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, Card, Input } from '../../ui';
import { colors } from '../../../constants/colors';
import { showAlert } from '../../../utils/alert';

interface AddTollModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number, location: string) => Promise<void>;
  isSubmitting: boolean;
}

export function AddTollModal({
  visible,
  onClose,
  onAdd,
  isSubmitting,
}: AddTollModalProps) {
  const [tollAmount, setTollAmount] = useState('');
  const [tollLocation, setTollLocation] = useState('');

  const handleAdd = async () => {
    const amount = parseFloat(tollAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Please enter valid toll amount');
      return;
    }
    if (!tollLocation.trim()) {
      showAlert('Error', 'Please enter toll location');
      return;
    }

    await onAdd(amount, tollLocation.trim());
    setTollAmount('');
    setTollLocation('');
  };

  const handleClose = () => {
    setTollAmount('');
    setTollLocation('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card title="Add Toll" style={styles.modalCard}>
          <Input
            label="Toll Amount (₹)"
            value={tollAmount}
            onChangeText={setTollAmount}
            keyboardType="numeric"
            placeholder="e.g., 125"
          />
          <Input
            label="Toll Location"
            value={tollLocation}
            onChangeText={setTollLocation}
            placeholder="e.g., Bangalore-Chennai Highway"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Add Toll"
              onPress={handleAdd}
              loading={isSubmitting}
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
  },
});
