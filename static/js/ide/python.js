/* Эмулятор IDE: исполнение Python в браузере через Pyodide. */
import { setupIdeShell } from "./shell.js";

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

export function initIde() {
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
