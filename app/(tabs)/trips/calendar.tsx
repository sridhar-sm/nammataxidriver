import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTrips } from '../../../src/hooks';
import { Trip } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/formatters';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
    dotColor?: string;
    dots?: { key: string; color: string }[];
  };
}

const STATUS_COLORS = {
  proposed: '#FF9500',
  confirmed: '#007AFF',
  active: '#34C759',
  completed: '#8E8E93',
  cancelled: '#FF3B30',
};

export default function CalendarScreen() {
  const router = useRouter();
  const { trips, refreshTrips } = useTrips();
  const [selectedDate, setSelectedDate] = useState<string>('');

  useFocusEffect(
    useCallback(() => {
      refreshTrips();
    }, [refreshTrips])
  );

  // Get marked dates from trips
  const getMarkedDates = (): MarkedDates => {
    const marked: MarkedDates = {};

    trips.forEach((trip) => {
      const date = trip.proposedStartDate.split('T')[0];
      if (!marked[date]) {
        marked[date] = { dots: [] };
      }
      marked[date].dots?.push({
        key: trip.id,
        color: STATUS_COLORS[trip.status],
      });
      marked[date].marked = true;
    });

    // Add selection styling
    if (selectedDate) {
      if (!marked[selectedDate]) {
        marked[selectedDate] = {};
      }
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = '#007AFF';
    }

    return marked;
  };

  // Get trips for selected date
  const getTripsForDate = (date: string): Trip[] => {
    return trips.filter((trip) => trip.proposedStartDate.split('T')[0] === date);
  };

  const selectedTrips = selectedDate ? getTripsForDate(selectedDate) : [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTripAmountInfo = (trip: Trip) => {
    const totalAdvances = (trip.advancePayments || []).reduce((sum, p) => sum + p.amount, 0);
    const isCompleted = trip.status === 'completed';
    const isActive = trip.status === 'active';
    const baseTotal =
      isCompleted && trip.actualFareBreakdown
        ? trip.actualFareBreakdown.grandTotal
        : trip.estimatedFareBreakdown.grandTotal;

    if ((isCompleted || isActive) && totalAdvances > 0) {
      const balanceDue = baseTotal - totalAdvances;
      const label = balanceDue < 0
        ? isCompleted
          ? 'Refund Due'
          : 'Estimated Refund Due'
        : isCompleted
          ? 'Balance Due'
          : 'Estimated Balance Due';
      return { label, amount: Math.abs(balanceDue), showLabel: true };
    }

    return { label: '', amount: baseTotal, showLabel: false };
  };

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        markingType="multi-dot"
        enableSwipeMonths={Platform.OS !== 'web'}
        theme={{
          backgroundColor: '#F2F2F7',
          calendarBackground: '#FFFFFF',
          textSectionTitleColor: '#8E8E93',
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#007AFF',
          dayTextColor: '#1C1C1E',
          textDisabledColor: '#C7C7CC',
          arrowColor: '#007AFF',
          monthTextColor: '#1C1C1E',
          textMonthFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
        }}
        style={styles.calendar}
      />

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.proposed }]} />
          <Text style={styles.legendText}>Proposed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.confirmed }]} />
          <Text style={styles.legendText}>Confirmed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.active }]} />
          <Text style={styles.legendText}>Active</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.completed }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>

      {/* Selected Date Trips */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>{formatDate(selectedDate)}</Text>
          {selectedTrips.length === 0 ? (
            <Text style={styles.noTripsText}>No trips scheduled</Text>
          ) : (
            <FlatList
              data={selectedTrips}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const amountInfo = getTripAmountInfo(item);
                return (
                  <TouchableOpacity
                    style={styles.tripItem}
                    onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
                  >
                    <View
                      style={[
                        styles.tripStatusIndicator,
                        { backgroundColor: STATUS_COLORS[item.status] },
                      ]}
                    />
                    <View style={styles.tripInfo}>
                      <Text style={styles.tripCustomer}>{item.customerName}</Text>
                      <Text style={styles.tripRoute}>
                        {item.startLocationName || 'Start'} {item.isRoundTrip ? '<->' : '->'}{' '}
                        {item.endLocationName || 'End'}
                      </Text>
                    </View>
                    <View style={styles.tripAmountContainer}>
                      {amountInfo.showLabel && (
                        <Text style={styles.tripAmountLabel}>{amountInfo.label}</Text>
                      )}
                      <Text style={styles.tripAmount}>
                        {formatCurrency(amountInfo.amount)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  calendar: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  selectedDateContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 8,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  noTripsText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    paddingVertical: 24,
  },
  tripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  tripStatusIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  tripInfo: {
    flex: 1,
  },
  tripCustomer: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  tripRoute: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  tripAmountContainer: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  tripAmountLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
});
