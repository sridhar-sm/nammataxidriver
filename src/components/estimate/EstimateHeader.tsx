import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StepIndicator } from '../ui';
import { colors } from '../../constants/colors';

const STEPS = [
  { label: 'Customer', shortLabel: 'Customer' },
  { label: 'Vehicle', shortLabel: 'Vehicle' },
  { label: 'Route', shortLabel: 'Route' },
  { label: 'Review', shortLabel: 'Review' },
];

interface EstimateHeaderProps {
  currentStep: number;
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function EstimateHeader({
  currentStep,
  title,
  onBack,
  showBackButton = true,
}: EstimateHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {showBackButton && currentStep > 0 ? (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder} />
      </View>
      <StepIndicator steps={STEPS} currentStep={currentStep} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
  },
  backButton: {
    paddingVertical: 4,
    paddingRight: 8,
    minWidth: 70,
  },
  backText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    minWidth: 70,
  },
});
