import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { buildStyle } from './map/buildStyle'
import { addDataLayers, applyLayerStyle } from './map/dataLayers'
import { KASHIWAZAKI, LAYERS, defaultLayerStyles } from './config/layers'
import SearchBox from './components/SearchBox'
import LayerPanel from './components/LayerPanel'
import BasemapSwitcher from './components/BasemapSwitcher'
import PinPanel from './components/PinPanel'
import SettingsPanel from './components/SettingsPanel'
import type { LngLat, LayerStyle } from './types'

const STYLE_STORAGE_KEY = 'kw-layer-styles'

function loadStyles(): Record<string, LayerStyle> {
  const def = defaultLayerStyles()
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, Partial<LayerStyle>>
      for (const k of Object.keys(def)) if (saved[k]) def[k] = { ...def[k], ...saved[k] }
    }
  } catch { /* 壊れた保存値は無視 */ }
  return def
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [userPos, setUserPos] = useState<LngLat | null>(null)
  const [styles, setStyles] = useState<Record<string, LayerStyle>>(loadStyles)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return
    const m = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: KASHIWAZAKI,
      zoom: 13,
    })
    m.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showAccuracyCircle: true,
    })
    m.addControl(geolocate, 'top-right')
    // 現在地が更新されたら保持（目的地ピンの直線距離に使用）
    geolocate.on('geolocate', (e: { coords: GeolocationCoordinates }) => {
      setUserPos([e.coords.longitude, e.coords.latitude])
    })
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left')
    m.on('load', () => {
      addDataLayers(m)
      setReady(true)
      // 読み込み時に自動で現在地を取得・表示（許可済みなら即・未許可なら許可ダイアログ）
      try {
        geolocate.trigger()
      } catch {
        /* 自動取得に失敗してもボタンから手動取得できるので無視 */
      }
    })
    setMap(m)
    return () => {
      m.remove()
      setMap(null)
      setReady(false)
    }
  }, [])

  // スタイル変更を localStorage に保存
  useEffect(() => {
    try { localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(styles)) } catch { /* 無視 */ }
  }, [styles])

  // スタイル変更を地図へ反映
  useEffect(() => {
    if (!map || !ready) return
    for (const layer of LAYERS) applyLayerStyle(map, layer, styles[layer.key])
  }, [map, ready, styles])

  return (
    <>
      <header id="header">
        <h1>❄ 柏崎 冬道マップ</h1>
        <SearchBox map={map} />
        <span className="sub">MapLibre + 地理院</span>
      </header>

      <div id="map" ref={containerRef} />

      {ready && map && (
        <LayerPanel map={map} styles={styles} onOpenSettings={() => setSettingsOpen(true)} />
      )}
      {ready && map && <BasemapSwitcher map={map} />}
      {ready && map && <PinPanel map={map} userPos={userPos} />}
      {settingsOpen && (
        <SettingsPanel styles={styles} setStyles={setStyles} onClose={() => setSettingsOpen(false)} />
      )}

      <div id="credit">
        出典：柏崎市オープンデータ（CC-BY 4.0／令和6年12月時点）｜背景：地理院タイル／OpenStreetMap｜検索：地理院
      </div>
    </>
  )
}
