import { useState } from 'react'
import maplibregl from 'maplibre-gl'
import { LAYERS } from '../config/layers'
import { setLayerVisibility } from '../map/dataLayers'

interface Props {
  map: maplibregl.Map
}

export default function LayerPanel({ map }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(LAYERS.map((l) => [l.key, l.defaultOn])),
  )

  const toggle = (key: string) => {
    const layer = LAYERS.find((l) => l.key === key)!
    const next = !visible[key]
    setLayerVisibility(map, layer, next)
    setVisible((v) => ({ ...v, [key]: next }))
  }

  return (
    <div id="layers" className="card">
      <h2>レイヤー</h2>
      <div>
        {LAYERS.map((l) => (
          <label key={l.key} className="row">
            <input type="checkbox" checked={visible[l.key]} onChange={() => toggle(l.key)} />
            <span className="swatch" style={{ borderTopColor: l.color }} />
            <span className="name">{l.name}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
