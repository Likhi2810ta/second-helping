import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Building2, CalendarDays, Check, FileText, MapPin, Phone, ShieldCheck, User, X } from 'lucide-react'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../hooks/useToast'
import { api, messageOf } from '../../lib/api'
import { orgTypeLabels } from '../../lib/labels'
import { supabase } from '../../lib/supabase'
import { card, dangerPill, inputClass, outlinePill, solidPill, tabClass } from '../../lib/ui'
import type { AdminOrganization } from '../../types/api'

type Status = AdminOrganization['status']

const tabs: { key: Status; label: string }[] = [
  { key: 'pending', label: 'Waiting' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
]

const badge: Record<Status, string> = {
  pending: 'bg-warn/15 text-ink',
  verified: 'bg-green-100 text-green-700',
  rejected: 'bg-danger/10 text-danger',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function OrgCard({ org, onChanged }: { org: AdminOrganization; onChanged: () => void }) {
  const toast = useToast()
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  async function openDocument() {
    if (!org.doc_path) return
    // Open the tab first (inside the click) so pop-up blockers allow it
    const tab = window.open('', '_blank')
    const { data, error } = await supabase.storage.from('org-docs').createSignedUrl(org.doc_path, 300)
    if (error || !data) {
      tab?.close()
      toast('Could not open the document.', 'error')
      return
    }
    if (tab) tab.location.href = data.signedUrl
    else window.location.href = data.signedUrl
  }

  async function decide(status: 'verified' | 'rejected', why?: string) {
    setBusy(true)
    try {
      await api(`/api/admin/organizations/${org.id}/verify`, { method: 'POST', body: { status, reason: why ?? null } })
      toast(status === 'verified' ? `${org.name} is now verified` : `${org.name} was rejected`)
      setRejecting(false)
      onChanged()
    } catch (e) {
      toast(messageOf(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  function onReject(e: FormEvent) {
    e.preventDefault()
    if (reason.trim().length < 5) {
      toast('Please write a short reason (at least 5 characters).', 'error')
      return
    }
    decide('rejected', reason.trim())
  }

  const isDonor = org.profiles?.role === 'donor'

  return (
    <article className={`${card} overflow-hidden`}>
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
            isDonor ? 'bg-green-50 text-green-600' : 'bg-sky-50 text-sky-700'
          }`}
        >
          <Building2 size={22} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{org.name}</h2>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge[org.status]}`}>{org.status}</span>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-muted">
              {isDonor ? 'Donor' : 'Receiver'} · {orgTypeLabels[org.type]}
            </span>
          </div>

          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm text-muted sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <dt className="sr-only">Address</dt>
              <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <dd>{org.address}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Owner</dt>
              <User size={15} className="shrink-0" aria-hidden="true" />
              <dd>{org.profiles?.full_name ?? 'Unknown'}</dd>
            </div>
            {org.profiles?.phone && (
              <div className="flex items-center gap-2">
                <dt className="sr-only">Phone</dt>
                <Phone size={15} className="shrink-0" aria-hidden="true" />
                <dd>
                  <a href={`tel:${org.profiles.phone}`} className="hover:text-green-700">
                    {org.profiles.phone}
                  </a>
                </dd>
              </div>
            )}
            <div className="flex items-center gap-2">
              <dt className="sr-only">Signed up</dt>
              <CalendarDays size={15} className="shrink-0" aria-hidden="true" />
              <dd>Signed up {formatDate(org.created_at)}</dd>
            </div>
          </dl>

          {org.status === 'rejected' && org.reject_reason && (
            <p className="mt-3 rounded-xl bg-danger/5 px-3 py-2 text-sm text-danger">Reason: {org.reject_reason}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-green-100 bg-green-50/40 px-5 py-4 sm:px-6">
        {org.doc_path ? (
          <button type="button" onClick={openDocument} className={outlinePill}>
            <FileText size={16} aria-hidden="true" /> View document
          </button>
        ) : (
          <span className="text-sm text-muted">No document uploaded</span>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          {org.status !== 'verified' && (
            <button type="button" onClick={() => decide('verified')} disabled={busy} className={solidPill}>
              <Check size={16} aria-hidden="true" /> Approve
            </button>
          )}
          {!rejecting && org.status !== 'rejected' && (
            <button type="button" onClick={() => setRejecting(true)} disabled={busy} className={dangerPill}>
              <X size={16} aria-hidden="true" /> {org.status === 'verified' ? 'Revoke' : 'Reject'}
            </button>
          )}
        </div>
      </div>

      {rejecting && (
        <form onSubmit={onReject} className="border-t border-green-100 px-5 py-4 sm:px-6">
          <label htmlFor={`reason-${org.id}`} className="text-sm font-semibold text-ink">
            Why is it being rejected? The organisation will see this.
          </label>
          <textarea
            id={`reason-${org.id}`}
            rows={2}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The document is unreadable. Please upload a clearer copy."
            className={inputClass}
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className={dangerPill}>
              {busy ? 'Saving…' : 'Confirm rejection'}
            </button>
            <button type="button" onClick={() => setRejecting(false)} className={outlinePill}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  )
}

export default function AdminVerify() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('status')
  const status: Status = raw === 'verified' || raw === 'rejected' ? raw : 'pending'
  const { data, error, errorMessage, loading, reload } = useApi<AdminOrganization[]>(
    `/api/admin/organizations?status=${status}`
  )

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Verify organisations"
        subtitle="Check each document, then approve or reject. Organisations see your decision right away."
      />

      <div role="tablist" aria-label="Status" className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={status === t.key}
            onClick={() => setParams(t.key === 'pending' ? {} : { status: t.key }, { replace: true })}
            className={tabClass(status === t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {loading && [0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-green-100/60" />)}
        {error && <p className="text-danger">{errorMessage}</p>}
        {data && data.length === 0 && (
          <EmptyState
            icon={ShieldCheck}
            title={status === 'pending' ? 'All caught up' : `No ${status} organisations`}
            text={status === 'pending' ? 'New sign-ups that need review will appear here.' : undefined}
          />
        )}
        {data?.map((org) => <OrgCard key={org.id} org={org} onChanged={reload} />)}
      </div>
    </div>
  )
}
