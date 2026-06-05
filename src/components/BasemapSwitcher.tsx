import { useState } from 'react'
import maplibregl from 'maplibre-gl'
import { BASEMAPS, DEFAULT_BASEMAP } from '../config/basemaps'

interface Props {
  map: maplibregl.Map
}

export default function BasemapSwitcher({ map }: Props) {
  const [active, setActive] = useState(DEFAULT_BASEMAP)

  const select = (key: string) => {
    for (const b of BASEMAPS) {
      map.setLayoutProperty(`base_${b.key}`, 'visibility', b.key === key ? 'visible' : 'none')
    }
    setActive(key)
  }

  return (
    <div id="basemaps" className="card">
      <h2>背景地図（タイル）</h2>
      <div className="seg">
        {BASEMAPS.map((b) => (
          <button key={b.key} className={b.key === active ? 'active' : ''} onClick={() => select(b.key)}>
            {b.name}
          </button>
        ))}
      </div>
    </div>
  )
}
