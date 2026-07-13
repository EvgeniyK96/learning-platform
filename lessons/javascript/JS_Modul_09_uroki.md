# Модуль 9. Работа с API (fetch) и JSON

---

## Урок 9.1. Формат JSON и работа с ним в JS
**Время: 40 минут**

### Цель урока
Понять формат JSON и научиться преобразовывать данные между JSON-строкой и объектами JavaScript.

### 1. Что такое JSON

JSON (JavaScript Object Notation) — текстовый формат представления структурированных данных, синтаксически очень похожий на объекты и массивы JavaScript. JSON — стандартный формат обмена данными между сервером и клиентом в вебе.

```json
{
    "name": "Алина",
    "age": 20,
    "isStudent": true,
    "courses": ["JS с нуля", "HTML/CSS"]
}
```

### 2. Отличия JSON от обычного объекта JavaScript

- Имена ключей в JSON всегда заключаются в двойные кавычки (`"name"`, а не `name` или `'name'`).
- JSON не может содержать функции, `undefined`, комментарии.
- JSON — это просто текст (строка), а не «живой» объект JavaScript.

### 3. Преобразование объекта в JSON: JSON.stringify()

```javascript
let student = {
    name: "Алина",
    age: 20,
    courses: ["JS с нуля", "HTML/CSS"]
};

let jsonString = JSON.stringify(student);
console.log(jsonString);
console.log(typeof jsonString);   // "string"
```

С дополнительными параметрами для красивого форматирования:

```javascript
let prettyJson = JSON.stringify(student, null, 2);
console.log(prettyJson);
```

### 4. Преобразование JSON в объект: JSON.parse()

```javascript
let jsonString = '{"name": "Алина", "age": 20}';
let student = JSON.parse(jsonString);

console.log(student.name);   // Алина
console.log(typeof student); // "object"
```

### 5. Практический пример: сохранение данных в localStorage

`localStorage` браузера умеет хранить только строки, поэтому для сохранения объектов их нужно предварительно преобразовать в JSON:

```javascript
let tasks = [{ title: "Задача 1", done: false }];

localStorage.setItem("tasks", JSON.stringify(tasks));

let savedTasks = JSON.parse(localStorage.getItem("tasks"));
console.log(savedTasks);
```

### 6. Типичные ошибки при работе с JSON

- Попытка вызвать `JSON.parse()` на некорректной JSON-строке приводит к ошибке `SyntaxError`.
- Забывают, что `JSON.stringify()` игнорирует функции и `undefined`-значения внутри объекта.

```javascript
let obj = { a: 1, b: undefined, c: function(){} };
console.log(JSON.stringify(obj));   // {"a":1}
```

### Резюме урока

- JSON — текстовый формат для передачи структурированных данных, стандарт де-факто для работы с веб-API.
- `JSON.stringify()` преобразует объект/массив JavaScript в JSON-строку, `JSON.parse()` — выполняет обратное преобразование.
- Имена ключей в корректном JSON всегда должны быть в двойных кавычках.

---

## Урок 9.2. Функция fetch: GET-запросы
**Время: 45 минут**

### Цель урока
Научиться получать данные с внешних серверов с помощью встроенной функции fetch.

### 1. Что такое fetch

`fetch()` — встроенная в браузер функция для выполнения HTTP-запросов к серверу. Она возвращает Promise, поэтому удобно использовать её вместе с `.then()` или `async/await`.

### 2. Базовый GET-запрос

```javascript
fetch("https://api.example.com/users")
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log("Ошибка:", error));
```

Обрати внимание на два этапа: сначала мы получаем объект `response`, а затем отдельным шагом вызываем `.json()` для извлечения и преобразования тела ответа — это тоже асинхронная операция, возвращающая ещё один Promise.

### 3. Тот же запрос с async/await

```javascript
async function loadUsers() {
    try {
        let response = await fetch("https://api.example.com/users");
        let data = await response.json();
        console.log(data);
    } catch (error) {
        console.log("Ошибка:", error);
    }
}

loadUsers();
```

### 4. Проверка успешности ответа

Важная особенность `fetch`: Promise завершается ошибкой (`reject`) только при сетевых сбоях (например, нет интернета), но **не** при ответах с кодами ошибок вроде 404 или 500 — их нужно проверять вручную через `response.ok`:

```javascript
async function loadData(url) {
    let response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
    }
    
    return await response.json();
}
```

### 5. Отображение загруженных данных на странице

```javascript
async function displayUsers() {
    let response = await fetch("https://api.example.com/users");
    let users = await response.json();
    
    let container = document.querySelector("#users-list");
    container.innerHTML = users.map(user => `<li>${user.name}</li>`).join("");
}

displayUsers();
```

### 6. Индикатор загрузки

При работе с реальными сетевыми запросами хорошей практикой является показ индикатора загрузки, пока данные ещё не пришли:

```javascript
async function loadWithSpinner() {
    let spinner = document.querySelector("#spinner");
    spinner.style.display = "block";
    
    try {
        let response = await fetch("https://api.example.com/users");
        let data = await response.json();
        console.log(data);
    } finally {
        spinner.style.display = "none";
    }
}
```

### Резюме урока

- `fetch()` выполняет HTTP-запрос и возвращает Promise, поэтому удобно сочетается с `async/await`.
- Ответ приходит в два этапа: сначала объект `response`, затем отдельный вызов `.json()` для получения данных.
- `response.ok` нужно проверять вручную — `fetch` не считает ответы с кодами 404/500 сетевой ошибкой.

