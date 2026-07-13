# Модуль 6. DOM: работа со страницей

---

## Урок 6.1. Что такое DOM, дерево документа
**Время: 35 минут**

### Цель урока
Понять концепцию DOM (Document Object Model) и то, как браузер представляет HTML-страницу в виде дерева объектов, доступных для JavaScript.

### 1. Что такое DOM

DOM (Document Object Model — объектная модель документа) — это представление HTML-страницы в виде дерева объектов, с которым может взаимодействовать JavaScript. Именно благодаря DOM JavaScript может изменять содержимое, структуру и стили страницы после её загрузки.

```html
<body>
    <h1>Заголовок</h1>
    <p>Текст</p>
</body>
```

Такая структура HTML превращается браузером в дерево объектов, каждый узел которого — это отдельный элемент (`h1`, `p`), доступный из JavaScript.

### 2. Объект document

Точкой входа для работы с DOM служит глобальный объект `document`, представляющий всю HTML-страницу:

```javascript
console.log(document.title);        // заголовок страницы (тег <title>)
console.log(document.body);         // весь тег <body>
console.log(document.URL);           // адрес текущей страницы
```

### 3. Узлы DOM-дерева

Каждый элемент HTML-страницы становится узлом (node) в DOM-дереве. Узлы могут быть вложены друг в друга — например, `<p>` внутри `<body>` является «потомком» (child) элемента `<body>`, а `<body>` — «родителем» (parent) для `<p>`.

### 4. Просмотр DOM через DevTools

Во вкладке **Elements** панели разработчика (`F12`) отображается актуальное состояние DOM — оно может отличаться от исходного HTML-файла, если JavaScript уже изменил страницу после её загрузки.

### 5. Событие загрузки страницы

Важно, чтобы JavaScript начинал работать с DOM только после того, как страница полностью загружена. Для этого используется событие `DOMContentLoaded`:

```javascript
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM полностью загружен и готов к работе");
});
```

(Если скрипт подключён в конце `<body>` или с атрибутом `defer`, эта проблема, как правило, уже решена — см. Урок 1.3.)

### 6. Разница между HTML-документом и DOM

Важно понимать: DOM — это не сам HTML-файл, а его представление в памяти браузера, с которым и работает JavaScript. Изменения, которые JavaScript вносит в DOM, видны пользователю на странице, но не изменяют исходный HTML-файл на диске.

### Резюме урока

- DOM — представление HTML-страницы в виде дерева объектов, с которым взаимодействует JavaScript.
- Точка входа для работы с DOM — глобальный объект `document`.
- Работать с DOM стоит только после полной загрузки страницы (событие `DOMContentLoaded` или атрибут `defer`).

---

## Урок 6.2. Поиск элементов: querySelector, getElementById
**Время: 40 минут**

### Цель урока
Научиться находить нужные элементы на странице разными способами для дальнейшей работы с ними через JavaScript.

### 1. Метод getElementById

Находит единственный элемент по значению атрибута `id`:

```html
<h1 id="main-title">Заголовок</h1>
```

```javascript
let title = document.getElementById("main-title");
console.log(title);
```

### 2. Метод querySelector

Более универсальный метод — принимает CSS-селектор и возвращает первый подходящий элемент:

```javascript
let title = document.querySelector("#main-title");    // по id
let firstParagraph = document.querySelector("p");        // первый тег <p>
let firstItem = document.querySelector(".item");         // по классу
```

### 3. Метод querySelectorAll

Возвращает **все** элементы, соответствующие селектору, в виде специальной коллекции NodeList:

```javascript
let items = document.querySelectorAll(".item");
console.log(items.length);

items.forEach(item => console.log(item.textContent));
```

### 4. Другие устаревшие, но иногда встречающиеся методы

```javascript
document.getElementsByClassName("item");   // коллекция по классу
document.getElementsByTagName("p");           // коллекция по тегу
```

