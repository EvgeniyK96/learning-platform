/* Статичные справочники: обложки языков, менторы, раннеры практики, вкладки ЛК. */

export const COVERS = {
  Python: { icon: "🐍", grad: "linear-gradient(135deg,#306998,#FFD43B)" },
  "C++": { icon: "⚙️", grad: "linear-gradient(135deg,#00427E,#659AD2)" },
  JavaScript: { icon: "🟨", grad: "linear-gradient(135deg,#B8860B,#F7DF1E)" },
  Java: { icon: "☕", grad: "linear-gradient(135deg,#5382A1,#F89820)" },
  DevOps: { icon: "♾️", grad: "linear-gradient(135deg,#16243D,#2563EB)" },
  Linux: { icon: "🐧", grad: "linear-gradient(135deg,#1F2937,#FBBF24)" },
  Git: { icon: "🌿", grad: "linear-gradient(135deg,#B93E1F,#F1502F)" },
  Docker: { icon: "🐳", grad: "linear-gradient(135deg,#0B3A62,#2496ED)" },
  SQL: { icon: "🗄️", grad: "linear-gradient(135deg,#155E75,#22D3EE)" },
};

export const MENTORS = [
  {
    name: "Евгений Куреда", role: "Руководитель школы · Python, DevOps",
    exp: "10+ лет в разработке. Django, архитектура веб-сервисов, CI/CD.", avatar: "ЕК", hue: "#2563EB"
  },
  {
    name: "Алина Сапарова", role: "Ментор · Frontend, JavaScript",
    exp: "7 лет во фронтенде. React, TypeScript, доступные интерфейсы.", avatar: "АС", hue: "#7C3AED"
  },
  {
    name: "Данияр Ахметов", role: "Ментор · Java, C++",
    exp: "9 лет в бэкенде и системном программировании. Highload, Spring.", avatar: "ДА", hue: "#0D9488"
  },
  {
    name: "Мария Ковалёва", role: "Ментор · SQL, аналитика данных",
    exp: "6 лет в data-инженерии. PostgreSQL, витрины данных, BI.", avatar: "МК", hue: "#D97706"
  },
];

/* какие языки блоков кода получают кнопку запуска, её подпись и заголовок практики */
export const RUNNERS = {
  python: { langs: ["python", "py"], label: "▶ Попробовать в IDE", heading: "Практика: попробуй код сам" },
  javascript: { langs: ["javascript", "js"], label: "▶ Попробовать в песочнице", heading: "Практика: попробуй код сам" },
  terminal: { langs: ["bash", "sh", "shell", "console", "terminal"], label: "▶ Выполнить в терминале", heading: "Практика: учебный терминал" },
  sql: { langs: ["sql"], label: "▶ Выполнить в консоли", heading: "Практика: SQL-консоль" },
};

export const levelName = (l) =>
  ({ beginner: "Начальный", intermediate: "Средний", advanced: "Продвинутый" }[l] || l);

export const DASH_TABS = [
  ["overview", "layout-dashboard", "Обзор"],
  ["courses", "book", "Мои курсы"],
  ["certificates", "trophy", "Сертификаты"],
  ["quizzes", "file-text", "Тесты"],
  ["homework", "upload", "Домашние задания"],
  ["profile", "settings", "Профиль"],
];
