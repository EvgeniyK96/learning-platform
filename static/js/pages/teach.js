/* Кабинет преподавателя: проверка ДЗ, свои курсы, прогресс учеников.
   Доступен только пользователям с ролью is_teacher. */
import { api, apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { icon } from "../icons.js";

const TEACH_TABS = [
  ["submissions", "clipboard-check", "Проверка ДЗ"],
  ["courses", "book", "Мои курсы"],
  ["students", "users", "Ученики"],
  ["profile", "settings", "Настройки профиля"],
];

const STATUS_BADGE = {
  accepted: "badge-success",
  submitted: "badge-pending",
  rejected: "badge-danger",
};

export async function pageTeach(tab) {
  if (!requireAuth()) return;
  if (!localStorage.getItem("is_teacher")) {
    app.innerHTML = `<p class="empty">Раздел доступен только преподавателям.</p>`;
    return;
  }
  tab = tab || "submissions";
  if (!TEACH_TABS.some(([k]) => k === tab)) tab = "submissions";

  const overview = await apiJson("/teaching/overview/").catch(() => null);

  app.innerHTML = `
    <div class="dash-layout">
      <aside class="dash-sidebar" aria-label="Меню преподавателя">
        <div class="dash-user">
          <span class="user-avatar user-avatar-lg" aria-hidden="true">${icon("clipboard-check")}</span>
          <div>
            <div class="dash-user-name">Кабинет преподавателя</div>
            <div class="dash-user-mail">${esc(localStorage.getItem("username") || "")}</div>
          </div>
        </div>
        <nav class="dash-menu">
          ${TEACH_TABS.map(([key, ic, label]) => `
            <a href="#/teach/${key}" class="${key === tab ? "active" : ""}"
               ${key === tab ? 'aria-current="page"' : ""}>
              ${icon(ic)} ${label}
              ${key === "submissions" && overview?.pending_submissions
                ? `<span class="menu-badge">${overview.pending_submissions}</span>` : ""}
            </a>`).join("")}
          <a href="#/chat">${icon("message-square")} Сообщения</a>
          <a href="#/logout" class="dash-logout">${icon("log-out")} Выйти</a>
        </nav>
      </aside>
      <div class="dash-content" id="teach-content">
        <p class="loading">Загрузка…</p>
      </div>
    </div>`;

  const box = document.getElementById("teach-content");
  try {
    if (tab === "submissions") await renderSubmissions(box);
    else if (tab === "courses") await renderCourses(box);
    else if (tab === "students") await renderStudents(box);
    else if (tab === "profile") await renderProfile(box);
  } catch (e) {
    box.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
  }
}

/* ---------- Проверка ДЗ ---------- */

async function renderSubmissions(box, status = "submitted") {
  const subs = await apiJson(`/teaching/submissions/?status=${encodeURIComponent(status)}`);
  const filters = [
    ["submitted", "На проверке"],
    ["accepted", "Принятые"],
    ["rejected", "На доработку"],
    ["all", "Все"],
  ];

  box.innerHTML = `
    <h2 class="dash-title">Проверка домашних заданий</h2>
    <div class="chip-row" id="sub-filters">
      ${filters.map(([k, l]) => `
        <button type="button" class="chip ${k === status ? "chip-active" : ""}" data-status="${k}">${l}</button>`).join("")}
    </div>
    ${subs.length ? `<div class="sub-list">${subs.map(subCard).join("")}</div>`
      : `<p class="empty">${icon("inbox")} Нет работ в этой категории.</p>`}`;

  box.querySelector("#sub-filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-status]");
    if (btn) renderSubmissions(box, btn.dataset.status);
  });

  box.querySelectorAll(".sub-card").forEach((card) => bindSubCard(card));
}

