import { Link } from 'react-router-dom'
import { ArrowRight, HandHeart, Truck, UtensilsCrossed } from 'lucide-react'
import { images } from '../../lib/images'
import SectionHeading, { outlinePill } from './SectionHeading'

const steps = [
  {
    icon: UtensilsCrossed,
    image: images.steps.post,
    title: 'Post',
    text: 'A donor lists surplus food with the number of portions and an expiry time.',
  },
  {
    icon: HandHeart,
    image: images.steps.request,
    title: 'Request',
    text: 'A verified NGO or shelter nearby requests it, and the donor accepts.',
  },
  {
    icon: Truck,
    image: images.steps.pickup,
    title: 'Pickup',
    text: 'The NGO collects the food, and the donor marks it as picked up.',
  },
]

const categories = [
  { image: images.categories.cooked, label: 'Cooked meals' },
  { image: images.categories.bakery, label: 'Bakery' },
  { image: images.categories.fruits_veg, label: 'Fruits & veg' },
  { image: images.categories.packed, label: 'Packed food' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="How it works"
          title={
            <>
              From surplus to a <span className="text-green-600">shared meal</span>
            </>
          }
          action={
            <Link to="/register" className={outlinePill}>
              Get started <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        />

        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, image, title, text }, i) => (
            <li
              key={title}
              className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-green-100 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-green-700 backdrop-blur">
                  Step {i + 1}
                </span>
              </div>
              <div className="relative px-6 pb-6 pt-9">
                <span className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-white text-green-600 shadow-md ring-4 ring-white">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ol>

        <h3 className="mt-16 text-lg font-bold text-ink">What you can share</h3>
        <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map(({ image, label }) => (
            <li key={label} className="group relative h-36 overflow-hidden rounded-2xl">
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-4 text-sm font-bold text-white">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
