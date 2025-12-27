import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePlaceSearch } from '../src/hooks';
import { LoadingSpinner } from '../src/components/ui';
import { Place } from '../src/types';

export default function PlaceSearchScreen() {
  const router = useRouter();
  const {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    selectPlace,
  } = usePlaceSearch();

  const handleSelect = async (place: Place) => {
    await selectPlace(place);
    router.back();
  };

  const displayResults = query.trim() ? results : recentSearches;
  const showRecent = !query.trim() && recentSearches.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a city or place..."
          placeholderTextColor="#8E8E93"
          autoFocus
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery('')}
            style={styles.clearButton}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {isSearching && (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="small" message="Searching..." />
        </View>
      )}

      {showRecent && (
        <Text style={styles.sectionTitle}>Recent Searches</Text>
      )}

      <FlatList
        data={displayResults}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelect(item)}
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
        ListEmptyComponent={
          query.trim() && !isSearching ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  loadingContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
