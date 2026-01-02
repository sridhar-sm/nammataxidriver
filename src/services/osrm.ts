import { OSRM_BASE_URL } from '../constants/api';
import { Coordinates, Route, Waypoint, RouteSegment } from '../types';
import { fetchWithRetry } from '../utils/fetch';

interface OSRMRouteResponse {
  code: string;
  routes: Array<{
    distance: number; // meters
    duration: number; // seconds
    legs: Array<{
      distance: number;
      duration: number;
    }>;
  }>;
}

export async function calculateRoute(waypoints: Waypoint[]): Promise<Route> {
  if (waypoints.length < 2) {
    throw new Error('At least 2 waypoints required');
  }

  // Build coordinates string: lon,lat;lon,lat;...
  const coordsString = waypoints
    .map((wp) => `${wp.place.coordinates.longitude},${wp.place.coordinates.latitude}`)
    .join(';');

  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordsString}?overview=false&steps=false`;

  const response = await fetchWithRetry(url);
  const data: OSRMRouteResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes.length) {
    throw new Error('No route found');
  }

  const route = data.routes[0];
  const segments: RouteSegment[] = [];

  // Build segments from legs
  for (let i = 0; i < route.legs.length; i++) {
    const leg = route.legs[i];
    segments.push({
      from: waypoints[i],
      to: waypoints[i + 1],
      distanceKm: leg.distance / 1000,
      durationMinutes: leg.duration / 60,
    });
  }

  return {
    waypoints,
    segments,
    totalDistanceKm: route.distance / 1000,
    totalDurationMinutes: route.duration / 60,
  };
}

export async function getDistanceBetweenPoints(
  start: Coordinates,
  end: Coordinates
): Promise<{ distanceKm: number; durationMinutes: number }> {
  const coordsString = `${start.longitude},${start.latitude};${end.longitude},${end.latitude}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordsString}?overview=false`;

  const response = await fetchWithRetry(url);
  const data: OSRMRouteResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes.length) {
    throw new Error('No route found');
  }

  return {
    distanceKm: data.routes[0].distance / 1000,
    durationMinutes: data.routes[0].duration / 60,
  };
}
