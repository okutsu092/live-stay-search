
import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import HomeClient from '../../HomeClient'
import type { Hotel, Venue } from '../../HomeClient'
import { createPublicServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

const BASE_URL = 'https://live-stay-search.vercel.app'

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
      canonical: `${BASE_URL}/venues/${venue.id}`,
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
    .rpc('search_hotels_near_venue_with_reviews', {
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

  // パンくずリストの構造化データ
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'トップページ',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: '会場一覧',
        item: `${BASE_URL}/venues`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: venue.name,
        item: `${BASE_URL}/venues/${venue.id}`,
      },
    ],
  }

  // JSON-LD内にHTMLとして解釈される文字が入らないようにする
  const breadcrumbJsonLdString = JSON.stringify(breadcrumbJsonLd).replace(
    /</g,
    '\\u003c'
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: breadcrumbJsonLdString,
        }}
      />

      <nav
        aria-label="パンくずリスト"
        className="mx-auto w-full max-w-7xl px-4 pt-4 text-sm text-slate-600"
      >
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <a
              href="/"
              className="underline-offset-4 hover:underline"
            >
              トップページ
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a
              href="/venues"
              className="underline-offset-4 hover:underline"
            >
              会場一覧
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li
            aria-current="page"
            className="font-medium text-slate-900"
          >
            {venue.name}
          </li>
        </ol>
      </nav>

      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-xl font-bold text-slate-900">
            {venue.name}周辺のホテル情報
          </h2>

          {(venue.prefecture || venue.address) && (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              所在地：
              {[venue.prefecture, venue.address]
                .filter(Boolean)
                .join(' ')}
            </p>
          )}

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {venue.name}でのライブやイベントに参加する際は、
            会場からの距離を参考に宿泊先を探せます。
            このページでは、会場周辺のホテルについて、
            口コミ評価・口コミ件数・最低料金の目安を比較できます。
          </p>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            検索範囲は1km・3km・5kmから選べます。
            会場に近いホテルを探したい場合は狭い範囲から、
            選択肢を増やしたい場合は広い範囲から確認してください。
            料金や空室状況は予約先で最新情報をご確認ください。
          </p>
        </div>
      </section>

      <HomeClient
        key={`${venue.id}-${initialRadius}`}
        venues={venueData ?? []}
        initialSelectedVenue={venue.name}
        initialHotels={initialHotels}
        initialRadius={initialRadius}
        isVenuePage={true}
      />
    </>
  )
}
