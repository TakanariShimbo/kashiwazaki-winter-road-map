# 柏崎 冬道マップ ❄

柏崎市のオープンデータ（消雪パイプ・除雪路線・緊急確保路線・歩道除雪）を地図に表示する冬道マップ。

**公開URL**: https://takanarishimbo.github.io/kashiwazaki-winter-road-map/

## 技術構成

- **MapLibre GL JS** … ベクトル地図エンジン（OSS）
- **React + TypeScript + Vite** … アプリ本体
- **地理院タイル / OpenStreetMap** … 背景地図（淡色・標準・航空写真・白地図・OSM 切替）
- **地理院 AddressSearch** … 場所・住所検索（柏崎中心で近い順）
- データ … 静的 GeoJSON（`public/data/`、ビルド時に同梱）

機能：タイル5種切替／場所検索／現在地（GPS）／回転・傾き（3D）／レイヤー切替／クリックで出典付きポップアップ。

## 開発

```bash
npm install
npm run dev      # 開発サーバ
npm run build    # 型チェック + 本番ビルド（dist/）
npm run preview  # 本番ビルドのプレビュー
```

## デプロイ

`main` への push で GitHub Actions が自動ビルドし、GitHub Pages へ公開します（`.github/workflows/deploy.yml`）。

## データの更新

```bash
python3 fetch_data.py   # ArcGIS REST API から最新を public/data/ に再取得
```

| ファイル | レイヤー | 件数 |
| --- | --- | --- |
| `shosetsu_pipe.geojson` | 消雪パイプ | 265 |
| `josetsu.geojson` + `_takayanagi` + `_nishiyama` | 除雪路線（統合） | 2,187 |
| `kinkyu.geojson` | 緊急確保路線 | 138 |
| `hodo.geojson` | 歩道除雪 | 309 |

## プロジェクト構成

```
src/
  App.tsx                 地図初期化・全体レイアウト
  components/             SearchBox / LayerPanel / BasemapSwitcher
  config/                 basemaps.ts / layers.ts（レイヤー・色・タイル定義）
  map/                    buildStyle.ts / dataLayers.ts（MapLibre 操作）
public/data/              冬道 GeoJSON
legacy/                   旧プロトタイプ（Leaflet版・素のMapLibre版）参照用
fetch_data.py             オープンデータ取得スクリプト
```

## 出典・ライセンス

- データ出典：**柏崎市オープンデータ**（道路維持課）／**CC-BY 4.0**／基準日 令和6年12月時点
- ポータル：https://open-data-kashiwazaki.opendata.arcgis.com/

> ⚠️ この地図は除雪・消雪の路線情報です。実際の路面状況や通行可否を保証するものではありません。
