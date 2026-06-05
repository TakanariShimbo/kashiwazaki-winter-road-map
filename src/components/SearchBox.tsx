import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { KASHIWAZAKI } from '../config/layers'

interface Props {
  map: maplibregl.Map | null
}

interface Suggestion {
  title: string
  coord: [number, number]
  outside: boolean
}

/** 地理院 AddressSearch のレスポンス型（必要部分のみ） */
interface GsiFeature {
  geometry: { coordinates: [number, number] }
  properties: { title: string }
}

const sqDist = (a: [number, number], b: [number, number]) => {
  const dx = a[0] - b[0]
  const dy = a[1] - b[1]
  return dx * dx + dy * dy
}

export default function SearchBox({ map }: Props) {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

  // 入力をデバウンスして地理院検索
  useEffect(() => {
    window.clearTimeout(timer.current)
    if (!query.trim()) { setItems([]); setOpen(false); return }
    timer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(
          'https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + encodeURIComponent(query),
        )
        const raw: GsiFeature[] = await res.json()
        const sugg = raw
          .map((f): Suggestion => ({
            title: f.properties.title,
            coord: f.geometry.coordinates,
            outside: sqDist(f.geometry.coordinates, KASHIWAZAKI) >= 0.04,
          }))
          .sort((a, b) => sqDist(a.coord, KASHIWAZAKI) - sqDist(b.coord, KASHIWAZAKI))
          .slice(0, 6)
        setItems(sugg)
        setOpen(true)
      } catch (err) {
        console.error('検索失敗', err)
      }
    }, 300)
    return () => window.clearTimeout(timer.current)
  }, [query])

  // 枠外クリックで候補を閉じる
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const select = (s: Suggestion) => {
    if (!map) return
    map.flyTo({ center: s.coord, zoom: 16, duration: 1200 })
    markerRef.current?.remove()
    markerRef.current = new maplibregl.Marker({ color: '#e8341c' }).setLngLat(s.coord).addTo(map)
    setQuery(s.title)
    setOpen(false)
  }

  return (
    <div id="search" ref={boxRef}>
      <input
        type="text"
        value={query}
        placeholder="場所・住所で検索（例：東本町、柏崎市役所）"
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && items[0]) { e.preventDefault(); select(items[0]) }
        }}
      />
      {open && items.length > 0 && (
        <div id="suggest">
          {items.map((s, i) => (
            <div key={i} onClick={() => select(s)}>
              {s.title} {s.outside && <small>（柏崎市外）</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
