#!/usr/bin/env python3
"""
notify_accidents.py
Простой монитор маячков ДТП с сайта и отправка новых в Telegram.

Настройка:
- Установите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID ниже или через переменные окружения.
- Запустите как демон или через cron.

Зависимости:
pip install requests beautifulsoup4 python-dateutil
"""

import os
import time
import json
import re
import requests
from bs4 import BeautifulSoup
from dateutil import parser as dateparser
from typing import List, Dict, Any

SITE_URL = "https://nikibelyy.github.io/Kimisars/"  # ваш сайт
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "PUT_YOUR_TOKEN_HERE")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "PUT_YOUR_CHAT_ID_HERE")
CHECK_INTERVAL = 60  # секунд между проверками (можно увеличить до 300 или 600)
SEEN_FILE = "seen.json"
USER_AGENT = "AccidentNotifier/1.0 (+https://example.com)"

session = requests.Session()
session.headers.update({"User-Agent": USER_AGENT, "Accept": "text/html,application/json"})

def load_seen() -> Dict[str, Any]:
    if os.path.exists(SEEN_FILE):
        try:
            return json.load(open(SEEN_FILE, "r", encoding="utf-8"))
        except Exception:
            return {}
    return {}

def save_seen(d: Dict[str, Any]):
    json.dump(d, open(SEEN_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

def send_telegram(text: str):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "HTML"}
    try:
        r = session.post(url, data=payload, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print("Ошибка отправки в Telegram:", e)

def try_fetch_json_from_page(soup: BeautifulSoup) -> Any:
    # Ищем <script type="application/json"> или ссылки на .json
    script_tags = soup.find_all("script")
    # 1) сначала искать теги с type application/json
    for s in script_tags:
        t = s.get("type","")
        if "application/json" in t and s.string:
            try:
                return json.loads(s.string)
            except Exception:
                pass
    # 2) искать в коде явный URL на .json
    html = str(soup)
    m = re.search(r"https?://[^\s'\"<>]+\.json", html)
    if m:
        url = m.group(0)
        try:
            r = session.get(url, timeout=15)
            r.raise_for_status()
            return r.json()
        except Exception:
            pass
    return None

def try_extract_points_from_js(soup: BeautifulSoup) -> List[Dict[str,Any]]:
    html = str(soup)
    # Ищем объекты/массивы похожие на GeoJSON: "features": [...]
    m = re.search(r'("features"\s*:\s*\[.*?\])', html, flags=re.S)
    if m:
        fragment = "{" + m.group(1) + "}"
        try:
            data = json.loads(fragment)
            features = data.get("features", [])
            return features
        except Exception:
            pass
    # Ищем массив похожих на [{lat:..., lng:..., ...}, ...]
    m2 = re.search(r'(\[{\s*["\']?lat["\']?\s*[:=].*?\}\])', html, flags=re.S)
    if m2:
        arr_text = m2.group(1)
        # Попробуем привести к корректному JSON: заменить одиночные кавычки и двоеточия
        try:
            arr_text_json = arr_text.replace("'", '"')
            # убрать trailing commas
            arr_text_json = re.sub(r",\s*}", "}", arr_text_json)
            arr_text_json = re.sub(r",\s*\]", "]", arr_text_json)
            data = json.loads(arr_text_json)
            return data
        except Exception:
            pass
    return []

def normalize_feature(feat: Dict[str,Any]) -> Dict[str,Any]:
    # Преобразуем структуру в унифицированный формат: id, lat, lon, time, text
    # Поддерживаем GeoJSON Feature или простые объекты
    out = {"id": None, "lat": None, "lon": None, "time": None, "text": None}
    if "geometry" in feat and feat.get("geometry"):
        geom = feat["geometry"]
        coords = geom.get("coordinates")  # [lon, lat]
        if isinstance(coords, list) and len(coords) >= 2:
            out["lon"], out["lat"] = coords[0], coords[1]
    # свойства
    props = feat.get("properties") or feat
    # попытки получить уникальный id
    for key in ("id", "uid", "ID", "uuid"):
        if key in feat:
            out["id"] = str(feat[key])
            break
    if not out["id"] and isinstance(props, dict):
        for key in ("id", "uid", "ID", "uuid"):
            if key in props:
                out["id"] = str(props[key]); break
    # время/описание
    if isinstance(props, dict):
        for tkey in ("time","timestamp","created_at","date","dt"):
            if tkey in props:
                try:
                    out["time"] = str(props[tkey])
                except:
                    pass
                break
        for dkey in ("description","desc","title","text","note","address"):
            if dkey in props:
                out["text"] = str(props[dkey]); break
    # если lat/lon ещё нет — искать прямые поля
    for latk in ("lat","latitude","y"):
        if not out["lat"] and latk in props:
            out["lat"] = float(props[latk])
    for lnk in ("lon","lng","longitude","x"):
        if not out["lon"] and lnk in props:
            out["lon"] = float(props[lnk])
    # если id всё ещё нет — собрать хэш из координат+описания
    if not out["id"]:
        out["id"] = f"{out.get('lat')}-{out.get('lon')}-{(out.get('text') or '')}"[:120]
    return out

def find_points_from_site(url: str) -> List[Dict[str,Any]]:
    try:
        r = session.get(url, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print("Ошибка загрузки страницы:", e)
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    # 1) пробуем явный JSON/GeoJSON
    parsed = try_fetch_json_from_page(soup)
    points = []
    if parsed:
        # если GeoJSON
        if isinstance(parsed, dict) and "features" in parsed:
            for f in parsed["features"]:
                points.append(normalize_feature(f))
            return points
        # если просто список
        if isinstance(parsed, list):
            for item in parsed:
                points.append(normalize_feature(item))
            return points
    # 2) пробуем извлечь из JS-кода
    features = try_extract_points_from_js(soup)
    if features:
        for f in features:
            points.append(normalize_feature(f))
    # 3) fallback: искать элемент DOM с координатами в data-* атрибутах
    # (реже, но может быть)
    for tag in soup.find_all(attrs=True):
        for (k, v) in tag.attrs.items():
            if isinstance(v, str) and ("lat" in k.lower() or "lng" in k.lower()):
                try:
                    lat = float(v) if "lat" in k.lower() else None
                    lon = float(v) if "lng" in k.lower() or "lon" in k.lower() else None
                    if lat and lon:
                        points.append({"id": f"{lat}-{lon}", "lat": lat, "lon": lon, "time": None, "text": tag.get_text(strip=True)})
                except:
                    pass
    return points

def format_message(p: Dict[str,Any]) -> str:
    lat = p.get("lat")
    lon = p.get("lon")
    text = p.get("text") or "ДТП"
    t = p.get("time")
    msg = f"🚨 <b>Новый маячок ДТП</b>\n{text}\n"
    if t:
        msg += f"🕒 {t}\n"
    if lat and lon:
        map_link = f"https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=18/{lat}/{lon}"
        msg += f"📍 <a href=\"{map_link}\">Открыть на карте</a>\n"
    return msg

def main_loop():
    seen = load_seen()
    while True:
        try:
            points = find_points_from_site(SITE_URL)
            # сортировка по времени/координатам необязательна
            new_count = 0
            for p in points:
                pid = p.get("id")
                if not pid:
                    continue
                if pid in seen:
                    continue
                # отправляем сообщение
                msg = format_message(p)
                print("Sending:", msg)
                send_telegram(msg)
                seen[pid] = {"sent_at": time.time(), "meta": p}
                new_count += 1
            if new_count:
                save_seen(seen)
            else:
                print(time.strftime("%Y-%m-%d %H:%M:%S"), "— новых маячков нет")
        except Exception as e:
            print("Ошибка основного цикла:", e)
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    if TELEGRAM_BOT_TOKEN.startswith("PUT_") or TELEGRAM_CHAT_ID.startswith("PUT_"):
        print("Пожалуйста, укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в переменных окружения или в скрипте.")
    else:
        main_loop()
