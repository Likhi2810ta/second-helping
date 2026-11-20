export const categoryLabels = {
  cooked: 'Cooked meal',
  bakery: 'Bakery',
  fruits_veg: 'Fruits and vegetables',
  packed: 'Packed food',
  other: 'Other',
} as const

export const dietLabels = {
  veg: 'Vegetarian',
  non_veg: 'Non-vegetarian',
  both: 'Veg and non-veg',
} as const
export const orgTypeLabels = {
  restaurant: 'Restaurant or café',
  hostel: 'Hostel or mess',
  caterer: 'Caterer',
  event: 'Event or function hall',
  ngo: 'NGO',
  shelter: 'Shelter',
  individual: 'Community kitchen',
} as const

export const listingStatusLabels = {
  available: 'Available',
  requested: 'Requested',
  confirmed: 'Confirmed',
  picked_up: 'Picked up',
  expired: 'Expired',
  cancelled: 'Withdrawn',
} as const

// Badge colours for each listing status
export const listingStatusTone = {
  available: 'bg-green-100 text-green-700',
  requested: 'bg-warn/15 text-ink',
  confirmed: 'bg-sky-100 text-sky-800',
  picked_up: 'bg-green-600 text-white',
  expired: 'bg-gray-100 text-muted',
  cancelled: 'bg-gray-100 text-muted',
} as const
