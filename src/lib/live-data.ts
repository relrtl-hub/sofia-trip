export type WeatherDay = {
  date: string
  high: number
  low: number
  rainProbability: number
  rainHours: number
  code: number
  rainWindow: string
}

export type WeatherStatus = {
  days: WeatherDay[]
  fetchedAt: string
  source: string
}

export type CurrencyStatus = {
  eurPerIls: number
  ilsPerEur: number
  fetchedAt: string
  source: string
}

const TRIP_DATES = ['2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25']
const CACHE_MINUTES = 30
const cacheKey = (key: string) => `sofia-trip:${key}`

function getCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(cacheKey(key))
    if (!raw) return null
    const cached = JSON.parse(raw) as { savedAt: number; value: T }
    return Date.now() - cached.savedAt < CACHE_MINUTES * 60_000 ? cached.value : null
  } catch {
    return null
  }
}

function setCache<T>(key: string, value: T) {
  try { localStorage.setItem(cacheKey(key), JSON.stringify({ savedAt: Date.now(), value })) } catch { /* storage is optional */ }
}

const weatherLabel = (code: number) => {
  if (code === 0) return 'Clear'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 48) return 'Foggy'
  if (code <= 67) return 'Rain possible'
  if (code <= 77) return 'Snow possible'
  if (code <= 82) return 'Showers possible'
  return 'Storm risk'
}

function rainWindow(date: string, times: string[], probability: number[], precipitation: number[]) {
  const daytimeRainHours = times.map((time, index) => ({
    time,
    hour: Number(time.slice(11, 13)),
    probability: probability[index] ?? 0,
    precipitation: precipitation[index] ?? 0,
  })).filter((item) => item.time.startsWith(date) && item.hour >= 8 && (item.probability >= 40 || item.precipitation > 0.1))
  if (!daytimeRainHours.length) return '08:00–17:00: no rain expected.'

  const windows: Array<{ start: number; end: number }> = []
  daytimeRainHours.forEach((item) => {
    const hour = item.hour
    const current = windows[windows.length - 1]
    if (current && hour === current.end) current.end = hour + 1
    else windows.push({ start: hour, end: hour + 1 })
  })
  const formatHour = (hour: number) => `${String(hour % 24).padStart(2, '0')}:00`
  const joinWindows = (items: Array<{ start: number; end: number }>) => items
    .map((window) => `${formatHour(window.start)}–${formatHour(window.end)}`)
    .join(', ')
  const daytimeWindows: Array<{ start: number; end: number }> = []
  const laterWindows: Array<{ start: number; end: number }> = []
  windows.forEach((window) => {
    if (window.start < 17) daytimeWindows.push({ start: window.start, end: Math.min(window.end, 17) })
    if (window.end > 17) laterWindows.push({ start: Math.max(window.start, 17), end: window.end })
  })
  const daytimeText = daytimeWindows.length
    ? `08:00–17:00: rain possible ${joinWindows(daytimeWindows)}`
    : '08:00–17:00: no rain expected'
  const laterText = laterWindows.length ? ` Later: rain possible ${joinWindows(laterWindows)}` : ''
  return `${daytimeText}.${laterText}`
}

export async function fetchWeather(): Promise<WeatherStatus> {
  const cached = getCache<WeatherStatus>('weather-v3')
  if (cached) return cached
  const params = new URLSearchParams({
    latitude: '42.6977', longitude: '23.3219',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_hours,weather_code',
    hourly: 'precipitation_probability,precipitation',
    timezone: 'Europe/Sofia', forecast_days: '16',
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
  if (!response.ok) throw new Error(`Weather request failed: ${response.status}`)
  const payload = await response.json()
  const days: WeatherDay[] = TRIP_DATES.map((date) => {
    const index = payload.daily.time.indexOf(date)
    return {
      date,
      high: payload.daily.temperature_2m_max[index],
      low: payload.daily.temperature_2m_min[index],
      rainProbability: payload.daily.precipitation_probability_max[index],
      rainHours: payload.daily.precipitation_hours[index],
      code: payload.daily.weather_code[index],
      rainWindow: rainWindow(date, payload.hourly.time, payload.hourly.precipitation_probability, payload.hourly.precipitation),
    }
  })
  const result = { days, fetchedAt: new Date().toISOString(), source: 'Open-Meteo' }
  setCache('weather-v3', result)
  return result
}

export async function fetchCurrency(): Promise<CurrencyStatus> {
  const cached = getCache<CurrencyStatus>('currency')
  if (cached) return cached
  const response = await fetch('https://api.frankfurter.dev/v1/latest?base=EUR&symbols=ILS')
  if (!response.ok) throw new Error(`Currency request failed: ${response.status}`)
  const payload = await response.json() as { rates?: { ILS?: number } }
  const ilsPerEur = payload.rates?.ILS
  if (!ilsPerEur || !Number.isFinite(ilsPerEur)) throw new Error('EUR to ILS rate missing')
  const result = {
    ilsPerEur,
    eurPerIls: 1 / ilsPerEur,
    fetchedAt: new Date().toISOString(),
    source: 'Frankfurter / ECB reference rates',
  }
  setCache('currency', result)
  return result
}

export const weatherDescription = weatherLabel
export { TRIP_DATES }
