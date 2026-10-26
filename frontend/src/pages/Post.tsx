import ListingForm from '../components/ListingForm'

export default function Post() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-green-900">Post surplus food</h1>
      <p className="mt-1 text-sm text-muted">Share what you have and how long it stays safe to eat.</p>
      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-green-100 sm:p-8">
        <ListingForm />
      </div>
    </div>
  )
}