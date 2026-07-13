# Модуль 8. Асинхронность

---

## Урок 8.1. Синхронный и асинхронный код, callback-функции
**Время: 45 минут**

### Цель урока
Понять разницу между синхронным и асинхронным выполнением кода и освоить базовый механизм асинхронности — callback-функции.

### 1. Синхронный код

По умолчанию JavaScript выполняет код синхронно — строго последовательно, строка за строкой, и каждая следующая операция ждёт завершения предыдущей:

```javascript
console.log("Первое");
console.log("Второе");
console.log("Третье");
// всегда выведет строго в этом порядке
```

### 2. Проблема с длительными операциями

JavaScript — однопоточный язык: он может выполнять только одну операцию одновременно. Если бы длительные операции (запрос к серверу, чтение большого файла, таймер) выполнялись синхронно, вся страница «зависала» бы до их завершения. Именно для решения этой проблемы существует асинхронность.

### 3. Функция setTimeout — простейший пример асинхронности

```javascript
console.log("Первое");

setTimeout(function() {
    console.log("Это выполнится через 2 секунды");
}, 2000);

console.log("Второе");

// Порядок вывода:
// Первое
// Второе
// Это выполнится через 2 секунды (через 2 сек)
```

Обрати внимание: несмотря на то, что `setTimeout` написан вторым по счёту, «Второе» выводится раньше него — JavaScript не «замирает» в ожидании таймера, а продолжает выполнять остальной код.

### 4. Что такое callback-функция

Callback-функция — это функция, переданная в качестве аргумента другой функции, которая будет вызвана позже, после завершения определённой операции:

```javascript
function greetUser(name, callback) {
    console.log(`Привет, ${name}!`);
    callback();
}

greetUser("Алина", function() {
    console.log("Callback выполнен");
});
```

### 5. Callback при работе с таймерами

```javascript
function delayedGreeting(name, delay) {
    setTimeout(function() {
        console.log(`Привет, ${name}! (с задержкой ${delay} мс)`);
    }, delay);
}

delayedGreeting("Данияр", 1000);
```

### 6. setInterval — повторяющееся действие

```javascript
let count = 0;
let intervalId = setInterval(function() {
    count++;
    console.log(`Прошло секунд: ${count}`);
    
    if (count === 5) {
        clearInterval(intervalId);   // остановка повторения
    }
}, 1000);
```

### Резюме урока

- JavaScript выполняет код синхронно по умолчанию, но использует асинхронные механизмы для длительных операций, чтобы не «замораживать» страницу.
- `setTimeout()` выполняет функцию один раз через указанную задержку, `setInterval()` — повторяет её через равные промежутки времени.
- Callback-функция — функция, переданная как аргумент, которая вызывается позже, при завершении определённой операции.

---

## Урок 8.2. Проблема «callback hell»
**Время: 30 минут**

### Цель урока
Понять, к каким проблемам приводит чрезмерное использование вложенных callback-функций, и подготовиться к изучению более современных решений.

### 1. Что такое callback hell

Когда несколько асинхронных операций должны выполняться одна за другой (например, сначала загрузить данные пользователя, потом на их основе загрузить список заказов, потом детали каждого заказа), callback-функции начинают вкладываться друг в друга, создавая трудночитаемую «пирамиду»:

```javascript
getUser(userId, function(user) {
    getOrders(user.id, function(orders) {
        getOrderDetails(orders[0].id, function(details) {
            console.log(details);
            // и так далее, вложенность продолжает расти...
        });
    });
});
```

Такая структура кода получила неформальное название «callback hell» («ад коллбэков») или «pyramid of doom» («пирамида судьбы»).

### 2. Почему это проблема

- **Читаемость.** Код сложно читать сверху вниз — логика теряется в глубокой вложенности.
- **Обработка ошибок.** Каждый уровень вложенности обычно требует собственной обработки ошибок, что сильно раздувает код.
- **Изменение порядка операций.** Внести изменения в такую структуру (например, добавить ещё один шаг) становится сложно и рискованно.

### 3. Пример нарастания проблемы

```javascript
step1(function(result1) {
    step2(result1, function(result2) {
        step3(result2, function(result3) {
            step4(result3, function(result4) {
                console.log("Готово:", result4);
                // код становится всё труднее читать вправо и вниз
            });
        });
    });
});
```

### 4. Симптомы callback hell в коде

- Отступы кода уходят слишком далеко вправо.
- Сложно понять, какая скобка `}` закрывает какую функцию.
- Обработка ошибок дублируется на каждом уровне.

### 5. Как эта проблема решается в современном JavaScript

