"""Версия статики для сброса кэша браузера: меняется при изменении файлов."""

import json
from pathlib import Path

from django.conf import settings


def static_version(request):
    static_dir = Path(settings.BASE_DIR) / "static"
    try:
        js_files = [p for p in (static_dir / "js").rglob("*.js") if p.is_file()]
        version = int(max(p.stat().st_mtime for p in static_dir.rglob("*") if p.is_file()))
    except (ValueError, OSError):
        js_files = []
        version = 0

    # Import map версионирует URL каждого JS-модуля, чтобы браузер не отдавал
    # из кэша устаревшие вложенные импорты (main.js тянет router.js -> auth.js …).
    imports = {}
    for p in js_files:
        url = f"{settings.STATIC_URL}js/{p.relative_to(static_dir / 'js').as_posix()}"
        imports[url] = f"{url}?v={version}"

    return {
        "static_version": version,
        "static_importmap": json.dumps({"imports": imports}),
        "telegram_bot_username": getattr(settings, "TELEGRAM_BOT_USERNAME", ""),
    }
