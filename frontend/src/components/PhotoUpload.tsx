import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { ACCEPTED_IMAGE_TYPES, MAX_INPUT_BYTES, compressImage } from '../lib/image'

type Props = { onChange: (photo: Blob | null) => void }

export default function PhotoUpload({ onChange }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  // Free the preview image from memory when this component goes away
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    },
    []
  )

  function replacePhoto(blob: Blob | null) {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = blob ? URL.createObjectURL(blob) : null
    setPreview(urlRef.current)
    onChange(blob)
  }

  async function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be chosen again later
    if (!file) return

    setError(null)
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Please choose a JPG, PNG or WebP photo.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError('That photo is larger than 10 MB. Please choose a smaller one.')
      return
    }

    setBusy(true)
    try {
      replacePhoto(await compressImage(file))
    } catch {
      setError('That file could not be read as a photo. Please try another one.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-green-900">Photo (optional)</span>

      {preview ? (
        <div className="relative mt-1 overflow-hidden rounded-xl ring-1 ring-green-100">
          <img src={preview} alt="Preview of the food photo" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => replacePhoto(null)}
            aria-label="Remove photo"
            className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-green-900 shadow hover:bg-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label className="mt-1 flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted/40 text-center text-sm text-muted focus-within:border-green-600 hover:bg-green-100">
          <ImagePlus size={28} aria-hidden="true" />
          {busy ? 'Preparing photo…' : 'Click to add a photo'}
          <span className="text-xs">JPG, PNG or WebP</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onPick}
            disabled={busy}
            className="sr-only"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}