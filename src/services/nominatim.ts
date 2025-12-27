import { NOMINATIM_BASE_URL, USER_AGENT } from '../constants/api';
import { Place, Coordinates } from '../types';

// Rate limiting: Nominatim requires max 1 request per second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL_MS = 1100; // 1.1 seconds to be safe

async function rateLimitedFetch(url: string, options: RequestInit): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();
  return fetch(url, options);
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

function extractShortName(result: NominatimResult): string {
  if (result.address) {
    const city = result.address.city || result.address.town || result.address.village;
    if (city && result.address.state) {
      return `${city}, ${result.address.state}`;
    }
    if (city) return city;
    if (result.address.state) return result.address.state;
  }
  // Fallback: take first two parts of display name
  const parts = result.display_name.split(',');
  return parts.slice(0, 2).join(',').trim();
}

export async function searchPlaces(query: string, countryCode = 'in'): Promise<Place[]> {
  if (!query.trim()) return [];

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '8',
    countrycodes: countryCode,
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim search failed: ${response.status}`);
  }

  const results: NominatimResult[] = await response.json();

  return results.map((result) => ({
    id: result.place_id.toString(),
    displayName: result.display_name,
    shortName: extractShortName(result),
    coordinates: {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    },
    type: result.type,
  }));
}

export async function reverseGeocode(coords: Coordinates): Promise<Place | null> {
  const params = new URLSearchParams({
    lat: coords.latitude.toString(),
    lon: coords.longitude.toString(),
    format: 'json',
    addressdetails: '1',
  });

  const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const result: NominatimResult = await response.json();

  return {
    id: result.place_id.toString(),
    displayName: result.display_name,
    shortName: extractShortName(result),
    coordinates: coords,
    type: result.type,
  };
}
