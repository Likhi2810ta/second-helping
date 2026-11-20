export default function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-sm text-muted" role="status">
      <span className="relative flex h-10 w-10">
        <span className="absolute inset-0 animate-ping rounded-full bg-green-200 opacity-60" />
        <span className="relative h-10 w-10 animate-spin rounded-full border-[3px] border-green-100 border-t-green-600" />
      </span>
      {label}
    </div>
  )
}
