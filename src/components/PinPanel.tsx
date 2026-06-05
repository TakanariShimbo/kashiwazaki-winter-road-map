import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { pinMode, haversine } from '../map/interaction'
import type { LngLat } from '../types'

interface Props {
  map: maplibregl.Map
  /** 現在地（GPS）。直線距離の算出に使用 */
  userPos: LngLat | null
}

const PIN_COLOR = '#d81b60'

/** 地理院リバースジオコーダで町名を取得（ベストエフォート） */
async function reverseGeocode(p: LngLat): Promise<string | null> {
  try {
    const res = await fetch(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${p[1]}&lon=${p[0]}`,
    )
    const data = await res.json()
    return data?.results?.lv01Nm ?? null
  } catch {
    return null
  }
}

const fmtDist = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`)

export default function PinPanel({ map, userPos }: Props) {
  const [active, setActive] = useState(false)
  const [pin, setPin] = useState<LngLat | null>(null)
  const [addr, setAddr] = useState<string | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)

  // 設置モードのON/OFFを共有フラグ＆カーソルに反映
  useEffect(() => {
    pinMode.active = active
    map.getCanvas().style.cursor = active ? 'crosshair' : ''
    return () => { pinMode.active = false; map.getCanvas().style.cursor = '' }
  }, [active, map])

  // ピンを置く（ドラッグで微調整可）。町名も取得。
  const placePin = (p: LngLat) => {
    setPin(p)
    setAddr(null)
    if (!markerRef.current) {
      const mk = new maplibregl.Marker({ color: PIN_COLOR, draggable: true }).setLngLat(p).addTo(map)
      mk.on('dragend', () => {
        const ll = mk.getLngLat()
        const np: LngLat = [ll.lng, ll.lat]
        setPin(np)
        reverseGeocode(np).then(setAddr)
      })
      markerRef.current = mk
    } else {
      markerRef.current.setLngLat(p)
    }
    reverseGeocode(p).then(setAddr)
  }

  // 設置モード中のマップクリックでピンを置く／動かす
  useEffect(() => {
    if (!active) return
    const onClick = (e: maplibregl.MapMouseEvent) => placePin([e.lngLat.lng, e.lngLat.lat])
    map.on('click', onClick)
    return () => { map.off('click', onClick) }
  }, [active, map])

  const clearPin = () => {
    markerRef.current?.remove()
    markerRef.current = null
    setPin(null)
    setAddr(null)
  }

  const dist = pin && userPos ? haversine(userPos, pin) : null

  return (
    <section className="sb-section">
      <h2 className="sb-title">目的地ピン</h2>
      <button
        className={`pin-toggle ${active ? 'on' : ''}`}
        onClick={() => setActive((a) => !a)}
      >
        📍 {active ? '地図をタップして設置' : '目的地を置く'}
      </button>

      {(active || pin) && (
        <div className="pin-body">
          {!pin && <div className="pin-hint">地図をタップして目的地を置いてください</div>}
          {pin && (
            <>
              <div className="pin-addr">📍 {addr ?? `${pin[1].toFixed(5)}, ${pin[0].toFixed(5)}`}</div>
              <div className="pin-dist">
                {dist != null
                  ? <>現在地から直線 <b>{fmtDist(dist)}</b></>
                  : <span className="muted">現在地を取得すると距離を表示します</span>}
              </div>
              <button className="pin-clear" onClick={clearPin}>クリア</button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
