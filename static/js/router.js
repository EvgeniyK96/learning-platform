/* Хеш-роутер: сопоставляет location.hash со страницей и рендерит её. */
import { esc } from "./api.js";
import { app } from "./dom.js";
import { pageHome } from "./pages/home.js";
import { pageCourses } from "./pages/courses.js";
import { pageCourse } from "./pages/course.js";
import { pageLesson } from "./pages/lesson.js";
import { pageQuiz } from "./pages/quiz.js";
import { pageHomework } from "./pages/homework.js";
import { pageDashboard } from "./pages/dashboard.js";
import { pageCertificate } from "./pages/certificate.js";
import { pageLogin, pageRegister, pageLogout } from "./pages/auth.js";

const routes = [
  [/^#?\/?$/, pageHome],
  [/^#\/about$/, () => pageHome("about")],
  [/^#\/mentors$/, () => pageHome("mentors")],
  [/^#\/courses$/, pageCourses],
  [/^#\/course\/(\d+)$/, pageCourse],
  [/^#\/lesson\/(\d+)$/, pageLesson],
  [/^#\/quiz\/(\d+)$/, pageQuiz],
  [/^#\/homework\/(\d+)$/, pageHomework],
  [/^#\/dashboard(?:\/([a-z]+))?$/, pageDashboard],
  [/^#\/certificate\/([A-Za-z0-9]+)$/, pageCertificate],
  [/^#\/login$/, pageLogin],
  [/^#\/register$/, pageRegister],
  [/^#\/logout$/, pageLogout],
];

export async function route() {
  const hash = location.hash || "#/";
  for (const [re, handler] of routes) {
    const m = hash.match(re);
    if (m) {
      app.innerHTML = `<p class="loading">Загрузка…</p>`;
      window.scrollTo(0, 0);
      try {
        await handler(m[1]);
      } catch (e) {
        app.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
      }
      return;
    }
  }
  app.innerHTML = `<p class="empty">Страница не найдена. <a href="#/">На главную</a></p>`;
}
