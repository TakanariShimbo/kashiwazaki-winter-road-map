import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { buildStyle } from './map/buildStyle'
import { addDataLayers, applyLayerStyle } from './map/dataLayers'
import { KASHIWAZAKI, LAYERS, defaultLayerStyles } from './config/layers'
import Sidebar from './components/Sidebar'
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
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 820)

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
    geolocate.on('geolocate', (e: { coords: GeolocationCoordinates }) => {
      setUserPos([e.coords.longitude, e.coords.latitude])
    })
    m.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')
    m.on('load', () => {
      addDataLayers(m)
      setReady(true)
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
      <div id="map" ref={containerRef} />

      {ready && map && (
        <Sidebar
          map={map}
          styles={styles}
          userPos={userPos}
          open={sidebarOpen}
          onToggle={() => setSidebarOpen((o) => !o)}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}
      {settingsOpen && (
        <SettingsPanel styles={styles} setStyles={setStyles} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  )
}
