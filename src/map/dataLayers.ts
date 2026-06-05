import maplibregl from 'maplibre-gl'
import { LAYERS, META, dataUrl } from '../config/layers'
import { pinMode } from './interaction'
import type { LayerConfig, FeatureProps, LayerStyle, LineDash } from '../types'

/** sublayer の line / case レイヤーIDを返す */
export const lineLayerId = (layerKey: string, i: number) => `lyr_${layerKey}_${i}`
const caseLayerId = (layerKey: string, i: number) => `lyr_${layerKey}_${i}_case`

function popupHtml(layer: LayerConfig, p: FeatureProps): string {
  let rows = ''
  for (const f of layer.fields) {
    let v = p[f]
    if (v === undefined || v === null || v === '') continue
    if (f === '除雪路線延長') v = `${v} m`
    rows += `<tr><td class="k">${f}</td><td>${v}</td></tr>`
  }
  return `<div class="pt">${layer.name}</div><table>${rows}</table>` +
    `<div class="meta">出典：${META.source}<br>基準日：${META.base}／${META.license}</div>`
}

/** 地図ロード後に全冬道レイヤーを追加し、クリックでポップアップを出す */
export function addDataLayers(map: maplibregl.Map): void {
  for (const layer of LAYERS) {
    layer.files.forEach((file, i) => {
      const sourceId = `${layer.key}_${i}`
      const id = lineLayerId(layer.key, i)
      const caseId = caseLayerId(layer.key, i)
      const visibility = layer.defaultOn ? 'visible' : 'none'

      map.addSource(sourceId, { type: 'geojson', data: dataUrl(file) })
      // 白い下地（航空写真の上でも視認しやすく）
      map.addLayer({
        id: caseId, type: 'line', source: sourceId,
        layout: { 'line-cap': 'round', visibility },
        paint: { 'line-color': '#ffffff', 'line-width': layer.width + 2, 'line-opacity': 0.6 },
      })
      map.addLayer({
        id, type: 'line', source: sourceId,
        layout: { 'line-cap': 'round', visibility },
        paint: { 'line-color': layer.color, 'line-width': layer.width, 'line-opacity': 0.95 },
      })

      map.on('click', id, (e) => {
        if (pinMode.active) return // ピン設置中はポップアップを抑制
        const props = (e.features?.[0]?.properties ?? {}) as FeatureProps
        new maplibregl.Popup({ maxWidth: '280px' })
          .setLngLat(e.lngLat)
          .setHTML(popupHtml(layer, props))
          .addTo(map)
      })
      map.on('mouseenter', id, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', id, () => { map.getCanvas().style.cursor = '' })
    })
  }
}

/** レイヤーの表示/非表示を切り替え（line と case 両方） */
export function setLayerVisibility(map: maplibregl.Map, layer: LayerConfig, visible: boolean): void {
  const vis = visible ? 'visible' : 'none'
  layer.files.forEach((_, i) => {
    map.setLayoutProperty(lineLayerId(layer.key, i), 'visibility', vis)
    map.setLayoutProperty(caseLayerId(layer.key, i), 'visibility', vis)
  })
}

// 線種 → line-dasharray（単位は線幅）。solid は null でリセット。
const DASH_PATTERN: Record<LineDash, number[] | null> = {
  solid: null,
  dashed: [2, 1.5],
  dotted: [0.4, 1.8],
}

/** ユーザ設定の色・太さ・線種をレイヤーへ適用（line と case 両方） */
export function applyLayerStyle(map: maplibregl.Map, layer: LayerConfig, style: LayerStyle): void {
  const dash = DASH_PATTERN[style.dash]
  layer.files.forEach((_, i) => {
    const id = lineLayerId(layer.key, i)
    const caseId = caseLayerId(layer.key, i)
    map.setPaintProperty(id, 'line-color', style.color)
    map.setPaintProperty(id, 'line-width', style.width)
    map.setPaintProperty(caseId, 'line-width', style.width + 2)
    // 破線時は白い下地も同じパターンで抜く
    map.setPaintProperty(id, 'line-dasharray', dash)
    map.setPaintProperty(caseId, 'line-dasharray', dash)
  })
}
