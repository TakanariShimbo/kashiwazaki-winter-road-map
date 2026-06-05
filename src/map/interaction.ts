/**
 * 目的地ピン設置モード中は、フィーチャのポップアップを抑制するための共有フラグ。
 * PinPanel が true/false を設定し、dataLayers のクリックハンドラが参照する。
 */
export const pinMode = { active: false }

/** 2点間の直線距離（メートル, ハバーサイン） */
export function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
