import { HeartHandshake } from 'lucide-react'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100 text-green-700">
        <HeartHandshake size={20} aria-hidden="true" />
      </span>
      <span className="leading-none">
        <span className={`block font-heading text-lg font-extrabold ${light ? 'text-white' : 'text-ink'}`}>
          Second Helping
        </span>
        <span className={`block text-[11px] font-medium ${light ? 'text-green-100' : 'text-muted'}`}>
          Share food, feed neighbours
        </span>
      </span>
    </span>
  )
}
