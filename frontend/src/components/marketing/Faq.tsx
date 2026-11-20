import { Plus } from 'lucide-react'
import SectionHeading from './SectionHeading'

const faqs = [
  {
    q: 'Who can post food?',
    a: 'Restaurants, hostels, caterers and event halls. After you sign up, an admin checks your food licence or business registration before you can post.',
  },
  {
    q: 'Who can collect it?',
    a: 'Registered NGOs, shelters and community kitchens. They upload a registration certificate and are verified by an admin before they can request food.',
  },
  {
    q: 'How do you keep the food safe?',
    a: 'Every listing has a "safe to eat" time set by the donor, who also confirms the food was freshly prepared and stored hygienically. Listings disappear automatically when they expire.',
  },
  {
    q: 'Is my address shared with everyone?',
    a: 'No. Receivers only see the area until the donor accepts their request. The exact address and phone number are shown only to the accepted receiver.',
  },
  {
    q: 'Does it cost anything?',
    a: 'No. Second Helping is free for donors and receivers.',
  },
]

export default function Faq() {
  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="self-start lg:sticky lg:top-24">
          <SectionHeading
            eyebrow="Questions"
            title={
              <>
                Good to <span className="text-green-600">know</span>
              </>
            }
            text="Everything you need before your first post or pickup."
          />
        </div>

        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-green-100 transition open:ring-green-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700 transition group-open:rotate-45 group-open:bg-green-600 group-open:text-white">
                  <Plus size={16} aria-hidden="true" />
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
