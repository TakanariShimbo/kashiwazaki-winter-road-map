import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { buildStyle } from './map/buildStyle'
import { addDataLayers } from './map/dataLayers'
import { KASHIWAZAKI } from './config/layers'
import SearchBox from './components/SearchBox'
import LayerPanel from './components/LayerPanel'
import BasemapSwitcher from './components/BasemapSwitcher'

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<maplibregl.Map | null>(null)
  const [ready, setReady] = useState(false)

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

  return (
    <>
      <header id="header">
        <h1>❄ 柏崎 冬道マップ</h1>
        <SearchBox map={map} />
        <span className="sub">MapLibre + 地理院</span>
      </header>

      <div id="map" ref={containerRef} />

      {ready && map && <LayerPanel map={map} />}
      {ready && map && <BasemapSwitcher map={map} />}

      <div id="credit">
        出典：柏崎市オープンデータ（CC-BY 4.0／令和6年12月時点）｜背景：地理院タイル／OpenStreetMap｜検索：地理院
      </div>
    </>
  )
}
