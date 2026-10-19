import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'
import { useEffect } from 'react'
import { categoryLabels, type Place } from '../data/places'
import type { TripRoute } from '../data/routes'
import { formatDistance, formatDuration, type RouteResult } from '../lib/routing'

type SofiaMapProps = {
  places: Place[]
  routeDisplays: Array<{ route: TripRoute; result: RouteResult }>
  selectedSegment?: { routeId: string; segmentIndex: number } | null
  onSegmentSelect?: (routeId: string, segmentIndex: number) => void
  onPlaceSelect?: (place: Place) => void
  showPlaceLabels?: boolean
  highlightedPlaceId?: string | null
}

const bounds: LatLngBoundsExpression = [
  [42.615, 23.245],
  [42.710, 23.395],
]

const colors: Record<string, string> = {
  hotel: '#1d3037',
  shopping: '#c68431',
  food: '#c86452',
  history: '#805573',
  dance: '#4a78a4',
  area: '#70955d',
}

function FitSofia({ routePointCoordinates, fitKey }: { routePointCoordinates: string; fitKey: string }) {
  const map = useMap()

  useEffect(() => {
    const routePoints = routePointCoordinates
      ? routePointCoordinates.split(';').map((point) => point.split(',').map(Number) as [number, number])
      : []
    map.fitBounds(routePoints.length > 1 ? routePoints : bounds, { padding: [28, 28], maxZoom: 15 })
  }, [fitKey, map, routePointCoordinates])

  return null
}

function FocusPlace({ place }: { place?: Place }) {
  const map = useMap()

  useEffect(() => {
    if (place) map.setView([place.lat, place.lon], 16, { animate: true })
  }, [map, place])

  return null
}

