import { Building2, Leaf, Scale, UtensilsCrossed } from 'lucide-react'
import { useImpactStats } from '../../hooks/useImpactStats'
import { images } from '../../lib/images'
import AnimatedNumber from './AnimatedNumber'

export default function ImpactBand() {
  const { data, error, loading } = useImpactStats()

  const items = data
    ? [
        { icon: UtensilsCrossed, label: 'Meals shared', value: data.meals },
        { icon: Scale, label: 'Kg of food saved', value: data.kg_food },
        { icon: Leaf, label: 'Kg CO₂ avoided', value: data.kg_co2 },
        { icon: Building2, label: 'Verified partners', value: data.donors + data.receivers },
      ]
    : []

  return (
    <section id="impact" className="px-4 py-12">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-green-50 ring-1 ring-green-100">
        <img
          src={images.impact}
          alt=""
          loading="lazy"
          className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-25 lg:block"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-gradient-to-r from-green-50 via-green-50/90 to-green-50/40 lg:block"
        />

        <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-600">Our impact</p>
            <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
              Changing lives,
              <br />
              <span className="text-green-600">one plate</span> at a time.
            </h2>
            <p className="mt-3 text-sm text-muted">Every number comes from real pickups on the platform.</p>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/70" />
              ))}
            </div>
          )}

          {error && <p className="text-muted">Impact numbers are unavailable right now.</p>}

          {data && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {items.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-2xl bg-white/85 p-5 text-center shadow-sm backdrop-blur">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-heading text-3xl font-extrabold text-ink">
                    <AnimatedNumber value={value} />
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="relative px-8 pb-6 text-xs text-muted sm:px-12">
          Estimated at 0.4 kg of food per portion and 2.5 kg of CO₂ avoided per kg of food.
        </p>
      </div>
    </section>
  )
}
