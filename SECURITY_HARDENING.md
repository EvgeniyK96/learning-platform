# Безопасная настройка сервера (чеклист пересоздания)

Этот чеклист закрывает причину, по которой предыдущий сервер был взломан:
**вход по SSH был разрешён по паролю, и пароль подобрали брутфорсом**
(28 000+ попыток). Главное правило нового сервера — **никаких паролей на SSH,
только ключи.**

Выполняется один раз при создании нового VDS, до деплоя проектов.

## 0. Подготовка на своём компьютере

Если SSH-ключа ещё нет — создайте:

```bash
ssh-keygen -t ed25519 -C "you@example.com"
# приватный ключ ~/.ssh/id_ed25519 НИКОМУ не передавайте
# публичный ~/.ssh/id_ed25519.pub — его кладём на сервер
cat ~/.ssh/id_ed25519.pub    # это понадобится ниже
```

## 1. Первый вход и пользователь

```bash
ssh root@<NEW_IP>
apt update && apt upgrade -y
apt install -y git curl nano ufw fail2ban

adduser deploy
usermod -aG sudo deploy
```

## 2. SSH-ключ пользователю deploy

```bash
mkdir -p /home/deploy/.ssh
# вставьте СОДЕРЖИМОЕ вашего id_ed25519.pub:
echo "ssh-ed25519 AAAA...ваш-ключ... you@example.com" > /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

**Проверьте с ДРУГОГО терминала**, что вход по ключу работает, не закрывая
текущую сессию:

```bash
ssh deploy@<NEW_IP>    # должно пустить без пароля
```

## 3. Отключить парольный вход и root по SSH  ← ключевой шаг

Только после того как убедились, что ключ работает:

```bash
sudo nano /etc/ssh/sshd_config
```

Установить (найти и раскомментировать/поправить эти строки):

```
PasswordAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart ssh
```

После этого брутфорс становится невозможным в принципе — пароли не принимаются.

## 4. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status          # открыты только 22, 80, 443
```

## 5. fail2ban

Уже установлен и защищает SSH из коробки. Проверка:

```bash
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd
```

## 6. Сильные секреты (никаких 123 и example-ключей)

Сгенерировать и вставить в `.env` каждого проекта:

```bash
# Django SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# пароль PostgreSQL
python3 -c "import secrets; print(secrets.token_urlsafe(24))"

# пароль Redis (если используется ботом/сайтом)
python3 -c "import secrets; print(secrets.token_urlsafe(24))"
```

Требования:
- `.env` **никогда** не коммитить в git (проверьте, что он в `.gitignore`);
- у каждого проекта свой пароль БД;
- старые значения (`SECRET_KEY`, `POSTGRES_PASSWORD=123`) считать
  скомпрометированными — не переиспользовать.

## 7. Внутренние сервисы — только на localhost

Redis и PostgreSQL не должны слушать `0.0.0.0`. Проверка после запуска:

```bash
sudo ss -tlnp
```

Наружу (`0.0.0.0` / `[::]`) допустимы только `22`, `80`, `443`.
Всё остальное (`5432`, `6379`, порты ботов) — только `127.0.0.1`.

Для Redis дополнительно задать пароль в `/etc/redis/redis.conf`:

```
bind 127.0.0.1 -::1
requirepass <сгенерированный-пароль>
```

## 8. Несколько проектов на одном сервере

Бот и сайт могут жить рядом с learning-platform, если:
- секреты у каждого в своём `.env`, не в git;
- токен Telegram-бота не светился в публичном репозитории
  (если светился — отозвать у @BotFather и получить новый);
- их сервисы (БД, Redis) слушают только localhost (см. п. 7).

Проверить, не утекли ли секреты в git проектов:

```bash
grep -rIl -E "TOKEN|PASSWORD|SECRET|api_key" /var/www/*/  2>/dev/null
```

## 9. Автообновления безопасности (опционально, желательно)

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## 10. Периодический контроль

```bash
docker stats --no-stream           # нагрузка контейнеров
ps aux --sort=-pcpu | head          # нет ли процессов из /tmp, /var/tmp
sudo ss -tlnp                       # не открылось ли лишних портов
sudo fail2ban-client status sshd    # сколько банов
```

Признак заражения: процесс с высоким CPU, запущенный из `/tmp`, `/var/tmp`,
`/dev/shm` или `$HOME` со скрытым именем (точка в начале).
