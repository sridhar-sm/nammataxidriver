import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, Card, Input } from '../../ui';
import { colors } from '../../../constants/colors';
import { showAlert } from '../../../utils/alert';

interface AddAdvanceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (amount: number, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function AddAdvanceModal({
  visible,
  onClose,
  onAdd,
  isSubmitting,
}: AddAdvanceModalProps) {
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  const handleAdd = async () => {
    const amount = parseFloat(advanceAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Please enter valid amount');
      return;
    }
    if (!advanceReason.trim()) {
      showAlert('Error', 'Please enter payment reason');
      return;
    }

    await onAdd(amount, advanceReason.trim());
    setAdvanceAmount('');
    setAdvanceReason('');
  };

  const handleClose = () => {
    setAdvanceAmount('');
    setAdvanceReason('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card title="Add Advance Payment" style={styles.modalCard}>
          <Input
            label="Amount"
            value={advanceAmount}
            onChangeText={setAdvanceAmount}
            keyboardType="numeric"
            placeholder="e.g., 5000"
          />
          <Input
            label="Payment Reason"
            value={advanceReason}
            onChangeText={setAdvanceReason}
            placeholder="e.g., Fuel advance, Initial payment"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Add Payment"
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
