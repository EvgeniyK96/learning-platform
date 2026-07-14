/* Переиспользуемые HTML-фрагменты: обложки, карточки курсов/менторов, SVG сертификата. */
import { esc } from "./api.js";
import { COVERS, levelName } from "./data.js";

export function courseCover(c) {
  if (c.cover) return `<img class="course-cover-img" src="${esc(c.cover)}" alt="">`;
  const cover = COVERS[c.language] || { icon: "💻", grad: "linear-gradient(135deg,#16243D,#2563EB)" };
  return `
    <div class="course-cover" style="background:${cover.grad}" aria-hidden="true">
      <span class="cover-icon">${cover.icon}</span>
      <span class="cover-lang">${esc(c.language || "Код")}</span>
    </div>`;
}

export function courseCard(c) {
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

export const mentorCard = (m) => `
  <article class="mentor-card">
    <span class="mentor-avatar" style="background:${m.hue}" aria-hidden="true">${esc(m.avatar)}</span>
    <h3>${esc(m.name)}</h3>
    <p class="mentor-role">${esc(m.role)}</p>
    <p class="desc">${esc(m.exp)}</p>
  </article>`;

export const LAUREL_SVG = `
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

export const SEAL_SVG = `
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