В современном коде рекомендуется использовать `querySelector`/`querySelectorAll` как универсальный и более гибкий подход, поддерживающий любые CSS-селекторы.

### 5. Сложные CSS-селекторы в querySelector

```javascript
document.querySelector("ul li:first-child");        // первый li внутри ul
document.querySelector("div.card > h2");              // h2, прямой потомок div.card
document.querySelectorAll("input[type='checkbox']");  // все чекбоксы
```

### 6. Практический пример

```html
<ul id="task-list">
    <li class="task">Купить молоко</li>
    <li class="task">Сделать домашнее задание</li>
</ul>
```

```javascript
let taskList = document.getElementById("task-list");
let tasks = document.querySelectorAll(".task");

console.log(`Найдено задач: ${tasks.length}`);
tasks.forEach(task => console.log(task.textContent));
```

### Резюме урока

- `getElementById` находит элемент по id, `querySelector`/`querySelectorAll` — по любому CSS-селектору.
- `querySelector` возвращает первый подходящий элемент, `querySelectorAll` — все подходящие в виде NodeList.
- В современной разработке `querySelector`/`querySelectorAll` предпочтительнее устаревших методов `getElementsBy...`.

---

## Урок 6.3. Изменение содержимого и стилей элементов
**Время: 45 минут**

### Цель урока
Научиться изменять текст, HTML-содержимое и CSS-стили элементов страницы через JavaScript.

### 1. Изменение текстового содержимого: textContent

```javascript
let title = document.querySelector("#main-title");
title.textContent = "Новый заголовок";
```

`textContent` полностью заменяет текст элемента, при этом любой HTML внутри трактуется как обычный текст (без интерпретации тегов).

### 2. Изменение HTML-содержимого: innerHTML

```javascript
let container = document.querySelector("#container");
container.innerHTML = "<strong>Жирный текст</strong>";
```

`innerHTML` позволяет вставлять HTML-разметку, которая будет интерпретирована браузером. Важно: при вставке пользовательского ввода через `innerHTML` есть риск XSS-уязвимости (внедрения вредоносного кода) — для отображения обычного текста безопаснее использовать `textContent`.

### 3. Изменение стилей через свойство style

```javascript
let title = document.querySelector("#main-title");
title.style.color = "blue";
title.style.fontSize = "32px";
title.style.backgroundColor = "yellow";
```

Обрати внимание: CSS-свойства с дефисом (например, `font-size`) записываются в camelCase (`fontSize`) при обращении через JavaScript.

### 4. Работа с классами: classList

Более гибкий и рекомендуемый способ управления стилями — через CSS-классы, а не напрямую через `style`:

```javascript
let title = document.querySelector("#main-title");

title.classList.add("highlighted");       // добавить класс
title.classList.remove("highlighted");    // удалить класс
title.classList.toggle("highlighted");    // переключить (добавить, если нет; удалить, если есть)
console.log(title.classList.contains("highlighted"));   // проверить наличие класса
```

### 5. Работа с атрибутами элементов

```javascript
let image = document.querySelector("img");

console.log(image.getAttribute("src"));        // получить атрибут
image.setAttribute("src", "new-image.jpg");     // установить атрибут
image.removeAttribute("alt");                     // удалить атрибут
```

### 6. Практический пример: переключатель темы

```html
<button id="theme-toggle">Сменить тему</button>
```

```css
body.dark-theme {
    background-color: #222;
    color: #eee;
}
```

```javascript
let button = document.querySelector("#theme-toggle");

button.addEventListener("click", function() {
    document.body.classList.toggle("dark-theme");
});
```

(Подробнее об обработчиках событий, таких как `addEventListener`, поговорим в Модуле 7.)

### Резюме урока

- `textContent` изменяет текст элемента, `innerHTML` — HTML-содержимое (с осторожностью из-за риска XSS).
- Для управления стилями через классы рекомендуется `classList` (`.add()`, `.remove()`, `.toggle()`), а не прямая работа с `.style`.
- Атрибуты элементов читаются и изменяются через `getAttribute()`/`setAttribute()`.

