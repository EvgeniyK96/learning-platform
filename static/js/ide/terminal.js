/* Мини-терминал: эмуляция bash + git + docker на виртуальной ФС. */
import { esc } from "../api.js";
import { runtime } from "../state.js";

export function termHtml(promptText, title, hint) {
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

export function setupTerminal({ prompt, exec }) {
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
      const lines = (runtime.codeSnippets[+btn.dataset.snippet] || "").split("\n");
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

export function initTerminal() {
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
    python: (a, io) => io.print("Учебный терминал не запускает Python — используй IDE в курсе Python"),
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
