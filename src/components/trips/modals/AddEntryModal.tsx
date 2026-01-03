import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../ui';
import { colors } from '../../../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../../../constants/spacing';
import { showAlert } from '../../../utils/alert';

type EntryType = 'toll' | 'advance';

interface AddEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onAddToll: (amount: number, location: string) => Promise<void>;
  onAddAdvance: (amount: number, reason: string) => Promise<void>;
  isSubmitting: boolean;
  initialTab?: EntryType;
}

export function AddEntryModal({
  visible,
  onClose,
  onAddToll,
  onAddAdvance,
  isSubmitting,
  initialTab = 'toll',
}: AddEntryModalProps) {
  const [activeTab, setActiveTab] = useState<EntryType>(initialTab);
  const [tollAmount, setTollAmount] = useState('');
  const [tollLocation, setTollLocation] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceReason, setAdvanceReason] = useState('');

  const resetForm = () => {
    setTollAmount('');
    setTollLocation('');
    setAdvanceAmount('');
    setAdvanceReason('');
  };

  const handleAddToll = async () => {
    const amount = parseFloat(tollAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Please enter valid toll amount');
      return;
    }
    if (!tollLocation.trim()) {
      showAlert('Error', 'Please enter toll location');
      return;
    }

    await onAddToll(amount, tollLocation.trim());
    resetForm();
  };

  const handleAddAdvance = async () => {
    const amount = parseFloat(advanceAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Please enter valid amount');
      return;
    }
    if (!advanceReason.trim()) {
      showAlert('Error', 'Please enter payment reason');
      return;
    }

    await onAddAdvance(amount, advanceReason.trim());
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (activeTab === 'toll') {
      handleAddToll();
    } else {
      handleAddAdvance();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={handleClose} />
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Entry</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'toll' && styles.tabActive]}
                onPress={() => setActiveTab('toll')}
              >
                <Ionicons
                  name="receipt-outline"
                  size={20}
                  color={activeTab === 'toll' ? colors.primary : colors.text.secondary}
                />
                <Text style={[styles.tabText, activeTab === 'toll' && styles.tabTextActive]}>
                  Toll
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'advance' && styles.tabActive]}
                onPress={() => setActiveTab('advance')}
              >
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color={activeTab === 'advance' ? colors.primary : colors.text.secondary}
                />
                <Text style={[styles.tabText, activeTab === 'advance' && styles.tabTextActive]}>
                  Advance Payment
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <View style={styles.formContent}>
              {activeTab === 'toll' ? (
                <>
                  <Input
                    label="Toll Amount"
                    value={tollAmount}
                    onChangeText={setTollAmount}
                    keyboardType="numeric"
                    placeholder="e.g., 125"
                    prefix="₹"
                  />
                  <Input
                    label="Toll Location"
                    value={tollLocation}
                    onChangeText={setTollLocation}
                    placeholder="e.g., Bangalore-Chennai Highway"
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Amount"
                    value={advanceAmount}
                    onChangeText={setAdvanceAmount}
                    keyboardType="numeric"
                    placeholder="e.g., 5000"
                    prefix="₹"
                  />
                  <Input
                    label="Payment Reason"
                    value={advanceReason}
                    onChangeText={setAdvanceReason}
                    placeholder="e.g., Fuel advance, Initial payment"
                  />
                </>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={styles.actionButton}
              />
              <Button
                title={activeTab === 'toll' ? 'Add Toll' : 'Add Payment'}
                onPress={handleSubmit}
                loading={isSubmitting}
                style={styles.actionButton}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.primary,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.background.secondary,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary,
  },
  formContent: {
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
