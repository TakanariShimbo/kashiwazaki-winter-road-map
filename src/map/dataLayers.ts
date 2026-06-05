import maplibregl from 'maplibre-gl'
import { LAYERS, META, dataUrl } from '../config/layers'
import type { LayerConfig, FeatureProps } from '../types'

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
