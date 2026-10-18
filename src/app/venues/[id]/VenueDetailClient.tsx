'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { groupVenuesByPrefecture } from '@/lib/group-venues'

export type Venue = {
  id: number
  name: string
  prefecture: string | null
  address: string | null
  nearest_station_access: string | null
  official_url: string | null
  max_capacity: number | null
}

export type Hotel = {
  hotel_id: number
  hotel_name: string
  address: string
  price_min: number | null
  affiliate_url: string | null
  hotel_image_url: string | null
  distance_km: number
  review_average: number | null
  review_count: number | null
  review_updated_at: string | null
}

type Props = {
  venues: Venue[]
  initialSelectedVenue: string
  initialHotels: Hotel[]
  initialRadius: number
}

type SortMode = 'distance' | 'price' | 'rating'

const VENUE_HERO_IMAGES: Record<number, string> = {}

function ReviewStars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, rating))

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`5点満点中${safeRating.toFixed(1)}点`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, safeRating - index))

        return (
          <span key={index} className="relative inline-block text-lg leading-none">
            <span className="text-slate-200">★</span>
            <span
              className="absolute inset-y-0 left-0 overflow-hidden text-amber-400"
              style={{ width: `${fill * 100}%` }}
              aria-hidden="true"
            >
              ★
            </span>
          </span>
        )
      })}
    </div>
  )
}