function subCard(s) {
  const date = new Date(s.submitted_at).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" });
  return `
    <div class="card sub-card" data-id="${s.id}">
      <div class="sub-head">
        <div>
          <strong>${esc(s.homework_title)}</strong>
          <div class="sub-meta">${esc(s.course_title)} · ${date}</div>
        </div>
        <span class="badge ${STATUS_BADGE[s.status]}">${esc(s.status_display)}</span>
      </div>
      <div class="sub-student">${icon("user")} ${esc(s.student_name)} <span class="sub-meta">@${esc(s.student_username)}</span>
        <a class="btn btn-outline btn-sm" href="#/chat/${s.student_id}">${icon("message-square")} Написать</a>
      </div>
      ${s.text ? `<pre class="sub-text">${esc(s.text)}</pre>` : ""}
      ${s.file_url ? `<p class="form-hint">${icon("paperclip")}
        <a href="#" class="sub-file" data-url="${esc(s.file_url)}" data-name="${esc(s.file_name || "файл")}">${esc(s.file_name || "скачать файл")}</a></p>` : ""}
      <form class="sub-review">
        <div class="sub-review-row">
          <div class="field field-inline">
            <label>Оценка (0–100)</label>
            <input type="number" class="rv-grade" min="0" max="100" value="${s.grade ?? ""}" placeholder="—">
          </div>
        </div>
        <div class="field">
          <label>Комментарий ученику</label>
          <textarea class="rv-comment" placeholder="Что исправить или похвала…">${esc(s.teacher_comment || "")}</textarea>
        </div>
        <div class="sub-actions">
          <button type="button" class="btn btn-primary btn-sm rv-accept">${icon("check-circle")} Принять</button>
          <button type="button" class="btn btn-outline btn-sm rv-reject">На доработку</button>
        </div>
      </form>
    </div>`;
}

