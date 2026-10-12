
'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { groupVenuesByPrefecture } from '@/lib/group-venues'

export type Venue = {
  id: number
  name: string
  prefecture: string | null
  address: string | null
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
      {/* 共通ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" className="shrink-0 text-lg font-extrabold tracking-tight sm:text-xl">
            🎵 ライブ会場ホテルサーチ
          </a>

          <nav
            aria-label="メインナビゲーション"
            className="flex flex-wrap items-center justify-end gap-1 sm:gap-2"
          >
            <a
              href="/#hotel-search"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white shadow-md transition hover:bg-indigo-700 sm:px-5 sm:py-3 sm:text-sm"
            >
              🔎 ホテル検索
            </a>
            <a
              href="/venues"
              className="rounded-full px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              会場一覧
            </a>
            <a
              href="/faq"
              className="hidden rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              よくある質問
            </a>
          </nav>
        </div>
      </header>

      {/* パンくずリスト */}
      <nav aria-label="パンくずリスト" className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <li>
              <a href="/" className="hover:text-indigo-600">トップページ</a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/venues" className="hover:text-indigo-600">
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

      {/* 会場Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{ backgroundImage: "url('/hero-concert.png')" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-blue-950/45" />

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            ライブ・イベント遠征のホテル探し
          </p>

          <h1 className="mt-5 max-w-4xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {initialSelectedVenue}
            <br />
            <span className="text-sky-300">周辺のホテルを探す</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-100 sm:text-base">
            会場からの距離・宿泊料金・口コミを比較して、
            ライブやイベントの遠征にぴったりのホテルを探せます。
          </p>

          {currentVenue?.address && (
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-white/90">
              <span aria-hidden="true">📍</span>
              <span>
                {currentVenue.prefecture ? `${currentVenue.prefecture} ` : ''}
                {currentVenue.address}
              </span>
            </p>
          )}
        </div>
      </section>

      {/* 検索フォーム */}
      <section
        id="hotel-search"
        className="scroll-mt-28 relative z-10 mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          <p className="text-sm font-bold tracking-widest text-blue-700">
            HOTEL SEARCH
          </p>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            会場周辺のホテルを探す
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            会場と検索範囲を選択してください。
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(180px,1fr)_auto] md:items-end">
            <div>
              <label htmlFor="venue" className="mb-2 block text-sm font-bold">
                📍 ライブ・イベント会場
              </label>
              <select
                id="venue"
                value={selectedVenue}
                onChange={(event) => setSelectedVenue(event.target.value)}
                disabled={venues.length === 0 || loading}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">会場を選択してください</option>
                {venueGroups.map((group) => (
                  <optgroup key={group.prefecture} label={group.prefecture}>
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
              <label htmlFor="radius" className="mb-2 block text-sm font-bold">
                🗺️ 会場からの検索範囲
              </label>
              <select
                id="radius"
                value={radius}
                onChange={(event) => setRadius(Number(event.target.value))}
                disabled={loading}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value={1000}>1km以内</option>
                <option value={3000}>3km以内</option>
                <option value={5000}>5km以内</option>
              </select>
            </div>

            <button
              type="button"
              onClick={searchHotels}
              disabled={loading || !selectedVenue}
              className="min-h-12 rounded-xl bg-blue-700 px-7 py-3 font-extrabold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '検索しています…' : 'ホテルを検索する →'}
            </button>
          </div>
        </div>
      </section>

      {/* 検索結果 */}
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
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              {initialSelectedVenue}から{initialRadius / 1000}km以内に
              <strong className="mx-1 text-slate-900">{initialHotels.length}件</strong>
              のホテルが見つかっています。
              {lowestPrice !== null && (
                <>
                  最低料金の目安は
                  <strong className="mx-1 text-slate-900">
                    {lowestPrice.toLocaleString('ja-JP')}円〜
                  </strong>
                  です。
                </>
              )}
              料金や空室状況は宿泊日・プランによって変わります。予約サイトで最新情報をご確認ください。
            </p>
          </div>

          <p className="shrink-0 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
            検索範囲：{initialRadius / 1000}km以内
          </p>
        </div>

        {/* 並び替えショートカット */}
        <div className="mt-6 flex flex-wrap gap-2" aria-label="ホテルの並び替え">
          <button
            type="button"
            onClick={() => setSortMode('distance')}
            aria-pressed={sortMode === 'distance'}
            className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
              sortMode === 'distance'
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            📍 会場から近い
          </button>
          <button
            type="button"
            onClick={() => setSortMode('price')}
            aria-pressed={sortMode === 'price'}
            className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
              sortMode === 'price'
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            💴 料金が安い
          </button>
          <button
            type="button"
            onClick={() => setSortMode('rating')}
            aria-pressed={sortMode === 'rating'}
            className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${
              sortMode === 'rating'
                ? 'border-blue-700 bg-blue-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
            }`}
          >
            ⭐ 口コミ評価が高い
          </button>
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
          <div className="mt-6 grid items-stretch gap-5 lg:grid-cols-2">
            {sortedHotels.map((hotel) => (
              <article
                key={hotel.hotel_id}
                className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="grid h-full sm:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="relative min-h-48 overflow-hidden bg-slate-100 sm:min-h-[320px]">
                    {hotel.hotel_image_url ? (
                      <img
                        src={hotel.hotel_image_url}
                        alt={hotel.hotel_name}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full min-h-48 items-center justify-center text-4xl text-slate-300">
                        🏨
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col p-5">
                    <p className="text-xs font-bold tracking-widest text-blue-700">
                      HOTEL
                    </p>
                    <h3 className="mt-2 break-words text-lg font-extrabold leading-7 text-slate-900">
                      {hotel.hotel_name}
                    </h3>

                    <div className="mt-3">
                      {hotel.review_average != null ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <ReviewStars rating={hotel.review_average} />
                          <span className="font-extrabold">
                            {hotel.review_average.toFixed(1)}
                          </span>
                          {hotel.review_count != null && (
                            <span className="text-sm text-slate-500">
                              口コミ {hotel.review_count.toLocaleString('ja-JP')}件
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">口コミ情報なし</p>
                      )}

                      {hotel.review_updated_at && (
                        <p className="mt-1 text-xs text-slate-400">
                          口コミ更新日：{hotel.review_updated_at.replace(/-/g, '/')}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs font-medium text-slate-500">
                        楽天トラベルでの最低料金（目安）
                      </p>
                      {hotel.price_min != null && hotel.price_min > 0 ? (
                        <p className="mt-1 text-2xl font-black text-blue-700">
                          {hotel.price_min.toLocaleString('ja-JP')}
                          <span className="ml-1 text-sm font-bold">円〜</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          料金情報なし
                        </p>
                      )}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {hotel.address}
                    </p>
                    <p className="mt-2 text-sm font-bold text-slate-700">
                      📍 {initialSelectedVenue}から約 {hotel.distance_km}km
                    </p>

                    {hotel.affiliate_url ? (
                      <a
                        href={hotel.affiliate_url}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="mt-5 block rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 sm:mt-auto"
                      >
                        予約・詳細を見る →
                      </a>
                    ) : (
                      <div className="mt-5 rounded-xl bg-slate-100 px-5 py-3 text-center text-sm font-semibold text-slate-500">
                        予約情報準備中
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 別の会場への内部リンク */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-xl font-black sm:text-2xl">
            別の会場からホテルを探す
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {venues
              .filter((venue) => venue.id !== currentVenue?.id)
              .map((venue) => (
                <li key={venue.id}>
                  <a
                    href={`/venues/${venue.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  >
                    <span>{venue.name}周辺のホテル</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </li>
              ))}
          </ul>
          <a
            href="/venues"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
          >
            会場一覧を見る →
          </a>
        </div>
      </section>

      
    </main>
  )
}
