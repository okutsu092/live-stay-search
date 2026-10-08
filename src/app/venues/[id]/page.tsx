import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import HomeClient from '../../HomeClient'
import type { Hotel, Venue } from '../../HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

type VenuePageProps = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}

// URLのIDに対応する会場を取得
const getVenue = cache(async (id: string): Promise<Venue | null> => {
  if (!/^\d+$/.test(id)) {
    return null
  }

  const venueId = Number(id)

  if (!Number.isSafeInteger(venueId) || venueId <= 0) {
    return null
  }

  const supabase = createPublicServerClient()

  const { data, error } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')
    .eq('id', venueId)
    .limit(1)
    .returns<Venue[]>()

  if (error) {
    console.error('会場情報の取得に失敗:', error.message)
    throw new Error('会場情報を取得できませんでした。')
  }

  return data?.[0] ?? null
})

// 会場ごとのタイトル・説明・canonical
export async function generateMetadata({
  params,
}: VenuePageProps): Promise<Metadata> {
  const { id } = await params
  const venue = await getVenue(id)

  if (!venue) {
    notFound()
  }

  return {
    title: {
      absolute: `${venue.name}周辺のホテル検索｜ライブ会場ホテルサーチ`,
    },
    description:
      `${venue.name}周辺のホテルを検索。` +
      '会場からの距離や楽天トラベルでの最低料金を確認して、宿泊施設を探せます。',
    alternates: {
      canonical: `https://live-stay-search.vercel.app/venues/${venue.id}`,
    },
  }
}

export default async function VenuePage({
  params,
  searchParams,
}: VenuePageProps) {
  const { id } = await params
  const query = await searchParams

  const venue = await getVenue(id)

  if (!venue) {
    notFound()
  }

  // 検索範囲は1km・3km・5km。未指定や不正な値は3km
  const radiusParam = Array.isArray(query.radius)
    ? query.radius[0]
    : query.radius

  const requestedRadius = Number(radiusParam)

  const initialRadius = [1000, 3000, 5000].includes(requestedRadius)
    ? requestedRadius
    : 3000

  const supabase = createPublicServerClient()

  // 選択リスト用の会場一覧
  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name, prefecture, address')
    .order('name')
    .returns<Venue[]>()

  if (venueError) {
    console.error('会場一覧の取得に失敗:', venueError.message)
    throw new Error('会場一覧を取得できませんでした。')
  }

  // 選択した会場の周辺ホテル
  const { data: hotelData, error: hotelError } = await supabase
    .rpc('search_hotels_near_venue', {
      venue_name: venue.name,
      radius_meters: initialRadius,
    })

  if (hotelError) {
    console.error('ホテル検索に失敗:', hotelError.message)
    throw new Error('ホテル情報を取得できませんでした。')
  }

  if (!Array.isArray(hotelData)) {
    throw new Error('ホテル検索の結果が配列ではありません。')
  }

  const initialHotels = hotelData as Hotel[]

  return (
    <HomeClient
      key={`${venue.id}-${initialRadius}`}
      venues={venueData ?? []}
      initialSelectedVenue={venue.name}
      initialHotels={initialHotels}
      initialRadius={initialRadius}
      isVenuePage={true}
    />
  )
}