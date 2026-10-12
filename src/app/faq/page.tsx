import type { Metadata } from 'next'

const BASE_URL = 'https://live-stay-search.vercel.app'

export const metadata: Metadata = {
  title: {
    absolute: 'よくある質問・サイトの使い方｜ライブ会場ホテルサーチ',
  },
  description:
    'ライブ・コンサート・イベント遠征時のホテル検索方法、検索範囲、料金・口コミの見方、ライブ終了後のホテル選びなど、ライブ会場ホテルサーチの使い方をまとめています。',
  alternates: {
    canonical: `${BASE_URL}/faq`,
  },
}

const faqs = [
  {
    question: 'ライブ会場の近くにあるホテルはどのように探せますか？',
    answer:
      'トップページの「ホテル検索」またはライブ・イベント会場一覧から会場を選択すると、会場周辺のホテルを検索できます。検索範囲は1km・3km・5kmから選べます。',
  },
  {
    question: '検索範囲は1km・3km・5kmのどれを選べばいいですか？',
    answer:
      'まずは標準の5km以内で候補を確認するのがおすすめです。会場からの近さを最優先したい場合は1km、近さとホテル数のバランスを取りたい場合は3kmに絞り込んで比較してください。',
  },
  {
    question: 'ホテルは何を基準に比較すればいいですか？',
    answer:
      '会場からの距離、最低料金、口コミ評価、口コミ件数をあわせて確認してください。近さだけで決めず、料金や実際に宿泊した人の評価も含めて比較すると選びやすくなります。',
  },
  {
    question: 'ホテルの表示料金は実際の宿泊料金ですか？',
    answer:
      'サイト内の料金は最低料金の目安です。実際の宿泊料金は、宿泊日・人数・プラン・空室状況などによって変動します。予約前に各予約サイトで最新の料金をご確認ください。',
  },
  {
    question: '口コミ評価や口コミ件数はどのように見ればいいですか？',
    answer:
      '口コミ評価だけでなく、口コミ件数もあわせて確認するのがおすすめです。評価が高くても口コミ件数が少ない場合があるため、料金・会場からの距離・口コミ評価・口コミ件数を総合的に比較してください。',
  },
  {
    question: 'ライブ終了後のホテルはどう選べばいいですか？',
    answer:
      '終演後は会場周辺や駅、公共交通機関が混雑する場合があります。移動の負担を抑えたい場合は会場から近いホテルを優先し、料金を抑えたい場合は検索範囲を広げて比較するのがおすすめです。',
  },
  {
    question: '人気公演の日はホテルを早めに予約した方がいいですか？',
    answer:
      '人気公演や週末、連休などは会場周辺のホテルが満室になったり、料金が上がったりする場合があります。参加日が決まっている場合は、早めに空室と料金を確認することをおすすめします。',
  },
  {
    question: '検索結果にホテルが表示されない場合はどうすればいいですか？',
    answer:
      '検索範囲を1kmから3km、3kmから5kmへ広げてみてください。それでも候補が少ない場合は、会場周辺だけでなく主要駅周辺のホテルも検討すると選択肢を増やせます。',
  },
]

export default function FaqPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  const faqJsonLdString = JSON.stringify(faqJsonLd).replace(
    /</g,
    '\\u003c'
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50 text-gray-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: faqJsonLdString,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/95 backdrop-blur">
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
    <a href="/" className="text-xl font-extrabold tracking-tight">
      🎵 ライブ会場ホテルサーチ
    </a>

    <nav
      aria-label="メインナビゲーション"
      className="flex flex-wrap items-center justify-end gap-2"
    >
      <a
        href="/#hotel-search"
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
  </div>
</header>

      {/* TOPと同じイメージのMV。検索窓は表示しない */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hero-concert.png')",
          }}
        />

        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/35 to-transparent" />

        <div className="relative mx-auto max-w-6xl px-6 pb-12 pt-10 sm:pb-14 sm:pt-12">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full bg-white/95 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm backdrop-blur">
              🎫 ライブ会場ホテルサーチ
            </p>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-gray-900 drop-shadow-sm sm:text-6xl">
              よくある質問
            </h1>

            <p className="mt-4 max-w-2xl text-base font-medium leading-8 text-gray-700 sm:text-lg">
              ホテルの探し方や料金・口コミの見方、
              ライブ遠征時のホテル選びについてご案内します。
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-4xl px-6 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            サイトの使い方・ホテル検索について
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            会場の選び方、検索範囲、料金・口コミの比較方法、
            ライブ終了後の宿泊先選びまでまとめています。
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <summary className="cursor-pointer list-none font-bold text-slate-900">
                <span className="flex items-start justify-between gap-4">
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="text-xl leading-none text-indigo-600 transition group-open:rotate-45"
                  >
                    ＋
                  </span>
                </span>
              </summary>

              <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-7 text-slate-600 sm:text-base">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-indigo-50 p-6">
          <h2 className="text-lg font-bold text-slate-900">
            会場周辺のホテルを探す
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            会場ごとのページでは、距離・最低料金・口コミを確認しながら周辺ホテルを比較できます。
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="/#hotel-search"
              className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
            >
              ホテル検索
            </a>

            <a
              href="/venues"
              className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              ライブ・イベント会場一覧を見る
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}