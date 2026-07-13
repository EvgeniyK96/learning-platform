# Модуль 7. События и интерактивность

---

## Урок 7.1. Обработчики событий: addEventListener
**Время: 40 минут**

### Цель урока
Научиться реагировать на действия пользователя с помощью обработчиков событий.

### 1. Что такое событие

Событие (event) — это действие, которое произошло на странице: клик мышью, нажатие клавиши, отправка формы, загрузка страницы и т.д. JavaScript позволяет «слушать» такие события и реагировать на них выполнением определённого кода.

### 2. Метод addEventListener

```javascript
let button = document.querySelector("#my-button");

button.addEventListener("click", function() {
    console.log("Кнопка нажата!");
});
```

`addEventListener` принимает два обязательных аргумента: название события (строкой) и функцию-обработчик, которая выполнится при возникновении этого события.

### 3. Часто используемые события

| Событие | Когда происходит |
|---|---|
| `click` | клик мышью |
| `dblclick` | двойной клик |
| `mouseover` / `mouseout` | наведение / уход курсора с элемента |
| `keydown` / `keyup` | нажатие / отпускание клавиши клавиатуры |
| `submit` | отправка формы |
| `change` | изменение значения поля ввода/select |
| `input` | ввод текста (срабатывает при каждом изменении) |
| `load` | полная загрузка страницы или ресурса |

### 4. Использование стрелочной функции как обработчика

```javascript
button.addEventListener("click", () => {
    console.log("Кнопка нажата!");
});
```

### 5. Именованная функция как обработчик

```javascript
function handleClick() {
    console.log("Кнопка нажата!");
}

button.addEventListener("click", handleClick);
```

Использование именованной функции удобно, если нужно позже отписаться от события через `removeEventListener`:

```javascript
button.removeEventListener("click", handleClick);
```

### 6. Устаревший способ (для общего понимания)

Раньше обработчики часто назначались напрямую через HTML-атрибут или свойство элемента:

```html
<button onclick="alert('Клик!')">Нажми меня</button>
```

```javascript
button.onclick = function() {
    console.log("Клик!");
};
```

Оба этих способа позволяют назначить только один обработчик на событие, тогда как `addEventListener` позволяет назначить несколько обработчиков на одно и то же событие — поэтому именно `addEventListener` является рекомендуемым современным подходом.

### Резюме урока

- `addEventListener(событие, функция)` — стандартный способ назначения обработчиков событий на элементы страницы.
- Обработчиком может быть как именованная, так и анонимная (стрелочная) функция.
- В отличие от устаревших способов, `addEventListener` позволяет назначать несколько обработчиков на одно событие.

---

## Урок 7.2. События мыши и клавиатуры
**Время: 40 минут**

### Цель урока
Изучить объект события (event object) и научиться работать с событиями мыши и клавиатуры подробнее.

### 1. Объект события (event)

Функция-обработчик автоматически получает объект события в качестве первого параметра, содержащий подробную информацию о произошедшем событии:

```javascript
button.addEventListener("click", function(event) {
    console.log(event.type);           // "click"
    console.log(event.target);          // элемент, на котором произошло событие
});
```

### 2. Координаты события мыши

```javascript
document.addEventListener("click", function(event) {
    console.log(`Клик по координатам: ${event.clientX}, ${event.clientY}`);
});
```

### 3. События клавиатуры

```javascript
document.addEventListener("keydown", function(event) {
    console.log(`Нажата клавиша: ${event.key}`);
    console.log(`Код клавиши: ${event.code}`);
});
```

### 4. Практический пример: реагирование на конкретную клавишу

```javascript
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        console.log("Нажат Enter!");
    }
    if (event.key === "Escape") {
        console.log("Нажат Escape!");
    }
});
```

### 5. Отмена действия по умолчанию: preventDefault()

Многие события в браузере имеют «поведение по умолчанию» — например, клик по ссылке переходит по адресу, а нажатие Enter в форме отправляет её. Метод `event.preventDefault()` отменяет это поведение:

```javascript
let link = document.querySelector("a");

link.addEventListener("click", function(event) {
    event.preventDefault();    // переход по ссылке не произойдёт
    console.log("Переход отменён");
});
```

### 6. Практический пример: поле ввода только для цифр

```javascript
let input = document.querySelector("#numeric-input");

input.addEventListener("keydown", function(event) {
    let isNumber = /[0-9]/.test(event.key);
    let isControlKey = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(event.key);
    
    if (!isNumber && !isControlKey) {
        event.preventDefault();
    }
});
```

### Резюме урока

