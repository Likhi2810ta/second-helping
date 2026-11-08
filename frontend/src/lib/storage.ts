import { supabase } from './supabase'

// Public web address of a photo in the food-photos bucket
export function foodPhotoUrl(path: string | null): string | null {
  if (!path) return null
  return supabase.storage.from('food-photos').getPublicUrl(path).data.publicUrl
}