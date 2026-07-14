/* Каталог курсов с поиском. */
import { apiJson } from "../api.js";
import { app } from "../dom.js";
import { courseCard } from "../components.js";

export async function pageCourses() {
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
