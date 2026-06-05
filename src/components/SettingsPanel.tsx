import { LAYERS, defaultLayerStyles } from '../config/layers'
import type { LayerStyle, LineDash } from '../types'

interface Props {
  styles: Record<string, LayerStyle>
  setStyles: React.Dispatch<React.SetStateAction<Record<string, LayerStyle>>>
  onClose: () => void
}

const DASH_OPTIONS: { value: LineDash; label: string }[] = [
  { value: 'solid', label: '実線' },
  { value: 'dashed', label: '破線' },
  { value: 'dotted', label: '点線' },
]

export default function SettingsPanel({ styles, setStyles, onClose }: Props) {
  const update = (key: string, patch: Partial<LayerStyle>) =>
    setStyles((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>⚙ 線のスタイル設定</h2>
          <button className="modal-x" onClick={onClose} aria-label="閉じる">×</button>
        </div>
        <div className="modal-body">
          {LAYERS.map((l) => {
            const s = styles[l.key]
            return (
              <div className="set-row" key={l.key}>
                <span className="set-name">
                  <span className="set-dot" style={{ background: s.color }} />
                  {l.name}
                </span>
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => update(l.key, { color: e.target.value })}
                  title="色"
                />
                <input
                  type="range" min={1} max={8} step={0.5}
                  value={s.width}
                  onChange={(e) => update(l.key, { width: Number(e.target.value) })}
                  title={`太さ ${s.width}`}
                />
                <select
                  value={s.dash}
                  onChange={(e) => update(l.key, { dash: e.target.value as LineDash })}
                  title="線種"
                >
                  {DASH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )
          })}
          <div className="set-actions">
            <button className="set-reset" onClick={() => setStyles(defaultLayerStyles())}>
              既定に戻す
            </button>
            <span className="muted">変更は自動保存されます</span>
          </div>
        </div>
      </div>
    </div>
  )
}