- Объект события (`event`) содержит подробную информацию о произошедшем событии: тип, целевой элемент, координаты, нажатую клавишу.
- `event.target` — элемент, на котором непосредственно произошло событие.
- `event.preventDefault()` отменяет поведение браузера по умолчанию для данного события (переход по ссылке, отправку формы и т.д.).

---

## Урок 7.3. Всплытие и погружение событий (event bubbling)
**Время: 40 минут**

### Цель урока
Понять механизм всплытия событий в DOM и научиться использовать делегирование событий для эффективной обработки множества элементов.

### 1. Что такое всплытие событий (event bubbling)

Когда событие происходит на каком-либо элементе, оно сначала срабатывает на самом этом элементе, а затем «всплывает» вверх по дереву DOM, срабатывая на всех его родительских элементах вплоть до `document`.

```html
<div id="outer">
    <div id="inner">
        <button id="btn">Нажми</button>
    </div>
</div>
```

```javascript
document.querySelector("#outer").addEventListener("click", () => console.log("outer"));
document.querySelector("#inner").addEventListener("click", () => console.log("inner"));
document.querySelector("#btn").addEventListener("click", () => console.log("btn"));

// При клике на кнопку в консоли появится: "btn", "inner", "outer"
```

### 2. Остановка всплытия: stopPropagation()

```javascript
document.querySelector("#btn").addEventListener("click", function(event) {
    event.stopPropagation();
    console.log("btn");
});
// теперь "inner" и "outer" не сработают
```

### 3. Делегирование событий (event delegation)

Всплытие событий позволяет использовать очень полезный паттерн — делегирование: вместо назначения обработчика на каждый отдельный элемент (например, каждый пункт списка), можно назначить один обработчик на родительский элемент и определять, на каком именно дочернем элементе произошёл клик, через `event.target`.

```html
<ul id="task-list">
    <li>Задача 1</li>
    <li>Задача 2</li>
    <li>Задача 3</li>
</ul>
```

```javascript
document.querySelector("#task-list").addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        console.log(`Клик по: ${event.target.textContent}`);
        event.target.classList.toggle("done");
    }
});
```

### 4. Преимущества делегирования событий

- Один обработчик вместо множества — экономия памяти и упрощение кода.
- Работает автоматически даже для элементов, добавленных на страницу **после** назначения обработчика (например, новых задач в списке) — это особенно важно для динамически создаваемых элементов.

### 5. Практический пример: список задач с делегированием

```html
<ul id="task-list"></ul>
```

```javascript
let list = document.querySelector("#task-list");

function addTask(title) {
    let li = document.createElement("li");
    li.textContent = title;
    list.appendChild(li);
}

list.addEventListener("click", function(event) {
    if (event.target.tagName === "LI") {
        event.target.remove();   // удаление задачи по клику
    }
});

addTask("Купить молоко");
addTask("Сделать домашнее задание");
// оба элемента уже реагируют на клик благодаря делегированию, без отдельного addEventListener на каждый li
```

### 6. Погружение событий (capturing) — для общего понимания

Помимо всплытия, у событий есть и обратная фаза — погружение (capturing), когда событие сначала проходит от `document` вниз к целевому элементу. Она используется значительно реже, но доступна через третий аргумент `addEventListener`:

```javascript
element.addEventListener("click", handler, true);   // true включает фазу погружения
```

### Резюме урока

- Событие сначала происходит на целевом элементе, а затем «всплывает» к его родителям — это называется всплытием событий.
- `event.stopPropagation()` останавливает дальнейшее всплытие.
- Делегирование событий (обработчик на родителе + проверка `event.target`) — эффективный паттерн для работы с динамически создаваемыми элементами.

---

## Урок 7.4. Работа с формами и валидация ввода
**Время: 45 минут**

### Цель урока
Научиться получать данные из форм, обрабатывать их отправку и проверять корректность введённых пользователем данных.

### 1. HTML-форма

```html
<form id="registration-form">
    <input type="text" id="name" placeholder="Имя">
    <input type="email" id="email" placeholder="Email">
    <input type="password" id="password" placeholder="Пароль">
    <button type="submit">Зарегистрироваться</button>
</form>
```

### 2. Обработка события submit

```javascript
let form = document.querySelector("#registration-form");

form.addEventListener("submit", function(event) {
    event.preventDefault();   // отменяем стандартную отправку формы (перезагрузку страницы)
    console.log("Форма отправлена");
});
```

Важно: без `event.preventDefault()` страница перезагрузится при отправке формы, и весь JavaScript-код будет выполнен заново.

### 3. Получение значений полей формы

```javascript
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    
    console.log({ name, email, password });
});
```

### 4. Базовая валидация вводимых данных

