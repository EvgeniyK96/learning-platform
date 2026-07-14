/* Тест: вопросы с вариантами, отправка и результат. */
import { apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { icon } from "../icons.js";

export async function pageQuiz(id) {
  if (!requireAuth()) return;
  const q = await apiJson(`/assessments/quizzes/${id}/`);
  app.innerHTML = `
    <div class="page-head">
      <h1>${esc(q.title)}</h1>
      <p class="form-hint">Проходной балл: ${q.pass_score}%.
        ${q.best_score !== null ? `Лучший результат: ${q.best_score}%.` : "Первая попытка."}
        ${q.passed ? ` ${icon("check-circle")} Тест сдан.` : ""}</p>
    </div>
    <form id="quiz-form">
      ${q.questions.map((question, i) => `
        <fieldset class="question">
          <p>${i + 1}. ${esc(question.text)}</p>
          ${question.choices.map((ch) => `
            <label class="choice">
              <input type="radio" name="q${question.id}" value="${ch.id}" required>
              <span>${esc(ch.text)}</span>
            </label>`).join("")}
        </fieldset>`).join("")}
      <button class="btn btn-primary" type="submit">Отправить ответы</button>
    </form>`;

  document.getElementById("quiz-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const answers = {};
    q.questions.forEach((question) => {
      const checked = document.querySelector(`input[name="q${question.id}"]:checked`);
      if (checked) answers[question.id] = Number(checked.value);
    });
    try {
      const r = await apiJson(`/assessments/quizzes/${id}/submit/`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      app.innerHTML = `
        <div class="card quiz-result">
          <div class="quiz-score" style="color:${r.passed ? "var(--success)" : "var(--destructive)"}">${r.score}%</div>
          <p><strong>${r.passed ? "Тест сдан!" : "Тест не сдан."}</strong>
             Правильных ответов: ${r.correct} из ${r.total} (проходной балл ${r.pass_score}%).</p>
          ${r.passed && q.module ? "<p>" + icon("unlock") + " Следующий модуль курса открыт!</p>" : ""}
          ${!r.passed && q.module ? "<p>Следующий модуль откроется после сдачи этого теста минимум на " + r.pass_score + "%. Перечитай уроки модуля и попробуй ещё раз.</p>" : ""}
          ${r.certificate_issued ? "<p>" + icon("trophy") + " Курс завершён — сертификат уже в личном кабинете!</p>" : ""}
          <div class="lesson-actions" style="justify-content:center">
            ${!r.passed ? `<a class="btn btn-primary" href="#/quiz/${id}" onclick="location.reload()">Попробовать ещё раз</a>` : ""}
            <a class="btn btn-outline" href="#/dashboard">В личный кабинет</a>
          </div>
        </div>`;
    } catch (err) { toast(err.message); }
  });
}