Именно для решения проблемы callback hell в JavaScript были добавлены **Promises** (Урок 8.3) и синтаксис **async/await** (Урок 8.4) — они позволяют записывать последовательность асинхронных операций гораздо более читаемым, «плоским» образом, похожим на обычный синхронный код.

### 6. Краткое сравнение (забегая вперёд)

```javascript
// Callback hell
getUser(id, function(user) {
    getOrders(user.id, function(orders) {
        console.log(orders);
    });
});

// То же самое через async/await (Урок 8.4)
async function loadData() {
    let user = await getUser(id);
    let orders = await getOrders(user.id);
    console.log(orders);
}
```

### Резюме урока

- Callback hell — ситуация чрезмерной вложенности callback-функций при последовательном выполнении нескольких асинхронных операций.
- Основные проблемы: плохая читаемость, сложная обработка ошибок, трудность внесения изменений.
- Promises и async/await, которые мы изучим в следующих уроках, были созданы специально для решения этой проблемы.

---

## Урок 8.3. Promises: создание и обработка
**Время: 50 минут**

### Цель урока
Освоить Promise — современный механизм работы с асинхронным кодом, пришедший на смену «голым» callback-функциям.

### 1. Что такое Promise

Promise (обещание) — это объект, представляющий результат асинхронной операции, которая может завершиться либо успешно (`resolved`), либо с ошибкой (`rejected`). Promise может находиться в одном из трёх состояний: `pending` (ожидание), `fulfilled` (выполнено успешно), `rejected` (завершено с ошибкой).

### 2. Создание Promise

```javascript
let myPromise = new Promise(function(resolve, reject) {
    let success = true;
    
    setTimeout(function() {
        if (success) {
            resolve("Операция выполнена успешно");
        } else {
            reject("Произошла ошибка");
        }
    }, 1000);
});
```

### 3. Обработка результата: then и catch

```javascript
myPromise
    .then(function(result) {
        console.log(result);   // выполнится, если promise завершился через resolve
    })
    .catch(function(error) {
        console.log(error);    // выполнится, если promise завершился через reject
    });
```

### 4. Цепочка then() — решение проблемы callback hell

Ключевое преимущество Promise — возможность строить «плоскую» цепочку последовательных асинхронных операций вместо вложенности:

```javascript
getUser(userId)
    .then(user => getOrders(user.id))
    .then(orders => getOrderDetails(orders[0].id))
    .then(details => console.log(details))
    .catch(error => console.log("Ошибка на любом из шагов:", error));
```

Каждый `.then()` получает результат предыдущего шага и возвращает новый Promise, что позволяет продолжать цепочку.

### 5. Блок finally

```javascript
myPromise
    .then(result => console.log(result))
    .catch(error => console.log(error))
    .finally(() => console.log("Операция завершена (в любом случае)"));
```

### 6. Promise.all — выполнение нескольких операций параллельно

```javascript
let promise1 = fetch("/api/users");
let promise2 = fetch("/api/orders");

Promise.all([promise1, promise2])
    .then(([usersResponse, ordersResponse]) => {
        console.log("Обе операции завершены");
    })
    .catch(error => console.log("Хотя бы одна операция завершилась ошибкой:", error));
```

`Promise.all()` ждёт завершения всех переданных промисов и удобен, когда нужно выполнить несколько независимых асинхронных операций параллельно, а не последовательно.

### Резюме урока

- Promise представляет результат асинхронной операции в одном из трёх состояний: ожидание, успех, ошибка.
- `.then()` обрабатывает успешный результат, `.catch()` — ошибку, `.finally()` выполняется в любом случае.
- Цепочка `.then()` заменяет вложенные callback-функции, делая асинхронный код значительно более читаемым.

---

## Урок 8.4. async/await
**Время: 45 минут**

### Цель урока
Освоить синтаксис async/await — самый современный и читаемый способ работы с асинхронным кодом в JavaScript.

### 1. Что такое async/await

`async/await` — это синтаксический «сахар» поверх Promise, позволяющий писать асинхронный код так, будто он выполняется синхронно — строка за строкой, без цепочек `.then()`.

### 2. Ключевое слово async

Функция, объявленная с ключевым словом `async`, всегда неявно возвращает Promise:

```javascript
async function greet() {
    return "Привет!";
}

greet().then(result => console.log(result));   // Привет!
```

### 3. Ключевое слово await

`await` можно использовать только внутри `async`-функции. Оно «приостанавливает» выполнение функции до тех пор, пока Promise справа от него не завершится, и возвращает результат:

```javascript
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("Начало");
    await wait(2000);
    console.log("Прошло 2 секунды");
}

run();
```

