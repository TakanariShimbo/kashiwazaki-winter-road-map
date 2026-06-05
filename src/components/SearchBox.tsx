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
  const [hasMarker, setHasMarker] = useState(false)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)

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
    setHasMarker(true)
    setQuery(s.title)
    setOpen(false)
  }

  const clear = () => {
    markerRef.current?.remove()
    markerRef.current = null
    setHasMarker(false)
    setQuery('')
    setItems([])
    setOpen(false)
  }

  return (
    <div className="search" ref={boxRef}>
      <svg className="search-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="text"
        value={query}
        placeholder="場所・住所で検索"
        autoComplete="off"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => items.length && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && items[0]) { e.preventDefault(); select(items[0]) }
          if (e.key === 'Escape') clear()
        }}
      />
      {(query || hasMarker) && (
        <button className="search-clear" onClick={clear} aria-label="検索をクリア" title="クリア">×</button>
      )}
      {open && items.length > 0 && (
        <div id="suggest">
          {items.map((s, i) => (
            <div key={i} onClick={() => select(s)}>
              {s.title} {s.outside && <small>（市外）</small>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
