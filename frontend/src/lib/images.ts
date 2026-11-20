import type { Category } from '../types/api'

// Photos live in /public/images (free Unsplash photos, resized to WebP).
const img = (name: string) => `/images/${name}.webp`

export const images = {
  hero: img('hero'),
  cta: img('cta'),
  impact: img('impact'),
  newsletter: img('newsletter'),
  steps: {
    post: img('step-post'),
    request: img('step-request'),
    pickup: img('step-pickup'),
  },
  categories: {
    cooked: img('cat-cooked'),
    bakery: img('cat-bakery'),
    fruits_veg: img('cat-produce'),
    packed: img('cat-packed'),
    other: img('food-other'),
  } satisfies Record<Category, string>,
  stories: [img('story-1'), img('story-2'), img('story-3'), img('story-4')],
  events: [img('event-1'), img('event-2'), img('event-3')],
}

// A stable fallback picture for items that have no photo of their own
export function pick(list: string[], index: number) {
  return list[index % list.length]
}
