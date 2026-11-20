// Address lookups through OpenStreetMap's free Nominatim service.

// Coordinates -> street address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url =
    'https://nominatim.openstreetmap.org/reverse' +
    `?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=en`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  return typeof data.display_name === 'string' ? data.display_name : null
}

export type Place = { lat: number; lng: number; label: string }

// Typed address or area -> coordinates (best match first)
export async function searchAddress(query: string): Promise<Place | null> {
  const q = query.trim()
  if (!q) return null
  const url =
    'https://nominatim.openstreetmap.org/search' +
    `?format=jsonv2&limit=1&accept-language=en&q=${encodeURIComponent(q)}`

  const res = await fetch(url)
  if (!res.ok) return null

  const [first] = (await res.json()) as { lat: string; lon: string; display_name: string }[]
  if (!first) return null
  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name }
}
