import { Link } from 'react-router-dom'
import { linkText } from '../lib/ui'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-4xl font-bold text-green-900">Page not found</h1>
      <p className="text-muted">That address does not exist.</p>
      <Link to="/" className={linkText}>Go home</Link>
    </main>
  )
}