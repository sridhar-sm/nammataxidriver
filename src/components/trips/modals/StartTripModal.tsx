import React, { useState } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, Card, Input } from '../../ui';
import { colors } from '../../../constants/colors';
import { showAlert } from '../../../utils/alert';

interface StartTripModalProps {
  visible: boolean;
  onClose: () => void;
  onStart: (data: { odometerStart: number; actualStartTime: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function StartTripModal({
  visible,
  onClose,
  onStart,
  isSubmitting,
}: StartTripModalProps) {
  const [odometerStart, setOdometerStart] = useState('');

  const handleStart = async () => {
    const odometer = parseFloat(odometerStart);
    if (isNaN(odometer) || odometer <= 0) {
      showAlert('Error', 'Please enter valid odometer reading');
      return;
    }

    await onStart({
      odometerStart: odometer,
      actualStartTime: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    setOdometerStart('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card title="Start Trip" style={styles.modalCard}>
          <Input
            label="Current Odometer Reading (km)"
            value={odometerStart}
            onChangeText={setOdometerStart}
            keyboardType="numeric"
            placeholder="e.g., 45230"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Start Trip"
              onPress={handleStart}
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
