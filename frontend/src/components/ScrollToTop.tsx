import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// New pages start at the top. Links to a #section are left to the browser.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
