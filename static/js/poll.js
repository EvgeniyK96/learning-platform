/* Единый управляемый поллинг для страниц с «живым» обновлением (чат).
   Активен только один поллер; роутер вызывает stopPolling() при переходе,
   чтобы фоновые запросы не копились после ухода со страницы. */

let timer = null;

export function startPolling(fn, ms) {
  stopPolling();
  timer = setInterval(fn, ms);
}

export function stopPolling() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
