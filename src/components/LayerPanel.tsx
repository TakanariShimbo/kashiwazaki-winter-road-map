import { useState } from 'react'
import maplibregl from 'maplibre-gl'
import { LAYERS } from '../config/layers'
import { setLayerVisibility } from '../map/dataLayers'
import type { LayerStyle, LineDash } from '../types'

interface Props {
  map: maplibregl.Map
  styles: Record<string, LayerStyle>
  onOpenSettings: () => void
}

const borderStyleOf = (dash: LineDash) => (dash === 'solid' ? 'solid' : dash)

export default function LayerPanel({ map, styles, onOpenSettings }: Props) {
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
    <section className="sb-section">
      <div className="sb-head">
        <h2 className="sb-title">レイヤー</h2>
        <button className="icon-btn" onClick={onOpenSettings} title="線のスタイル設定">⚙</button>
      </div>
      <div className="layer-list">
        {LAYERS.map((l) => {
          const s = styles[l.key]
          return (
            <label key={l.key} className="row">
              <input type="checkbox" checked={visible[l.key]} onChange={() => toggle(l.key)} />
              <span
                className="swatch"
                style={{
                  borderTopColor: s.color,
                  borderTopStyle: borderStyleOf(s.dash),
                  borderTopWidth: `${Math.max(3, s.width)}px`,
                }}
              />
              <span className="name">{l.name}</span>
            </label>
          )
        })}
      </div>
    </section>
  )
}
