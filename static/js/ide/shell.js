/* Общая обвязка редактора кода: разметка IDE, нумерация строк, Tab,
   Ctrl+Enter, вывод в консоль и кнопки «Попробовать» у блоков кода. */
import { esc } from "../api.js";
import { runtime } from "../state.js";

export function ideHtml(starterCode, title, hint) {
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

export function setupIdeShell(runHandler) {
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
      code.value = runtime.codeSnippets[+btn.dataset.snippet] || "";
      renderGutter();
      document.querySelector(".ide").scrollIntoView({ behavior: "smooth", block: "center" });
      code.focus();
    });
  });
  return shell;
}