function bindSubCard(card) {
  const id = card.dataset.id;
  const grade = card.querySelector(".rv-grade");
  const comment = card.querySelector(".rv-comment");

  const review = async (status) => {
    const body = { status, teacher_comment: comment.value };
    const g = grade.value.trim();
    body.grade = g === "" ? null : Number(g);
    try {
      await apiJson(`/teaching/submissions/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      toast(status === "accepted" ? "Работа принята." : "Отправлено на доработку.");
      // перерисовываем текущую вкладку целиком, чтобы обновились счётчики
      pageTeach("submissions");
    } catch (err) { toast(err.message); }
  };

  card.querySelector(".rv-accept").addEventListener("click", () => review("accepted"));
  card.querySelector(".rv-reject").addEventListener("click", () => review("rejected"));

  const file = card.querySelector(".sub-file");
  if (file) file.addEventListener("click", (e) => { e.preventDefault(); downloadFile(file.dataset.url, file.dataset.name); });
}

/* ---------- Мои курсы ---------- */

async function renderCourses(box) {
  const courses = await apiJson("/teaching/courses/");
  box.innerHTML = `
    <h2 class="dash-title">Мои курсы</h2>
    ${courses.length ? `<div class="grid teach-grid">${courses.map((c) => `
      <div class="card teach-course">
        <h3>${esc(c.title)}</h3>
        <div class="teach-course-stats">
          <span>${icon("users")} ${c.students_count} учеников</span>
          <span>${icon("book")} ${c.lessons_count} уроков</span>
          <span class="${c.pending_submissions ? "text-pending" : ""}">${icon("clipboard-check")} ${c.pending_submissions} на проверке</span>
        </div>
        <a class="btn btn-outline btn-sm" href="#/teach/students?course=${c.id}">Ученики курса</a>
      </div>`).join("")}</div>`
      : `<p class="empty">Вам ещё не назначены курсы. Обратитесь к администратору.</p>`}`;
}

/* ---------- Ученики ---------- */

async function renderStudents(box) {
  const courses = await apiJson("/teaching/courses/");
  if (!courses.length) {
    box.innerHTML = `<h2 class="dash-title">Ученики</h2><p class="empty">Вам ещё не назначены курсы.</p>`;
    return;
  }
  const params = new URLSearchParams(location.hash.split("?")[1] || "");
  let current = Number(params.get("course")) || courses[0].id;
  if (!courses.some((c) => c.id === current)) current = courses[0].id;

  box.innerHTML = `
    <h2 class="dash-title">Ученики</h2>
    <div class="field field-inline" style="max-width:420px">
      <label for="stu-course">Курс</label>
      <select id="stu-course">
        ${courses.map((c) => `<option value="${c.id}" ${c.id === current ? "selected" : ""}>${esc(c.title)}</option>`).join("")}
      </select>
    </div>
    <div id="stu-table"><p class="loading">Загрузка…</p></div>`;

  const load = async (courseId) => {
    const table = document.getElementById("stu-table");
    try {
      const students = await apiJson(`/teaching/courses/${courseId}/students/`);
      table.innerHTML = students.length ? `
        <div class="table-wrap"><table class="data">
          <thead><tr><th>Ученик</th><th>Прогресс</th><th>Уроков</th><th>Тестов</th><th>ДЗ принято</th><th></th></tr></thead>
          <tbody>${students.map((s) => `
            <tr>
              <td><strong>${esc(s.full_name)}</strong><div class="sub-meta">@${esc(s.username)}</div></td>
              <td>
                <div class="mini-bar"><span style="width:${s.progress}%"></span></div>
                <span class="sub-meta">${s.progress}%</span>
              </td>
              <td>${s.lessons_done}</td>
              <td>${s.quizzes_passed}</td>
              <td>${s.homeworks_accepted}</td>
              <td><a class="btn btn-outline btn-sm" href="#/chat/${s.id}">${icon("message-square")} Чат</a></td>
            </tr>`).join("")}</tbody>
        </table></div>`
        : `<p class="empty">На курс пока никто не записан.</p>`;
    } catch (e) {
      table.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    }
  };

  document.getElementById("stu-course").addEventListener("change", (e) => load(e.target.value));
  load(current);
}

/* ---------- Настройки профиля ---------- */

async function renderProfile(box) {
  const u = await apiJson("/users/me/");
  box.innerHTML = `
    <h2 class="dash-title">Настройки профиля</h2>
    <form class="form-card" id="teach-profile" style="max-width:520px">
      <div class="field">
        <label for="tp-first">Имя</label>
        <input id="tp-first" autocomplete="given-name" value="${esc(u.first_name)}">
      </div>
      <div class="field">
        <label for="tp-last">Фамилия</label>
        <input id="tp-last" autocomplete="family-name" value="${esc(u.last_name)}">
      </div>
      <div class="field">
        <label for="tp-email">Email</label>
        <input id="tp-email" type="email" autocomplete="email" value="${esc(u.email)}">
      </div>
      <div class="field">
        <label for="tp-bio">О себе</label>
        <textarea id="tp-bio">${esc(u.bio || "")}</textarea>
      </div>
      <button class="btn btn-primary" type="submit">Сохранить</button>
    </form>`;

  document.getElementById("teach-profile").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await apiJson("/users/me/", {
        method: "PATCH",
        body: JSON.stringify({
          first_name: document.getElementById("tp-first").value,
          last_name: document.getElementById("tp-last").value,
          email: document.getElementById("tp-email").value,
          bio: document.getElementById("tp-bio").value,
        }),
      });
      toast("Профиль сохранён.");
    } catch (err) { toast(err.message); }
  });
}

/* ---------- Скачивание файла (через авторизованный fetch) ---------- */

async function downloadFile(url, name) {
  try {
    const res = await api(url.replace("/api", ""));
    if (!res.ok) throw new Error("Не удалось скачать файл");
    const blob = await res.blob();
    const link = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = link;
    a.download = name;
    a.click();
    URL.revokeObjectURL(link);
  } catch (err) { toast(err.message); }
}
