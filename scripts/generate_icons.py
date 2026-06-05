#!/usr/bin/env python3
"""アプリアイコン（雪の結晶）を生成して public/ に保存する。
青のグラデ背景＋白い6方向スノーフレーク。PWA 用に複数サイズを出力。
"""
import math
import os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), "..", "public")
SS = 4  # スーパーサンプリング倍率（アンチエイリアス用）


def gradient_bg(size):
    """上(#2b6cff)→下(#0a3d8f) の縦グラデーション背景"""
    top = (43, 108, 255)
    bottom = (10, 61, 143)
    img = Image.new("RGB", (size, size))
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = c
    return img


def draw_snowflake(draw, size):
    cx = cy = size / 2
    R = size * 0.34
    w = max(2, int(size * 0.035))
    white = (255, 255, 255, 255)
    for k in range(6):
        a = math.radians(60 * k)
        ex, ey = cx + R * math.cos(a), cy + R * math.sin(a)
        draw.line([cx, cy, ex, ey], fill=white, width=w)
        for frac in (0.5, 0.75):
            bx, by = cx + R * frac * math.cos(a), cy + R * frac * math.sin(a)
            bl = R * 0.26
            for s in (-1, 1):
                a2 = a + s * math.radians(52)
                draw.line([bx, by, bx + bl * math.cos(a2), by + bl * math.sin(a2)], fill=white, width=w)
    # 中心の小円
    r = size * 0.045
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=white)


def make(size, rounded=True):
    big = size * SS
    base = gradient_bg(big).convert("RGBA")
    overlay = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw_snowflake(ImageDraw.Draw(overlay), big)
    img = Image.alpha_composite(base, overlay)
    if rounded:
        radius = int(big * 0.22)
        mask = Image.new("L", (big, big), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, big, big], radius=radius, fill=255)
        img.putalpha(mask)
    return img.resize((size, size), Image.LANCZOS)


def save(img, name):
    img.save(os.path.join(OUT, name))
    print("wrote", name)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    save(make(192, rounded=True), "pwa-192x192.png")
    save(make(512, rounded=True), "pwa-512x512.png")
    # maskable / iOS は全面背景（OS 側でマスクされる）
    save(make(512, rounded=False), "pwa-maskable-512x512.png")
    save(make(180, rounded=False), "apple-touch-icon.png")
    save(make(32,  rounded=True),  "favicon-32x32.png")
