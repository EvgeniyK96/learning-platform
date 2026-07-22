/* Чат ученик ↔ преподаватель: список диалогов + переписка.
   Новые сообщения подтягиваются опросом (polling) раз в несколько секунд. */
import { apiJson, esc, requireAuth, toast } from "../api.js";
import { app } from "../dom.js";
import { icon } from "../icons.js";
import { startPolling } from "../poll.js";
import { refreshUnread } from "../nav.js";

export async function pageChat(partnerId) {
  if (!requireAuth()) return;
  const pid = partnerId ? Number(partnerId) : null;

  app.innerHTML = `
    <div class="chat" ${pid ? 'data-open="1"' : ""}>
      <aside class="chat-contacts" id="chat-contacts"><p class="loading">Загрузка…</p></aside>
      <section class="chat-thread" id="chat-thread">
        ${pid ? `<p class="loading">Загрузка…</p>`
          : `<div class="chat-empty">${icon("message-square")}<p>Выберите диалог слева, чтобы начать переписку.</p></div>`}
      </section>
    </div>`;

  await loadContacts(pid);
  if (pid) {
    await loadThread(pid);
    startPolling(async () => {
      await updateMessages(pid);
      await loadContacts(pid, true);
    }, 4000);
  } else {
    startPolling(() => loadContacts(null, true), 8000);
  }
}

/* ---------- Список диалогов ---------- */

async function loadContacts(activeId, silent) {
  const box = document.getElementById("chat-contacts");
  if (!box) return;
  let contacts;
  try {
    contacts = await apiJson("/chat/contacts/");
  } catch (e) {
    if (!silent) box.innerHTML = `<p class="empty">${esc(e.message)}</p>`;
    return;
  }
  const head = `<div class="chat-contacts-head">Диалоги</div>`;
  if (!contacts.length) {
    box.innerHTML = head + `<p class="empty" style="padding:18px">Пока нет собеседников. Они появятся, когда вы запишетесь на курс — или когда к вам запишется ученик.</p>`;
    return;
  }
  box.innerHTML = head + contacts.map((c) => `
    <a class="chat-contact ${c.id === activeId ? "active" : ""}" href="#/chat/${c.id}">
      <span class="chat-avatar">${esc((c.name[0] || "?").toUpperCase())}</span>
      <span class="chat-contact-main">
        <span class="chat-contact-name">${esc(c.name)}${c.is_teacher ? ' <span class="chat-role">препод.</span>' : ""}</span>
        <span class="chat-contact-last">${esc(c.last_message || "нет сообщений")}</span>
      </span>
      ${c.unread ? `<span class="chat-unread">${c.unread}</span>` : ""}
    </a>`).join("");
}

/* ---------- Переписка ---------- */

async function loadThread(partnerId) {
  const pane = document.getElementById("chat-thread");
  if (!pane) return;
  let data;
  try {
    data = await apiJson(`/chat/thread/${partnerId}/`);
  } catch (e) {
    pane.innerHTML = `<div class="chat-empty"><p>${esc(e.message)}</p><a class="btn btn-outline btn-sm" href="#/chat">К диалогам</a></div>`;
    return;
  }
  const p = data.partner;
  pane.innerHTML = `
    <div class="chat-thread-head">
      <a class="chat-back" href="#/chat" aria-label="Назад к диалогам">${icon("arrow-left")}</a>
      <span class="chat-avatar">${esc((p.name[0] || "?").toUpperCase())}</span>
      <div>
        <div class="chat-thread-name">${esc(p.name)}</div>
        <div class="sub-meta">${p.is_teacher ? "Преподаватель" : "Ученик"}</div>
      </div>
    </div>
    <div class="chat-messages" id="chat-msgs"></div>
    <form class="chat-input" id="chat-form">
      <textarea id="chat-text" rows="1" placeholder="Сообщение…" autocomplete="off"></textarea>
      <button class="btn btn-primary" type="submit" aria-label="Отправить">${icon("send")}</button>
    </form>`;
  renderMessages(data.messages);
  refreshUnread();

  const form = document.getElementById("chat-form");
  const text = document.getElementById("chat-text");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = text.value.trim();
    if (!body) return;
    text.value = "";
    try {
      await apiJson(`/chat/thread/${partnerId}/`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      await updateMessages(partnerId);
      await loadContacts(partnerId, true);
    } catch (err) {
      toast(err.message);
      text.value = body;
    }
  });
  text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}

async function updateMessages(partnerId) {
  if (!document.getElementById("chat-msgs")) return;
  try {
    const data = await apiJson(`/chat/thread/${partnerId}/`);
    renderMessages(data.messages);
    refreshUnread();
  } catch (_) { /* тихо — следующий тик попробует снова */ }
}

function renderMessages(messages) {
  const box = document.getElementById("chat-msgs");
  if (!box) return;
  box.innerHTML = messages.length ? messages.map((m) => `
    <div class="chat-msg ${m.mine ? "mine" : ""}">
      <div class="chat-bubble">${esc(m.body)}</div>
      <div class="chat-time">${new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
    </div>`).join("") : `<p class="empty">Сообщений пока нет. Напишите первым.</p>`;
  box.scrollTop = box.scrollHeight;
}
