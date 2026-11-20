import ListingForm from '../components/ListingForm'
import PageHeader from '../components/PageHeader'
import { card } from '../lib/ui'

export default function Post() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Donor" title="Post surplus food" subtitle="Share what you have and how long it stays safe to eat." />
      <div className={`${card} mt-8 p-6 sm:p-8`}>
        <ListingForm />
      </div>
    </div>
  )
}
