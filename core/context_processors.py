"""Версия статики для сброса кэша браузера: меняется при изменении файлов."""

from pathlib import Path

from django.conf import settings


def static_version(request):
    static_dir = Path(settings.BASE_DIR) / "static"
    try:
        version = int(max(p.stat().st_mtime for p in static_dir.iterdir() if p.is_file()))
    except (ValueError, OSError):
        version = 0
    return {"static_version": version}
