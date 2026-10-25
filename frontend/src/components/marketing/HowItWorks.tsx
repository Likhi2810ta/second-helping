import { Apple, ChefHat, Croissant, HandHeart, Package, Truck, UtensilsCrossed } from 'lucide-react'

const steps = [
  {
    icon: UtensilsCrossed,
    title: 'Post',
    text: 'A donor lists surplus food with the number of portions and an expiry time.',
  },
  {
    icon: HandHeart,
    title: 'Request',
    text: 'A verified NGO or shelter nearby requests it, and the donor accepts.',
  },
  {
    icon: Truck,
    title: 'Pickup',
    text: 'The NGO collects the food, and the donor marks it as picked up.',
  },
]

const categories = [
  { icon: ChefHat, label: 'Cooked meals' },
  { icon: Croissant, label: 'Bakery' },
  { icon: Apple, label: 'Fruits & veg' },
  { icon: Package, label: 'Packed food' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-green-900">How it works</h2>
        <p className="mt-1 text-muted">Three steps from surplus to a shared meal.</p>

        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-green-100">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <Icon size={24} className="text-green-700" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-green-900">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>

        <h3 className="mt-12 text-lg font-bold text-green-900">What you can share</h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3 rounded-xl bg-green-100 p-4 text-green-900">
              <Icon size={22} aria-hidden="true" />
              <span className="text-sm font-semibold">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