export default function VenueDetailClient({
  venues,
  initialSelectedVenue,
  initialHotels,
  initialRadius,
}: Props) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()
  const [selectedVenue, setSelectedVenue] = useState(initialSelectedVenue)
  const [radius, setRadius] = useState(initialRadius)
  const [sortMode, setSortMode] = useState<SortMode>('distance')

  const venueGroups = groupVenuesByPrefecture(venues)

  const currentVenue = venues.find(
    (venue) => venue.name === initialSelectedVenue
  )

  const venueHeroImage =
    (currentVenue && VENUE_HERO_IMAGES[currentVenue.id]) ||
    '/hero-concert.png'

  const sortedHotels = useMemo(() => {
    const result = [...initialHotels]

    if (sortMode === 'distance') {
      result.sort((a, b) => a.distance_km - b.distance_km)
    } else if (sortMode === 'price') {
      result.sort((a, b) => {
        const priceA =
          a.price_min != null && a.price_min > 0
            ? a.price_min
            : Number.POSITIVE_INFINITY
        const priceB =
          b.price_min != null && b.price_min > 0
            ? b.price_min
            : Number.POSITIVE_INFINITY

        return priceA - priceB
      })
    } else {
      result.sort((a, b) => {
        const ratingA =
          a.review_average != null
            ? a.review_average
            : Number.NEGATIVE_INFINITY
        const ratingB =
          b.review_average != null
            ? b.review_average
            : Number.NEGATIVE_INFINITY

        return ratingB - ratingA
      })
    }

    return result
  }, [initialHotels, sortMode])

  const hotelsWithPrice = initialHotels.filter(
    (hotel) =>
      typeof hotel.price_min === 'number' && hotel.price_min > 0
  )

  const lowestPrice =
    hotelsWithPrice.length > 0
      ? Math.min(...hotelsWithPrice.map((hotel) => hotel.price_min as number))
      : null


  function getHotelTags(hotel: Hotel) {
    const tags: Array<{
      label: string
      className: string
    }> = []

    if (hotel.distance_km <= 1) {
      tags.push({
        label: '会場から近い',
        className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      })
    } else if (hotel.distance_km <= 3) {
      tags.push({
        label: '3km以内',
        className: 'bg-sky-50 text-sky-700 ring-sky-100',
      })
    }

    if (hotel.review_average != null && hotel.review_average >= 4) {
      tags.push({
        label: '高評価',
        className: 'bg-amber-50 text-amber-700 ring-amber-100',
      })
    }

    if (hotel.review_count != null && hotel.review_count >= 100) {
      tags.push({
        label: '口コミ多数',
        className: 'bg-violet-50 text-violet-700 ring-violet-100',
      })
    }

    if (
      lowestPrice !== null &&
      hotel.price_min != null &&
      hotel.price_min > 0 &&
      hotel.price_min <= lowestPrice * 1.15
    ) {
      tags.push({
        label: '料金が安め',
        className: 'bg-rose-50 text-rose-700 ring-rose-100',
      })
    }

    return tags.slice(0, 3)
  }

  function searchHotels() {
    const venue = venues.find((item) => item.name === selectedVenue)
    if (!venue || loading) return

    const destination =
      radius === 5000
        ? `/venues/${venue.id}`
        : `/venues/${venue.id}?radius=${radius}`

    const currentUrl = window.location.pathname + window.location.search
    if (currentUrl === destination) return

    startTransition(() => {
      router.push(destination)
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="/"
            className="min-w-0 shrink text-base font-extrabold tracking-tight sm:text-xl"
          >
            <span className="sm:hidden">🎵 ライブ会場ホテル</span>
            <span className="hidden sm:inline">🎵 ライブ会場ホテルサーチ</span>
          </a>

          {/* Desktop navigation */}
          <nav
            aria-label="メインナビゲーション"
            className="hidden items-center justify-end gap-2 md:flex"
          >
            <a
              href="#hotel-search"
              className="inline-flex min-w-[180px] items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-lg"
            >
              🔎 ホテル検索
            </a>

            <a
              href="/venues"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              ライブ・イベント会場一覧
            </a>

            <a
              href="/faq"
              className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
            >
              よくある質問
            </a>
          </nav>

          {/* Mobile navigation */}
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <a
              href="#hotel-search"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm"
            >
              🔎 ホテル検索
            </a>

            <details className="relative">
              <summary
                aria-label="メニューを開く"
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm"
              >
                ☰
              </summary>

              <div className="absolute right-0 top-12 z-[60] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <a
                  href="/venues"
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ライブ・イベント会場一覧
                </a>

                <a
                  href="/faq"
                  className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  よくある質問
                </a>
              </div>
            </details>
          </div>
        </div>
      </header>

      <div aria-hidden="true" className="h-[64px] sm:h-[68px]" />

      <nav
        aria-label="パンくずリスト"
        className="border-b border-slate-100 bg-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li>
              <a href="/" className="transition hover:text-indigo-600">
                トップページ
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/venues" className="transition hover:text-indigo-600">
                ライブ・イベント会場一覧
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-medium text-slate-800">
              {initialSelectedVenue}
            </li>
          </ol>
        </div>
      </nav>

      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: `url('${venueHeroImage}')` }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />

        <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:gap-12">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
                <span aria-hidden="true">♪</span>
                ライブ・イベント遠征のホテル探し
              </p>

              <h1 className="mt-4 text-3xl font-black leading-[1.15] tracking-tight text-white sm:mt-5 sm:text-5xl lg:text-6xl">
                {initialSelectedVenue}
                <br />
                <span className="text-sky-300">周辺のホテル</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">
                会場からの距離・宿泊料金・口コミを比較して、
                ライブやイベントの遠征に便利なホテルを探せます。
              </p>

              {currentVenue?.address && (
                <p className="mt-4 flex max-w-2xl items-start gap-2 text-sm leading-6 text-white/90">
                  <span aria-hidden="true">📍</span>
                  <span>
                    {currentVenue.prefecture
                      ? `${currentVenue.prefecture} `
                      : ''}
                    {currentVenue.address}
                  </span>
                </p>
              )}
            </div>

            <div
              id="hotel-search"
              className="scroll-mt-24 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur sm:scroll-mt-28 sm:rounded-3xl sm:p-7"
            >
              <p className="text-xs font-black tracking-[0.18em] text-blue-700">
                HOTEL SEARCH
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                会場周辺のホテルを探す
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                会場と検索範囲を選択してください。
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <label
                    htmlFor="venue"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    📍 ライブ・イベント会場
                  </label>

                  <select
                    id="venue"
                    value={selectedVenue}
                    onChange={(event) => setSelectedVenue(event.target.value)}
                    disabled={venues.length === 0 || loading}
                    className="min-h-14 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">会場を選択してください</option>
                    {venueGroups.map((group) => (
                      <optgroup
                        key={group.prefecture}
                        label={group.prefecture}
                      >
                        {group.venues.map((venue) => (
                          <option key={venue.id} value={venue.name}>
                            {venue.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-2 text-sm font-bold text-slate-700">
                    🗺️ 会場からの検索範囲
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {[1000, 3000, 5000].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRadius(value)}
                        disabled={loading}
                        className={`min-h-12 rounded-xl border px-3 py-3 text-sm font-extrabold transition ${
                          radius === value
                            ? 'border-blue-700 bg-blue-700 text-white shadow-sm'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {value / 1000}km以内
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={searchHotels}
                  disabled={loading || !selectedVenue}
                  className="flex min-h-14 w-full items-center justify-center rounded-xl bg-blue-700 px-7 py-3 text-base font-extrabold text-white shadow-md transition hover:bg-blue-800 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? '検索しています…'
                    : '🔎 この会場のホテルを検索'}
                </button>
              </div>

              <p className="mt-4 text-center text-xs leading-5 text-slate-400">
                距離・料金・口コミからホテルを比較できます
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-busy={loading}
        className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:px-8"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold tracking-widest text-blue-700">
              HOTELS NEAR THE VENUE
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              {initialSelectedVenue}周辺のホテル
            </h2>
          </div>
        </div>

        {/* Venue overview */}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 sm:px-5">
            <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 sm:text-xl">
              <span aria-hidden="true">🏢</span>
              {initialSelectedVenue}について
            </h3>
          </div>

          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[320px_minmax(0,1fr)_420px] lg:items-stretch">
            {/* Venue image */}
            <div className="relative min-h-[200px] overflow-hidden rounded-xl bg-slate-100 sm:min-h-[220px] lg:min-h-[240px]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${venueHeroImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/15 to-transparent" />
            </div>

            {/* Venue basic information */}
            <div className="flex min-w-0 flex-col justify-center gap-4 py-1">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">
                  📍
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">
                    住所
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                    {currentVenue?.address
                      ? `${currentVenue.prefecture ? `${currentVenue.prefecture} ` : ''}${currentVenue.address}`
                      : '情報なし'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">
                  🚉
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">最寄り駅</p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm font-semibold leading-6 text-slate-800">{currentVenue?.nearest_station_access?.trim() || '情報なし'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base">
                  👥
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500">最大キャパ</p>
                  <p className="mt-1 whitespace-pre-line break-words text-sm font-semibold leading-6 text-slate-800">{currentVenue?.max_capacity != null ? `${currentVenue.max_capacity.toLocaleString('ja-JP')}人` : '情報なし'}</p>
                </div>
              </div>
            </div>

            {/* Search summary cards */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-sky-100 bg-sky-50 px-4 py-5 text-center sm:px-5 sm:py-6">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  🏨
                </div>

                <p className="mt-3 text-xs font-bold leading-5 text-slate-600 sm:text-sm">
                  検索範囲{initialRadius / 1000}kmでのホテル数
                </p>

                <p className="mt-2 text-3xl font-black tracking-tight text-sky-700 sm:text-4xl">
                  {initialHotels.length}
                  <span className="ml-1 text-base font-bold sm:text-lg">件</span>
                </p>
              </div>

              <div className="flex min-w-0 flex-col justify-center rounded-2xl border border-rose-100 bg-rose-50 px-4 py-5 text-center sm:px-5 sm:py-6">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-xl shadow-sm">
                  💴
                </div>

                <p className="mt-3 text-xs font-bold leading-5 text-slate-600 sm:text-sm">
                  楽天トラベルでの最低料金（目安）
                </p>

                <p className="mt-2 break-words text-2xl font-black tracking-tight text-rose-700 sm:text-3xl">
                  {lowestPrice !== null
                    ? `${lowestPrice.toLocaleString('ja-JP')}円〜`
                    : '情報なし'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div
          className="mt-6 flex flex-wrap gap-2"
          aria-label="ホテルの並び替え"
        >
          {[
            ['distance', '📍 会場から近い'],
            ['price', '💴 料金が安い'],
            ['rating', '⭐ 口コミ評価が高い'],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode as SortMode)}
              aria-pressed={sortMode === mode}
              className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
                sortMode === mode
                  ? 'border-blue-700 bg-blue-700 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {sortedHotels.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <div className="text-4xl" aria-hidden="true">🏨</div>
            <h3 className="mt-4 text-lg font-bold">
              条件に合うホテルが見つかりませんでした
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              検索範囲を広げて、もう一度お試しください。
            </p>
          </div>
        ) : (
          <div className="mt-6 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sortedHotels.map((hotel) => {
              const hotelTags = getHotelTags(hotel)

              return (
                <article
                  key={hotel.hotel_id}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  {/* Hotel image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    {hotel.hotel_image_url ? (
                      <img
                        src={hotel.hotel_image_url}
                        alt={hotel.hotel_name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-slate-300">
                        🏨
                      </div>
                    )}

                    <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                      <span className="rounded-lg bg-white/95 px-3 py-1.5 text-sm font-extrabold text-blue-700 shadow-sm backdrop-blur sm:text-base">
                        {hotel.distance_km.toFixed(1)}km
                      </span>

                      {hotel.review_average != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-extrabold text-slate-800 shadow-sm backdrop-blur sm:text-base">
                          <span aria-hidden="true">⭐</span>
                          {hotel.review_average.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Hotel content */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="break-words text-xl font-black leading-7 text-slate-900">
                      {hotel.hotel_name}
                    </h3>

                    <div className="mt-3 space-y-2">
                      <p className="flex items-start gap-2 text-sm leading-6 text-slate-600">
                        <span className="shrink-0" aria-hidden="true">
                          📍
                        </span>
                        <span>{hotel.address}</span>
                      </p>

                      <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <span aria-hidden="true">🎵</span>
                        会場から約 {hotel.distance_km}km
                      </p>
                    </div>

                    {hotelTags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {hotelTags.map((tag) => (
                          <span
                            key={tag.label}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold ring-1 ${tag.className}`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
                      {hotel.review_average != null ? (
                        <>
                          <ReviewStars rating={hotel.review_average} />
                          {hotel.review_count != null && (
                            <span className="text-xs text-slate-500">
                              口コミ {hotel.review_count.toLocaleString('ja-JP')}件
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">
                          口コミ情報なし
                        </span>
                      )}
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-medium text-slate-500">
                        楽天トラベルでの最低料金（目安）
                      </p>

                      {hotel.price_min != null && hotel.price_min > 0 ? (
                        <p className="mt-1 text-sm font-bold text-slate-700">
                          1泊
                          <span className="ml-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                            {hotel.price_min.toLocaleString('ja-JP')}
                          </span>
                          <span className="ml-1 text-xs font-black text-slate-900 sm:text-sm">
                            円〜
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          料金情報なし
                        </p>
                      )}
                    </div>

                    {hotel.affiliate_url ? (
                      <a
                        href={hotel.affiliate_url}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-center text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-200 sm:mt-auto"
                      >
                        空室・料金を見る →
                      </a>
                    ) : (
                      <div className="mt-5 rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-500 sm:mt-auto">
                        予約情報準備中
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
</main>
  )
}