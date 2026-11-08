import { Link } from 'react-router-dom'

type Props = { label: string; value: number; to?: string; highlight?: boolean }

export default function StatCard({ label, value, to, highlight = false }: Props) {
  const box = `rounded-2xl p-5 ring-1 ${
    highlight ? 'bg-warn/20 ring-warn/40' : 'bg-white ring-green-100'
  }`

  const content = (
    <>
      <p className="font-heading text-4xl font-extrabold text-green-900">{value.toLocaleString('en-IN')}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={`${box} block hover:shadow-md`}>
        {content}
      </Link>
    )
  }
  return <div className={box}>{content}</div>
}