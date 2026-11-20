import { useEffect } from 'react'

const SITE = 'Second Helping'

// Sets the browser tab title while a page is open
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : `${SITE} | Share surplus food, feed neighbours`
  }, [title])
}
