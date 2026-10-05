import type { MetadataRoute } from 'next'
import { createPublicServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://live-stay-search.vercel.app'
  const supabase = createPublicServerClient()

  const { data: venues, error } = await supabase
    .from('venues')
    .select('id')
    .order('id')
    .returns<{ id: number }[]>()

  if (error) {
    console.error('サイトマップ用の会場取得に失敗:', error.message)
    throw new Error('サイトマップを生成できませんでした。')
  }

  const venueUrls: MetadataRoute.Sitemap = (venues ?? []).map(
    (venue) => ({
      url: `${baseUrl}/venues/${venue.id}`,
    })
  )

  return [
    {
      url: `${baseUrl}/`,
    },
    {
      url: `${baseUrl}/venues`,
    },
    ...venueUrls,
  ]
}