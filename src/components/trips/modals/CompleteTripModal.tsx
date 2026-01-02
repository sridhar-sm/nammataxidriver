import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import { Button, Card, Input } from '../../ui';
import { colors } from '../../../constants/colors';
import { showAlert, formatDateTime } from '../../../utils';

interface CompleteTripModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (data: { odometerEnd: number; actualEndTime: string }) => Promise<void>;
  odometerStart?: number;
  actualStartTime?: string;
  isSubmitting: boolean;
}

export function CompleteTripModal({
  visible,
  onClose,
  onComplete,
  odometerStart,
  actualStartTime,
  isSubmitting,
}: CompleteTripModalProps) {
  const [odometerEnd, setOdometerEnd] = useState('');

  const handleComplete = async () => {
    const odometer = parseFloat(odometerEnd);
    if (isNaN(odometer) || odometer <= 0) {
      showAlert('Error', 'Please enter valid odometer reading');
      return;
    }
    if (odometerStart && odometer < odometerStart) {
      showAlert('Error', 'End odometer must be greater than start');
      return;
    }

    await onComplete({
      odometerEnd: odometer,
      actualEndTime: new Date().toISOString(),
    });
  };

  const handleClose = () => {
    setOdometerEnd('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card title="Complete Trip" style={styles.modalCard}>
          <Text style={styles.modalHint}>
            Start odometer: {odometerStart?.toLocaleString() || 0} km
          </Text>
          {actualStartTime && (
            <Text style={styles.modalHint}>
              Start time: {formatDateTime(actualStartTime)}
            </Text>
          )}
          <Input
            label="End Odometer Reading (km)"
            value={odometerEnd}
            onChangeText={setOdometerEnd}
            keyboardType="numeric"
            placeholder="e.g., 45680"
          />
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Complete"
              onPress={handleComplete}
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
  modalHint: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
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
