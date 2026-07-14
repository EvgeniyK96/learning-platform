/* Главная: герой, популярные курсы, о школе, менторы. */
import { apiJson } from "../api.js";
import { app } from "../dom.js";
import { MENTORS } from "../data.js";
import { courseCard, mentorCard } from "../components.js";
import { icon } from "../icons.js";

const FEATURES = [
  ["monitor", "IDE прямо в браузере", "Python, JavaScript, терминал и SQL-консоль запускаются онлайн — ничего не нужно устанавливать."],
  ["file-text", "Тесты после модуля", "Каждый модуль закрывается тестом. Следующий открывается только после сдачи — знания закрепляются."],
  ["message-square", "Проверка ментором", "Домашние задания проверяет живой преподаватель и даёт обратную связь по решению."],
  ["trophy", "Сертификат по итогу", "По завершении курса выдаётся именной сертификат с проверкой подлинности по номеру."],
];

const featureCard = ([ic, title, text]) => `
  <article class="feature-card">
    <span class="feature-icon">${icon(ic)}</span>
    <h3>${title}</h3>
    <p>${text}</p>
  </article>`;

export async function pageHome(scrollTo) {
  app.innerHTML = `
    <section class="hero">
      <h1>Научись программировать —<br>от первой строки до сертификата</h1>
      <p>Интерактивные уроки со встроенной IDE прямо в браузере, тесты после каждого модуля, домашние задания с обратной связью от преподавателя и сертификат по итогам курса.</p>
      <a class="btn btn-accent" href="#/courses">Смотреть курсы</a>
    </section>

    <section class="features-block" aria-label="Преимущества школы">
      <div class="grid features-grid">${FEATURES.map(featureCard).join("")}</div>
    </section>

    <h2 class="section-title">Популярные курсы</h2>
    <div id="home-courses" class="grid"><p class="loading">Загрузка…</p></div>

    <section id="about" class="about-block">
      <h2 class="section-title">О школе</h2>
      <div class="about-grid">
        <div class="about-text">
          <p><strong>CODE WAY</strong> — онлайн школа программирования, где путь в IT
          начинается с первой строки кода и заканчивается сертификатом. Мы учим через
          практику: теория в каждом уроке сразу закрепляется во встроенной IDE,
          терминале или SQL-консоли — ничего не нужно устанавливать.</p>
          <p>Доступ к следующему модулю открывается после теста, домашние задания
          проверяют менторы, а по итогам курса выдаётся сертификат с проверкой
          подлинности по номеру.</p>
        </div>
        <div class="about-stats" id="about-stats">
          <div class="stat"><div class="num" id="stat-courses">9</div><div class="lbl">курсов</div></div>
          <div class="stat"><div class="num" id="stat-lessons">280+</div><div class="lbl">уроков</div></div>
          <div class="stat"><div class="num">4</div><div class="lbl">ментора</div></div>
          <div class="stat"><div class="num">100%</div><div class="lbl">практики в браузере</div></div>
        </div>
      </div>
    </section>

    <section id="mentors" class="mentors-block">
      <h2 class="section-title">Наши менторы</h2>
      <div class="grid mentors-grid">${MENTORS.map(mentorCard).join("")}</div>
    </section>

    <section class="cta-band">
      <div class="cta-inner">
        <div>
          <h2>Готовы начать свой путь в IT?</h2>
          <p>Выберите курс, пройдите первый бесплатный урок и напишите первую строку кода уже сегодня.</p>
        </div>
        <a class="btn btn-accent" href="#/courses">Выбрать курс</a>
      </div>
    </section>`;

  if (scrollTo) {
    setTimeout(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" }), 50);
  }
  const courses = await apiJson("/courses/");
  document.getElementById("home-courses").innerHTML =
    courses.slice(0, 6).map(courseCard).join("") ||
    `<p class="empty">Курсы скоро появятся.</p>`;
  document.getElementById("stat-courses").textContent = courses.length;
  document.getElementById("stat-lessons").textContent =
    courses.reduce((sum, c) => sum + c.lessons_count, 0);
  if (scrollTo) document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" });
}
