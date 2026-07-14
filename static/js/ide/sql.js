/* SQL-консоль: настоящий SQLite в браузере через sql.js (WASM). */
import { setupTerminal } from "./terminal.js";

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

export function initSqlConsole() {
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
