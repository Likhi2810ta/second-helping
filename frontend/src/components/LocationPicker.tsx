import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

export type LatLng = { lat: number; lng: number }

// Leaflet's default pin image breaks with bundlers, so we point it at the files ourselves.
const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
})

const DEFAULT_CENTER: LatLng = { lat: 12.9716, lng: 77.5946 } // Bengaluru

function ClickToPlace({ onChange }: { onChange: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function FlyTo({ target }: { target: LatLng | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], 16)
  }, [map, target])
  return null
}

type Props = { value: LatLng | null; onChange: (p: LatLng) => void }

export default function LocationPicker({ value, onChange }: Props) {
  const [focus, setFocus] = useState<LatLng | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  function locateMe() {
    if (!navigator.geolocation) {
      setMessage('Your browser cannot share its location. Click the map instead.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        onChange(p)
        setFocus(p)
        setMessage(null)
      },
      () => setMessage('Could not get your location. Click the map instead.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-green-900">Pin your exact location</span>
        <button type="button" onClick={locateMe} className="text-sm font-semibold text-green-700 underline">
          Use my location
        </button>
      </div>

      <MapContainer
        center={[DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]}
        zoom={12}
        className="relative z-0 mt-2 h-64 w-full rounded-xl ring-1 ring-green-100"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToPlace onChange={onChange} />
        <FlyTo target={focus} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = (e.target as L.Marker).getLatLng()
                onChange({ lat: ll.lat, lng: ll.lng })
              },
            }}
          />
        )}
      </MapContainer>

      <p className="mt-1 text-xs text-muted">
        {value
          ? `Pinned at ${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}. Drag the pin to adjust.`
          : 'Click the map to drop a pin.'}
      </p>
      {message && <p className="mt-1 text-xs text-danger">{message}</p>}
    </div>
  )
}