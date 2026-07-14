/* Сертификат: печатная A4-раскладка с проверкой подлинности по номеру. */
import { apiJson, esc } from "../api.js";
import { app } from "../dom.js";
import { LAUREL_SVG, SEAL_SVG } from "../components.js";
import { icon } from "../icons.js";

export async function pageCertificate(number) {
  const c = await apiJson(`/certificates/verify/${encodeURIComponent(number)}/`);
  const issued = new Date(c.issued_at).toLocaleDateString("ru-RU");
  const langmark = /python/i.test(c.course_title) ? icon("code") : /django|веб/i.test(c.course_title) ? icon("monitor") : icon("graduation-cap");
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
              <div class="row">${icon("file-text", "cert-ico")} Сертификат № <strong>&nbsp;${esc(c.number)}</strong></div>
              <div class="row">${icon("calendar", "cert-ico")} Дата выдачи: <strong>&nbsp;${issued}</strong></div>
              <div class="row">${icon("shield-check", "cert-ico")} Проверка подлинности: ${verifyUrl}</div>
            </div>
            ${SEAL_SVG}
            <div class="cert-sign">
              <div class="script">Е. Куреда</div>
              <div class="who">Е. Куреда</div>
              <div class="role">Руководитель школы<br>CODE WAY</div>
            </div>
          </div>

          <div class="cert-motto">
            <span class="trophy">${icon("trophy")}</span>
            ТВОЙ ПУТЬ В <b>IT</b><br>НАЧИНАЕТСЯ ЗДЕСЬ
          </div>
        </div>
      </div>
    </div>
    <div class="lesson-actions no-print" style="justify-content:center;margin-top:24px">
      <button class="btn btn-primary" onclick="window.print()">Распечатать / сохранить PDF</button>
      <a class="btn btn-outline" href="#/dashboard">В личный кабинет</a>
    </div>
    <p class="form-hint no-print" style="text-align:center;margin-top:10px">
      Формат печати: A4, альбомная ориентация — сертификат занимает ровно один лист.
      Ориентация выбирается автоматически; если браузер спросит — укажите «Альбомная».
    </p>`;
}