---

## Урок 9.3. Отправка данных: POST-запросы
**Время: 40 минут**

### Цель урока
Научиться отправлять данные на сервер с помощью fetch (POST-запросы) для создания и изменения ресурсов.

### 1. Отличие GET от POST

`GET`-запросы используются для получения данных, `POST` — для отправки новых данных на сервер (например, создания новой записи). У `POST`-запроса, помимо адреса, обычно есть «тело» (body) с отправляемыми данными.

### 2. Синтаксис POST-запроса через fetch

```javascript
async function createUser(userData) {
    let response = await fetch("https://api.example.com/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });
    
    return await response.json();
}

createUser({ name: "Алина", age: 20 })
    .then(result => console.log("Создано:", result));
```

Второй аргумент `fetch()` — объект настроек, где указывается метод запроса (`method`), заголовки (`headers`) и тело запроса (`body`, обязательно преобразованное в JSON-строку).

### 3. Другие HTTP-методы

| Метод | Назначение |
|---|---|
| `GET` | получение данных |
| `POST` | создание новой записи |
| `PUT` / `PATCH` | обновление существующей записи |
| `DELETE` | удаление записи |

```javascript
async function updateUser(id, updatedData) {
    let response = await fetch(`https://api.example.com/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
    
    return await response.json();
}

async function deleteUser(id) {
    let response = await fetch(`https://api.example.com/users/${id}`, {
        method: "DELETE"
    });
    
    return response.ok;
}
```

### 4. Заголовки авторизации

Многие API требуют авторизации через специальный заголовок:

```javascript
async function getPrivateData(token) {
    let response = await fetch("https://api.example.com/private", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    return await response.json();
}
```

### 5. Обработка ошибок при отправке данных

```javascript
async function createUser(userData) {
    try {
        let response = await fetch("https://api.example.com/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`Не удалось создать пользователя: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.log(error.message);
        return null;
    }
}
```

### 6. Практический пример: отправка формы через fetch

```javascript
document.querySelector("#contact-form").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    let formData = {
        name: document.querySelector("#name").value,
        message: document.querySelector("#message").value
    };
    
    try {
        let response = await fetch("https://api.example.com/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            console.log("Сообщение успешно отправлено");
        }
    } catch (error) {
        console.log("Ошибка отправки:", error);
    }
});
```

### Резюме урока

- Для отправки данных через `fetch` нужно указать `method: "POST"` (или другой метод), заголовок `Content-Type` и `body` с данными в формате JSON.
- Основные HTTP-методы: `GET`, `POST`, `PUT`/`PATCH`, `DELETE`.
- Многие API требуют заголовок авторизации (`Authorization`) для доступа к защищённым данным.

---

## Урок 9.4. Практика: приложение с загрузкой данных с публичного API
**Время: 55 минут**

### Цель урока
Закрепить материал модуля, разработав небольшое приложение, которое загружает и отображает данные с реального публичного API.

### 1. Постановка задачи

Разработаем приложение «Поиск стран» — пользователь вводит название страны, приложение обращается к публичному API и выводит информацию о ней (столица, население, регион).

### 2. HTML-разметка

```html
<div id="app">
    <input type="text" id="country-input" placeholder="Введите название страны">
    <button id="search-btn">Найти</button>
    <div id="result"></div>
    <p id="loading" style="display: none;">Загрузка...</p>
    <p id="error-message" style="display: none;"></p>
</div>
```

### 3. Функция загрузки данных

```javascript
async function searchCountry(countryName) {
    const loading = document.querySelector("#loading");
    const errorMessage = document.querySelector("#error-message");
    const result = document.querySelector("#result");
    
    loading.style.display = "block";
    errorMessage.style.display = "none";
    result.innerHTML = "";
    
    try {
        let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        
        if (!response.ok) {
            throw new Error("Страна не найдена");
        }
        
        let data = await response.json();
        displayCountry(data[0]);
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = "block";
    } finally {
        loading.style.display = "none";
    }
}
```

### 4. Функция отображения результата

```javascript
function displayCountry(country) {
    const result = document.querySelector("#result");
    
    result.innerHTML = `
        <h2>${country.name.common}</h2>
        <p>Столица: ${country.capital ? country.capital[0] : "нет данных"}</p>
        <p>Регион: ${country.region}</p>
        <p>Население: ${country.population.toLocaleString()}</p>
    `;
}
```

### 5. Обработчик кнопки поиска

```javascript
document.querySelector("#search-btn").addEventListener("click", function() {
    const countryName = document.querySelector("#country-input").value.trim();
    
    if (countryName === "") {
        return;
    }
    
    searchCountry(countryName);
});
```

### 6. Что демонстрирует этот пример

- Полный цикл работы с реальным внешним API: запрос → обработка ошибок → отображение данных.
- Управление состояниями интерфейса: загрузка (`loading`), ошибка (`error-message`), успешный результат.
- Комбинацию всех знаний модуля 9 (fetch, JSON, async/await, try/catch) вместе со знаниями модулей 6 и 7 (DOM, события).

### Резюме урока

- Реальные приложения на JavaScript почти всегда взаимодействуют с внешними API для получения актуальных данных.
- Важно всегда предусматривать состояния загрузки и ошибки — это значительно улучшает пользовательский опыт.
- Этот пример — хорошая основа для итогового проекта курса, если он связан с отображением данных из внешнего источника.
