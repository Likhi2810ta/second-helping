import { BadgeCheck, Leaf, MapPin, Radio } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified Donors',
    text: 'Every donor and NGO is checked by an admin before posting or requesting.',
  },
  {
    icon: Radio,
    title: 'Live Listings',
    text: 'Food appears as soon as it is posted, with a clear expiry time.',
  },
  {
    icon: MapPin,
    title: 'Easy Pickup',
    text: 'Find food nearby on a map, request it and collect it in minutes.',
  },
  {
    icon: Leaf,
    title: 'Zero Waste',
    text: 'Good food reaches people instead of the bin, and every meal is counted.',
  },
]

export default function FeatureStrip() {
  return (
    <section aria-label="Why Second Helping" className="relative z-10 px-4 pt-8 sm:-mt-10 sm:pt-0">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-3xl bg-green-100 shadow-xl shadow-green-900/5 ring-1 ring-green-100 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white p-6 sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-600 ring-1 ring-green-100">
              <Icon size={20} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-bold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
