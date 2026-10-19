export default function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-green-900">{title}</h1>
      <p className="mt-2 text-muted">This screen is built in a later phase.</p>
    </div>
  )
}