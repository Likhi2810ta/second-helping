export default function Home() {
  const swatches = [
    'bg-green-100',
    'bg-green-600',
    'bg-green-700',
    'bg-green-900',
    'bg-warn',
    'bg-danger',
  ]

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold text-green-900">Second Helping</h1>
      <p className="mt-2 text-muted">Surplus food, shared with people who need it.</p>

      <div className="mt-6 flex gap-3">
        <button className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700">
          Primary
        </button>
        <button className="rounded-full border border-green-600 px-5 py-2 font-semibold text-green-700">
          Outline
        </button>
        <button className="rounded-full bg-danger px-5 py-2 font-semibold text-white">
          Danger
        </button>
      </div>

      <div className="mt-8 flex gap-2">
        {swatches.map((c) => (
          <div key={c} className={`h-16 w-16 rounded-lg ${c}`} />
        ))}
      </div>
    </main>
  )
}