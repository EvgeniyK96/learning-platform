/* Аутентификация: вход, регистрация, выход (djoser + JWT). */
import { apiJson, tokens, toast } from "../api.js";
import { app } from "../dom.js";
import { renderNav } from "../nav.js";

function handleAuthSuccess(data) {
  tokens.set(data.access, data.refresh);
  localStorage.setItem("username", data.user?.username || "");
  renderNav();
  toast(data.created ? "Аккаунт создан через Telegram!" : "Добро пожаловать!");
  location.hash = "#/dashboard";
}

export function pageLogin() {
  app.innerHTML = `
    <div class="form">
      <form class="form-card" id="login-form">
        <h2>Вход</h2>
        <div class="field">
          <label for="lg-username">Логин</label>
          <input id="lg-username" autocomplete="username" required>
        </div>
        <div class="field">
          <label for="lg-password">Пароль</label>
          <input id="lg-password" type="password" autocomplete="current-password" required>
        </div>
        <p class="form-error" id="login-error" hidden></p>
        <button class="btn btn-primary" type="submit" style="width:100%">Войти</button>
        <p class="form-hint" style="margin-top:14px">Нет аккаунта? <a href="#/register">Зарегистрируйтесь</a></p>
      </form>
      <div class="divider" style="margin:20px 0">или</div>
      <div id="telegram-login-widget"></div>
    </div>`;
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("login-error");
    err.hidden = true;
    try {
      const data = await apiJson("/auth/jwt/create/", {
        method: "POST",
        body: JSON.stringify({
          username: document.getElementById("lg-username").value,
          password: document.getElementById("lg-password").value,
        }),
      });
      handleAuthSuccess(data);
    } catch (ex) {
      err.textContent = "Неверный логин или пароль.";
      err.hidden = false;
    }
  });
  renderTelegramLoginWidget();
}

export function pageRegister() {
  app.innerHTML = `
    <div class="form">
      <form class="form-card" id="reg-form">
        <h2>Регистрация</h2>
        <div class="field">
          <label for="rg-username">Логин</label>
          <input id="rg-username" autocomplete="username" required>
        </div>
        <div class="field">
          <label for="rg-email">Email</label>
          <input id="rg-email" type="email" autocomplete="email">
        </div>
        <div class="field">
          <label for="rg-first">Имя</label>
          <input id="rg-first" autocomplete="given-name">
        </div>
        <div class="field">
          <label for="rg-password">Пароль</label>
          <input id="rg-password" type="password" autocomplete="new-password" required minlength="8">
          <p class="form-hint">Минимум 8 символов, не только цифры.</p>
        </div>
        <p class="form-error" id="reg-error" hidden></p>
        <button class="btn btn-primary" type="submit" style="width:100%">Создать аккаунт</button>
        <p class="form-hint" style="margin-top:14px">Уже есть аккаунт? <a href="#/login">Войдите</a></p>
      </form>
      <div class="divider" style="margin:20px 0">или</div>
      <div id="telegram-login-widget"></div>
    </div>`;
  document.getElementById("reg-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("reg-error");
    err.hidden = true;
    const username = document.getElementById("rg-username").value;
    const password = document.getElementById("rg-password").value;
    try {
      await apiJson("/auth/users/", {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
          email: document.getElementById("rg-email").value,
          first_name: document.getElementById("rg-first").value,
        }),
      });
      const data = await apiJson("/auth/jwt/create/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      handleAuthSuccess(data);
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });
  renderTelegramLoginWidget();
}

export function pageLogout() {
  tokens.clear();
  localStorage.removeItem("username");
  renderNav();
  toast("Вы вышли из аккаунта.");
  location.hash = "#/";
}

