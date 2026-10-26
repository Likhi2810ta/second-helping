export type Point = { lat: number; lng: number }

// Supabase returns a PostGIS "geography" column as a long hex string (EWKB).
// This turns it back into plain latitude and longitude. It also accepts GeoJSON.
export function parsePoint(value: unknown): Point | null {
  if (!value) return null

  if (typeof value === 'object') {
    const coords = (value as { coordinates?: unknown }).coordinates
    if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return { lng: coords[0], lat: coords[1] }
    }
    return null
  }

  if (typeof value !== 'string' || !/^([0-9a-fA-F]{2})+$/.test(value)) return null

  const bytes = new Uint8Array((value.match(/../g) ?? []).map((h) => parseInt(h, 16)))
  if (bytes.length < 21) return null

  const view = new DataView(bytes.buffer)
  const little = bytes[0] === 1
  const type = view.getUint32(1, little)
  if ((type & 0xff) !== 1) return null // not a single point

  const hasSrid = (type & 0x20000000) !== 0
  const offset = 5 + (hasSrid ? 4 : 0)
  if (bytes.length < offset + 16) return null

  return { lng: view.getFloat64(offset, little), lat: view.getFloat64(offset + 8, little) }
}