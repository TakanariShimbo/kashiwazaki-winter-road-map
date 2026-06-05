import type { BasemapConfig } from '../types'

const GSI = '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地理院タイル</a>'
const OSM = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

/** 背景タイル（すべて無料・APIキー不要） */
export const BASEMAPS: BasemapConfig[] = [
  { key: 'pale',  name: '淡色',     tiles: ['https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'],          attribution: GSI },
  { key: 'std',   name: '標準',     tiles: ['https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'],           attribution: GSI },
  { key: 'photo', name: '航空写真', tiles: ['https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'], attribution: GSI },
  { key: 'blank', name: '白地図',   tiles: ['https://cyberjapandata.gsi.go.jp/xyz/blank/{z}/{x}/{y}.png'],         attribution: GSI },
  { key: 'osm',   name: 'OSM',      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],                     attribution: OSM },
]

export const DEFAULT_BASEMAP = 'pale'
