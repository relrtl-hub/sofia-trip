import type { Place } from './places'

export type DayKey = 'day1' | 'day2' | 'day3' | 'day4'
export type TravelMode = 'walking' | 'driving' | 'transit'
export type TransitType = 'metro' | 'bus'

export type RouteSegment = {
  from: string
  to: string
  mode: TravelMode
  transitType?: TransitType
  optional?: boolean
  instruction?: string
}

export type TripRoute = {
  id: string
  day: DayKey
  time: string
  title: string
  description: string
  placeIds: string[]
  segments: RouteSegment[]
  color: string
}

export type RoutePlan = TripRoute

const walk = (from: string, to: string): RouteSegment => ({ from, to, mode: 'walking' })
const drive = (from: string, to: string): RouteSegment => ({ from, to, mode: 'driving' })
const metro = (from: string, to: string, instruction: string): RouteSegment => ({ from, to, mode: 'transit', transitType: 'metro', instruction })
const bus = (from: string, to: string, instruction: string): RouteSegment => ({ from, to, mode: 'transit', transitType: 'bus', instruction })

export const routes: TripRoute[] = [
  {
    id: 'day1-airport-arrival',
    day: 'day1',
    time: 'arrival',
    title: 'Sofia Airport → Serdika → Art Hotel 158',
    description: 'From Terminal 2, take Metro M4 to Serdika Metro Station, then walk to Art Hotel 158. Serdika is the station interpreted from “sverdraga”.',
    placeIds: ['sofia-airport', 'serdika-metro-station', 'hotel'],
    segments: [
      metro('sofia-airport', 'serdika-metro-station', 'Take Sofia Metro M4 from Sofia Airport to Serdika Metro Station.'),
      { ...walk('serdika-metro-station', 'hotel'), instruction: 'Walk from Serdika Metro Station to Art Hotel 158.' },
    ],
    color: '#4d8b72',
  },
  {
    id: 'day1-central-heritage',
    day: 'day1',
    time: '10:00',
    title: 'Art Hotel 158 → central Sofia → Beit Habad → hotel',
    description: 'One continuous walking loop: nearby central sights first, then farther east through the gardens and cathedral to Beit Habad, followed by the return to Art Hotel 158.',
    placeIds: [
      'hotel',
      'big-synagogue',
      'banya-bashi',
      'central-mineral-baths',
      'ancient-serdika',
      'rotunda-st-george',
      'archaeological-museum',
      'sofia-city-court',
      'vitosha-boulevard',
      'city-garden',
      'ivan-vazov-theatre',
      'crystal-garden',
      'saint-sofia',
      'alexander-nevsky',
      'beit-habad',
    ],
    segments: [
      walk('hotel', 'big-synagogue'),
      walk('big-synagogue', 'banya-bashi'),
      walk('banya-bashi', 'central-mineral-baths'),
      walk('central-mineral-baths', 'ancient-serdika'),
      walk('ancient-serdika', 'rotunda-st-george'),
      walk('rotunda-st-george', 'archaeological-museum'),
      walk('archaeological-museum', 'sofia-city-court'),
      walk('sofia-city-court', 'vitosha-boulevard'),
      walk('vitosha-boulevard', 'city-garden'),
      walk('city-garden', 'ivan-vazov-theatre'),
      walk('ivan-vazov-theatre', 'crystal-garden'),
      walk('crystal-garden', 'saint-sofia'),
      walk('saint-sofia', 'alexander-nevsky'),
      walk('alexander-nevsky', 'beit-habad'),
      walk('beit-habad', 'hotel'),
    ],
    color: '#ef8354',
  },
  {
    id: 'day3-boyana-nature',
    day: 'day3',
    time: '07:30',
    title: 'Serdika → Boyana Church → lake → waterfall → southern return',
    description: 'Take the metro and bus to Boyana Church, walk to Boyana Lake and Boyana Waterfall, then return through the National Museum of History, Bulgaria Mall and Yuzhen Park.',
    placeIds: ['hotel', 'serdika-metro-station', 'vitosha-metro-station', 'boyana-church', 'boyana-lake', 'boyana-waterfall', 'national-museum-of-history', 'bulgaria-mall', 'yuzhen-park'],
    segments: [
      { ...walk('hotel', 'serdika-metro-station'), instruction: 'Walk from Art Hotel 158 to Serdika Metro Station.' },
      metro('serdika-metro-station', 'vitosha-metro-station', 'Take Metro M2 toward Vitosha and get off at Vitosha Metro Station.'),
      bus('vitosha-metro-station', 'boyana-church', 'Take bus 64 toward Boyana and get off at the Boyana Church stop.'),
      { ...walk('boyana-church', 'boyana-lake'), instruction: 'Walk from Boyana Church to Boyana Lake.' },
      { ...walk('boyana-lake', 'boyana-waterfall'), instruction: 'Follow the marked Vitosha trail uphill from Boyana Lake to Boyana Waterfall.' },
      { ...walk('boyana-waterfall', 'boyana-lake'), instruction: 'Return downhill on the marked trail to Boyana Lake.' },
      { ...walk('boyana-lake', 'boyana-church'), instruction: 'Walk back from Boyana Lake to Boyana Church.' },
      drive('boyana-church', 'national-museum-of-history'),
      drive('national-museum-of-history', 'bulgaria-mall'),
      { ...walk('bulgaria-mall', 'yuzhen-park'), instruction: 'Walk east from Bulgaria Mall into Yuzhen Park.' },
      drive('yuzhen-park', 'hotel'),
    ],
    color: '#4d8b72',
  },
  {
    id: 'day4-vitosha-shopping',
    day: 'day4',
    time: '10:00',
    title: 'Vitosha Boulevard → Graf Ignatiev Street → Serdika Center',
    description: 'Central shopping route through Vitosha Boulevard, using “vishnia” as the likely Vitosha reference, then Graf Ignatiev Street and Serdika Center before returning to the hotel.',
    placeIds: ['hotel', 'vitosha-boulevard', 'graf-ignatiev-street', 'serdika-center'],
    segments: [
      walk('hotel', 'vitosha-boulevard'),
      walk('vitosha-boulevard', 'graf-ignatiev-street'),
      walk('graf-ignatiev-street', 'serdika-center'),
      walk('serdika-center', 'hotel'),
    ],
    color: '#e4b363',
  },
]

export const placesById = (places: Place[]) => new Map(places.map((place) => [place.id, place]))

export const routesForDay = (day: DayKey) => routes.filter((route) => route.day === day)

export const routePlaces = (route: RoutePlan, places: Place[]) => {
  const map = placesById(places)
  return route.placeIds.map((id) => map.get(id)).filter((place): place is Place => Boolean(place))
}

export function googleDirectionsUrl(route: TripRoute, places: Place[]) {
  const plannedSegments = route.segments.filter((segment) => !segment.optional)
  const stopIds = plannedSegments.length
    ? [plannedSegments[0].from, ...plannedSegments.map((segment) => segment.to)]
    : []
  const stops = stopIds.map((id) => places.find((place) => place.id === id)).filter((place): place is Place => Boolean(place))
  if (stops.length < 2) return '#'

  const origin = stops[0]
  const destination = stops[stops.length - 1]
  const waypoints = stops.slice(1, -1).map((place) => `${place.lat},${place.lon}`).join('|')
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lon}`,
    destination: `${destination.lat},${destination.lon}`,
    travelmode: route.segments.some((segment) => segment.mode === 'driving') ? 'driving' : 'walking',
  })
  if (waypoints) params.set('waypoints', waypoints)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export const routeGoogleMapsUrl = googleDirectionsUrl
