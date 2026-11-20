import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { LatLng } from './LocationPicker'
import type { NearbyListing } from '../types/api'
import { distanceLabel } from '../lib/maps'

type Props = {
  center: LatLng
  radiusKm: number
  listings: NearbyListing[]
  selectedId: string | null
  onSelect: (id: string) => void
  onPickLocation: (p: LatLng) => void
}

// A small pill showing how many portions are left
function portionsIcon(portions: number, selected: boolean) {
  const tone = selected ? 'bg-green-900 scale-110' : 'bg-green-600'
  return L.divIcon({
    className: '',
    html: `<span class="sh-marker ${tone}">${portions}</span>`,
    iconSize: [44, 28],
    iconAnchor: [22, 14],
    popupAnchor: [0, -14],
  })
}

const youIcon = L.divIcon({
  className: '',
  html: '<span class="sh-you" aria-hidden="true"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

// Zooms the map so the whole search circle fits. It also re-measures the map
// when its box changes size (for example when the phone list/map switch shows it),
// because Leaflet draws grey tiles if it was created while hidden.
function FitRadius({ center, radiusKm }: { center: LatLng; radiusKm: number }) {
  const map = useMap()

  useEffect(() => {
    const fit = () =>
      map.fitBounds(L.latLng(center.lat, center.lng).toBounds(radiusKm * 2000), { padding: [16, 16] })
    fit()

    const el = map.getContainer()
    let wasHidden = el.clientWidth === 0
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
      if (wasHidden && el.clientWidth > 0) fit()
      wasHidden = el.clientWidth === 0
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [map, center.lat, center.lng, radiusKm])

  return null
}

function ClickToMove({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

export default function FoodMap({ center, radiusKm, listings, selectedId, onSelect, onPickLocation }: Props) {
  const markers = useMemo(
    () =>
      listings.map((l) => ({
        listing: l,
        icon: portionsIcon(l.portions, l.id === selectedId),
      })),
    [listings, selectedId]
  )

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="relative z-0 h-full min-h-80 w-full rounded-2xl ring-1 ring-green-100"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitRadius center={center} radiusKm={radiusKm} />
      <ClickToMove onPick={onPickLocation} />

      <Circle
        center={[center.lat, center.lng]}
        radius={radiusKm * 1000}
        pathOptions={{ color: '#2F7D4F', weight: 1, fillOpacity: 0.05 }}
      />
      <Marker position={[center.lat, center.lng]} icon={youIcon} interactive={false} keyboard={false} />

      {markers.map(({ listing, icon }) => (
        <Marker
          key={listing.id}
          position={[listing.latitude, listing.longitude]}
          icon={icon}
          title={`${listing.title}, ${listing.portions} portions`}
          zIndexOffset={listing.id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(listing.id) }}
        >
          <Popup>
            <p className="font-semibold text-green-900">{listing.title}</p>
            <p className="text-muted">
              {listing.donor_name} · {distanceLabel(listing.distance_km)}
            </p>
            <Link to={`/listing/${listing.id}`} className="font-semibold text-green-700 underline">
              View and request
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
