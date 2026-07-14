/* CODE WAY SPA — точка входа: инициализация навигации и роутера. */
import { renderNav, initBurger } from "./nav.js";
import { route } from "./router.js";

initBurger();
renderNav();
route();
window.addEventListener("hashchange", route);