```javascript
function validateForm(name, email, password) {
    let errors = [];
    
    if (name.trim() === "") {
        errors.push("Имя не может быть пустым");
    }
    
    if (!email.includes("@")) {
        errors.push("Некорректный email");
    }
    
    if (password.length < 8) {
        errors.push("Пароль должен содержать минимум 8 символов");
    }
    
    return errors;
}
```

### 5. Отображение ошибок пользователю

```javascript
form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    let name = document.querySelector("#name").value;
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    
    let errors = validateForm(name, email, password);
    let errorContainer = document.querySelector("#errors");
    
    if (errors.length > 0) {
        errorContainer.innerHTML = errors.map(e => `<li>${e}</li>`).join("");
    } else {
        errorContainer.innerHTML = "";
        console.log("Форма прошла валидацию!");
        form.reset();   // очистка полей формы
    }
});
```

### 6. Встроенная валидация HTML5 (для общего понимания)

Помимо JavaScript-валидации, HTML5 предоставляет базовые атрибуты валидации:

```html
<input type="email" required minlength="5">
<input type="number" min="1" max="100">
```

Такая встроенная валидация полезна для базовых проверок, но для сложной логики (например, «пароли должны совпадать») всё равно требуется JavaScript.

### Резюме урока

- `event.preventDefault()` в обработчике `submit` предотвращает стандартную перезагрузку страницы при отправке формы.
- Значения полей ввода читаются через свойство `.value`.
- Валидация форм на JavaScript позволяет реализовать любую сложную логику проверки, недоступную встроенным HTML5-атрибутам.

---

## Урок 7.5. Практика: интерактивная форма с валидацией
**Время: 50 минут**

### Цель урока
Закрепить материал модуля, создав полноценную форму обратной связи с валидацией в реальном времени.

### 1. HTML-разметка формы

```html
<form id="feedback-form">
    <div>
        <input type="text" id="name" placeholder="Ваше имя">
        <span class="error" id="name-error"></span>
    </div>
    <div>
        <input type="email" id="email" placeholder="Email">
        <span class="error" id="email-error"></span>
    </div>
    <div>
        <textarea id="message" placeholder="Сообщение"></textarea>
        <span class="error" id="message-error"></span>
    </div>
    <button type="submit">Отправить</button>
    <p id="success-message" style="display: none;">Спасибо! Сообщение отправлено.</p>
</form>
```

### 2. Валидация в реальном времени (при вводе)

```javascript
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");

function validateName() {
    const errorEl = document.querySelector("#name-error");
    if (nameInput.value.trim().length < 2) {
        errorEl.textContent = "Имя должно содержать минимум 2 символа";
        return false;
    }
    errorEl.textContent = "";
    return true;
}

function validateEmail() {
    const errorEl = document.querySelector("#email-error");
    const pattern = /^[\w.]+@[\w.]+\.\w+$/;
    if (!pattern.test(emailInput.value)) {
        errorEl.textContent = "Введите корректный email";
        return false;
    }
    errorEl.textContent = "";
    return true;
}

function validateMessage() {
    const errorEl = document.querySelector("#message-error");
    if (messageInput.value.trim().length < 10) {
        errorEl.textContent = "Сообщение должно содержать минимум 10 символов";
        return false;
    }
    errorEl.textContent = "";
    return true;
}
```

### 3. Проверка полей при потере фокуса (событие blur)

```javascript
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
messageInput.addEventListener("blur", validateMessage);
```

### 4. Обработка отправки формы

```javascript
const form = document.querySelector("#feedback-form");

form.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();
    
    if (isNameValid && isEmailValid && isMessageValid) {
        document.querySelector("#success-message").style.display = "block";
        form.reset();
        
        setTimeout(() => {
            document.querySelector("#success-message").style.display = "none";
        }, 3000);
    }
});
```

### 5. Дополнительная стилизация ошибок через классы

```javascript
function toggleErrorStyle(input, isValid) {
    input.classList.toggle("input-error", !isValid);
}
```

Эту функцию можно вызывать внутри каждой функции валидации, передавая соответствующее поле и результат проверки.

### 6. Что демонстрирует этот пример

- Валидацию форм как в реальном времени (`blur`), так и при финальной отправке (`submit`).
- Разделение логики на отдельные переиспользуемые функции проверки для каждого поля.
- Использование `setTimeout` для временного отображения сообщения об успехе (подробнее об асинхронности — в Модуле 8).

### Резюме урока

- Комбинация событий `blur` (при потере фокуса) и `submit` (при отправке) обеспечивает удобный пользовательский опыт валидации форм.
- Вынесение логики валидации каждого поля в отдельную функцию делает код более организованным и переиспользуемым.
- Такая форма — типичный практический кейс, встречающийся в большинстве реальных веб-приложений.
