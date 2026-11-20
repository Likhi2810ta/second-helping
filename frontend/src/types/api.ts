import type { Database } from './database'

type Enums = Database['public']['Enums']

export type Category = Enums['food_category']
export type Diet = Enums['diet_type']
export type ListingStatus = Enums['listing_status']
export type RequestStatus = Enums['request_status']

// GET /api/listings/nearby
export type NearbyListing = {
  id: string
  title: string
  category: Category
  diet: Diet
  portions: number
  photo_path: string | null
  prepared_at: string
  expires_at: string
  address: string
  status: ListingStatus
  donor_name: string
  latitude: number
  longitude: number
  distance_km: number
}

// GET /api/listings/:id
export type ListingDetail = {
  id: string
  title: string
  description: string | null
  category: Category
  diet: Diet
  portions: number
  photo_path: string | null
  prepared_at: string
  expires_at: string
  status: ListingStatus
  pickup_note: string | null
  area: string
  address: string | null // only after the request is accepted
  latitude: number
  longitude: number
  donor_name: string
  donor_type: Enums['org_type']
  donor_verified: boolean
  donor_phone: string | null // only after the request is accepted
  my_request_id: string | null
  my_request_status: RequestStatus | null
}

// GET /api/pickups
export type Pickup = {
  request_id: string
  request_status: RequestStatus
  message: string | null
  eta_minutes: number | null
  requested_at: string
  completed_at: string | null
  rating: number | null
  listing_id: string
  title: string
  category: Category
  diet: Diet
  portions: number
  photo_path: string | null
  prepared_at: string
  expires_at: string
  listing_status: ListingStatus
  pickup_note: string | null
  area: string
  address: string | null
  latitude: number | null
  longitude: number | null
  donor_name: string
  donor_phone: string | null
}

// ---------- Admin ----------

// GET /api/admin/organizations
export type AdminOrganization = {
  id: string
  name: string
  type: Enums['org_type']
  address: string
  doc_path: string | null
  status: Enums['verify_status']
  reject_reason: string | null
  verified_at: string | null
  created_at: string
  profiles: { full_name: string; phone: string | null; role: Enums['user_role'] } | null
}

// GET /api/admin/listings
export type AdminListing = {
  id: string
  title: string
  category: Category
  diet: Diet
  portions: number
  status: ListingStatus
  address: string
  expires_at: string
  created_at: string
  organizations: { name: string } | null
  pickup_requests: { status: RequestStatus; organizations: { name: string } | null }[]
}

// GET /api/admin/reports
export type AdminReport = {
  impact: { meals: number; kg_food: number; kg_co2: number; donors: number; receivers: number }
  organizations: Record<'pending' | 'verified' | 'rejected', number>
  listings: Record<ListingStatus, number>
  rescue_rate: number | null
  top_donors: { name: string; meals: number }[]
}
