// Turns coordinates into a street address using OpenStreetMap's free Nominatim service.
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url =
    'https://nominatim.openstreetmap.org/reverse' +
    `?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=en`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  return typeof data.display_name === 'string' ? data.display_name : null
}