---

## Урок 6.4. Создание и удаление элементов
**Время: 40 минут**

### Цель урока
Научиться динамически создавать новые элементы и удалять существующие с помощью JavaScript.

### 1. Создание нового элемента: createElement

```javascript
let newParagraph = document.createElement("p");
newParagraph.textContent = "Это новый параграф";
```

Обрати внимание: `createElement` только создаёт элемент в памяти — на странице он пока не появится, пока не будет добавлен в DOM-дерево явно.

### 2. Добавление элемента на страницу: appendChild и append

```javascript
let container = document.querySelector("#container");
container.appendChild(newParagraph);

// современный аналог, поддерживающий несколько узлов и текст:
container.append(newParagraph);
```

### 3. Вставка элемента в конкретное место

```javascript
let container = document.querySelector("#container");
let firstChild = container.firstElementChild;

container.insertBefore(newParagraph, firstChild);   // вставить перед первым элементом
```

Также существует более современный метод `element.before()` / `element.after()`.

### 4. Удаление элемента

```javascript
let element = document.querySelector("#to-remove");
element.remove();    // современный способ

// устаревший способ, требующий обращения к родителю:
element.parentElement.removeChild(element);
```

### 5. Практический пример: динамический список задач

```html
<input type="text" id="task-input">
<button id="add-task">Добавить</button>
<ul id="task-list"></ul>
```

```javascript
let input = document.querySelector("#task-input");
let button = document.querySelector("#add-task");
let list = document.querySelector("#task-list");

button.addEventListener("click", function() {
    if (input.value.trim() === "") return;
    
    let li = document.createElement("li");
    li.textContent = input.value;
    
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", () => li.remove());
    
    li.appendChild(deleteBtn);
    list.appendChild(li);
    
    input.value = "";
});
```

### 6. Клонирование элементов

```javascript
let original = document.querySelector("#template");
let clone = original.cloneNode(true);   // true - копировать вместе с дочерними элементами
document.body.appendChild(clone);
```

### Резюме урока

- `createElement()` создаёт элемент в памяти, `appendChild()`/`append()` добавляют его на страницу.
- `.remove()` — современный способ удаления элемента со страницы.
- Динамическое создание и удаление элементов — основа большинства интерактивных интерфейсов (списки, формы, карточки товаров и т.д.).

---

## Урок 6.5. Работа с классами и атрибутами элементов
**Время: 35 минут**

### Цель урока
Углубить навыки работы с атрибутами и классами элементов, включая пользовательские data-атрибуты.

### 1. Повторение classList

```javascript
let card = document.querySelector(".card");

card.classList.add("active", "highlighted");   // можно добавить сразу несколько классов
card.classList.remove("highlighted");
console.log(card.className);   // строка со всеми классами через пробел
```

### 2. Data-атрибуты

HTML позволяет хранить произвольные пользовательские данные в атрибутах вида `data-*`, к которым удобно обращаться из JavaScript через свойство `dataset`:

```html
<div class="product" data-id="42" data-category="electronics">Ноутбук</div>
```

```javascript
let product = document.querySelector(".product");

console.log(product.dataset.id);          // "42"
console.log(product.dataset.category);    // "electronics"

product.dataset.inStock = "true";           // добавление нового data-атрибута
```

Data-атрибуты — стандартный способ «прикрепить» данные к элементу без создания дополнительных глобальных переменных.

### 3. Проверка и изменение состояния элементов формы

```javascript
let checkbox = document.querySelector("#agree");
console.log(checkbox.checked);       // true/false

let input = document.querySelector("#name");
input.disabled = true;                  // делает поле недоступным для ввода
input.value = "Значение по умолчанию";
```

### 4. Работа с несколькими элементами через querySelectorAll и dataset

