import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTrips } from '../../../src/hooks';
import { TripCard } from '../../../src/components/trips';
import { LoadingSpinner } from '../../../src/components/ui';
import { TripStatus, Trip } from '../../../src/types';
import { showAlert, showActionSheet } from '../../../src/utils/alert';

type TabFilter = 'all' | TripStatus;

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'proposed', label: 'Proposed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
];

export default function TripsListScreen() {
  const router = useRouter();
  const { trips, isLoading, refreshTrips, activeTrips, cancelTrip, deleteTrip } = useTrips();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  useFocusEffect(
    useCallback(() => {
      refreshTrips();
    }, [refreshTrips])
  );

  const filteredTrips =
    activeTab === 'all'
      ? trips.filter((t) => t.status !== 'cancelled')
      : trips.filter((t) => t.status === activeTab);

  const handleTripLongPress = (trip: Trip) => {
    const options: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [];

    if (trip.status === 'proposed' || trip.status === 'confirmed') {
      options.push({
        text: 'Cancel Trip',
        style: 'destructive',
        onPress: () => {
          showAlert(
            'Cancel Trip',
            `Are you sure you want to cancel the trip for ${trip.customerName}?`,
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes, Cancel',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await cancelTrip(trip.id);
                  } catch (err) {
                    showAlert('Error', 'Failed to cancel trip');
                  }
                },
              },
            ]
          );
        },
      });
    }

    if (trip.status === 'proposed' || trip.status === 'cancelled') {
      options.push({
        text: 'Delete Trip',
        style: 'destructive',
        onPress: () => {
          showAlert(
            'Delete Trip',
            `Are you sure you want to permanently delete this trip for ${trip.customerName}?`,
            [
              { text: 'No', style: 'cancel' },
              {
                text: 'Yes, Delete',
                style: 'destructive',
                onPress: async () => {
                  try {
                    await deleteTrip(trip.id);
                  } catch (err) {
                    showAlert('Error', 'Failed to delete trip');
                  }
                },
              },
            ]
          );
        },
      });
    }

    if (options.length > 0) {
      options.push({ text: 'Close', style: 'cancel' });
      showActionSheet(trip.customerName, 'Select an action', options);
    }
  };

  if (isLoading && trips.length === 0) {
    return <LoadingSpinner message="Loading trips..." />;
  }

  return (
    <View style={styles.container}>
      {/* Active Trip Banner */}
      {activeTrips.length > 0 && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => router.push(`/(tabs)/trips/${activeTrips[0].id}`)}
        >
          <View style={styles.activeBannerContent}>
            <Text style={styles.activeBannerIcon}>🚗</Text>
            <View style={styles.activeBannerText}>
              <Text style={styles.activeBannerTitle}>Trip in Progress</Text>
              <Text style={styles.activeBannerSubtitle}>
                {activeTrips[0].customerName} - {activeTrips[0].startLocationName}
              </Text>
            </View>
            <Text style={styles.activeBannerArrow}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trips List */}
      {filteredTrips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Trips</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'all'
              ? 'Create your first trip estimate'
              : `No ${activeTab} trips`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
              onLongPress={() => handleTripLongPress(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  activeBanner: {
    backgroundColor: '#34C759',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  activeBannerIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  activeBannerText: {
    flex: 1,
  },
  activeBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  activeBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  activeBannerArrow: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexGrow: 0,
    marginTop: 16,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
