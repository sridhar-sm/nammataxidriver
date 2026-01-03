import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '../../src/components/ui';
import { TripCard } from '../../src/components/trips';
import { useVehicles, useTrips } from '../../src/hooks';
import { formatCurrency, formatDistance } from '../../src/utils/formatters';
import { colors } from '../../src/constants/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, layout } from '../../src/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();
  const { vehicles } = useVehicles();
  const {
    trips,
    activeTrips,
    proposedTrips,
    confirmedTrips,
    completedTrips,
    earningsSummary,
    refreshTrips,
  } = useTrips();

  useFocusEffect(
    useCallback(() => {
      refreshTrips();
    }, [refreshTrips])
  );

  const upcomingTrips = [...proposedTrips, ...confirmedTrips]
    .sort((a, b) => new Date(a.proposedStartDate).getTime() - new Date(b.proposedStartDate).getTime())
    .slice(0, 3);

  const hasActiveTrip = activeTrips.length > 0;
  const activeTrip = activeTrips[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Taxi Fare Calculator</Text>
      <Text style={styles.subtitle}>Manage your trips and fares</Text>

      {/* Active Trip Banner - Prominent when trip in progress */}
      {hasActiveTrip && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => router.push(`/(tabs)/trips/${activeTrip.id}`)}
        >
          <View style={styles.activeBannerContent}>
            <View style={styles.activeBannerLeft}>
              <View style={styles.activeBannerIconContainer}>
                <Ionicons name="car" size={24} color={colors.text.inverse} />
              </View>
              <View style={styles.activeBannerText}>
                <Text style={styles.activeBannerTitle}>Trip in Progress</Text>
                <Text style={styles.activeBannerSubtitle} numberOfLines={1}>
                  {activeTrip.customerName} - {activeTrip.startLocationName || 'On the way'}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.inverse} />
          </View>
        </TouchableOpacity>
      )}

      {/* Today's Summary Card */}
      <Card style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Text style={styles.earningsTitle}>Today's Summary</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/trips?filter=completed')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.earningsRow}>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsAmount}>
              {formatCurrency(earningsSummary.today.totalEarnings)}
            </Text>
            <Text style={styles.earningsLabel}>earned</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsStat}>
            <Text style={styles.earningsCount}>{earningsSummary.today.tripCount}</Text>
            <Text style={styles.earningsLabel}>trips</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsStat}>
            <Text style={styles.earningsCount}>
              {formatDistance(earningsSummary.today.totalDistance)}
            </Text>
            <Text style={styles.earningsLabel}>distance</Text>
          </View>
        </View>
        {earningsSummary.allTime.pendingAmount > 0 && (
          <View style={styles.pendingBanner}>
            <Ionicons name="wallet-outline" size={16} color={colors.warning} />
            <Text style={styles.pendingText}>
              {formatCurrency(earningsSummary.allTime.pendingAmount)} pending collection
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Actions - 2x2 Grid */}
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/estimate')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </View>
          <Text style={styles.quickActionText}>New Trip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/trips')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="list" size={28} color={colors.success} />
          </View>
          <Text style={styles.quickActionText}>My Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/vehicles')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.secondary + '15' }]}>
            <Ionicons name="car-sport" size={28} color={colors.secondary} />
          </View>
          <Text style={styles.quickActionText}>Vehicles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: colors.text.secondary + '15' }]}>
            <Ionicons name="settings" size={28} color={colors.text.secondary} />
          </View>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Status Overview */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.status.proposed }]}>
              {proposedTrips.length}
            </Text>
            <Text style={styles.statLabel}>Proposed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.status.confirmed }]}>
              {confirmedTrips.length}
            </Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.status.completed }]}>
              {completedTrips.length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>
      </Card>

      {/* Upcoming Trips - Horizontal scroll */}
      {upcomingTrips.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Trips</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/trips')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={upcomingTrips}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            renderItem={({ item }) => (
              <View style={styles.horizontalTripCard}>
                <TripCard
                  trip={item}
                  onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
                />
              </View>
            )}
          />
        </View>
      )}

      {/* Get Started Tips */}
      {vehicles.length === 0 && (
        <Card style={styles.tipCard}>
          <Ionicons name="bulb" size={32} color={colors.warning} />
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
          <Ionicons name="rocket" size={32} color={colors.primary} />
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
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: layout.screenPadding,
  },
  title: {
    fontSize: fontSize.largeTitle,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  // Active Trip Banner
  activeBanner: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  activeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeBannerIconContainer: {
    width: 44,
    height: 44,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.inverse,
  },
  activeBannerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  // Earnings Card
  earningsCard: {
    marginBottom: spacing.md,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  earningsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  viewAllLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  earningsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsStat: {
    flex: 1,
    alignItems: 'center',
  },
  earningsAmount: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  earningsCount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  earningsLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  earningsDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.primary,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  pendingText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: fontWeight.medium,
    marginLeft: spacing.sm,
  },
  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickActionCard: {
    width: '48.5%',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.md,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  // Stats Card
  statsCard: {
    marginBottom: spacing.md,
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
    backgroundColor: colors.border.primary,
  },
  statValue: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  // Sections
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionLink: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  horizontalList: {
    paddingRight: spacing.md,
  },
  horizontalTripCard: {
    width: 300,
    marginRight: spacing.sm,
  },
  // Tips
  tipCard: {
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    marginBottom: spacing.md,
  },
  tipTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  tipButton: {
    width: '100%',
  },
});
