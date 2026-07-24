/* Страница курса: модули, уроки, тесты, запись на курс. */
import { apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { levelName } from "../data.js";
import { icon } from "../icons.js";

export async function pageCourse(id) {
  const c = await apiJson(`/courses/${id}/`);
  const modules = c.modules.map((m) => {
    const open = c.is_enrolled && !m.locked;
    const showLock = c.is_enrolled && m.locked;
    const quizRow = m.quiz ? `
      <li class="lesson-item module-quiz-item">
        <span class="lesson-status" aria-hidden="true">${m.quiz.passed ? icon("medal") : icon("file-text")}</span>
        ${open
        ? `<a href="#/quiz/${m.quiz.id}">${esc(m.quiz.title)}</a>`
        : `<span style="flex:1">${esc(m.quiz.title)}</span>`}
        ${m.quiz.passed
        ? `<span class="badge badge-success">Сдан · ${m.quiz.best_score}%</span>`
        : m.quiz.best_score !== null
          ? `<span class="badge badge-danger">Лучший: ${m.quiz.best_score}% (нужно ${m.quiz.pass_score}%)</span>`
          : `<span class="badge badge-pending">Проходной: ${m.quiz.pass_score}%</span>`}
      </li>` : "";
    return `
    <section class="module ${showLock ? "module-locked" : ""}">
      <h3>${showLock ? icon("lock") + " " : ""}${esc(m.title)}</h3>
      ${showLock ? `<p class="lock-note">Модуль откроется после сдачи теста предыдущего модуля минимум на 75%.</p>` : ""}
      <ul class="lesson-list">
        ${m.lessons.map((l) => `
          <li class="lesson-item">
            <span class="lesson-status ${l.completed ? "is-done" : ""}" aria-label="${l.completed ? "Пройден" : "Не пройден"}">${l.completed ? icon("check-circle") : icon("book-open")}</span>
            ${open
        ? `<a href="#/lesson/${l.id}">${esc(l.title)}</a>`
        : `<span style="flex:1">${esc(l.title)}</span>`}
            <span class="lesson-duration">${l.duration_minutes} мин</span>
          </li>`).join("")}
        ${quizRow}
      </ul>
    </section>`;
  }).join("");

  app.innerHTML = `
    <div class="page-head">
      <div class="card-meta">
        <span class="badge badge-level">${esc(levelName(c.level))}</span>
        ${c.language ? `<span class="badge badge-lang">${esc(c.language)}</span>` : ""}
      </div>
      <h1>${esc(c.title)}</h1>
      <p>${esc(c.description)}</p>
      ${c.is_enrolled
      ? `<div class="progress-wrap" style="max-width:420px">
             <div class="progress"><div class="progress-bar" style="width:${c.progress}%"></div></div>
             <span class="progress-label">${c.progress}%</span>
           </div>`
      : localStorage.getItem("is_teacher")
        ? `<p class="form-hint">Вы вошли как преподаватель — запись на курсы недоступна.</p>`
        : `<button class="btn btn-primary" id="enroll-btn">Записаться на курс</button>`}
    </div>
    ${modules}`;

  const enrollBtn = document.getElementById("enroll-btn");
  if (enrollBtn) {
    enrollBtn.addEventListener("click", async () => {
      if (!requireAuth()) return;
      enrollBtn.disabled = true;
      try {
        await apiJson(`/courses/${id}/enroll/`, { method: "POST" });
        toast("Вы записаны на курс!");
        pageCourse(id);
      } catch (e) {
        toast(e.message);
        enrollBtn.disabled = false;
      }
    });
  }
}
