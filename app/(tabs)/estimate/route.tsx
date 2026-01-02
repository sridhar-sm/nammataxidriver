import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { useEstimate } from '../../../src/contexts';
import { EstimateHeader } from '../../../src/components/estimate';
import { Button, Card, LoadingSpinner } from '../../../src/components/ui';
import { PlaceSearchInput, RoutePreview } from '../../../src/components/location';
import { useRouteCalculation } from '../../../src/hooks';
import { Place, Waypoint } from '../../../src/types';
import { searchPlaces } from '../../../src/services/nominatim';
import { showAlert } from '../../../src/utils/alert';
import { colors } from '../../../src/constants/colors';

type EditingWaypoint = 'start' | 'end' | 'waypoint' | null;

export default function RouteScreen() {
  const router = useRouter();
  const { data, updateData, setCurrentStep } = useEstimate();
  const { route, isCalculating, calculateRoute, error } = useRouteCalculation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState<EditingWaypoint>(null);
  const [editingIndex, setEditingIndex] = useState<number>(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setCurrentStep(2);
  }, []);

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

  useEffect(() => {
    if (data.isRoundTrip && data.startPlace) {
      updateData({ endPlace: data.startPlace });
    } else if (!data.isRoundTrip && data.startPlace && data.endPlace?.id === data.startPlace.id) {
      updateData({ endPlace: null });
    }
  }, [data.isRoundTrip, data.startPlace]);

  useEffect(() => {
    if (route) {
      updateData({ route });
    }
  }, [route]);

  const handleSelectPlace = (place: Place) => {
    if (editingWaypoint === 'start') {
      updateData({ startPlace: place });
      if (data.isRoundTrip) {
        updateData({ endPlace: place });
      }
    } else if (editingWaypoint === 'end') {
      updateData({ endPlace: place });
    } else if (editingWaypoint === 'waypoint') {
      if (editingIndex >= 0) {
        const updated = [...data.intermediateWaypoints];
        updated[editingIndex] = place;
        updateData({ intermediateWaypoints: updated });
      } else {
        updateData({ intermediateWaypoints: [...data.intermediateWaypoints, place] });
      }
    }
    setEditingWaypoint(null);
    setEditingIndex(-1);
    setSearchQuery('');
    setSearchResults([]);
  };

  const buildWaypoints = useCallback((): Waypoint[] => {
    const waypoints: Waypoint[] = [];

    if (data.startPlace) {
      waypoints.push({
        id: uuidv4(),
        place: data.startPlace,
        order: 0,
        isStart: true,
        isEnd: false,
      });
    }

    data.intermediateWaypoints.forEach((place, index) => {
      waypoints.push({
        id: uuidv4(),
        place,
        order: index + 1,
        isStart: false,
        isEnd: false,
      });
    });

    const finalEndPlace = data.isRoundTrip ? data.startPlace : data.endPlace;
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
  }, [data.startPlace, data.endPlace, data.intermediateWaypoints, data.isRoundTrip]);

  const handleCalculateRoute = async () => {
    const finalEndPlace = data.isRoundTrip ? data.startPlace : data.endPlace;
    if (!data.startPlace || !finalEndPlace) {
      showAlert('Error', 'Please set start and end points');
      return;
    }

    const waypoints = buildWaypoints();
    await calculateRoute(waypoints);
  };

  const handleNext = () => {
    if (!data.route) {
      showAlert('Error', 'Please calculate route first');
      return;
    }
    router.push('/(tabs)/estimate/review');
  };

  const getEditingTitle = () => {
    if (editingWaypoint === 'start') return 'Start Point';
    if (editingWaypoint === 'end') return 'End Point';
    return 'Waypoint';
  };

  if (editingWaypoint) {
    return (
      <View style={styles.container}>
        <EstimateHeader
          currentStep={2}
          title={`Search ${getEditingTitle()}`}
          onBack={() => {
            setEditingWaypoint(null);
            setSearchQuery('');
            setSearchResults([]);
          }}
        />
        <View style={styles.searchContainer}>
          <Card>
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

  const finalEndPlace = data.isRoundTrip ? data.startPlace : data.endPlace;

  return (
    <View style={styles.container}>
      <EstimateHeader currentStep={2} title="Plan Route" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card title="Route Points">
          <PlaceSearchInput
            value={data.startPlace}
            onPress={() => setEditingWaypoint('start')}
            placeholder="Set start point..."
            label="Start Point"
          />

          <View style={styles.roundTripRow}>
            <Text style={styles.roundTripLabel}>Return to start (Round trip)</Text>
            <Switch
              value={data.isRoundTrip}
              onValueChange={(value) => updateData({ isRoundTrip: value })}
              trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            />
          </View>

          {!data.isRoundTrip && (
            <PlaceSearchInput
              value={data.endPlace}
              onPress={() => setEditingWaypoint('end')}
              placeholder="Set end point..."
              label="End Point"
            />
          )}

          {data.isRoundTrip && data.startPlace && (
            <View style={styles.roundTripNote}>
              <Text style={styles.roundTripNoteIcon}>↩️</Text>
              <Text style={styles.roundTripNoteText}>
                Returning to {data.startPlace.shortName}
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

          {data.intermediateWaypoints.length > 0 && (
            <View style={styles.waypointsSection}>
              <Text style={styles.waypointsSectionTitle}>Stops</Text>
              {data.intermediateWaypoints.map((place, index) => (
                <View key={index} style={styles.waypointItem}>
                  <Text style={styles.waypointNumber}>{index + 1}</Text>
                  <Text style={styles.waypointName} numberOfLines={1}>
                    {place.shortName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      updateData({
                        intermediateWaypoints: data.intermediateWaypoints.filter(
                          (_, i) => i !== index
                        ),
                      });
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
          disabled={!data.startPlace || !finalEndPlace}
          style={styles.calculateButton}
        />

        {error && (
          <Card style={styles.errorCard}>
            <Text style={styles.errorText}>{error.message}</Text>
          </Card>
        )}

        {data.route && (
          <>
            <RoutePreview route={data.route} />
            <Button
              title="Next: Review Estimate →"
              onPress={handleNext}
              style={styles.proceedButton}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
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
