/* Урок: теория (Markdown) + интерактивная практика (IDE/терминал/SQL). */
import { apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { RUNNERS } from "../data.js";
import { runtime } from "../state.js";
import { icon } from "../icons.js";
import { mdToHtml } from "../markdown.js";
import { ideHtml } from "../ide/shell.js";
import { initIde } from "../ide/python.js";
import { initJsIde } from "../ide/javascript.js";
import { termHtml, initTerminal } from "../ide/terminal.js";
import { initSqlConsole } from "../ide/sql.js";

export async function pageLesson(id) {
  if (!requireAuth()) return;
  const l = await apiJson(`/courses/lessons/${id}/`);

  const runner = RUNNERS[l.course_runner] || null;
  runtime.tryLangs = runner ? runner.langs : [];
  runtime.tryLabel = runner ? runner.label : "";
  const theory = mdToHtml(l.content || "");

  let practice = "";
  if (l.course_runner === "python") {
    const starter = runtime.codeSnippets[0] || 'print("Привет, CODE WAY!")';
    practice = `
      <h2 class="section-title">${runner.heading}</h2>
      <p class="form-hint" style="margin-bottom:12px">Скопируй пример кнопкой «${runtime.tryLabel}» у любого блока кода или напиши свой — код выполнится прямо в браузере (Python загрузится при первом запуске, 10–20 сек).</p>
      ${ideHtml(starter, "main.py — CODE WAY IDE", "Консоль. Нажми «Запустить», чтобы выполнить код.")}`;
  } else if (l.course_runner === "javascript") {
    const starter = runtime.codeSnippets[0] || 'console.log("Привет, CODE WAY!");';
    practice = `
      <h2 class="section-title">${runner.heading}</h2>
      <p class="form-hint" style="margin-bottom:12px">Скопируй пример кнопкой «${runtime.tryLabel}» или напиши свой код — он выполнится в браузере. Вывод console.log появится в консоли ниже.</p>
      ${ideHtml(starter, "main.js — CODE WAY IDE", "Консоль. Нажми «Запустить», чтобы выполнить код.")}`;
  } else if (l.course_runner === "terminal") {
    practice = `
      <h2 class="section-title">${runner.heading}</h2>
      <p class="form-hint" style="margin-bottom:12px">Эмулятор терминала: базовые команды Linux, git и docker. Нажми «${runtime.tryLabel}» у блока команд или вводи команды сам (help — список).</p>
      ${termHtml("student@codeway:~$", "терминал — CODE WAY", "Учебный терминал CODE WAY. Введи help, чтобы увидеть доступные команды.")}`;
  } else if (l.course_runner === "sql") {
    practice = `
      <h2 class="section-title">${runner.heading}</h2>
      <p class="form-hint" style="margin-bottom:12px">Настоящая SQLite прямо в браузере. Демо-таблицы students, orders и payments уже созданы — пробуй запросы из урока (кнопка «${runtime.tryLabel}») или пиши свои.</p>
      ${termHtml("sqlite>", "SQL-консоль — CODE WAY", "SQL-консоль. Введи запрос, например: SELECT * FROM students;")}`;
  }

  app.innerHTML = `
    <div class="page-head">
      <h1>${esc(l.title)}</h1>
      <p class="form-hint">${icon("book-open")} Теория · ${l.duration_minutes} мин · ${l.completed ? icon("check-circle") + " пройден" : "ещё не пройден"}</p>
    </div>
    <div class="lesson-content md">${theory}</div>
    ${practice}
    <div class="lesson-actions" style="margin-top:26px">
      ${!l.completed ? `<button class="btn btn-primary" id="complete-btn">Отметить как пройденный</button>` : ""}
      ${l.quiz_id ? `<a class="btn btn-outline" href="#/quiz/${l.quiz_id}">Пройти тест</a>` : ""}
      ${l.homework_id ? `<a class="btn btn-outline" href="#/homework/${l.homework_id}">Домашнее задание</a>` : ""}
      <a class="btn btn-outline" href="#/course/${l.course_id}">← Назад к курсу</a>
    </div>`;

  if (l.course_runner === "python") initIde();
  else if (l.course_runner === "javascript") initJsIde();
  else if (l.course_runner === "terminal") initTerminal();
  else if (l.course_runner === "sql") initSqlConsole();

  const btn = document.getElementById("complete-btn");
  if (btn) {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      try {
        const r = await apiJson(`/courses/lessons/${id}/complete/`, { method: "POST" });
        toast(r.certificate_issued
          ? "Курс завершён! Сертификат в личном кабинете."
          : `Урок пройден. Прогресс курса: ${r.course_progress}%`);
        pageLesson(id);
      } catch (e) { toast(e.message); btn.disabled = false; }
    });
  }
}
