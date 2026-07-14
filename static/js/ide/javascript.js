/* JS-песочница: исполнение кода в изолированной функции с перехватом console. */
import { setupIdeShell } from "./shell.js";

export function initJsIde() {
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
