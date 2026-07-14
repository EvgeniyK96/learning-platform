/* Аутентификация: вход, регистрация, выход (djoser + JWT). */
import { apiJson, tokens, toast } from "../api.js";
import { app } from "../dom.js";
import { renderNav } from "../nav.js";

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
      tokens.set(data.access, data.refresh);
      localStorage.setItem("username", document.getElementById("lg-username").value);
      renderNav();
      toast("Добро пожаловать!");
      location.hash = "#/dashboard";
    } catch (ex) {
      err.textContent = "Неверный логин или пароль.";
      err.hidden = false;
    }
  });
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
      tokens.set(data.access, data.refresh);
      localStorage.setItem("username", username);
      renderNav();
      toast("Аккаунт создан. Добро пожаловать!");
      location.hash = "#/courses";
    } catch (ex) {
      err.textContent = ex.message;
      err.hidden = false;
    }
  });
}

export function pageLogout() {
  tokens.clear();
  localStorage.removeItem("username");
  renderNav();
  toast("Вы вышли из аккаунта.");
  location.hash = "#/";
}
