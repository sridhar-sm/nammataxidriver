export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  displayName: string;
  shortName: string;
  coordinates: Coordinates;
  type: string;
}

export interface Waypoint {
  id: string;
  place: Place;
  order: number;
  isStart: boolean;
  isEnd: boolean;
}

export interface RouteSegment {
  from: Waypoint;
  to: Waypoint;
  distanceKm: number;
  durationMinutes: number;
}

export interface Route {
  waypoints: Waypoint[];
  segments: RouteSegment[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
}
