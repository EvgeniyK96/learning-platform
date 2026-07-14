/* Навигация: меню авторизованного пользователя и мобильный бургер. */
import { esc, isAuthed } from "./api.js";
import { navAuth } from "./dom.js";
import { icon } from "./icons.js";

export function renderNav() {
  if (isAuthed()) {
    const name = localStorage.getItem("username") || "";
    const initial = (name[0] || "?").toUpperCase();
    navAuth.innerHTML = `
      <div class="user-menu" id="user-menu">
        <button type="button" class="user-btn" id="user-btn" aria-haspopup="true" aria-expanded="false" title="${esc(name)}">
          <span class="user-avatar" aria-hidden="true">${esc(initial)}</span>
          <span class="user-name">${esc(name)}</span>
          <span class="user-caret" aria-hidden="true">▾</span>
        </button>
        <div class="user-dropdown" id="user-dropdown" hidden>
          <a href="#/dashboard">${icon("user")} Личный кабинет</a>
          <a href="#/dashboard/courses">${icon("book")} Мои курсы</a>
          <a href="#/dashboard/certificates">${icon("trophy")} Сертификаты</a>
          <a href="#/dashboard/profile">${icon("settings")} Настройки профиля</a>
          <a href="#/logout" class="user-logout">${icon("log-out")} Выйти</a>
        </div>
      </div>`;
    const btn = document.getElementById("user-btn");
    const dd = document.getElementById("user-dropdown");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dd.hidden = !dd.hidden;
      btn.setAttribute("aria-expanded", String(!dd.hidden));
    });
    document.addEventListener("click", () => { dd.hidden = true; });
    dd.addEventListener("click", () => { dd.hidden = true; });
  } else {
    navAuth.innerHTML = `
      <a class="btn btn-outline btn-sm nav-btn" href="#/login">Войти</a>
      <a class="btn btn-primary btn-sm nav-btn" href="#/register">Регистрация</a>`;
  }
}

/* мобильное меню-бургер */
export function initBurger() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) navLinks.classList.remove("open");
  });
}
