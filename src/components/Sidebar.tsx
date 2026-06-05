import maplibregl from 'maplibre-gl'
import SearchBox from './SearchBox'
import LayerPanel from './LayerPanel'
import BasemapSwitcher from './BasemapSwitcher'
import PinPanel from './PinPanel'
import type { LayerStyle, LngLat } from '../types'

interface Props {
  map: maplibregl.Map
  styles: Record<string, LayerStyle>
  userPos: LngLat | null
  open: boolean
  onToggle: () => void
  onOpenSettings: () => void
  onSetDestination: (coord: LngLat, label: string) => void
  externalDest: { coord: LngLat; label: string } | null
  onDestConsumed: () => void
  onCloseSidebar: () => void
}

export default function Sidebar({
  map, styles, userPos, open, onToggle, onOpenSettings,
  onSetDestination, externalDest, onDestConsumed, onCloseSidebar,
}: Props) {
  return (
    <>
      <button className={`sb-fab ${open ? 'hidden' : ''}`} onClick={onToggle} aria-label="メニューを開く">☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sb-brand">
          <img className="sb-logo-img" src={`${import.meta.env.BASE_URL}favicon-32x32.png`} alt="" />
          <div>
            <div className="sb-name">柏崎 冬道マップ</div>
            <div className="sb-sub">消雪・除雪・冬の道路</div>
          </div>
          <button className="icon-btn sb-collapse" onClick={onToggle} aria-label="閉じる">‹</button>
        </div>

        <SearchBox map={map} onSetDestination={onSetDestination} onCloseSidebar={onCloseSidebar} />
        <LayerPanel map={map} styles={styles} onOpenSettings={onOpenSettings} />
        <BasemapSwitcher map={map} />
        <PinPanel map={map} userPos={userPos} externalDest={externalDest} onDestConsumed={onDestConsumed} />

        <div className="sb-credit">
          出典：柏崎市オープンデータ（CC-BY 4.0／令和6年12月時点）<br />
          背景：地理院タイル／OpenStreetMap｜検索：地理院
        </div>
      </aside>
    </>
  )
}
