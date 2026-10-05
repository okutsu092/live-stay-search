import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://live-stay-search.vercel.app'),

  title: {
    default: 'ライブ会場ホテルサーチ',
    template: '%s｜ライブ会場ホテルサーチ',
  },

  description:
    'ライブ・コンサート・イベント会場から近いホテルを検索。会場と検索範囲を選び、周辺の宿泊施設を距離で探せます。',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
