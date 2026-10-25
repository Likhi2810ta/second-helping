import { useImpactStats } from '../../hooks/useImpactStats'
import AnimatedNumber from './AnimatedNumber'

export default function ImpactBand() {
  const { data, error, loading } = useImpactStats()

  const items = data
    ? [
        { label: 'Meals shared', value: data.meals },
        { label: 'Kg of food saved', value: data.kg_food },
        { label: 'Kg CO₂ avoided', value: data.kg_co2 },
        { label: 'Verified partners', value: data.donors + data.receivers },
      ]
    : []

  return (
    <section id="impact" className="bg-green-900 px-4 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold">Our impact so far</h2>
        <p className="mt-1 text-green-100">Every number here comes from real pickups on the platform.</p>

        {loading && (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/10" />
            ))}
          </div>
        )}

        {error && <p className="mt-8 text-green-100">Impact numbers are unavailable right now.</p>}

        {data && (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
                <p className="font-heading text-4xl font-extrabold sm:text-5xl">
                  <AnimatedNumber value={item.value} />
                </p>
                <p className="mt-1 text-sm text-green-100">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-green-100">
          Estimated at 0.4 kg of food per portion and 2.5 kg of CO₂ avoided per kg of food.
        </p>
      </div>
    </section>
  )
}
