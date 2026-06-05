import type { LayerConfig, LayerStyle } from '../types'

/** 柏崎市中心（経度, 緯度） */
export const KASHIWAZAKI: [number, number] = [138.5589, 37.3716]

export const META = {
  source: '柏崎市オープンデータ',
  license: 'CC-BY 4.0',
  base: '令和6年12月時点',
}

/** 冬道レイヤー。配列の後ろほど地図上で前面に描画される。
 * 配色はブルー同系統で統一。除雪・緊急確保は同色で太さ違い、歩道は点線。 */
export const LAYERS: LayerConfig[] = [
  { key: 'hodo',    name: '歩道除雪',     color: '#7fb0de', width: 2.5, dash: 'dotted', files: ['hodo'], defaultOn: false, fields: ['路線名', '水準', '除雪路線延長'] },
  { key: 'josetsu', name: '除雪路線',     color: '#163e8c', width: 2,   dash: 'solid',  files: ['josetsu', 'josetsu_takayanagi', 'josetsu_nishiyama'], defaultOn: true, fields: ['路線名', '区分', '路線種別', '除雪路線延長'] },
  { key: 'kinkyu',  name: '緊急確保路線', color: '#163e8c', width: 5,   dash: 'solid',  files: ['kinkyu'], defaultOn: true, fields: ['路線名', '区分', '路線種別', '除雪路線延長', 'その他必要情報'] },
  { key: 'pipe',    name: '消雪パイプ',   color: '#0a84ff', width: 3.5, dash: 'solid',  files: ['shosetsu_pipe'], defaultOn: true, fields: ['路線名', '管理番号', '施設番号', '設置場所'] },
]

/** base（GitHub Pages のサブパス）に追従するデータURL */
export const dataUrl = (file: string): string =>
  `${import.meta.env.BASE_URL}data/${file}.geojson`

/** LAYERS の既定値から初期スタイルを生成 */
export const defaultLayerStyles = (): Record<string, LayerStyle> =>
  Object.fromEntries(
    LAYERS.map((l) => [l.key, { color: l.color, width: l.width, dash: l.dash }]),
  )
