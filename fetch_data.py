#!/usr/bin/env python3
"""柏崎市オープンデータ（雪・冬道関連）を ArcGIS REST API から取得し、
静的 GeoJSON として data/ に保存する。

出典: 柏崎市オープンデータ (CC-BY 4.0)
https://open-data-kashiwazaki.opendata.arcgis.com/
"""
import json
import os
import urllib.parse
import urllib.request

BASE = "https://services1.arcgis.com/XlTFoh9FvQbdpw6d/arcgis/rest/services"
OUT_DIR = os.path.join(os.path.dirname(__file__), "public", "data")

# レイヤー定義: (出力ファイル名, 表示名, REST サービスパス)
LAYERS = [
    ("shosetsu_pipe",   "消雪パイプ",       "消雪パイプ"),
    ("josetsu",         "除雪路線",         "除雪路線"),
    ("josetsu_takayanagi", "除雪路線（高柳）", "除雪路線_高柳"),
    ("josetsu_nishiyama",  "除雪路線（西山）", "除雪路線_西山"),
    ("kinkyu",          "緊急確保路線",     "緊急確保路線"),
    ("hodo",            "歩道除雪",         "歩道除雪"),
]

PAGE = 2000  # ArcGIS の標準 maxRecordCount


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "kashiwazaki-winter-map/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def query_all(service):
    """exceededTransferLimit を見ながら全件ページング取得して FeatureCollection を返す。"""
    enc = urllib.parse.quote(service)
    base_q = f"{BASE}/{enc}/FeatureServer/0/query"
    features = []
    offset = 0
    while True:
        params = urllib.parse.urlencode({
            "where": "1=1",
            "outFields": "*",
            "outSR": "4326",
            "f": "geojson",
            "resultOffset": offset,
            "resultRecordCount": PAGE,
        })
        data = fetch_json(f"{base_q}?{params}")
        batch = data.get("features", [])
        features.extend(batch)
        exceeded = data.get("properties", {}).get("exceededTransferLimit")
        if not batch or (not exceeded and len(batch) < PAGE):
            break
        offset += len(batch)
    return {"type": "FeatureCollection", "features": features}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    meta = {
        "source": "柏崎市オープンデータ",
        "source_url": "https://open-data-kashiwazaki.opendata.arcgis.com/",
        "license": "CC-BY 4.0",
        "base_date": "令和6年12月時点（2024-12-13）",
        "layers": [],
    }
    for fname, label, service in LAYERS:
        print(f"取得中: {label} ...", end=" ", flush=True)
        fc = query_all(service)
        n = len(fc["features"])
        path = os.path.join(OUT_DIR, f"{fname}.geojson")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(fc, f, ensure_ascii=False)
        print(f"{n} 本 -> data/{fname}.geojson")
        meta["layers"].append({"file": fname, "label": label, "count": n})

    with open(os.path.join(OUT_DIR, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    print("完了: data/meta.json")


if __name__ == "__main__":
    main()
