/* Личный кабинет: обзор, курсы, сертификаты, тесты, ДЗ, профиль. */
import { apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { DASH_TABS } from "../data.js";
import { courseCard } from "../components.js";
import { icon } from "../icons.js";

export async function pageDashboard(tab) {
  if (!requireAuth()) return;
  // преподаватель не обучается как ученик — уводим в его кабинет
  if (localStorage.getItem("is_teacher")) {
    location.hash = "#/teach";
    return;
  }
  tab = tab || "overview";
  const [d, certs, attempts, submissions] = await Promise.all([
    apiJson("/users/dashboard/"),
    apiJson("/certificates/"),
    apiJson("/assessments/attempts/"),
    apiJson("/assessments/submissions/"),
  ]);
  const u = d.user;

  const statusBadge = (s) => `<span class="badge ${{ accepted: "badge-success", submitted: "badge-pending", rejected: "badge-danger" }[s.status]
    }">${esc(s.status_display)}</span>`;

  const sections = {
    overview: () => `
      <h2 class="dash-title">Обзор</h2>
      <div class="dashboard-stats">
        <div class="stat"><div class="num">${d.enrollments.length}</div><div class="lbl">Курсов</div></div>
        <div class="stat"><div class="num">${d.quizzes_passed}</div><div class="lbl">Тестов сдано</div></div>
        <div class="stat"><div class="num">${d.homeworks_accepted}</div><div class="lbl">ДЗ принято</div></div>
        <div class="stat"><div class="num">${d.certificates_count}</div><div class="lbl">Сертификатов</div></div>
      </div>
      <h3 class="section-title" style="font-size:18px">Продолжить обучение</h3>
      ${d.enrollments.length
        ? `<div class="grid dash-grid">${d.enrollments.slice(0, 2).map((e) => courseCard(e.course)).join("")}</div>`
        : `<p class="empty">Вы ещё не записались ни на один курс. <a href="#/courses">Выбрать курс</a></p>`}`,

    courses: () => `
      <h2 class="dash-title">Мои курсы</h2>
      ${d.enrollments.length
        ? `<div class="grid dash-grid">${d.enrollments.map((e) => courseCard(e.course)).join("")}</div>`
        : `<p class="empty">Вы ещё не записались ни на один курс. <a href="#/courses">Выбрать курс</a></p>`}`,

    certificates: () => `
      <h2 class="dash-title">Сертификаты</h2>
      ${certs.length ? `
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Номер</th><th>Курс</th><th>Дата</th><th></th></tr></thead>
          <tbody>${certs.map((c) => `
            <tr>
              <td><strong>${esc(c.number)}</strong></td>
              <td>${esc(c.course_title)}</td>
              <td>${new Date(c.issued_at).toLocaleDateString("ru-RU")}</td>
              <td><a class="btn btn-outline btn-sm" href="#/certificate/${esc(c.number)}">Открыть</a></td>
            </tr>`).join("")}</tbody>
        </table></div>`
        : `<p class="empty">Пройдите курс полностью — и здесь появится сертификат. ${icon("trophy")}</p>`}`,

    quizzes: () => `
      <h2 class="dash-title">Результаты тестов</h2>
      ${attempts.length ? `
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Тест</th><th>Результат</th><th>Статус</th><th>Дата</th></tr></thead>
          <tbody>${attempts.map((a) => `
            <tr>
              <td>${esc(a.quiz_title)}</td>
              <td>${a.score}%</td>
              <td>${a.passed ? '<span class="badge badge-success">Сдан</span>' : '<span class="badge badge-danger">Не сдан</span>'}</td>
              <td>${new Date(a.created_at).toLocaleDateString("ru-RU")}</td>
            </tr>`).join("")}</tbody>
        </table></div>`
        : `<p class="empty">Попыток пока нет.</p>`}`,

    homework: () => `
      <h2 class="dash-title">Домашние задания</h2>
      ${submissions.length ? `
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Задание</th><th>Статус</th><th>Оценка</th><th>Дата</th></tr></thead>
          <tbody>${submissions.map((s) => `
            <tr>
              <td><a href="#/homework/${s.homework}">${esc(s.homework_title)}</a></td>
              <td>${statusBadge(s)}</td>
              <td>${s.grade ?? "—"}</td>
              <td>${new Date(s.submitted_at).toLocaleDateString("ru-RU")}</td>
            </tr>`).join("")}</tbody>
        </table></div>`
        : `<p class="empty">Сданных заданий пока нет.</p>`}`,

    profile: () => `
      <h2 class="dash-title">Профиль</h2>
      <form class="form-card" id="profile-form" style="max-width:520px">
        <div class="field">
          <label for="pf-first">Имя</label>
          <input id="pf-first" name="first_name" autocomplete="given-name" value="${esc(u.first_name)}">
        </div>
        <div class="field">
          <label for="pf-last">Фамилия</label>
          <input id="pf-last" name="family-name" autocomplete="family-name" value="${esc(u.last_name)}">
        </div>
        <div class="field">
          <label for="pf-email">Email</label>
          <input id="pf-email" type="email" autocomplete="email" value="${esc(u.email)}">
        </div>
        <div class="field">
          <label for="pf-bio">О себе</label>
          <textarea id="pf-bio">${esc(u.bio || "")}</textarea>
        </div>
        <button class="btn btn-primary" type="submit">Сохранить</button>
      </form>`,
  };
  if (!sections[tab]) tab = "overview";

  app.innerHTML = `
    <div class="dash-layout">
      <aside class="dash-sidebar" aria-label="Меню личного кабинета">
        <div class="dash-user">
          <span class="user-avatar user-avatar-lg" aria-hidden="true">${esc((u.first_name || u.username || "?")[0].toUpperCase())}</span>
          <div>
            <div class="dash-user-name">${esc(u.first_name || u.username)}</div>
            <div class="dash-user-mail">${esc(u.email || "")}</div>
          </div>
        </div>
        <nav class="dash-menu">
          ${DASH_TABS.map(([key, iconName, label]) => `
            <a href="#/dashboard/${key}" class="${key === tab ? "active" : ""}"
               ${key === tab ? 'aria-current="page"' : ""}>
              ${icon(iconName)} ${label}
            </a>`).join("")}
          <a href="#/logout" class="dash-logout">${icon("log-out")} Выйти</a>
        </nav>
      </aside>
      <div class="dash-content">${sections[tab]()}</div>
    </div>`;

  document.getElementById("profile-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await apiJson("/users/me/", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: document.getElementById("pf-first").value,
          last_name: document.getElementById("pf-last").value,
          email: document.getElementById("pf-email").value,
          bio: document.getElementById("pf-bio").value,
        }),
      });
      toast("Профиль сохранён.");
    } catch (err) { toast(err.message); }
  });
}
