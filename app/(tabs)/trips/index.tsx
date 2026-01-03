import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTrips } from '../../../src/hooks';
import { SwipeableTripCard, ConfirmTripModal, StartTripModal } from '../../../src/components/trips';
import { LoadingSpinner } from '../../../src/components/ui';
import { TripStatus, Trip } from '../../../src/types';
import { showAlert } from '../../../src/utils/alert';
import { colors } from '../../../src/constants/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, layout } from '../../../src/constants/spacing';

type TabFilter = 'all' | TripStatus;

const TABS: { key: TabFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'All', icon: 'apps' },
  { key: 'active', label: 'Active', icon: 'car' },
  { key: 'proposed', label: 'Proposed', icon: 'document-text' },
  { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { key: 'completed', label: 'Completed', icon: 'checkmark-done' },
];

interface TripSection {
  title: string;
  data: Trip[];
}

export default function TripsListScreen() {
  const router = useRouter();
  const {
    trips,
    isLoading,
    refreshTrips,
    activeTrips,
    cancelTrip,
    confirmTrip,
    startTrip,
  } = useTrips();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalType, setModalType] = useState<'confirm' | 'start' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshTrips();
    }, [refreshTrips])
  );

  const filteredTrips = useMemo(() => {
    return activeTab === 'all'
      ? trips.filter((t) => t.status !== 'cancelled')
      : trips.filter((t) => t.status === activeTab);
  }, [trips, activeTab]);

  // Group trips by date
  const sections = useMemo((): TripSection[] => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const todayTrips: Trip[] = [];
    const yesterdayTrips: Trip[] = [];
    const thisWeekTrips: Trip[] = [];
    const earlierTrips: Trip[] = [];

    filteredTrips.forEach((trip) => {
      const tripDate = new Date(trip.proposedStartDate);
      if (tripDate >= startOfToday) {
        todayTrips.push(trip);
      } else if (tripDate >= startOfYesterday) {
        yesterdayTrips.push(trip);
      } else if (tripDate >= startOfWeek) {
        thisWeekTrips.push(trip);
      } else {
        earlierTrips.push(trip);
      }
    });

    const result: TripSection[] = [];
    if (todayTrips.length > 0) result.push({ title: 'Today', data: todayTrips });
    if (yesterdayTrips.length > 0) result.push({ title: 'Yesterday', data: yesterdayTrips });
    if (thisWeekTrips.length > 0) result.push({ title: 'This Week', data: thisWeekTrips });
    if (earlierTrips.length > 0) result.push({ title: 'Earlier', data: earlierTrips });

    return result;
  }, [filteredTrips]);

  const handleCancel = (trip: Trip) => {
    showAlert('Cancel Trip', `Are you sure you want to cancel the trip for ${trip.customerName}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelTrip(trip.id);
          } catch {
            showAlert('Error', 'Failed to cancel trip');
          }
        },
      },
    ]);
  };

  const handleConfirmTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalType('confirm');
  };

  const handleStartTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setModalType('start');
  };

  const handleConfirmSubmit = async (data: {
    confirmedStartTime: string;
    confirmedEndTime?: string;
  }) => {
    if (!selectedTrip) return;
    setIsSubmitting(true);
    try {
      await confirmTrip(selectedTrip.id, data);
      setModalType(null);
      setSelectedTrip(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to confirm trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSubmit = async (data: { odometerStart: number; actualStartTime: string }) => {
    if (!selectedTrip) return;
    setIsSubmitting(true);
    try {
      await startTrip(selectedTrip.id, data);
      setModalType(null);
      setSelectedTrip(null);
      refreshTrips();
    } catch {
      showAlert('Error', 'Failed to start trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && trips.length === 0) {
    return <LoadingSpinner message="Loading trips..." />;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Active Trip Banner */}
      {activeTrips.length > 0 && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => router.push(`/(tabs)/trips/${activeTrips[0].id}`)}
        >
          <View style={styles.activeBannerContent}>
            <View style={styles.activeBannerIconContainer}>
              <Ionicons name="car" size={20} color={colors.text.inverse} />
            </View>
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>Trip in Progress</Text>
              <Text style={styles.activeBannerSubtitle} numberOfLines={1}>
                {activeTrips[0].customerName} - {activeTrips[0].startLocationName}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.inverse} />
          </View>
        </TouchableOpacity>
      )}

      {/* Sticky Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? colors.text.inverse : colors.text.secondary}
                  style={styles.tabIcon}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Trips List with Sections */}
      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>No Trips</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'all'
              ? 'Create your first trip estimate'
              : `No ${activeTab} trips`}
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/estimate')}
          >
            <Ionicons name="add-circle" size={20} color={colors.text.inverse} />
            <Text style={styles.emptyButtonText}>New Trip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <SwipeableTripCard
              trip={item}
              onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
              onCancel={() => handleCancel(item)}
              onConfirm={() => handleConfirmTrip(item)}
              onStart={() => handleStartTrip(item)}
            />
          )}
        />
      )}

      {/* Modals */}
      <ConfirmTripModal
        visible={modalType === 'confirm'}
        onClose={() => {
          setModalType(null);
          setSelectedTrip(null);
        }}
        onConfirm={handleConfirmSubmit}
        proposedStartDate={selectedTrip?.proposedStartDate || ''}
        isSubmitting={isSubmitting}
      />

      <StartTripModal
        visible={modalType === 'start'}
        onClose={() => {
          setModalType(null);
          setSelectedTrip(null);
        }}
        onStart={handleStartSubmit}
        isSubmitting={isSubmitting}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  // Active Banner
  activeBanner: {
    backgroundColor: colors.success,
    marginHorizontal: layout.screenPadding,
    marginTop: layout.screenPadding,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  activeBannerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activeBannerText: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
  },
  activeBannerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  // Tabs
  tabsWrapper: {
    backgroundColor: colors.background.primary,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    ...shadows.sm,
  },
  tabsContainer: {
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabIcon: {
    marginRight: spacing.xs,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
  // Section List
  list: {
    padding: layout.screenPadding,
  },
  sectionHeader: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Empty State
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
    marginLeft: spacing.sm,
  },
});
