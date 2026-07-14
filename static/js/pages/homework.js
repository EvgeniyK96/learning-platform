/* Домашнее задание: условие, отправка решения (текст/файл), статус проверки. */
import { api, apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { icon } from "../icons.js";

export async function pageHomework(id) {
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
    ${s && s.file_url ? `
      <p class="form-hint" style="margin-bottom:16px">${icon("paperclip")} Прикреплён файл:
        <a href="#" id="hw-download" data-url="${esc(s.file_url)}" data-name="${esc(s.file_name || "файл")}">${esc(s.file_name || "скачать")}</a>
      </p>` : ""}
    ${s && s.teacher_comment ? `
      <div class="card" style="margin-bottom:22px">
        <h3>Комментарий преподавателя</h3>
        <p>${esc(s.teacher_comment)}</p>
      </div>` : ""}
    ${s && s.status === "accepted"
      ? `<p class="empty">${icon("check-circle")} Задание принято — отправка закрыта.</p>`
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
        <p class="form-hint">До 10 МБ. Разрешены документы, архивы, изображения и файлы с кодом (не .exe/.bat и т.п.).</p>
      </div>
      <button class="btn btn-primary" type="submit">Отправить на проверку</button>
    </form>`}`;

  const download = document.getElementById("hw-download");
  if (download) {
    download.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const res = await api(download.dataset.url.replace("/api", ""));
        if (!res.ok) throw new Error("Не удалось скачать файл");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = download.dataset.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) { toast(err.message); }
    });
  }

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
