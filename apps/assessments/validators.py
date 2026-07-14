"""Валидация загружаемых файлов домашних заданий."""

from pathlib import Path

from django.core.exceptions import ValidationError

# Разрешённые расширения (без исполняемых/веб-форматов)
ALLOWED_EXTENSIONS = {
    ".pdf", ".txt", ".md", ".rtf", ".doc", ".docx", ".odt",
    ".zip", ".tar", ".gz", ".7z",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp",
    ".py", ".ipynb", ".java", ".c", ".cpp", ".h", ".hpp",
    ".js", ".ts", ".html", ".css", ".json", ".xml", ".yaml", ".yml",
    ".sql", ".go", ".rs", ".kt", ".rb", ".cs",
    ".csv", ".log",
}
# Примечание: серверно-исполняемые форматы (.php, .sh, .cgi, .jsp, .asp…)
# намеренно исключены. Веб-файлы (.html/.js/.css) разрешены для курса
# JavaScript и безопасны, так как отдаются только как вложение (attachment)
# владельцу или преподавателю — inline-исполнение в браузере невозможно.

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ


def validate_homework_file(file):
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_EXTENSIONS))
        raise ValidationError(
            f"Недопустимый тип файла «{ext or file.name}». "
            f"Разрешены: {allowed}."
        )
    if file.size > MAX_FILE_SIZE:
        raise ValidationError(
            f"Файл слишком большой ({file.size // 1024 // 1024} МБ). "
            f"Максимум — {MAX_FILE_SIZE // 1024 // 1024} МБ."
        )
