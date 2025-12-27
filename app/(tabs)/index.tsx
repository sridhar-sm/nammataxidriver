import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Button, Card } from '../../src/components/ui';
import { TripCard } from '../../src/components/trips';
import { useVehicles, useTrips } from '../../src/hooks';

export default function HomeScreen() {
  const router = useRouter();
  const { vehicles } = useVehicles();
  const { trips, activeTrips, proposedTrips, confirmedTrips, refreshTrips } = useTrips();

  useFocusEffect(
    useCallback(() => {
      refreshTrips();
    }, [refreshTrips])
  );

  const upcomingTrips = [...proposedTrips, ...confirmedTrips]
    .sort((a, b) => new Date(a.proposedStartDate).getTime() - new Date(b.proposedStartDate).getTime())
    .slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Taxi Fare Calculator</Text>
      <Text style={styles.subtitle}>Manage your trips and fares</Text>

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
                {activeTrips[0].customerName} - Tap to manage
              </Text>
            </View>
            <Text style={styles.activeBannerArrow}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/estimate')}
        >
          <Text style={styles.quickActionIcon}>➕</Text>
          <Text style={styles.quickActionText}>New Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/trips')}
        >
          <Text style={styles.quickActionIcon}>📋</Text>
          <Text style={styles.quickActionText}>My Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/(tabs)/vehicles')}
        >
          <Text style={styles.quickActionIcon}>🚗</Text>
          <Text style={styles.quickActionText}>Vehicles</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{proposedTrips.length}</Text>
            <Text style={styles.statLabel}>Proposed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{confirmedTrips.length}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
        </View>
      </Card>

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trips')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() => router.push(`/(tabs)/trips/${trip.id}`)}
            />
          ))}
        </View>
      )}

      {/* Get Started */}
      {vehicles.length === 0 && (
        <Card style={styles.tipCard}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTitle}>Get Started</Text>
          <Text style={styles.tipText}>
            Add your first vehicle to start creating trip estimates.
          </Text>
          <Button
            title="Add Vehicle"
            onPress={() => router.push('/(tabs)/vehicles/new')}
            variant="outline"
            style={styles.tipButton}
          />
        </Card>
      )}

      {vehicles.length > 0 && trips.length === 0 && (
        <Card style={styles.tipCard}>
          <Text style={styles.tipIcon}>🚀</Text>
          <Text style={styles.tipTitle}>Create Your First Trip</Text>
          <Text style={styles.tipText}>
            Start by creating a trip estimate for your customer.
          </Text>
          <Button
            title="New Trip Estimate"
            onPress={() => router.push('/(tabs)/estimate')}
            style={styles.tipButton}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
  },
  activeBanner: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    marginBottom: 16,
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
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statsCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sectionLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  tipCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
  },
  tipIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  tipButton: {
    width: '100%',
  },
});
