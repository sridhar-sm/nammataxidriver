import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet } from 'react-native';
import { Button, Card, DatePicker } from '../../ui';
import { colors } from '../../../constants/colors';

interface ConfirmTripModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { confirmedStartTime: string; confirmedEndTime?: string }) => Promise<void>;
  proposedStartDate?: string;
  isSubmitting: boolean;
}

export function ConfirmTripModal({
  visible,
  onClose,
  onConfirm,
  proposedStartDate,
  isSubmitting,
}: ConfirmTripModalProps) {
  const [confirmedStartTime, setConfirmedStartTime] = useState<Date | null>(null);
  const [confirmedEndTime, setConfirmedEndTime] = useState<Date | null>(null);
  const [useConfirmedEndTime, setUseConfirmedEndTime] = useState(false);

  const getDefaultConfirmedTime = () => {
    const now = new Date();
    const dateStr = proposedStartDate?.split('T')[0];
    if (!dateStr) return now;

    const parts = dateStr.split('-').map((value) => parseInt(value, 10));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
      return now;
    }
    const [year, month, day] = parts;
    return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), 0, 0);
  };

  useEffect(() => {
    if (visible && !confirmedStartTime) {
      setConfirmedStartTime(getDefaultConfirmedTime());
    }
    if (visible && !confirmedEndTime && useConfirmedEndTime) {
      setConfirmedEndTime(getDefaultConfirmedTime());
    }
  }, [visible, confirmedStartTime, confirmedEndTime, useConfirmedEndTime, proposedStartDate]);

  const handleConfirm = async () => {
    if (!confirmedStartTime) return;

    await onConfirm({
      confirmedStartTime: confirmedStartTime.toISOString(),
      confirmedEndTime:
        useConfirmedEndTime && confirmedEndTime ? confirmedEndTime.toISOString() : undefined,
    });
  };

  const handleClose = () => {
    setConfirmedStartTime(null);
    setConfirmedEndTime(null);
    setUseConfirmedEndTime(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Card title="Confirm Trip" style={styles.modalCard}>
          {confirmedStartTime && (
            <DatePicker
              label="Confirmed Start Date & Time"
              value={confirmedStartTime}
              onChange={setConfirmedStartTime}
              mode="datetime"
            />
          )}

          {useConfirmedEndTime ? (
            <>
              <DatePicker
                label="Confirmed End Date & Time (optional)"
                value={confirmedEndTime ?? confirmedStartTime ?? new Date()}
                onChange={setConfirmedEndTime}
                mode="datetime"
                minimumDate={confirmedStartTime ?? undefined}
              />
              <Button
                title="Clear End Time"
                variant="outline"
                onPress={() => {
                  setUseConfirmedEndTime(false);
                  setConfirmedEndTime(null);
                }}
                style={styles.inlineButton}
              />
            </>
          ) : (
            <Button
              title="Add End Time (optional)"
              variant="outline"
              onPress={() => {
                setUseConfirmedEndTime(true);
                setConfirmedEndTime(confirmedStartTime ?? getDefaultConfirmedTime());
              }}
              style={styles.inlineButton}
            />
          )}
          <View style={styles.modalActions}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.modalButton}
            />
            <Button
              title="Confirm"
              onPress={handleConfirm}
              loading={isSubmitting}
              disabled={!confirmedStartTime}
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
  inlineButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
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
