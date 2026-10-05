import type { Metadata } from 'next'
import HomeClient from './HomeClient'
import type { Hotel, Venue } from './HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'


export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: {
    absolute:
      'ライブ・イベント会場周辺のホテル検索｜ライブ会場ホテルサーチ',
  },


  description:
    'ライブ・コンサート・イベント会場から近いホテルを検索。会場と検索範囲を選び、周辺の宿泊施設を距離で探せます。',


  alternates: {
    canonical: 'https://live-stay-search.vercel.app/',
  },
}


type HomePageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined
  }>
}


export default async function HomePage({
  searchParams,
}: HomePageProps) {
  const params = await searchParams


  const requestedVenue = Array.isArray(params.venue)
    ? params.venue[0]
    : params.venue


  const supabase = createPublicServerClient()


  const { data: venueData, error: venueError } = await supabase
    .from('venues')
    .select('id, name')
    .order('name')
    .returns<Venue[]>()


  if (venueError) {
    console.error('会場一覧の取得に失敗:', venueError.message)
    throw new Error('会場情報を取得できませんでした。')
  }


  const venues = venueData ?? []


  const matchedVenue = venues.find(
    (venue) => venue.name === requestedVenue
  )

  if (matchedVenue) {
    redirect(`/venues/${matchedVenue.id}`)
  }

  const selectedVenue = matchedVenue?.name ?? venues[0]?.name ?? ''
  const initialRadius = 3000


  let initialHotels: Hotel[] = []


    if (selectedVenue) {
    const { data: hotelData, error: hotelError } = await supabase
      .rpc('search_hotels_near_venue', {
        venue_name: selectedVenue,
        radius_meters: initialRadius,
      })


    if (hotelError) {
      console.error('初回ホテル検索に失敗:', hotelError.message)
      throw new Error('ホテル情報を取得できませんでした。')
    }


    if (!Array.isArray(hotelData)) {
      throw new Error(
        'ホテル検索の結果が配列ではありません。検索関数の戻り値を確認してください。'
      )
    }


    initialHotels = hotelData as Hotel[]
  }


  return (
    <HomeClient
      key={selectedVenue}
      venues={venues}
      initialSelectedVenue={selectedVenue}
      initialHotels={initialHotels}
      initialRadius={initialRadius}
    />
  )
}