
'use client'

import { useState, useTransition } from 'react'
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

type HomeClientProps = {
  venues: Venue[]
  initialSelectedVenue: string
  initialHotels: Hotel[]
  initialRadius: number
  isVenuePage?: boolean
}

function ReviewStars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, rating))

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`5点満点中${safeRating.toFixed(1)}点`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(
          0,
          Math.min(1, safeRating - index)
        )

        return (
          <span
            key={index}
            className="relative inline-block text-lg leading-none"
          >
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

export default function HomeClient({
  venues,
  initialSelectedVenue,
  initialHotels,
  initialRadius,
  isVenuePage = false,
}: HomeClientProps) {
  const router = useRouter()
  const [loading, startTransition] = useTransition()

  const [selectedVenue, setSelectedVenue] = useState(
    isVenuePage ? initialSelectedVenue : ''
  )
  const [radius, setRadius] = useState(initialRadius)

  const venueGroups = groupVenuesByPrefecture(venues)
  const hotels = initialHotels

  const currentVenue = venues.find(
    (venue) => venue.name === initialSelectedVenue
  )

  function searchHotels() {
    const venue = venues.find(
      (item) => item.name === selectedVenue
    )

    if (!venue || loading) return

    const destination =
      radius === 3000
        ? `/venues/${venue.id}`
        : `/venues/${venue.id}?radius=${radius}`

    const currentUrl =
      window.location.pathname + window.location.search

    if (currentUrl === destination) return

    startTransition(() => {
      router.push(destination)
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="flex min-w-0 items-center gap-2 text-lg font-black tracking-tight text-slate-900 sm:text-xl"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-xl text-white">
              ♪
            </span>
            <span>
              ライブ会場
              <span className="text-blue-700">ホテルサーチ</span>
            </span>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            <a href="/venues" className="transition hover:text-blue-700">
              会場一覧
            </a>
            <a href="#hotel-search" className="transition hover:text-blue-700">
              ホテルを探す
            </a>
            <a href="#venue-info" className="transition hover:text-blue-700">
              会場情報
            </a>
          </nav>

          <a
            href="#hotel-search"
            className="shrink-0 rounded-full bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 sm:px-5"
          >
            ホテル検索
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 -z-20 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-concert.png')",
          }}
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-blue-950/45" />

        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur">
              <span aria-hidden="true">♪</span>
              ライブ・イベント遠征のホテル探し
            </p>

            <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {isVenuePage ? (
                <>
                  {initialSelectedVenue}
                  <br />
                  <span className="text-sky-300">
                    周辺のホテルを探す
                  </span>
                </>
              ) : (
                <>
                  ライブの日は、
                  <br />
                  <span className="text-sky-300">
                    会場の近くに泊まろう。
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 sm:text-lg">
              ライブやイベントの会場を選ぶだけ。
              <br className="hidden sm:block" />
              会場からの距離や口コミ、料金を比較して、
              <br className="hidden sm:block" />
              遠征にぴったりのホテルを探せます。
            </p>

            {isVenuePage && currentVenue?.address && (
              <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-white/90">
                <span aria-hidden="true">📍</span>
                <span>{currentVenue.address}</span>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Search form */}
      <section
        id="hotel-search"
        className="relative z-10 mx-auto -mt-12 max-w-7xl scroll-mt-28 px-4 sm:px-6 lg:px-8"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-7">
          <div className="mb-5">
            <p className="text-sm font-bold text-blue-700">
              HOTEL SEARCH
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              会場周辺のホテルを探す
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              会場と検索範囲を選択してください。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(180px,1fr)_auto] md:items-end">
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
                onChange={(event) =>
                  setSelectedVenue(event.target.value)
                }
                disabled={venues.length === 0 || loading}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
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

              {venues.length === 0 && (
                <p className="mt-2 text-sm text-slate-500">
                  登録されている会場がありません。
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="radius"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                🗺️ 会場からの検索範囲
              </label>

              <select
                id="radius"
                value={radius}
                onChange={(event) =>
                  setRadius(Number(event.target.value))
                }
                disabled={loading}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
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
              className="min-h-12 rounded-xl bg-blue-700 px-7 py-3 font-extrabold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '検索しています…' : 'ホテルを検索する →'}
            </button>
          </div>
        </div>
      </section>

      {/* Venue page results */}
      {isVenuePage && (
        <>
          <section
            className="mx-auto max-w-7xl px-4 pb-12 pt-14 sm:px-6 lg:px-8"
            aria-busy={loading}
          >
            <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold tracking-widest text-blue-700">
                  HOTELS NEAR THE VENUE
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {initialSelectedVenue}周辺のホテル
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  会場からの距離や口コミ、料金を比較できます。
                </p>
              </div>

              <p className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-800">
                検索範囲：{initialRadius / 1000}km以内
              </p>
            </div>

            {hotels.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
                <div className="text-4xl" aria-hidden="true">
                  🏨
                </div>\               <h3 className="mt-4 text-lg font-bold">
                  条件に合うホテルが見つかりませんでした
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  検索範囲を広げて、もう一度お試しください。
                </p>
              </div>
            ) : (
              <div className="grid items-stretch gap-6 lg:grid-cols-2">
                {hotels.map((hotel) => (
                  <article
  key={hotel.hotel_id}
  className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
>
                    <div className="grid h-full sm:grid-cols-[180px_minmax(0,1fr)]">
  <div className="relative min-h-48 overflow-hidden bg-slate-100 sm:min-h-[360px]">
                        {hotel.hotel_image_url ? (
                          <img
                            src={hotel.hotel_image_url}
                            alt={hotel.hotel_name}
                            loading="lazy"
                            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex min-h-48 h-full items-center justify-center text-4xl text-slate-300">
                            🏨
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col p-5 sm:p-6">
                        <p className="text-xs font-bold tracking-widest text-blue-700">
                          HOTEL
                        </p>

                        <h3 className="mt-2 break-words text-lg font-extrabold leading-7 text-slate-900">
                          {hotel.hotel_name}
                        </h3>

                        <div className="mt-3">
                          {hotel.review_average != null ? (
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <ReviewStars
                                rating={hotel.review_average}
                              />
                              <span className="font-extrabold text-slate-900">
                                {hotel.review_average.toFixed(1)}
                              </span>

                              {hotel.review_count != null && (
                                <span className="text-sm text-slate-500">
                                  口コミ{' '}
                                  {hotel.review_count.toLocaleString('ja-JP')}
                                  件
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">
                              口コミ情報なし
                            </p>
                          )}

                          {hotel.review_updated_at && (
                            <p className="mt-1 text-xs text-slate-400">
                              口コミ更新日：
                              {hotel.review_updated_at.replace(/-/g, '/')}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3">
                          <p className="text-xs font-medium text-slate-500">
                            楽天トラベルでの最低料金（目安）
                          </p>
                          {hotel.price_min != null &&
                          hotel.price_min > 0 ? (
                            <p className="mt-1 text-2xl font-black text-blue-700">
                              {hotel.price_min.toLocaleString('ja-JP')}
                              <span className="ml-1 text-sm font-bold">
                                円〜
                              </span>
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
                          📍 {initialSelectedVenue}から約{' '}
                          {hotel.distance_km}km
                        </p>

                        {hotel.affiliate_url ? (
                          <a
                            href={hotel.affiliate_url}
                            target="_blank"
                            rel="sponsored noopener noreferrer"
                            className="mt-auto block rounded-xl bg-blue-700 px-5 py-3 text-center font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
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

          {/* Venue information */}
          {currentVenue && (
            <section
              id="venue-info"
              className="border-y border-slate-200 bg-white"
            >
              <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm font-bold tracking-widest text-blue-700">
                  VENUE INFORMATION
                </p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  {currentVenue.name}の会場情報
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      所在地
                    </p>
                    <p className="mt-2 leading-7 text-slate-800">
                      {currentVenue.address || '住所情報は準備中です。'}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-5">
                    <p className="text-sm font-bold text-slate-500">
                      都道府県
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-800">
                      {currentVenue.prefecture || '情報なし'}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-500">
                  会場周辺のホテルは、上の一覧で距離・口コミ・料金を比較できます。
                  最寄り駅や詳しいアクセス情報は、確認できるデータを準備してから掲載します。
                </p>
              </div>
            </section>
          )}
        </>
      )}

      {/* Venue links */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-blue-700">
              FIND YOUR VENUE
            </p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              会場からホテルを探す
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              ライブ・イベント会場の一覧から、周辺のホテルを探せます。
            </p>
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <li key={venue.id}>
                <a
                  href={`/venues/${venue.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                >
                  <span>{venue.name}周辺のホテル</span>
                  <span aria-hidden="true">→</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 text-center">
            <a
              href="/venues"
              className="inline-flex rounded-full bg-slate-900 px-7 py-3 font-bold text-white transition hover:bg-slate-700"
            >
              会場一覧を見る →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-4 py-8 text-center text-sm text-slate-400">
        <a
          href="/"
          className="font-bold text-white transition hover:text-sky-300"
        >
          ライブ会場ホテルサーチ
        </a>
        <p className="mt-3">
          © ライブ会場ホテルサーチ
        </p>
      </footer>
    </main>
  )
}
