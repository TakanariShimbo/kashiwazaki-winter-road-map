export interface LayerConfig {
  /** 内部キー */
  key: string
  /** 表示名 */
  name: string
  /** 線の色 */
  color: string
  /** 線の太さ */
  width: number
  /** data/ 配下の geojson ファイル名（拡張子なし）。複数なら1レイヤーに統合表示 */
  files: string[]
  /** 初期表示 ON/OFF */
  defaultOn: boolean
  /** ポップアップに出す属性キー（この順で表示） */
  fields: string[]
}

export interface BasemapConfig {
  key: string
  name: string
  tiles: string[]
  attribution: string
}

/** GeoJSON フィーチャの属性 */
export type FeatureProps = Record<string, string | number | null>

/** 経度, 緯度 */
export type LngLat = [number, number]

/** 線種 */
export type LineDash = 'solid' | 'dashed' | 'dotted'

/** ユーザがカスタマイズ可能なレイヤーの線スタイル */
export interface LayerStyle {
  color: string
  width: number
  dash: LineDash
}