```html
<div class="product" data-price="1500">Товар 1</div>
<div class="product" data-price="2300">Товар 2</div>
```

```javascript
let products = document.querySelectorAll(".product");
let total = 0;

products.forEach(product => {
    total += Number(product.dataset.price);
});

console.log(`Общая сумма: ${total}`);
```

### 5. Практический пример: фильтрация карточек по категории

```javascript
let category = "electronics";
let products = document.querySelectorAll(".product");

products.forEach(product => {
    if (product.dataset.category === category) {
        product.style.display = "block";
    } else {
        product.style.display = "none";
    }
});
```

### 6. Работа с select и его значением

```javascript
let select = document.querySelector("#city-select");
console.log(select.value);   // значение выбранной опции

select.addEventListener("change", function() {
    console.log(`Выбран город: ${select.value}`);
});
```

### Резюме урока

- Data-атрибуты (`data-*`) — стандартный способ хранить пользовательские данные прямо в HTML-элементе, доступные через `dataset`.
- Свойства элементов форм (`.checked`, `.value`, `.disabled`) позволяют читать и управлять их состоянием из JavaScript.
- Комбинация `querySelectorAll` и `dataset` часто применяется для фильтрации и обработки групп однотипных элементов (карточки товаров, список задач и т.д.).

---

## Урок 6.6. Практика: динамический список задач на DOM
**Время: 55 минут**

### Цель урока
Закрепить материал модуля, реализовав полноценное мини-приложение «Список задач» с использованием DOM.

### 1. HTML-разметка приложения

```html
<div id="app">
    <h1>Мои задачи</h1>
    <input type="text" id="task-input" placeholder="Новая задача">
    <button id="add-btn">Добавить</button>
    <ul id="task-list"></ul>
    <p id="counter">Задач: 0</p>
</div>
```

### 2. Хранение данных в JavaScript

```javascript
let tasks = [];
```

### 3. Функция отрисовки списка задач

```javascript
function renderTasks() {
    const list = document.querySelector("#task-list");
    list.innerHTML = "";   // очищаем список перед перерисовкой
    
    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.textContent = task.title;
        
        if (task.done) {
            li.classList.add("done");
        }
        
        li.addEventListener("click", () => toggleTask(index));
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.addEventListener("click", (event) => {
            event.stopPropagation();   // чтобы клик по кнопке не сработал как клик по li
            removeTask(index);
        });
        
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
    
    document.querySelector("#counter").textContent = `Задач: ${tasks.length}`;
}
```

### 4. Функции для работы с задачами

```javascript
function addTask(title) {
    tasks.push({ title, done: false });
    renderTasks();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
}

function removeTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}
```

### 5. Обработчик кнопки добавления

```javascript
const input = document.querySelector("#task-input");
const addBtn = document.querySelector("#add-btn");

addBtn.addEventListener("click", function() {
    const title = input.value.trim();
    if (title === "") return;
    
    addTask(title);
    input.value = "";
});

renderTasks();   // первичная отрисовка (пустого списка)
```

### 6. Что демонстрирует этот пример

- Хранение данных в обычном JavaScript-массиве, отдельно от отображения.
- Функция `renderTasks()`, которая полностью перерисовывает интерфейс на основе текущих данных — базовый принцип, лежащий в основе современных фреймворков (React, Vue).
- Обработку событий клика для переключения и удаления задач.
- Использование `event.stopPropagation()` для предотвращения нежелательного «всплытия» события (подробнее об этом — в Модуле 7).

### Резюме урока

- Разделение данных (массив `tasks`) и их отображения (функция `renderTasks`) — важный архитектурный принцип, упрощающий поддержку интерфейса.
- Практика создания динамического UI на «чистом» JavaScript закладывает понимание принципов, на которых построены современные фреймворки.
- Такой проект — хорошая основа для дальнейшего расширения: сохранение задач в localStorage, фильтрация, редактирование.