### 4. Сравнение с цепочкой then()

```javascript
// С помощью Promise.then()
function loadData() {
    getUser(userId)
        .then(user => getOrders(user.id))
        .then(orders => console.log(orders))
        .catch(error => console.log(error));
}

// С помощью async/await
async function loadData() {
    try {
        let user = await getUser(userId);
        let orders = await getOrders(user.id);
        console.log(orders);
    } catch (error) {
        console.log(error);
    }
}
```

Код с `async/await` читается практически как обычный синхронный код — сверху вниз, без глубокой вложенности.

### 5. Параллельное выполнение с async/await

Если несколько асинхронных операций не зависят друг от друга, их стоит запускать параллельно через `Promise.all()`, а не последовательно через отдельные `await` — это работает значительно быстрее:

```javascript
async function loadAll() {
    let [users, orders] = await Promise.all([
        getUsers(),
        getOrders()
    ]);
    console.log(users, orders);
}
```

### 6. Практический пример

```javascript
async function getUserFullInfo(userId) {
    console.log("Загрузка данных пользователя...");
    let user = await getUser(userId);
    
    console.log("Загрузка заказов пользователя...");
    let orders = await getOrders(user.id);
    
    return { user, orders };
}

getUserFullInfo(1).then(info => console.log(info));
```

### Резюме урока

- `async` перед функцией делает её асинхронной — она всегда возвращает Promise.
- `await` приостанавливает выполнение `async`-функции до завершения Promise и возвращает его результат.
- `async/await` — рекомендуемый современный способ записи асинхронного кода, значительно более читаемый, чем цепочки `.then()`.

---

## Урок 8.5. Обработка ошибок в асинхронном коде (try/catch)
**Время: 45 минут**

### Цель урока
Научиться правильно обрабатывать ошибки в асинхронном коде, написанном с использованием async/await.

### 1. try/catch с async/await

Ошибки в `async`-функциях обрабатываются с помощью привычной конструкции `try/catch`, знакомой по обработке синхронных ошибок:

```javascript
async function loadUser(userId) {
    try {
        let user = await getUser(userId);
        console.log(user);
    } catch (error) {
        console.log("Не удалось загрузить пользователя:", error.message);
    }
}
```

### 2. Что происходит при отклонении (reject) Promise без try/catch

Если Promise внутри `async`-функции отклоняется (`reject`), а ошибка не обработана через `try/catch`, это приводит к необработанному отклонению Promise (unhandled promise rejection) — программа не «упадёт» полностью, но в консоли появится предупреждение об ошибке.

```javascript
async function risky() {
    let result = await Promise.reject("Ошибка!");   // не обработана
}

risky();   // Uncaught (in promise) Ошибка!
```

### 3. Блок finally в try/catch

```javascript
async function loadData() {
    showLoadingSpinner();
    
    try {
        let data = await fetchData();
        console.log(data);
    } catch (error) {
        console.log("Ошибка загрузки:", error);
    } finally {
        hideLoadingSpinner();   // выполнится в любом случае - успех или ошибка
    }
}
```

### 4. Обработка нескольких асинхронных операций с try/catch

```javascript
async function processOrder(orderId) {
    try {
        let order = await getOrder(orderId);
        let payment = await processPayment(order);
        let confirmation = await sendConfirmation(payment);
        return confirmation;
    } catch (error) {
        console.log("Ошибка на одном из шагов обработки заказа:", error.message);
        throw error;   // можно передать ошибку дальше, если это необходимо
    }
}
```

### 5. Собственные ошибки с throw

Как и в синхронном коде, можно самостоятельно генерировать ошибки внутри `async`-функций с помощью `throw`:

```javascript
async function withdraw(balance, amount) {
    if (amount > balance) {
        throw new Error("Недостаточно средств на счёте");
    }
    return balance - amount;
}

async function run() {
    try {
        let newBalance = await withdraw(1000, 1500);
        console.log(newBalance);
    } catch (error) {
        console.log(error.message);   // Недостаточно средств на счёте
    }
}

run();
```

### 6. Практический пример: безопасная загрузка данных

```javascript
async function safeGetData(url) {
    try {
        let response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        let data = await response.json();
        return data;
    } catch (error) {
        console.log("Не удалось получить данные:", error.message);
        return null;
    }
}
```

### Резюме урока

- Ошибки в `async/await`-коде обрабатываются привычной конструкцией `try/catch`.
- Необработанные отклонения Promise (rejected без catch) приводят к предупреждениям в консоли, хотя и не «роняют» всю программу.
- Собственные ошибки внутри асинхронных функций можно генерировать через `throw new Error(...)`, как и в синхронном коде.
