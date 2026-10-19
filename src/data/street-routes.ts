import type { RouteSegment } from './routes'

export type BundledStreetRoute = {
  distanceMeters: number
  durationSeconds: number
  geometry: Array<[number, number]>
}

// Sofia routes are requested from the live pedestrian-capable OSM router.
// Keep this map available for future verified offline geometries.
export const bundledStreetRoutes: Record<string, BundledStreetRoute> = {}

export const bundledStreetRouteFor = (segment: RouteSegment) => bundledStreetRoutes[`${segment.from}->${segment.to}`]
