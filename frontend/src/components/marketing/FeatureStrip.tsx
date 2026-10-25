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
    <section aria-label="Why Second Helping" className="relative z-10 -mt-14 px-4 pb-16">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-green-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-bold text-green-900">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}