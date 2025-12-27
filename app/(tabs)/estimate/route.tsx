import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Switch,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { Button, Card, LoadingSpinner } from '../../../src/components/ui';
import { PlaceSearchInput, WaypointList, RoutePreview } from '../../../src/components/location';
import { useRouteCalculation, useVehicles, useTrips } from '../../../src/hooks';
import { Place, Waypoint, Route } from '../../../src/types';
import { searchPlaces } from '../../../src/services/nominatim';

type EditingWaypoint = 'start' | 'end' | 'waypoint' | null;

export default function EstimateRouteScreen() {
  const params = useLocalSearchParams<{
    customerName: string;
    customerPhone: string;
    proposedStartDate: string;
    vehicleId: string;
    numberOfDays: string;
    bataPerDay: string;
    estimatedTolls: string;
    notes: string;
  }>();
  const router = useRouter();
  const { getVehicle } = useVehicles();
  const { createProposal } = useTrips();
  const { route, isCalculating, calculateRoute, error } = useRouteCalculation();

  const [startPlace, setStartPlace] = useState<Place | null>(null);
  const [endPlace, setEndPlace] = useState<Place | null>(null);
  const [intermediateWaypoints, setIntermediateWaypoints] = useState<Place[]>([]);
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<EditingWaypoint>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [isSaving, setIsSaving] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  const vehicle = getVehicle(params.vehicleId);

  useEffect(() => {
    if (editingWaypoint && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingWaypoint]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // When round trip is toggled on, set end place to start place
  useEffect(() => {
    if (isRoundTrip && startPlace) {
      setEndPlace(startPlace);
    } else if (!isRoundTrip && startPlace && endPlace?.id === startPlace.id) {
      setEndPlace(null);
    }
  }, [isRoundTrip, startPlace]);

  const handleSelectPlace = (place: Place) => {
    if (editingWaypoint === 'start') {
      setStartPlace(place);
      if (isRoundTrip) {
        setEndPlace(place);
      }
    } else if (editingWaypoint === 'end') {
      setEndPlace(place);
    } else if (editingWaypoint === 'waypoint') {
      if (editingIndex >= 0) {
        const updated = [...intermediateWaypoints];
        updated[editingIndex] = place;
        setIntermediateWaypoints(updated);
      } else {
        setIntermediateWaypoints([...intermediateWaypoints, place]);
      }
    }
    setEditingWaypoint(null);
    setEditingIndex(-1);
    setSearchQuery('');
    setSearchResults([]);
  };

  const buildWaypoints = useCallback((): Waypoint[] => {
    const waypoints: Waypoint[] = [];

    if (startPlace) {
      waypoints.push({
        id: uuidv4(),
        place: startPlace,
        order: 0,
        isStart: true,
        isEnd: false,
      });
    }

    intermediateWaypoints.forEach((place, index) => {
      waypoints.push({
        id: uuidv4(),
        place,
        order: index + 1,
        isStart: false,
        isEnd: false,
      });
    });

    const finalEndPlace = isRoundTrip ? startPlace : endPlace;
    if (finalEndPlace) {
      waypoints.push({
        id: uuidv4(),
        place: finalEndPlace,
        order: waypoints.length,
        isStart: false,
        isEnd: true,
      });
    }

    return waypoints;
  }, [startPlace, endPlace, intermediateWaypoints, isRoundTrip]);

  const handleCalculateRoute = async () => {
    const finalEndPlace = isRoundTrip ? startPlace : endPlace;
    if (!startPlace || !finalEndPlace) {
      Alert.alert('Error', 'Please set start and end points');
      return;
    }

    const waypoints = buildWaypoints();
    await calculateRoute(waypoints);
  };

  const handleSaveTrip = async () => {
    if (!route || !vehicle) {
      Alert.alert('Error', 'Please calculate route first');
      return;
    }

    setIsSaving(true);
    try {
      const trip = await createProposal(
        {
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          vehicleId: params.vehicleId,
          proposedStartDate: params.proposedStartDate,
          numberOfDays: params.numberOfDays,
          bataPerDay: params.bataPerDay,
          estimatedTolls: params.estimatedTolls,
          notes: params.notes,
        },
        vehicle,
        route,
        route.totalDistanceKm,
        isRoundTrip
      );

      // Navigate to trip details immediately after saving
      router.replace(`/(tabs)/trips/${trip.id}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to save trip');
    } finally {
      setIsSaving(false);
    }
  };

  const removeWaypoint = (index: number) => {
    const adjustedIndex = index - 1;
    if (adjustedIndex >= 0 && adjustedIndex < intermediateWaypoints.length) {
      setIntermediateWaypoints(intermediateWaypoints.filter((_, i) => i !== adjustedIndex));
    }
  };

  const getEditingTitle = () => {
    if (editingWaypoint === 'start') return 'Start Point';
    if (editingWaypoint === 'end') return 'End Point';
    return 'Waypoint';
  };

  if (editingWaypoint) {
    return (
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Card title={`Search ${getEditingTitle()}`}>
            <View style={styles.searchBox}>
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search for a city or place..."
                placeholderTextColor="#8E8E93"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {isSearching && <LoadingSpinner size="small" message="Searching..." />}

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              style={styles.searchResults}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectPlace(item)}
                >
                  <Text style={styles.resultIcon}>📍</Text>
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName}>{item.shortName}</Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>
                      {item.displayName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />

            <Button
              title="Cancel"
              onPress={() => {
                setEditingWaypoint(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
              variant="outline"
              style={styles.cancelButton}
            />
          </Card>
        </View>
      </View>
    );
  }

  const finalEndPlace = isRoundTrip ? startPlace : endPlace;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Route Points">
        <PlaceSearchInput
          value={startPlace}
          onPress={() => setEditingWaypoint('start')}
          placeholder="Set start point..."
          label="Start Point"
        />

        {/* Round Trip Toggle */}
        <View style={styles.roundTripRow}>
          <Text style={styles.roundTripLabel}>Return to start (Round trip)</Text>
          <Switch
            value={isRoundTrip}
            onValueChange={setIsRoundTrip}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
          />
        </View>

        {!isRoundTrip && (
          <PlaceSearchInput
            value={endPlace}
            onPress={() => setEditingWaypoint('end')}
            placeholder="Set end point..."
            label="End Point"
          />
        )}

        {isRoundTrip && startPlace && (
          <View style={styles.roundTripNote}>
            <Text style={styles.roundTripNoteIcon}>↩️</Text>
            <Text style={styles.roundTripNoteText}>
              Returning to {startPlace.shortName}
            </Text>
          </View>
        )}

        <Button
          title="+ Add Waypoint"
          onPress={() => {
            setEditingWaypoint('waypoint');
            setEditingIndex(-1);
          }}
          variant="outline"
          style={styles.addWaypointButton}
        />

        {intermediateWaypoints.length > 0 && (
          <View style={styles.waypointsSection}>
            <Text style={styles.waypointsSectionTitle}>Stops</Text>
            {intermediateWaypoints.map((place, index) => (
              <View key={index} style={styles.waypointItem}>
                <Text style={styles.waypointNumber}>{index + 1}</Text>
                <Text style={styles.waypointName} numberOfLines={1}>
                  {place.shortName}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setIntermediateWaypoints(
                      intermediateWaypoints.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <Text style={styles.waypointRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Button
        title="Calculate Route Distance"
        onPress={handleCalculateRoute}
        loading={isCalculating}
        disabled={!startPlace || !finalEndPlace}
        style={styles.calculateButton}
      />

      {error && (
        <Card style={styles.errorCard}>
          <Text style={styles.errorText}>{error.message}</Text>
        </Card>
      )}

      {route && (
        <>
          <RoutePreview route={route} />
          <Button
            title="Save Trip Proposal"
            onPress={handleSaveTrip}
            loading={isSaving}
            style={styles.proceedButton}
          />
        </>
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
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    color: '#1C1C1E',
  },
  clearButton: {
    padding: 8,
  },
  clearIcon: {
    fontSize: 14,
    color: '#8E8E93',
  },
  searchResults: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  resultAddress: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 16,
  },
  roundTripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
    marginBottom: 12,
  },
  roundTripLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  roundTripNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F9E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  roundTripNoteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  roundTripNoteText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '500',
  },
  addWaypointButton: {
    marginTop: 8,
  },
  waypointsSection: {
    marginTop: 16,
  },
  waypointsSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  waypointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  waypointNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 10,
  },
  waypointName: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
  },
  waypointRemove: {
    fontSize: 16,
    color: '#8E8E93',
    padding: 4,
  },
  calculateButton: {
    marginTop: 16,
  },
  errorCard: {
    marginTop: 16,
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  proceedButton: {
    marginTop: 16,
  },
});
