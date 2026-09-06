const OPEN_METEO_AIR_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality"

// Belgrade centre. One point for now; per-municipality centroids come later.
const BELGRADE = { latitude: "44.81", longitude: "20.46" }

/**
 * The slice of the Open-Meteo response we actually read.
 * Anything else the API returns is ignored on purpose.
 */
type OpenMeteoCurrentResponse = {
  current: {
    time: string // ISO 8601 in the requested timezone, e.g. "2026-09-05T13:00"
    european_aqi: number
    pm2_5: number
    pm10: number
  }
}

export type CurrentAir = {
  time: string
  /** When this function ran, i.e. when the page was (re)built. Not the API's time. */
  fetchedAt: string
  europeanAqi: number
  pm25: number
  pm10: number
}

export async function getCurrentAir(): Promise<CurrentAir> {
  const params = new URLSearchParams({
    ...BELGRADE,
    current: "european_aqi,pm2_5,pm10",
    timezone: "Europe/Belgrade"
  })

  const response = await fetch(`${OPEN_METEO_AIR_URL}?${params}`, {
    next: { revalidate: 60, tags: ["air"] }
  })
  if (!response.ok) {
    throw new Error(`Open-Meteo responded with ${response.status}`)
  }

  const data = (await response.json()) as OpenMeteoCurrentResponse

  return {
    time: data.current.time,
    fetchedAt: new Date().toISOString(),
    europeanAqi: data.current.european_aqi,
    pm25: data.current.pm2_5,
    pm10: data.current.pm10
  }
}
