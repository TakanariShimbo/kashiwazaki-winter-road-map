import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages（プロジェクトページ）配信のため base にリポジトリ名を設定。
// データ取得は import.meta.env.BASE_URL を使うので base 変更に追従する。
export default defineConfig({
  plugins: [react()],
  base: '/kashiwazaki-winter-road-map/',
})
