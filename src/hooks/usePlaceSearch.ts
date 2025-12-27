import { useState, useEffect, useCallback, useRef } from 'react';
import { Place } from '../types';
import { searchPlaces } from '../services/nominatim';
import { getRecentSearches, addRecentSearch, clearRecentSearches } from '../services/storage';

const DEBOUNCE_MS = 800;

export function usePlaceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [recentSearches, setRecentSearches] = useState<Place[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const places = await searchPlaces(query);
        setResults(places);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Search failed'));
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const selectPlace = useCallback(async (place: Place) => {
    await addRecentSearch(place);
    const updated = await getRecentSearches();
    setRecentSearches(updated);
    return place;
  }, []);

  const clearRecent = useCallback(async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const reset = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    recentSearches,
    selectPlace,
    clearRecentSearches: clearRecent,
    reset,
  };
}
