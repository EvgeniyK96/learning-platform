# Деплой без Docker (домен codeway.kiri.kz)

Инструкция для VPS на **Ubuntu 22.04/24.04** без Docker: приложение запускается
через **gunicorn под systemd**, статику и HTTPS обслуживает **nginx**.
Домен `codeway.kiri.kz` уже указывает на этот сервер (A-запись создана у kiri.kz).

Стек: **Python 3.12 + Django/gunicorn + nginx + Let's Encrypt**.
База по умолчанию — **SQLite** (ноль настройки). Как перейти на PostgreSQL — см. шаг 9.

В командах ниже используется пользователь `deploy` и каталог
`/home/deploy/learning-platform`. Подставь свои, если отличаются.

---

## 1. Первичная настройка сервера

Подключись под root и обнови систему:

```bash
ssh root@<IP>
apt update && apt upgrade -y
apt install -y git curl nano python3-venv python3-pip nginx
```

Создай непривилегированного пользователя и включи firewall:

```bash
adduser deploy
usermod -aG sudo deploy

mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh

ufw allow OpenSSH
ufw allow 'Nginx Full'      # открывает порты 80 и 443
ufw enable
```

Дальше работаем под `deploy`:

```bash
su - deploy
```

---

## 2. Код и виртуальное окружение

```bash
git clone https://github.com/EvgeniyK96/learning-platform.git
cd learning-platform

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

> В `requirements.txt` есть `gunicorn` — отдельно ставить не нужно.

---

## 3. Настройка `.env`

```bash
nano .env
```

Минимальное содержимое для прода на этом домене:

```ini
# сгенерируй: python3 -c "import secrets; print(secrets.token_urlsafe(50))"
SECRET_KEY=<длинная случайная строка>

DEBUG=False

# домен (можно добавить IP через запятую)
ALLOWED_HOSTS=codeway.kiri.kz

LANGUAGE_CODE=ru
TIME_ZONE=Asia/Almaty

# --- HTTPS (включаем сразу, сертификат получим на шаге 7) ---
CSRF_TRUSTED_ORIGINS=https://codeway.kiri.kz
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=True
SECURE_HSTS_SECONDS=31536000
```

> Если сначала хочешь проверить сайт по HTTP (до сертификата) — временно поставь
> `DEBUG=False` + `SECURE_COOKIES=False` и **не включай** `SECURE_SSL_REDIRECT`.
> После получения сертификата (шаг 7) верни значения как выше.

---

## 4. Миграции, статика, данные

```bash
source venv/bin/activate            # если ещё не активно
python manage.py migrate
python manage.py collectstatic --noinput

# наполнить базу курсами (5 больших + 4 мини-курса)
python manage.py import_courses

python manage.py createsuperuser
```

Быстрая проверка, что приложение стартует:

```bash
gunicorn core.wsgi:application --bind 127.0.0.1:8000
# Ctrl+C после проверки, что нет ошибок
```

---

## 5. gunicorn под systemd

Через unix-сокет — nginx будет обращаться к нему напрямую, порт наружу не открывается.

Создай сервис (под root или через `sudo`):

```bash
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=gunicorn daemon for learning-platform
After=network.target

[Service]
User=deploy
Group=www-data
WorkingDirectory=/home/deploy/learning-platform
RuntimeDirectory=gunicorn
ExecStart=/home/deploy/learning-platform/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/run/gunicorn/codeway.sock \
          core.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Запусти и включи автозагрузку:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now gunicorn
sudo systemctl status gunicorn        # должно быть active (running)
```

Логи, если что-то не так:

```bash
sudo journalctl -u gunicorn -f
```

---

## 6. nginx

nginx должен читать статику и медиа из домашнего каталога — дай ему право входа
в директорию пользователя:

```bash
sudo chmod o+x /home/deploy
```

Создай конфиг сайта:

```bash
sudo nano /etc/nginx/sites-available/codeway
```

```nginx
server {
    listen 80;
    server_name codeway.kiri.kz;

    # лимит соответствует DATA_UPLOAD_MAX_MEMORY_SIZE (12 МБ) с запасом
    client_max_body_size 15m;

    location /static/ {
        alias /home/deploy/learning-platform/staticfiles/;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /media/ {
        alias /home/deploy/learning-platform/media/;
        expires 7d;
    }

    location / {
        proxy_pass http://unix:/run/gunicorn/codeway.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

Активируй и перезапусти:

```bash
sudo ln -s /etc/nginx/sites-available/codeway /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default   # убрать дефолтную заглушку
sudo nginx -t                                 # проверка синтаксиса
sudo systemctl reload nginx
```

Теперь `http://codeway.kiri.kz/` должен открываться.

---

## 7. HTTPS (Let's Encrypt)

certbot сам пропишет сертификат в конфиг nginx и настроит редирект на HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d codeway.kiri.kz
```

На вопрос про редирект выбери **2 (Redirect)**. Автопродление certbot ставит сам
(systemd-таймер `certbot.timer`), проверить можно так:

```bash
sudo certbot renew --dry-run
```

После этого убедись, что в `.env` активны строки HTTPS из шага 3
(`SECURE_SSL_REDIRECT`, `SECURE_PROXY_SSL_HEADER`, `CSRF_TRUSTED_ORIGINS`) и
**нет** `SECURE_COOKIES=False`, затем перезапусти приложение:

```bash
sudo systemctl restart gunicorn
```

---

## 8. Проверка

- `https://codeway.kiri.kz/` — фронтенд;
- `https://codeway.kiri.kz/api/courses/` — список курсов (JSON);
- `https://codeway.kiri.kz/admin/` — админка;
- `https://codeway.kiri.kz/swagger/` — документация API.

---

## 9. PostgreSQL вместо SQLite (опционально)

SQLite подходит для небольшой нагрузки. Для более серьёзного прода:

```bash
sudo apt install -y postgresql
sudo -u postgres psql <<'SQL'
CREATE DATABASE django_db;
CREATE USER django_user WITH PASSWORD 'надёжный_пароль';
GRANT ALL PRIVILEGES ON DATABASE django_db TO django_user;
ALTER DATABASE django_db OWNER TO django_user;
SQL
```

Добавь в `.env`:

```ini
DATABASE_URL=postgres://django_user:надёжный_пароль@localhost:5432/django_db
```

Затем прогони миграции и данные заново на новой базе:

```bash
source venv/bin/activate
python manage.py migrate
python manage.py import_courses
python manage.py createsuperuser
sudo systemctl restart gunicorn
```

---

## 10. Эксплуатация

**Обновление приложения:**

```bash
cd ~/learning-platform
git pull
source venv/bin/activate
pip install -r requirements.txt          # если менялись зависимости
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
```

**Бэкап базы:**

- SQLite: `cp db.sqlite3 backup_$(date +%F).sqlite3`
- PostgreSQL: `pg_dump -U django_user django_db | gzip > backup_$(date +%F).sql.gz`

**Что где лежит:**

- код и venv — `/home/deploy/learning-platform`;
- база — файл `db.sqlite3` (SQLite) или кластер PostgreSQL;
- загруженные файлы (аватарки, домашки) — `media/`;
- собранная статика — `staticfiles/` (пересобирается `collectstatic`).

**Ресурсы:** 3 воркера gunicorn + nginx занимают ~300–400 МБ RAM. Для 2 vCPU
разумный максимум воркеров — 5 (правь `--workers` в `gunicorn.service`,
после чего `sudo systemctl daemon-reload && sudo systemctl restart gunicorn`).
```