export function pageTelegramLogin() {
  app.innerHTML = `
    <div class="form">
      <div class="form-card" style="text-align:center">
        <h2>Вход через Telegram</h2>
        <p class="form-hint" style="margin-bottom:20px">
          Введите номер телефона в формате +7XXXXXXXXXX
        </p>
        <form id="tg-phone-form">
          <div class="field" style="text-align:left">
            <label for="tg-phone">Номер телефона</label>
            <input id="tg-phone" type="tel" placeholder="+7XXXXXXXXXX" required
                   pattern="^\\+[1-9]\\d{1,14}$" autocomplete="tel">
          </div>
          <p class="form-error" id="tg-phone-error" hidden></p>
          <button class="btn btn-primary" type="submit" style="width:100%">Отправить код</button>
        </form>
        <p class="form-hint" style="margin-top:14px">
          <a href="#/login">← Вернуться к входу по паролю</a>
        </p>
      </div>
    </div>`;

  document.getElementById("tg-phone-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("tg-phone").value.trim();
    const err = document.getElementById("tg-phone-error");
    err.hidden = true;

    try {
      const res = await apiJson("/users/telegram/gateway/send-code/", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone }),
      });
      showTelegramCodeForm(phone, res.request_id);
    } catch (ex) {
      err.textContent = ex.message || "Ошибка отправки кода";
      err.hidden = false;
    }
  });
}

function showTelegramCodeForm(phone, requestId) {
  app.innerHTML = `
    <div class="form">
      <div class="form-card" style="text-align:center">
        <h2>Код отправлен в Telegram</h2>
        <p class="form-hint" style="margin-bottom:20px">
          Введите 5-значный код из уведомления в Telegram
        </p>
        <form id="tg-code-form">
          <div class="field" style="text-align:left">
            <label for="tg-code">Код подтверждения</label>
            <input id="tg-code" type="text" maxlength="5" pattern="\\d{5}" required
                   autocomplete="one-time-code" style="letter-spacing: 8px; text-align:center">
          </div>
          <p class="form-error" id="tg-code-error" hidden></p>
          <button class="btn btn-primary" type="submit" style="width:100%">Подтвердить</button>
        </form>
        <p class="form-hint" style="margin-top:14px">
          <button type="button" class="btn btn-link" id="tg-resend">Отправить код повторно</button>
        </p>
        <p class="form-hint" style="margin-top:8px">
          <a href="#/telegram-login">← Изменить номер</a>
        </p>
      </div>
    </div>`;

  let resendCooldown = 0;
  const resendBtn = document.getElementById("tg-resend");
  const startCooldown = () => {
    resendCooldown = 60;
    resendBtn.disabled = true;
    resendBtn.textContent = `Повторно через ${resendCooldown}с`;
    const timer = setInterval(() => {
      resendCooldown--;
      if (resendCooldown <= 0) {
        clearInterval(timer);
        resendBtn.disabled = false;
        resendBtn.textContent = "Отправить код повторно";
      } else {
        resendBtn.textContent = `Повторно через ${resendCooldown}с`;
      }
    }, 1000);
  };

  document.getElementById("tg-code-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const code = document.getElementById("tg-code").value.trim();
    const err = document.getElementById("tg-code-error");
    err.hidden = true;

    try {
      const data = await apiJson("/users/telegram/gateway/verify-code/", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone, request_id: requestId, code }),
      });
      handleAuthSuccess(data);
    } catch (ex) {
      err.textContent = ex.message || "Неверный или истёкший код";
      err.hidden = false;
    }
  });

  resendBtn.addEventListener("click", async () => {
    try {
      const res = await apiJson("/users/telegram/gateway/send-code/", {
        method: "POST",
        body: JSON.stringify({ phone_number: phone }),
      });
      requestId = res.request_id;
      startCooldown();
      toast("Код отправлен повторно");
    } catch (ex) {
      toast(ex.message || "Ошибка отправки");
    }
  });

  startCooldown();
}

function renderTelegramLoginWidget() {
  const botUsername = window.TELEGRAM_BOT_USERNAME || "";
  if (!botUsername) return;

  const container = document.getElementById("telegram-login-widget");
  if (!container) return;

  container.innerHTML = `
    <div class="form-hint" style="margin-bottom:12px; display:block; text-align:center">
      Войти через Telegram:
    </div>
    <script async src="https://telegram.org/js/telegram-widget.js?22"
      data-telegram-login="${botUsername}"
      data-size="large"
      data-auth-url="${window.location.origin}/api/users/telegram/widget/auth/"
      data-request-access="write"
      data-onauth="onTelegramAuth"
      style="display:block; margin:0 auto"></script>`;

  window.onTelegramAuth = (user) => {
    apiJson("/users/telegram/widget/auth/", {
      method: "POST",
      body: JSON.stringify(user),
    })
      .then(handleAuthSuccess)
      .catch((ex) => toast(ex.message || "Ошибка авторизации через Telegram"));
  };
}