export function SofiaMap({ places, routeDisplays, selectedSegment = null, onSegmentSelect, onPlaceSelect, showPlaceLabels = true, highlightedPlaceId = null }: SofiaMapProps) {
  const routeStopIds = new Set(routeDisplays.flatMap(({ route }) => route.segments.flatMap((segment) => [segment.from, segment.to])))
  const activeRoute = routeDisplays[0]?.route
  const selectedRouteSegment = selectedSegment?.routeId === activeRoute?.id ? activeRoute.segments[selectedSegment.segmentIndex] : undefined
  const fitPlaceIds = selectedRouteSegment
    ? [selectedRouteSegment.from, selectedRouteSegment.to]
    : activeRoute
      ? activeRoute.segments.flatMap((segment) => [segment.from, segment.to])
      : []
  const fitPlaceIdSet = new Set(fitPlaceIds)
  const routePoints = places.filter((place) => fitPlaceIdSet.has(place.id)).map((place): [number, number] => [place.lat, place.lon])
  const routePointCoordinates = routePoints.map(([lat, lon]) => `${lat},${lon}`).join(';')
  const fitKey = `${activeRoute?.id ?? 'all'}:${selectedSegment?.segmentIndex ?? 'route'}:${fitPlaceIds.join('|')}`
  const routeLegs = routeDisplays.flatMap(({ route, result }) => result.legs.flatMap((leg, index) => leg.geometry.length > 1 ? [{ route, leg, index }] : []))
  const orderedRouteLegs = [
    ...routeLegs.filter(({ route, index }) => !selectedSegment || selectedSegment.routeId !== route.id || selectedSegment.segmentIndex !== index),
    ...routeLegs.filter(({ route, index }) => Boolean(selectedSegment && selectedSegment.routeId === route.id && selectedSegment.segmentIndex === index)),
  ]

  return (
    <MapContainer className="real-map" bounds={bounds} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitSofia fitKey={fitKey} routePointCoordinates={routePointCoordinates} />
      <FocusPlace place={places.find((place) => place.id === highlightedPlaceId)} />
      {orderedRouteLegs.map(({ route, leg, index }) => {
        const isSelected = Boolean(selectedSegment && selectedSegment.routeId === route.id && selectedSegment.segmentIndex === index)
        return (
          <Polyline
            key={`${route.id}-${leg.segment.from}-${leg.segment.to}`}
            eventHandlers={{ click: () => onSegmentSelect?.(route.id, index) }}
            pathOptions={{
              color: isSelected ? '#f0a52b' : route.color,
              dashArray: leg.source === 'fallback' ? '4 8' : leg.segment.optional ? '9 8' : undefined,
              opacity: isSelected ? 1 : leg.source === 'fallback' ? 0.48 : leg.segment.optional ? 0.72 : 0.88,
              weight: isSelected ? 9 : leg.source === 'fallback' ? 3 : leg.segment.optional ? 4 : 5,
            }}
            positions={leg.geometry}
          >
            <Tooltip className="segment-label" direction="center" permanent>
              {index + 1}
            </Tooltip>
            <Popup>
              <div className="route-popup">
                <div className="place-popup route-popup-summary">
                  <span className="popup-category">{route.title} · {leg.source === 'fallback' ? leg.segment.mode === 'transit' ? `${leg.segment.transitType === 'metro' ? 'Metro' : 'Bus'} directions` : 'Approximate directions' : leg.segment.mode === 'walking' ? 'Walking directions' : leg.segment.mode === 'driving' ? 'Taxi directions' : `${leg.segment.transitType === 'metro' ? 'Metro' : 'Bus'} directions`}</span>
                  <strong>{formatDistance(leg.distanceMeters)} · {formatDuration(leg.durationSeconds)}</strong>
                  <small>{leg.source === 'fallback' ? 'Approximate connector only, not a verified street route.' : leg.source === 'bundled' ? 'Verified street route, bundled for offline display.' : leg.segment.optional ? 'Optional segment, shown dashed.' : 'Tap the route to highlight this segment.'}</small>
                </div>
                <ol className="route-instructions">
                  {(leg.steps.length ? leg.steps : [{
                    instruction: leg.segment.instruction ?? 'Follow the route to the next stop.',
                    distanceMeters: leg.distanceMeters,
                    durationSeconds: leg.durationSeconds,
                  }]).map((step, stepIndex) => (
                    <li key={`${route.id}-${leg.segment.from}-${leg.segment.to}-${stepIndex}`}>
                      <span>{step.instruction}</span>
                      <small>{formatDistance(step.distanceMeters)} · {formatDuration(step.durationSeconds)}{leg.source === 'fallback' ? ' · approximate' : ''}</small>
                    </li>
                  ))}
                </ol>
              </div>
            </Popup>
          </Polyline>
        )
      })}
      {places.map((place) => (
        <CircleMarker
          center={[place.lat, place.lon]}
          color={highlightedPlaceId === place.id ? '#f0a52b' : place.addedByAssistant ? '#e1a43d' : '#ffffff'}
          eventHandlers={{ click: () => onPlaceSelect?.(place) }}
          fillColor={colors[place.category]}
          fillOpacity={highlightedPlaceId === place.id ? 1 : routeStopIds.has(place.id) ? 1 : 0.8}
          key={place.id}
          radius={highlightedPlaceId === place.id ? 11 : place.category === 'hotel' ? 9 : place.addedByAssistant ? 8 : routeStopIds.has(place.id) ? 8 : 6}
          weight={highlightedPlaceId === place.id ? 4 : place.addedByAssistant || routeStopIds.has(place.id) ? 3 : 2}
        >
          {showPlaceLabels && (
            <Tooltip className="map-point-label" direction="top" offset={[0, -7]} permanent>
              {place.addedByAssistant ? `✦ ${place.name}` : place.name}
            </Tooltip>
          )}
          <Popup>
            <div className="place-popup">
              <span className="popup-category">{place.addedByAssistant ? '✦ Added by assistant' : categoryLabels[place.category]}</span>
              <strong>{place.name}</strong>
              <span>{place.address}</span>
              {place.rating && <span className="place-rating">★ {place.rating.toFixed(1)} Google</span>}
              {place.price && <span>{place.price}</span>}
              {place.hours && <span>{place.hours}</span>}
              {place.tags?.length ? <div className="place-tags">{place.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
              <small>{place.note}</small>
              <a href={place.googleMapsUrl} rel="noreferrer" target="_blank">Open in Google Maps ↗</a>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  )
}
