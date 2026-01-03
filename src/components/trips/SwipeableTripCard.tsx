import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '../../types';
import { TripCard } from './TripCard';
import { colors } from '../../constants/colors';
import { spacing, borderRadius, fontSize, fontWeight } from '../../constants/spacing';

interface SwipeableTripCardProps {
  trip: Trip;
  onPress: () => void;
  onCancel?: () => void;
  onStart?: () => void;
  onConfirm?: () => void;
}

export function SwipeableTripCard({
  trip,
  onPress,
  onCancel,
  onStart,
  onConfirm,
}: SwipeableTripCardProps) {
  const swipeableRef = useRef<Swipeable>(null);

  const close = () => {
    swipeableRef.current?.close();
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Left swipe: Confirm or Start based on status
    if (trip.status === 'proposed' && onConfirm) {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 0],
      });
      return (
        <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
          <RectButton
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => {
              close();
              onConfirm();
            }}
          >
            <Ionicons name="checkmark-circle" size={24} color={colors.text.inverse} />
            <Text style={styles.actionText}>Confirm</Text>
          </RectButton>
        </Animated.View>
      );
    }

    if (trip.status === 'confirmed' && onStart) {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 0],
      });
      return (
        <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
          <RectButton
            style={[styles.actionButton, styles.startButton]}
            onPress={() => {
              close();
              onStart();
            }}
          >
            <Ionicons name="play-circle" size={24} color={colors.text.inverse} />
            <Text style={styles.actionText}>Start</Text>
          </RectButton>
        </Animated.View>
      );
    }

    return null;
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    // Right swipe: Cancel (for proposed/confirmed)
    if ((trip.status === 'proposed' || trip.status === 'confirmed') && onCancel) {
      const trans = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [80, 0],
      });
      return (
        <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
          <RectButton
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => {
              close();
              onCancel();
            }}
          >
            <Ionicons name="close-circle" size={24} color={colors.text.inverse} />
            <Text style={styles.actionText}>Cancel</Text>
          </RectButton>
        </Animated.View>
      );
    }

    return null;
  };

  const canSwipe = trip.status === 'proposed' || trip.status === 'confirmed';

  if (!canSwipe) {
    return <TripCard trip={trip} onPress={onPress} />;
  }

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
    >
      <TripCard trip={trip} onPress={onPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rightAction: {
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  startButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.danger,
  },
  actionText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
    marginTop: spacing.xs,
  },
});
