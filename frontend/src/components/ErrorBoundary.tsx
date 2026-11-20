import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode; resetKey?: string }
type State = { error: Error | null; key?: string }

const RELOAD_FLAG = 'sh-chunk-reload'

// A lazily loaded page whose file could not be downloaded (new deploy, dev server restart)
function isChunkError(error: Error) {
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError/i.test(
    error.message
  )
}

// Shows a friendly message instead of a blank white screen when a page crashes.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  // Navigating to another page clears the error
  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (props.resetKey !== state.key) return { key: props.resetKey, error: null }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page crashed:', error, info.componentStack)

    // Fetch the fresh files, but at most once every 10 seconds so it cannot loop
    if (isChunkError(error)) {
      try {
        const last = Number(sessionStorage.getItem(RELOAD_FLAG) ?? 0)
        if (Date.now() - last > 10_000) {
          sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
          window.location.reload()
        }
      } catch {
        // Storage blocked: fall through to the message
      }
    }
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-green-100">
          <h1 className="text-xl font-bold text-ink">Something went wrong on this page</h1>
          <p className="mt-2 text-sm text-muted">
            {isChunkError(error)
              ? 'Part of the app could not be downloaded. Reloading usually fixes it.'
              : 'Please reload. If it keeps happening, share the message below.'}
          </p>
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-green-50 p-3 text-left text-xs text-danger">
            {error.message}
          </pre>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700"
            >
              Reload
            </button>
            <a href="/" className="rounded-full px-5 py-2.5 font-semibold text-green-700 ring-1 ring-green-200 hover:bg-green-50">
              Home
            </a>
          </div>
        </div>
      </main>
    )
  }
}
