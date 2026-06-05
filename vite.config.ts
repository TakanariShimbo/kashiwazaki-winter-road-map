import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages（プロジェクトページ）配信のため base にリポジトリ名を設定。
// データ取得は import.meta.env.BASE_URL を使うので base 変更に追従する。
export default defineConfig({
  base: '/kashiwazaki-winter-road-map/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon-32x32.png', 'apple-touch-icon.png'],
      manifest: {
        name: '柏崎 冬道マップ',
        short_name: '冬道マップ',
        description: '柏崎市の消雪パイプ・除雪路線・緊急確保路線・歩道除雪を表示する冬道マップ',
        lang: 'ja',
        dir: 'ltr',
        theme_color: '#0a3d8f',
        background_color: '#0a3d8f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // アプリ本体＋冬道データを事前キャッシュ（オフラインでも起動・データ表示可）
        globPatterns: ['**/*.{js,css,html,png,svg,json,geojson}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // 地理院タイル（閲覧した範囲をオフライン用にキャッシュ）
            urlPattern: ({ url }) => url.hostname === 'cyberjapandata.gsi.go.jp',
            handler: 'CacheFirst',
            options: {
              cacheName: 'gsi-tiles',
              expiration: { maxEntries: 800, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // OpenStreetMap タイル
            urlPattern: ({ url }) => url.hostname === 'tile.openstreetmap.org',
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
