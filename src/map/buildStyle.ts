import type { StyleSpecification } from 'maplibre-gl'
import { BASEMAPS, DEFAULT_BASEMAP } from '../config/basemaps'

/** 全背景タイルを source/layer として持ち、初期表示のみ visible にしたスタイルを構築 */
export function buildStyle(): StyleSpecification {
  const sources: StyleSpecification['sources'] = {}
  const layers: StyleSpecification['layers'] = []
  for (const b of BASEMAPS) {
    const id = `base_${b.key}`
    sources[id] = { type: 'raster', tiles: b.tiles, tileSize: 256, attribution: b.attribution, maxzoom: 18 }
    layers.push({
      id, type: 'raster', source: id,
      layout: { visibility: b.key === DEFAULT_BASEMAP ? 'visible' : 'none' },
    })
  }
  return { version: 8, sources, layers }
}
