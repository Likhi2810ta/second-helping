import { Link } from 'react-router-dom'
import { ArrowRight, Check, HandHeart, Store } from 'lucide-react'
import { images } from '../../lib/images'
import SectionHeading from './SectionHeading'

const groups = [
  {
    role: 'donor',
    icon: Store,
    image: images.steps.post,
    eyebrow: 'For donors',
    title: 'I have food to share',
    who: 'Restaurants, hostels, caterers and event halls',
    points: ['Post in under a minute', 'Choose who collects it', 'See the meals you saved'],
    cta: 'Join as a donor',
  },
  {
    role: 'receiver',
    icon: HandHeart,
    image: images.steps.request,
    eyebrow: 'For receivers',
    title: 'I collect food for people',
    who: 'NGOs, shelters and community kitchens',
    points: ['Live food on a map', 'Exact address once accepted', 'Track every pickup'],
    cta: 'Join as a receiver',
  },
] as const

export default function Audience() {
  return (
    <section id="join" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Who it's for"
          title={
            <>
              Two sides, <span className="text-green-600">one table</span>
            </>
          }
          text="Second Helping connects the people who have extra food with the people who can get it to those who need it."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {groups.map(({ role, icon: Icon, image, eyebrow, title, who, points, cta }) => (
            <article
              key={role}
              className="group relative overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-green-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/5"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-green-700 backdrop-blur">
                  <Icon size={14} aria-hidden="true" /> {eyebrow}
                </span>
              </div>
              <div className="relative -mt-8 p-6 sm:p-8">
                <h3 className="text-2xl font-bold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-muted">{who}</p>
                <ul className="mt-5 space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-ink">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <Check size={12} strokeWidth={3} aria-hidden="true" />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/register?role=${role}`}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700"
                >
                  {cta} <ArrowRight size={18} className="transition group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
