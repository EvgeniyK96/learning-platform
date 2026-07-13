/* CODE WAY SPA — hash-роутинг + JWT (djoser) */
(() => {
  const API = "/api";
  const app = document.getElementById("app");
  const navAuth = document.getElementById("nav-auth");

  /* ---------- утилиты ---------- */
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  const tokens = {
    get access() { return localStorage.getItem("access"); },
    get refresh() { return localStorage.getItem("refresh"); },
    set(access, refresh) {
      localStorage.setItem("access", access);
      if (refresh) localStorage.setItem("refresh", refresh);
    },
    clear() { localStorage.removeItem("access"); localStorage.removeItem("refresh"); },
  };

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(el._t);
    el._t = setTimeout(() => { el.hidden = true; }, 3500);
  }

  async function api(path, options = {}) {
    const headers = options.headers || {};
    if (!(options.body instanceof FormData) && options.body) {
      headers["Content-Type"] = "application/json";
    }
    if (tokens.access) headers["Authorization"] = "Bearer " + tokens.access;

    let res = await fetch(API + path, { ...options, headers });

    if (res.status === 401 && tokens.refresh) {
      const rr = await fetch(API + "/auth/jwt/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
      if (rr.ok) {
        const data = await rr.json();
        tokens.set(data.access);
        headers["Authorization"] = "Bearer " + data.access;
        res = await fetch(API + path, { ...options, headers });
      } else {
        tokens.clear();
        renderNav();
      }
    }
    return res;
  }

  async function apiJson(path, options) {
    const res = await api(path, options);
    if (!res.ok) {
      let detail = "Ошибка запроса (" + res.status + ")";
      try {
        const data = await res.json();
        detail = data.detail || Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : v}`)
          .join("; ") || detail;
      } catch (_) { /* не JSON */ }
      throw new Error(detail);
    }
    return res.status === 204 ? null : res.json();
  }

  const isAuthed = () => Boolean(tokens.access);

  function requireAuth() {
    if (!isAuthed()) {
      location.hash = "#/login";
      return false;
    }
    return true;
  }

  /* ---------- навигация ---------- */
  function renderNav() {
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
            <a href="#/dashboard">👤 Личный кабинет</a>
            <a href="#/dashboard/courses">📚 Мои курсы</a>
            <a href="#/dashboard/certificates">🏆 Сертификаты</a>
            <a href="#/dashboard/profile">⚙️ Настройки профиля</a>
            <a href="#/logout" class="user-logout">↩ Выйти</a>
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
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a")) navLinks.classList.remove("open");
  });

  /* ---------- обложки курсов ---------- */
  const COVERS = {
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

  function courseCover(c) {
    if (c.cover) return `<img class="course-cover-img" src="${esc(c.cover)}" alt="">`;
    const cover = COVERS[c.language] || { icon: "💻", grad: "linear-gradient(135deg,#16243D,#2563EB)" };
    return `
      <div class="course-cover" style="background:${cover.grad}" aria-hidden="true">
        <span class="cover-icon">${cover.icon}</span>
        <span class="cover-lang">${esc(c.language || "Код")}</span>
      </div>`;
  }

  /* ---------- менторы ---------- */
  const MENTORS = [
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

  const mentorCard = (m) => `
    <article class="mentor-card">
      <span class="mentor-avatar" style="background:${m.hue}" aria-hidden="true">${esc(m.avatar)}</span>
      <h3>${esc(m.name)}</h3>
      <p class="mentor-role">${esc(m.role)}</p>
      <p class="desc">${esc(m.exp)}</p>
    </article>`;

  /* ---------- страницы ---------- */
  async function pageHome(scrollTo) {
    app.innerHTML = `
      <section class="hero">
        <h1>Научись программировать —<br>от первой строки до сертификата</h1>
        <p>Интерактивные уроки со встроенной IDE прямо в браузере, тесты после каждого модуля, домашние задания с обратной связью от преподавателя и сертификат по итогам курса.</p>
        <a class="btn btn-accent" href="#/courses">Смотреть курсы</a>
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

  function courseCard(c) {
    const progress = c.is_enrolled
      ? `<div class="progress-wrap" aria-label="Прогресс ${c.progress}%">
           <div class="progress"><div class="progress-bar" style="width:${c.progress}%"></div></div>
           <span class="progress-label">${c.progress}%</span>
         </div>`
      : "";
    return `
      <article class="card course-card">
        ${courseCover(c)}
        <div class="card-meta">
          <span class="badge badge-level">${esc(levelName(c.level))}</span>
          ${c.language ? `<span class="badge badge-lang">${esc(c.language)}</span>` : ""}
        </div>
        <h3><a href="#/course/${c.id}">${esc(c.title)}</a></h3>
        <p class="desc">${esc(c.description).slice(0, 140)}…</p>
        <p class="form-hint">${c.lessons_count} уроков${c.teacher_name ? " · " + esc(c.teacher_name) : ""}</p>
        ${progress}
        <a class="btn ${c.is_enrolled ? "btn-outline" : "btn-primary"}" href="#/course/${c.id}">
          ${c.is_enrolled ? "Продолжить" : "Подробнее"}
        </a>
      </article>`;
  }

  const levelName = (l) =>
    ({ beginner: "Начальный", intermediate: "Средний", advanced: "Продвинутый" }[l] || l);

  /* ---------- markdown-рендер теории ---------- */
  let codeSnippets = []; // код из блоков урока для кнопки «Попробовать»
  // какие языки блоков кода получают кнопку и её подпись — зависит от курса
  let tryLangs = [];
  let tryLabel = "▶ Попробовать в IDE";

  const RUNNERS = {
    python: { langs: ["python", "py"], label: "▶ Попробовать в IDE", heading: "Практика: попробуй код сам" },
    javascript: { langs: ["javascript", "js"], label: "▶ Попробовать в песочнице", heading: "Практика: попробуй код сам" },
    terminal: { langs: ["bash", "sh", "shell", "console", "terminal"], label: "▶ Выполнить в терминале", heading: "Практика: учебный терминал" },
    sql: { langs: ["sql"], label: "▶ Выполнить в консоли", heading: "Практика: SQL-консоль" },
  };

  function mdToHtml(md) {
    codeSnippets = [];
    const blocks = [];
    // выносим fenced-блоки кода, чтобы их не трогала остальная разметка
    let text = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const idx = blocks.length;
      let tryBtn = "";
      if (tryLangs.includes((lang || "").toLowerCase())) {
        const snippetId = codeSnippets.length;
        codeSnippets.push(code.replace(/\s+$/, ""));
        tryBtn = `<button type="button" class="code-try" data-snippet="${snippetId}">${tryLabel}</button>`;
      }
      blocks.push(
        `<div class="code-block"><div class="code-head"><span>${esc(lang || "code")}</span>${tryBtn}</div><pre><code>${esc(code)}</code></pre></div>`
      );
      return `\u0000BLOCK${idx}\u0000`;
    });

    text = esc(text);

    const inline = (s) =>
      s.replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = text.split("\n");
    const out = [];
    let list = null; // "ul" | "ol"
    let table = null;
    let quote = false;

    const closeAll = () => {
      if (list) { out.push(`</${list}>`); list = null; }
      if (table) { out.push("</tbody></table></div>"); table = null; }
      if (quote) { out.push("</blockquote>"); quote = false; }
    };

    for (const raw of lines) {
      const line = raw.trimEnd();
      const t = line.trim();

      const blockRef = t.match(/^\u0000BLOCK(\d+)\u0000$/);
      if (blockRef) { closeAll(); out.push(blocks[+blockRef[1]]); continue; }

      if (!t) { closeAll(); continue; }

      const h = t.match(/^(#{1,6})\s+(.+)$/);
      if (h) {
        closeAll();
        const level = Math.min(h[1].length + 1, 6); // # → h2, ### → h4
        out.push(`<h${level}>${inline(h[2])}</h${level}>`);
        continue;
      }
      if (/^-{3,}$/.test(t)) { closeAll(); out.push("<hr>"); continue; }

      if (t.startsWith("|")) {
        const cells = t.split("|").slice(1, -1).map((c) => c.trim());
        if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // разделитель шапки
        if (!table) {
          table = true;
          out.push(`<div class="table-wrap"><table class="data"><thead><tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`);
        } else {
          out.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
        }
        continue;
      }

      if (t.startsWith("&gt;")) {
        if (!quote) { closeAll(); out.push("<blockquote>"); quote = true; }
        out.push(`<p>${inline(t.replace(/^&gt;\s?/, ""))}</p>`);
        continue;
      }

      const ul = t.match(/^[-*]\s+(.+)$/);
      const ol = t.match(/^\d+\.\s+(.+)$/);
      if (ul || ol) {
        const kind = ul ? "ul" : "ol";
        if (list !== kind) { closeAll(); out.push(`<${kind}>`); list = kind; }
        out.push(`<li>${inline((ul || ol)[1])}</li>`);
        continue;
      }

      closeAll();
      out.push(`<p>${inline(t)}</p>`);
    }
    closeAll();
    return out.join("\n");
  }

  /* ---------- эмулятор IDE (Python в браузере через Pyodide) ---------- */
  const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/";
  let pyodidePromise = null;

  function loadPyodideOnce() {
    if (!pyodidePromise) {
      pyodidePromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = PYODIDE_URL + "pyodide.js";
        s.onload = () =>
          window.loadPyodide({ indexURL: PYODIDE_URL }).then(resolve, reject);
        s.onerror = () =>
          reject(new Error("Не удалось загрузить среду Python. Проверьте интернет-соединение."));
        document.head.appendChild(s);
      }).catch((e) => { pyodidePromise = null; throw e; });
    }
    return pyodidePromise;
  }

  const IDE_SETUP = `
import builtins
def _cw_input(prompt_text=""):
    from js import window
    res = window.prompt(str(prompt_text))
    if res is None:
        res = ""
    print(str(prompt_text) + res)
    return res
builtins.input = _cw_input
`;

  function ideHtml(starterCode, title, hint) {
    return `
      <section class="ide" aria-label="Встроенная IDE">
        <div class="ide-head">
          <span class="ide-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="ide-title">${esc(title || "main.py — CODE WAY IDE")}</span>
          <span class="ide-btns">
            <button type="button" class="btn btn-primary btn-sm" id="ide-run">▶ Запустить (Ctrl+Enter)</button>
            <button type="button" class="btn btn-outline btn-sm ide-btn-light" id="ide-clear">Очистить консоль</button>
          </span>
        </div>
        <div class="ide-editor-wrap">
          <pre class="ide-gutter" id="ide-gutter" aria-hidden="true">1</pre>
          <textarea id="ide-code" class="ide-code" spellcheck="false"
            aria-label="Редактор кода">${esc(starterCode)}</textarea>
        </div>
        <div class="ide-console" id="ide-console" role="log" aria-label="Консоль вывода">
          <span class="ide-muted">${esc(hint || "Консоль. Нажми «Запустить», чтобы выполнить код.")}</span>
        </div>
      </section>`;
  }

  /* общая обвязка редактора: нумерация строк, Tab, Ctrl+Enter, печать в консоль */
  function setupIdeShell(runHandler) {
    const code = document.getElementById("ide-code");
    const gutter = document.getElementById("ide-gutter");
    const consoleEl = document.getElementById("ide-console");
    const runBtn = document.getElementById("ide-run");

    const renderGutter = () => {
      const n = code.value.split("\n").length;
      gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    };
    code.addEventListener("input", renderGutter);
    code.addEventListener("scroll", () => { gutter.scrollTop = code.scrollTop; });
    renderGutter();

    code.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const { selectionStart: s, selectionEnd: en } = code;
        code.setRangeText("    ", s, en, "end");
        renderGutter();
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        runBtn.click();
      }
    });

    const print = (text, cls) => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text;
      consoleEl.appendChild(span);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    };

    document.getElementById("ide-clear").addEventListener("click", () => {
      consoleEl.innerHTML = "";
    });

    const shell = { code, consoleEl, runBtn, print, renderGutter };

    runBtn.addEventListener("click", async () => {
      runBtn.disabled = true;
      consoleEl.innerHTML = "";
      try {
        await runHandler(shell);
      } finally {
        runBtn.disabled = false;
      }
    });

    // кнопки «Попробовать» у блоков кода — подставляют код в редактор
    document.querySelectorAll(".code-try").forEach((btn) => {
      btn.addEventListener("click", () => {
        code.value = codeSnippets[+btn.dataset.snippet] || "";
        renderGutter();
        document.querySelector(".ide").scrollIntoView({ behavior: "smooth", block: "center" });
        code.focus();
      });
    });
    return shell;
  }

  function initIde() {
    setupIdeShell(async ({ code, consoleEl, print }) => {
      try {
        if (!window.__pyodideReady) print("Загружаю Python…\n", "ide-muted");
        const py = await loadPyodideOnce();
        window.__pyodideReady = true;
        consoleEl.innerHTML = "";
        py.setStdout({ batched: (s) => print(s + "\n") });
        py.setStderr({ batched: (s) => print(s + "\n", "ide-err") });
        await py.runPythonAsync(IDE_SETUP);
        const ns = py.globals.get("dict")();
        try {
          await py.runPythonAsync(code.value, { globals: ns });
          print("\n[программа завершена]", "ide-muted");
        } finally {
          ns.destroy();
        }
      } catch (err) {
        const msg = String(err.message || err);
        // показываем только питоновский traceback без внутренностей pyodide
        const cut = msg.indexOf('File "<exec>"');
        print((cut > -1 ? "Traceback:\n  " + msg.slice(cut) : msg) + "\n", "ide-err");
      }
    });
  }

  /* ---------- JS-песочница ---------- */
  function initJsIde() {
    setupIdeShell(({ code, print }) => {
      const fmt = (v) => {
        if (typeof v === "string") return v;
        if (v instanceof Error) return String(v);
        try { return JSON.stringify(v, null, 1); } catch (_) { return String(v); }
      };
      const fakeConsole = {
        log: (...a) => print(a.map(fmt).join(" ") + "\n"),
        info: (...a) => print(a.map(fmt).join(" ") + "\n"),
        warn: (...a) => print("⚠ " + a.map(fmt).join(" ") + "\n", "ide-warn"),
        error: (...a) => print("✖ " + a.map(fmt).join(" ") + "\n", "ide-err"),
      };
      try {
        const result = new Function("console", `"use strict";\n${code.value}`)(fakeConsole);
        if (result !== undefined) print("→ " + fmt(result) + "\n", "ide-muted");
        print("\n[программа завершена]", "ide-muted");
      } catch (err) {
        print(String(err) + "\n", "ide-err");
      }
    });
  }

  /* ---------- мини-терминал (bash + git + docker, эмуляция) ---------- */
  function termHtml(promptText, title, hint) {
    return `
      <section class="ide term" aria-label="Учебный терминал">
        <div class="ide-head">
          <span class="ide-dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="ide-title">${esc(title)}</span>
          <span class="ide-btns">
            <button type="button" class="btn btn-outline btn-sm ide-btn-light" id="term-clear">Очистить</button>
          </span>
        </div>
        <div class="term-out ide-console" id="term-out" role="log" aria-label="Вывод терминала">
          <span class="ide-muted">${esc(hint)}\n</span>
        </div>
        <div class="term-line">
          <span class="term-prompt" id="term-prompt">${esc(promptText)}</span>
          <input id="term-input" class="term-input" autocomplete="off" spellcheck="false"
                 aria-label="Ввод команды">
        </div>
      </section>`;
  }

  function setupTerminal({ prompt, exec }) {
    const out = document.getElementById("term-out");
    const input = document.getElementById("term-input");
    const promptEl = document.getElementById("term-prompt");
    const history = [];
    let histPos = 0;

    const print = (text, cls) => {
      if (text === undefined || text === null || text === "") return;
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = text.endsWith("\n") ? text : text + "\n";
      out.appendChild(span);
      out.scrollTop = out.scrollHeight;
    };

    const run = async (line) => {
      print(promptEl.textContent + " " + line, "term-cmd");
      if (line.trim()) {
        history.push(line);
        histPos = history.length;
        await exec(line.trim(), { print, setPrompt: (p) => { promptEl.textContent = p; }, clear: () => { out.innerHTML = ""; } });
      }
    };

    input.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const line = input.value;
        input.value = "";
        await run(line);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (histPos > 0) input.value = history[--histPos] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (histPos < history.length) input.value = history[++histPos] || "";
        else input.value = "";
      }
    });

    document.getElementById("term-clear").addEventListener("click", () => { out.innerHTML = ""; });
    document.querySelector(".term").addEventListener("click", (e) => {
      if (window.getSelection().toString() === "" && e.target.tagName !== "BUTTON") input.focus();
    });

    // кнопки «Выполнить» у блоков кода: прогоняем строки блока по очереди
    document.querySelectorAll(".code-try").forEach((btn) => {
      btn.addEventListener("click", async () => {
        document.querySelector(".term").scrollIntoView({ behavior: "smooth", block: "center" });
        const lines = (codeSnippets[+btn.dataset.snippet] || "").split("\n");
        for (const raw of lines) {
          const line = raw.trim();
          if (!line || line.startsWith("#") || line.startsWith("--")) continue;
          await run(line);
        }
        input.focus();
      });
    });

    if (prompt) promptEl.textContent = prompt;
    return { print };
  }

  function initTerminal() {
    // виртуальная файловая система
    const mkdir = () => ({ type: "dir", children: {} });
    const root = mkdir();
    root.children.home = mkdir();
    root.children.home.children.student = mkdir();
    let cwd = ["home", "student"];
    let gitRepos = {}; // путь → состояние репозитория
    const docker = { images: new Set(), containers: [], nextId: 1 };
    const KNOWN_IMAGES = ["hello-world", "nginx", "ubuntu", "alpine", "python", "redis", "postgres", "node"];

    const pathKey = (p) => "/" + p.join("/");
    const homePrompt = () => {
      const p = pathKey(cwd).replace("/home/student", "~") || "/";
      return `student@codeway:${p}$`;
    };

    const nodeAt = (parts) => {
      let node = root;
      for (const part of parts) {
        if (node.type !== "dir" || !node.children[part]) return null;
        node = node.children[part];
      }
      return node;
    };

    const resolve = (path) => {
      const parts = path.startsWith("/") ? [] : [...cwd];
      const expanded = path.replace(/^~/, "/home/student");
      for (const seg of expanded.split("/")) {
        if (!seg || seg === ".") continue;
        if (seg === "..") parts.pop();
        else parts.push(seg);
      }
      return parts;
    };

    const repo = () => gitRepos[pathKey(cwd)];

    const shortHash = () => Math.random().toString(16).slice(2, 9);

    const commands = {
      help: (a, io) => io.print(
        "Учебный терминал CODE WAY. Поддерживаются:\n" +
        "  файлы:  pwd, ls, cd, mkdir, touch, cat, echo, rm, cp, mv, clear\n" +
        "  система: whoami, date, uname, history --help\n" +
        "  git:    init, status, add, commit, log, branch, checkout, switch, merge, remote, push, pull, clone\n" +
        "  docker: pull, images, run, ps, stop, start, rm, rmi, --version"
      ),
      pwd: (a, io) => io.print(pathKey(cwd)),
      whoami: (a, io) => io.print("student"),
      date: (a, io) => io.print(new Date().toString()),
      uname: (a, io) => io.print(a.includes("-a") ? "Linux codeway 6.8.0-edu x86_64 GNU/Linux" : "Linux"),
      clear: (a, io) => io.clear(),
      ls: (a, io) => {
        const showAll = a.includes("-a") || a.includes("-la") || a.includes("-al");
        const target = a.find((x) => !x.startsWith("-"));
        const node = target ? nodeAt(resolve(target)) : nodeAt(cwd);
        if (!node) return io.print(`ls: невозможно получить доступ к '${target}': Нет такого файла или каталога`, "ide-err");
        if (node.type === "file") return io.print(target);
        const names = Object.keys(node.children).sort();
        const visible = showAll ? [".", "..", ...names] : names;
        io.print(visible.map((n) => (node.children[n]?.type === "dir" ? n + "/" : n)).join("  ") || "");
      },
      cd: (a, io) => {
        const target = a[0] || "~";
        const parts = resolve(target);
        const node = nodeAt(parts);
        if (!node || node.type !== "dir") return io.print(`bash: cd: ${target}: Нет такого каталога`, "ide-err");
        cwd = parts;
        io.setPrompt(homePrompt());
      },
      mkdir: (a, io) => {
        if (!a[0]) return io.print("mkdir: пропущен операнд", "ide-err");
        for (const name of a.filter((x) => !x.startsWith("-"))) {
          const parts = resolve(name);
          const parent = nodeAt(parts.slice(0, -1));
          if (!parent) return io.print(`mkdir: '${name}': Нет такого каталога`, "ide-err");
          parent.children[parts.at(-1)] = mkdir();
        }
      },
      touch: (a, io) => {
        for (const name of a) {
          const parts = resolve(name);
          const parent = nodeAt(parts.slice(0, -1));
          if (parent) parent.children[parts.at(-1)] = { type: "file", content: "" };
        }
      },
      cat: (a, io) => {
        const node = nodeAt(resolve(a[0] || ""));
        if (!node || node.type !== "file") return io.print(`cat: ${a[0]}: Нет такого файла`, "ide-err");
        io.print(node.content || "");
      },
      echo: (a, io, rawArgs) => {
        const m = rawArgs.match(/^(.*?)\s*(>>?)\s*(\S+)\s*$/);
        const clean = (s) => s.replace(/^["']|["']$/g, "");
        if (m) {
          const parts = resolve(m[3]);
          const parent = nodeAt(parts.slice(0, -1));
          if (!parent) return io.print(`bash: ${m[3]}: Нет такого каталога`, "ide-err");
          const name = parts.at(-1);
          const prev = m[2] === ">>" && parent.children[name]?.type === "file"
            ? parent.children[name].content + "\n" : "";
          parent.children[name] = { type: "file", content: prev + clean(m[1]) };
        } else {
          io.print(clean(rawArgs));
        }
      },
      rm: (a, io) => {
        const target = a.find((x) => !x.startsWith("-"));
        if (!target) return io.print("rm: пропущен операнд", "ide-err");
        const parts = resolve(target);
        const parent = nodeAt(parts.slice(0, -1));
        const name = parts.at(-1);
        if (!parent || !parent.children[name]) return io.print(`rm: невозможно удалить '${target}': Нет такого файла или каталога`, "ide-err");
        if (parent.children[name].type === "dir" && !a.includes("-r") && !a.includes("-rf"))
          return io.print(`rm: невозможно удалить '${target}': Это каталог (используйте rm -r)`, "ide-err");
        delete parent.children[name];
      },
      cp: (a, io) => {
        const [src, dst] = a.filter((x) => !x.startsWith("-"));
        const node = nodeAt(resolve(src || ""));
        if (!node) return io.print(`cp: '${src}': Нет такого файла`, "ide-err");
        const parts = resolve(dst || "");
        const parent = nodeAt(parts.slice(0, -1));
        if (parent) parent.children[parts.at(-1)] = JSON.parse(JSON.stringify(node));
      },
      mv: (a, io) => {
        commands.cp(a, io);
        const src = a.filter((x) => !x.startsWith("-"))[0];
        const parts = resolve(src);
        const parent = nodeAt(parts.slice(0, -1));
        if (parent) delete parent.children[parts.at(-1)];
      },
      git: (a, io, rawArgs) => {
        const sub = a[0];
        const r = repo();
        const need = () => { io.print("fatal: не git-репозиторий (выполните git init)", "ide-err"); };
        switch (sub) {
          case "--version": return io.print("git version 2.43.0");
          case "init": {
            gitRepos[pathKey(cwd)] = { branch: "main", branches: { main: [] }, staged: [], remote: null };
            return io.print(`Инициализирован пустой репозиторий Git в ${pathKey(cwd)}/.git/`);
          }
          case "clone": {
            const url = a[1] || "";
            const name = url.split("/").pop().replace(/\.git$/, "") || "repo";
            const node = nodeAt(cwd);
            node.children[name] = mkdir();
            node.children[name].children["README.md"] = { type: "file", content: `# ${name}` };
            gitRepos[pathKey([...cwd, name])] = {
              branch: "main",
              branches: { main: [{ hash: shortHash(), msg: "Initial commit" }] },
              staged: [], remote: url,
            };
            io.print(`Клонирование в «${name}»…\nremote: Enumerating objects: 3, done.\nПолучение объектов: 100% (3/3), готово.`);
            return;
          }
          case "status": {
            if (!r) return need();
            const dir = nodeAt(cwd);
            const files = Object.keys(dir.children).filter((n) => dir.children[n].type === "file");
            const committed = new Set(r.branches[r.branch].flatMap((c) => c.files || []));
            const untracked = files.filter((f) => !r.staged.includes(f) && !committed.has(f));
            let s = `На ветке ${r.branch}\n`;
            if (r.staged.length) s += `\nИзменения, которые будут включены в коммит:\n${r.staged.map((f) => "\tновый файл:   " + f).join("\n")}\n`;
            if (untracked.length) s += `\nНеотслеживаемые файлы:\n${untracked.map((f) => "\t" + f).join("\n")}\n\t(используйте "git add <файл>", чтобы добавить их)`;
            if (!r.staged.length && !untracked.length) s += "нечего коммитить, рабочий каталог чист";
            return io.print(s);
          }
          case "add": {
            if (!r) return need();
            const dir = nodeAt(cwd);
            const files = Object.keys(dir.children).filter((n) => dir.children[n].type === "file");
            if (a[1] === "." || a[1] === "-A" || a[1] === "--all") r.staged = [...new Set([...r.staged, ...files])];
            else {
              for (const f of a.slice(1)) {
                if (!dir.children[f]) return io.print(`fatal: спецификация пути «${f}» не соответствует ни одному файлу`, "ide-err");
                if (!r.staged.includes(f)) r.staged.push(f);
              }
            }
            return;
          }
          case "commit": {
            if (!r) return need();
            if (!r.staged.length) return io.print("нечего коммитить (используйте git add)", "ide-err");
            const msgMatch = rawArgs.match(/-m\s+"([^"]+)"|-m\s+'([^']+)'|-m\s+(\S+)/);
            const msg = msgMatch ? (msgMatch[1] || msgMatch[2] || msgMatch[3]) : "commit";
            const hash = shortHash();
            r.branches[r.branch].push({ hash, msg, files: [...r.staged] });
            io.print(`[${r.branch} ${hash}] ${msg}\n ${r.staged.length} файл(ов) изменено`);
            r.staged = [];
            return;
          }
          case "log": {
            if (!r) return need();
            const commits = [...r.branches[r.branch]].reverse();
            if (!commits.length) return io.print(`fatal: у ветки «${r.branch}» ещё нет коммитов`, "ide-err");
            if (a.includes("--oneline")) return io.print(commits.map((c) => `${c.hash} ${c.msg}`).join("\n"));
            return io.print(commits.map((c) =>
              `commit ${c.hash}${c === commits[0] ? ` (HEAD -> ${r.branch})` : ""}\nAuthor: student <student@codeway.dev>\n\n    ${c.msg}\n`).join("\n"));
          }
          case "branch": {
            if (!r) return need();
            if (!a[1]) return io.print(Object.keys(r.branches).map((b) => (b === r.branch ? "* " + b : "  " + b)).join("\n"));
            r.branches[a[1]] = [...r.branches[r.branch]];
            return;
          }
          case "checkout":
          case "switch": {
            if (!r) return need();
            let name = a[1];
            if (name === "-b" || name === "-c") { name = a[2]; r.branches[name] = [...r.branches[r.branch]]; }
            if (!r.branches[name]) return io.print(`error: ветка «${name}» не найдена`, "ide-err");
            r.branch = name;
            return io.print(`Переключено на ветку «${name}»`);
          }
          case "merge": {
            if (!r) return need();
            const other = r.branches[a[1]];
            if (!other) return io.print(`merge: ${a[1]} — нет такой ветки`, "ide-err");
            const known = new Set(r.branches[r.branch].map((c) => c.hash));
            const added = other.filter((c) => !known.has(c.hash));
            r.branches[r.branch].push(...added);
            return io.print(added.length ? `Обновление до ${added.at(-1).hash}\nFast-forward\n ${added.length} коммит(ов) слито` : "Уже обновлено.");
          }
          case "remote": {
            if (!r) return need();
            if (a[1] === "add") { r.remote = a[3]; return; }
            return io.print(r.remote ? "origin" : "");
          }
          case "push": {
            if (!r) return need();
            if (!r.remote) return io.print("fatal: не настроен удалённый репозиторий (git remote add origin <url>)", "ide-err");
            return io.print(`Перечисление объектов: ${r.branches[r.branch].length}, готово.\nTo ${r.remote}\n   ${r.branch} -> ${r.branch}`);
          }
          case "pull": {
            if (!r) return need();
            return io.print("Уже обновлено.");
          }
          default:
            return io.print(`git: «${sub || ""}» не является командой git. См. git help`, "ide-err");
        }
      },
      docker: (a, io) => {
        const sub = a[0];
        const findC = (name) => docker.containers.find((c) => c.name === name || c.id.startsWith(name));
        switch (sub) {
          case "--version": return io.print("Docker version 27.0.3, build codeway-edu");
          case "pull": {
            const img = a[1];
            if (!img) return io.print("docker pull: требуется имя образа", "ide-err");
            docker.images.add(img.split(":")[0]);
            return io.print(`Using default tag: latest\nlatest: Pulling from library/${img}\nStatus: Downloaded newer image for ${img}:latest`);
          }
          case "images": {
            if (!docker.images.size) return io.print("REPOSITORY   TAG       IMAGE ID       SIZE");
            return io.print("REPOSITORY   TAG       IMAGE ID       SIZE\n" +
              [...docker.images].map((i) => `${i.padEnd(12)} latest    ${shortHash().padEnd(14)} ${(Math.random() * 200 + 5).toFixed(0)}MB`).join("\n"));
          }
          case "run": {
            const img = a.filter((x) => !x.startsWith("-") && x !== a.find((y, i) => a[i - 1] === "--name" || a[i - 1] === "-p")).pop();
            if (!img) return io.print("docker run: требуется имя образа", "ide-err");
            const base = img.split(":")[0];
            if (!docker.images.has(base) && !KNOWN_IMAGES.includes(base))
              return io.print(`Unable to find image '${img}' locally\ndocker: Error response from daemon: pull access denied for ${img}`, "ide-err");
            docker.images.add(base);
            const ni = a.indexOf("--name");
            const name = ni > -1 ? a[ni + 1] : base + "_" + docker.nextId;
            const id = shortHash() + shortHash().slice(0, 5);
            const detached = a.includes("-d");
            docker.containers.push({ id, name, image: img, status: detached ? "Up" : "Exited (0)" });
            docker.nextId += 1;
            if (base === "hello-world")
              return io.print("Hello from Docker!\nThis message shows that your installation appears to be working correctly.");
            return io.print(detached ? id : `[контейнер ${name} из образа ${img} выполнен и завершился]`);
          }
          case "ps": {
            const list = a.includes("-a") ? docker.containers : docker.containers.filter((c) => c.status === "Up");
            return io.print("CONTAINER ID   IMAGE        STATUS       NAMES\n" +
              list.map((c) => `${c.id.slice(0, 12)}   ${c.image.padEnd(12)} ${c.status.padEnd(12)} ${c.name}`).join("\n"));
          }
          case "stop": {
            const c = findC(a[1] || "");
            if (!c) return io.print(`Error: контейнер «${a[1]}» не найден`, "ide-err");
            c.status = "Exited (0)";
            return io.print(a[1]);
          }
          case "start": {
            const c = findC(a[1] || "");
            if (!c) return io.print(`Error: контейнер «${a[1]}» не найден`, "ide-err");
            c.status = "Up";
            return io.print(a[1]);
          }
          case "rm": {
            const c = findC(a[1] || "");
            if (!c) return io.print(`Error: контейнер «${a[1]}» не найден`, "ide-err");
            docker.containers = docker.containers.filter((x) => x !== c);
            return io.print(a[1]);
          }
          case "rmi": {
            docker.images.delete((a[1] || "").split(":")[0]);
            return io.print(`Untagged: ${a[1]}:latest`);
          }
          default:
            return io.print(`docker: «${sub || ""}» не поддерживается в учебном терминале. Доступно: pull, images, run, ps, stop, start, rm, rmi`, "ide-err");
        }
      },
      history: (a, io) => io.print("используй стрелки ↑/↓ для навигации по истории команд"),
      python: (a, io) => io.print("Учебный терминал не запускает Python — используй IDE в курсе Python 🙂"),
      python3: (a, io) => commands.python(a, io),
      sudo: (a, io, raw) => io.print("student не требуется sudo в учебном терминале — команды выполняются напрямую"),
    };

    setupTerminal({
      prompt: homePrompt(),
      exec: (line, io) => {
        const [cmd, ...args] = line.split(/\s+/);
        const rawArgs = line.slice(cmd.length).trim();
        const handler = commands[cmd];
        if (!handler) return io.print(`bash: ${cmd}: команда не найдена (введите help)`, "ide-err");
        return handler(args, io, rawArgs);
      },
    });
  }

  /* ---------- SQL-консоль (настоящий SQLite через sql.js) ---------- */
  const SQLJS_URL = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/";
  let sqlJsPromise = null;

  function loadSqlJsOnce() {
    if (!sqlJsPromise) {
      sqlJsPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = SQLJS_URL + "sql-wasm.js";
        s.onload = () =>
          window.initSqlJs({ locateFile: (f) => SQLJS_URL + f }).then(resolve, reject);
        s.onerror = () => reject(new Error("Не удалось загрузить SQLite. Проверьте интернет-соединение."));
        document.head.appendChild(s);
      }).catch((e) => { sqlJsPromise = null; throw e; });
    }
    return sqlJsPromise;
  }

  const SQL_SEED = `
    CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER, course TEXT);
    INSERT INTO students (name, age, course) VALUES
      ('Алина', 20, 'SQL с нуля'), ('Данияр', 19, 'SQL с нуля'),
      ('Мария', 22, 'Python с нуля'), ('Тимур', 21, 'Python с нуля'),
      ('Айгерим', 18, 'JavaScript с нуля'), ('Олег', 23, 'SQL с нуля');
    CREATE TABLE orders (id INTEGER PRIMARY KEY, student_id INTEGER, book_name TEXT);
    INSERT INTO orders (student_id, book_name) VALUES
      (1, 'Гарри Поттер'), (1, 'Властелин колец'), (2, 'SQL для всех'), (3, 'Чистый код');
    CREATE TABLE payments (id INTEGER PRIMARY KEY, student_id INTEGER, amount INTEGER);
    INSERT INTO payments (student_id, amount) VALUES (1, 15000), (2, 20000), (4, 15000);
  `;

  function formatSqlResult(res) {
    if (!res.length) return "OK (запрос выполнен, строк не возвращено)";
    return res.map(({ columns, values }) => {
      const rows = [columns, ...values.map((r) => r.map((v) => (v === null ? "NULL" : String(v))))];
      const widths = columns.map((_, i) => Math.max(...rows.map((r) => r[i].length)));
      const line = (r) => "| " + r.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |";
      const sep = "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+";
      return [sep, line(rows[0]), sep, ...rows.slice(1).map(line), sep,
        `${values.length} строк(и)`].join("\n");
    }).join("\n\n");
  }

  function initSqlConsole() {
    let db = null;
    setupTerminal({
      prompt: "sqlite>",
      exec: async (line, io) => {
        try {
          if (!db) {
            io.print("Загружаю SQLite…", "ide-muted");
            const SQL = await loadSqlJsOnce();
            db = new SQL.Database();
            db.run(SQL_SEED);
            io.print("SQLite готова. Демо-таблицы: students, orders, payments (см. .tables)", "ide-muted");
          }
          if (line === ".tables") {
            const res = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
            return io.print(res[0].values.map((v) => v[0]).join("  "));
          }
          if (line === ".reset") {
            db.close(); db = null;
            return io.print("База сброшена — при следующем запросе создастся заново.", "ide-muted");
          }
          if (line.startsWith(".")) return io.print("Поддерживаются: .tables, .reset и любые SQL-запросы", "ide-muted");
          io.print(formatSqlResult(db.exec(line)));
        } catch (err) {
          io.print("Ошибка SQL: " + String(err.message || err), "ide-err");
        }
      },
    });
  }

  async function pageCourses() {
    app.innerHTML = `
      <div class="page-head"><h1>Каталог курсов</h1></div>
      <form class="searchbar" id="search-form" role="search">
        <input type="search" id="search-input" placeholder="Поиск по названию…" aria-label="Поиск курсов" autocomplete="off">
        <button class="btn btn-primary" type="submit">Найти</button>
      </form>
      <div id="course-grid" class="grid"><p class="loading">Загрузка…</p></div>`;

    async function load(q) {
      const courses = await apiJson("/courses/" + (q ? "?search=" + encodeURIComponent(q) : ""));
      document.getElementById("course-grid").innerHTML =
        courses.map(courseCard).join("") || `<p class="empty">Ничего не найдено.</p>`;
    }
    document.getElementById("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      load(document.getElementById("search-input").value.trim());
    });
    await load("");
  }

  async function pageCourse(id) {
    const c = await apiJson(`/courses/${id}/`);
    const modules = c.modules.map((m) => {
      const open = c.is_enrolled && !m.locked;
      const showLock = c.is_enrolled && m.locked;
      const quizRow = m.quiz ? `
        <li class="lesson-item module-quiz-item">
          <span class="lesson-status" aria-hidden="true">${m.quiz.passed ? "🏅" : "📝"}</span>
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
        <h3>${showLock ? "🔒 " : ""}${esc(m.title)}</h3>
        ${showLock ? `<p class="lock-note">Модуль откроется после сдачи теста предыдущего модуля минимум на 75%.</p>` : ""}
        <ul class="lesson-list">
          ${m.lessons.map((l) => `
            <li class="lesson-item">
              <span class="lesson-status" aria-label="${l.completed ? "Пройден" : "Не пройден"}">${l.completed ? "✅" : "📖"}</span>
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

  async function pageLesson(id) {
    if (!requireAuth()) return;
    const l = await apiJson(`/courses/lessons/${id}/`);

    const runner = RUNNERS[l.course_runner] || null;
    tryLangs = runner ? runner.langs : [];
    tryLabel = runner ? runner.label : "";
    const theory = mdToHtml(l.content || "");

    let practice = "";
    if (l.course_runner === "python") {
      const starter = codeSnippets[0] || 'print("Привет, CODE WAY!")';
      practice = `
        <h2 class="section-title">${runner.heading}</h2>
        <p class="form-hint" style="margin-bottom:12px">Скопируй пример кнопкой «${tryLabel}» у любого блока кода или напиши свой — код выполнится прямо в браузере (Python загрузится при первом запуске, 10–20 сек).</p>
        ${ideHtml(starter, "main.py — CODE WAY IDE", "Консоль. Нажми «Запустить», чтобы выполнить код.")}`;
    } else if (l.course_runner === "javascript") {
      const starter = codeSnippets[0] || 'console.log("Привет, CODE WAY!");';
      practice = `
        <h2 class="section-title">${runner.heading}</h2>
        <p class="form-hint" style="margin-bottom:12px">Скопируй пример кнопкой «${tryLabel}» или напиши свой код — он выполнится в браузере. Вывод console.log появится в консоли ниже.</p>
        ${ideHtml(starter, "main.js — CODE WAY IDE", "Консоль. Нажми «Запустить», чтобы выполнить код.")}`;
    } else if (l.course_runner === "terminal") {
      practice = `
        <h2 class="section-title">${runner.heading}</h2>
        <p class="form-hint" style="margin-bottom:12px">Эмулятор терминала: базовые команды Linux, git и docker. Нажми «${tryLabel}» у блока команд или вводи команды сам (help — список).</p>
        ${termHtml("student@codeway:~$", "терминал — CODE WAY", "Учебный терминал CODE WAY. Введи help, чтобы увидеть доступные команды.")}`;
    } else if (l.course_runner === "sql") {
      practice = `
        <h2 class="section-title">${runner.heading}</h2>
        <p class="form-hint" style="margin-bottom:12px">Настоящая SQLite прямо в браузере. Демо-таблицы students, orders и payments уже созданы — пробуй запросы из урока (кнопка «${tryLabel}») или пиши свои.</p>
        ${termHtml("sqlite>", "SQL-консоль — CODE WAY", "SQL-консоль. Введи запрос, например: SELECT * FROM students;")}`;
    }

    app.innerHTML = `
      <div class="page-head">
        <h1>${esc(l.title)}</h1>
        <p class="form-hint">📚 Теория · ${l.duration_minutes} мин · ${l.completed ? "✅ пройден" : "ещё не пройден"}</p>
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
            ? "🎉 Курс завершён! Сертификат в личном кабинете."
            : `Урок пройден. Прогресс курса: ${r.course_progress}%`);
          pageLesson(id);
        } catch (e) { toast(e.message); btn.disabled = false; }
      });
    }
  }

  async function pageQuiz(id) {
    if (!requireAuth()) return;
    const q = await apiJson(`/assessments/quizzes/${id}/`);
    app.innerHTML = `
      <div class="page-head">
        <h1>${esc(q.title)}</h1>
        <p class="form-hint">Проходной балл: ${q.pass_score}%.
          ${q.best_score !== null ? `Лучший результат: ${q.best_score}%.` : "Первая попытка."}
          ${q.passed ? " ✅ Тест сдан." : ""}</p>
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
            <p><strong>${r.passed ? "Тест сдан! 🎉" : "Тест не сдан."}</strong>
               Правильных ответов: ${r.correct} из ${r.total} (проходной балл ${r.pass_score}%).</p>
            ${r.passed && q.module ? "<p>🔓 Следующий модуль курса открыт!</p>" : ""}
            ${!r.passed && q.module ? "<p>Следующий модуль откроется после сдачи этого теста минимум на " + r.pass_score + "%. Перечитай уроки модуля и попробуй ещё раз.</p>" : ""}
            ${r.certificate_issued ? "<p>🏆 Курс завершён — сертификат уже в личном кабинете!</p>" : ""}
            <div class="lesson-actions" style="justify-content:center">
              ${!r.passed ? `<a class="btn btn-primary" href="#/quiz/${id}" onclick="location.reload()">Попробовать ещё раз</a>` : ""}
              <a class="btn btn-outline" href="#/dashboard">В личный кабинет</a>
            </div>
          </div>`;
      } catch (err) { toast(err.message); }
    });
  }

  async function pageHomework(id) {
    if (!requireAuth()) return;
    const hw = await apiJson(`/assessments/homeworks/${id}/`);
    const s = hw.my_submission;
    const statusBadge = s
      ? `<span class="badge ${{ accepted: "badge-success", submitted: "badge-pending", rejected: "badge-danger" }[s.status]
      }">${esc(s.status_display)}${s.grade != null ? " · " + s.grade + " баллов" : ""}</span>`
      : "";

    app.innerHTML = `
      <div class="page-head">
        <h1>${esc(hw.title)}</h1>
        ${statusBadge}
      </div>
      <div class="lesson-content">${esc(hw.description)}</div>
      ${s && s.teacher_comment ? `
        <div class="card" style="margin-bottom:22px">
          <h3>Комментарий преподавателя</h3>
          <p>${esc(s.teacher_comment)}</p>
        </div>` : ""}
      ${s && s.status === "accepted"
        ? `<p class="empty">✅ Задание принято — отправка закрыта.</p>`
        : `
      <form class="form-card" id="hw-form" style="max-width:640px">
        <h3>${s ? "Отправить новое решение" : "Отправить решение"}</h3>
        <div class="field">
          <label for="hw-text">Текст решения</label>
          <textarea id="hw-text" name="text" placeholder="Вставьте код или опишите решение…"></textarea>
        </div>
        <div class="field">
          <label for="hw-file">Файл (по желанию)</label>
          <input type="file" id="hw-file" name="file">
        </div>
        <button class="btn btn-primary" type="submit">Отправить на проверку</button>
      </form>`}`;

    const form = document.getElementById("hw-form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append("text", document.getElementById("hw-text").value);
        const file = document.getElementById("hw-file").files[0];
        if (file) fd.append("file", file);
        try {
          await apiJson(`/assessments/homeworks/${id}/submit/`, { method: "POST", body: fd });
          toast("Решение отправлено на проверку!");
          pageHomework(id);
        } catch (err) { toast(err.message); }
      });
    }
  }

  const DASH_TABS = [
    ["overview", "📊", "Обзор"],
    ["courses", "📚", "Мои курсы"],
    ["certificates", "🏆", "Сертификаты"],
    ["quizzes", "📝", "Тесты"],
    ["homework", "📤", "Домашние задания"],
    ["profile", "⚙️", "Профиль"],
  ];

  async function pageDashboard(tab) {
    if (!requireAuth()) return;
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
          : `<p class="empty">Пройдите курс полностью — и здесь появится сертификат. 🏆</p>`}`,

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
            <textarea id="pf-bio">${esc(u.profile?.bio || "")}</textarea>
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
            ${DASH_TABS.map(([key, icon, label]) => `
              <a href="#/dashboard/${key}" class="${key === tab ? "active" : ""}"
                 ${key === tab ? 'aria-current="page"' : ""}>
                <span aria-hidden="true">${icon}</span> ${label}
              </a>`).join("")}
            <a href="#/logout" class="dash-logout"><span aria-hidden="true">↩</span> Выйти</a>
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
            profile: { bio: document.getElementById("pf-bio").value },
          }),
        });
        toast("Профиль сохранён.");
      } catch (err) { toast(err.message); }
    });
  }

  const LAUREL_SVG = `
    <svg class="laurel" viewBox="0 0 42 92" aria-hidden="true">
      <path d="M36,90 C16,72 8,48 20,4" stroke="#E8B23A" stroke-width="2.5" fill="none"/>
      <g fill="#E8B23A">
        <ellipse cx="30" cy="78" rx="10" ry="4" transform="rotate(-40 30 78)"/>
        <ellipse cx="22" cy="64" rx="10" ry="4" transform="rotate(-55 22 64)"/>
        <ellipse cx="17" cy="49" rx="10" ry="4" transform="rotate(-70 17 49)"/>
        <ellipse cx="15" cy="34" rx="10" ry="4" transform="rotate(-85 15 34)"/>
        <ellipse cx="17" cy="19" rx="10" ry="4" transform="rotate(-100 17 19)"/>
        <ellipse cx="23" cy="8" rx="9" ry="3.5" transform="rotate(-115 23 8)"/>
      </g>
    </svg>`;

  const SEAL_SVG = `
    <svg class="cert-seal" viewBox="0 0 132 132" aria-hidden="true">
      <defs>
        <linearGradient id="sealGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#6D28D9"/>
        </linearGradient>
        <path id="sealArcTop" d="M 66,66 m -40,0 a 40,40 0 1,1 80,0"/>
        <path id="sealArcBot" d="M 66,66 m -40,0 a 40,40 0 1,0 80,0"/>
      </defs>
      <circle cx="66" cy="66" r="62" fill="url(#sealGrad)"/>
      <circle cx="66" cy="66" r="52" fill="#FBFDFF" stroke="#E8B23A" stroke-width="2" stroke-dasharray="5 4"/>
      <text font-size="10.5" font-weight="800" fill="#16243D" letter-spacing="2.2">
        <textPath href="#sealArcTop" startOffset="50%" text-anchor="middle">CODE WAY</textPath>
      </text>
      <text font-size="8" font-weight="700" fill="#56657F" letter-spacing="1.4">
        <textPath href="#sealArcBot" startOffset="50%" text-anchor="middle">ШКОЛА ПРОГРАММИРОВАНИЯ</textPath>
      </text>
      <text x="66" y="74" text-anchor="middle" font-size="24" font-weight="800"
            font-family="Consolas, monospace" fill="#2563EB">&lt;/&gt;</text>
      <text x="66" y="92" text-anchor="middle" font-size="13" fill="#E8B23A">★ ★ ★</text>
    </svg>`;

  async function pageCertificate(number) {
    const c = await apiJson(`/certificates/verify/${encodeURIComponent(number)}/`);
    const issued = new Date(c.issued_at).toLocaleDateString("ru-RU");
    const langmark = /python/i.test(c.course_title) ? "🐍" : /django|веб/i.test(c.course_title) ? "🌐" : "🎓";
    const verifyUrl = `${location.host}/#/certificate/${esc(c.number)}`;

    app.innerHTML = `
      <div class="cert-wrap">
        <div class="cert">
          <div class="cert-inner">
            <span class="cert-wedge w-tl"></span>
            <span class="cert-wedge w-tr-gold"></span>
            <span class="cert-wedge w-tr"></span>
            <span class="cert-wedge w-bl-gold"></span>
            <span class="cert-wedge w-bl"></span>
            <span class="cert-wedge w-br"></span>

            <div class="cert-brandmark"><img src="/static/logo.png" alt="CODE WAY"></div>
            <div class="cert-langmark" aria-hidden="true">${langmark}</div>

            <div class="cert-pill">Онлайн школа программирования</div>
            <h2 class="cert-title">СЕРТИФИКАТ</h2>
            <div class="cert-sub">об успешном прохождении курса</div>

            <p class="cert-confirm">Настоящим подтверждается, что</p>
            <div class="cert-name-row">
              ${LAUREL_SVG}
              <div class="cert-name">${esc(c.user_name)}</div>
              ${LAUREL_SVG.replace('class="laurel"', 'class="laurel right"')}
            </div>
            <div class="cert-star">★ ★ ★ ★ ★</div>

            <p class="cert-confirm">полностью прошёл(ла) программу курса</p>
            <div class="cert-ribbon"><span class="rb">«${esc(c.course_title)}»</span></div>

            <div class="cert-bottom">
              <div class="cert-info">
                <div class="row"><span class="ico">📜</span> Сертификат № <strong>&nbsp;${esc(c.number)}</strong></div>
                <div class="row"><span class="ico">📅</span> Дата выдачи: <strong>&nbsp;${issued}</strong></div>
                <div class="row"><span class="ico">🔍</span> Проверка подлинности: ${verifyUrl}</div>
              </div>
              ${SEAL_SVG}
              <div class="cert-sign">
                <div class="script">Е. Куреда</div>
                <div class="who">Е. Куреда</div>
                <div class="role">Руководитель школы<br>CODE WAY</div>
              </div>
            </div>

            <div class="cert-motto">
              <span class="trophy">🏆</span>
              ТВОЙ ПУТЬ В <b>IT</b><br>НАЧИНАЕТСЯ ЗДЕСЬ
            </div>
          </div>
        </div>
      </div>
      <div class="lesson-actions no-print" style="justify-content:center;margin-top:24px">
        <button class="btn btn-primary" onclick="window.print()">Распечатать / сохранить PDF</button>
        <a class="btn btn-outline" href="#/dashboard">В личный кабинет</a>
      </div>`;
  }

  function pageLogin() {
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

  function pageRegister() {
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

  function pageLogout() {
    tokens.clear();
    localStorage.removeItem("username");
    renderNav();
    toast("Вы вышли из аккаунта.");
    location.hash = "#/";
  }

  /* ---------- роутер ---------- */
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

  async function route() {
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

  window.addEventListener("hashchange", route);
  renderNav();
  route();
})();
