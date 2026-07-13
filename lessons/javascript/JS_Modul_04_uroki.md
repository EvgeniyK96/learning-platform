# Модуль 4. Функции

---

## Урок 4.1. Объявление функций: function declaration и function expression
**Время: 40 минут**

### Цель урока
Изучить основные способы объявления функций в JavaScript и понять разницу между ними.

### 1. Function Declaration (объявление функции)

```javascript
function greet(name) {
    console.log(`Привет, ${name}!`);
}

greet("Алина");   // Привет, Алина!
```

### 2. Function Expression (функциональное выражение)

Функцию можно присвоить переменной — в таком случае она называется анонимной функцией, записанной в переменную:

```javascript
const greet = function(name) {
    console.log(`Привет, ${name}!`);
};

greet("Данияр");
```

### 3. Ключевое отличие: hoisting (всплытие)

Function Declaration «поднимается» интерпретатором в начало кода (hoisting) и доступна для вызова даже до места её объявления в коде:

```javascript
sayHi();   // работает! "Привет!"

function sayHi() {
    console.log("Привет!");
}
```

Function Expression так не работает — переменная должна быть уже определена к моменту вызова:

```javascript
sayHi();   // ReferenceError: Cannot access 'sayHi' before initialization

const sayHi = function() {
    console.log("Привет!");
};
```

### 4. Оператор return

```javascript
function add(a, b) {
    return a + b;
}

let result = add(5, 3);
console.log(result);   // 8
```

Функция без `return` возвращает `undefined`. Код после `return` внутри функции не выполняется.

### 5. Функция is_prime — практический пример

```javascript
function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i < n; i++) {
        if (n % i === 0) return false;
    }
    return true;
}

console.log(isPrime(7));    // true
console.log(isPrime(10));   // false
```

### 6. Когда что использовать

На практике оба способа широко используются. Function Declaration удобнее для основных, «главных» функций программы (за счёт hoisting), а Function Expression часто применяется, когда функция передаётся как значение — например, в качестве аргумента другой функции (что мы подробно разберём в Модуле 5 и 8).

### Резюме урока

- Function Declaration объявляется через `function имя() {}` и «поднимается» в начало кода благодаря hoisting.
- Function Expression присваивает анонимную функцию переменной и не поднимается — доступна только после объявления.
- `return` завершает выполнение функции и передаёт результат в место вызова.

---

## Урок 4.2. Параметры, значения по умолчанию, rest-параметры
**Время: 40 минут**

### Цель урока
Научиться работать с параметрами функций: значениями по умолчанию и произвольным количеством аргументов.

### 1. Обычные параметры

```javascript
function describe(name, age) {
    console.log(`${name}, ${age} лет`);
}

describe("Алина", 20);
```

### 2. Значения параметров по умолчанию

Если аргумент не передан при вызове, параметр получает значение `undefined`. Чтобы избежать этого, можно задать значение по умолчанию:

```javascript
function describe(name, age = 18) {
    console.log(`${name}, ${age} лет`);
}

describe("Данияр");         // Данияр, 18 лет
describe("Аружан", 25);     // Аружан, 25 лет
```

### 3. Что если передано больше аргументов, чем параметров

JavaScript не выдаёт ошибку, если передано больше аргументов, чем объявлено параметров — «лишние» аргументы просто игнорируются (если явно не собраны через rest-параметр):

```javascript
function add(a, b) {
    return a + b;
}

console.log(add(2, 3, 100));   // 5, третий аргумент игнорируется
```

### 4. Rest-параметры — произвольное число аргументов

Оператор `...` (три точки) перед последним параметром собирает все оставшиеся аргументы в массив:

```javascript
function total(...numbers) {
    return numbers.reduce((sum, n) => sum + n, 0);
}

console.log(total(1, 2, 3));         // 6
console.log(total(10, 20, 30, 40));  // 100
```

### 5. Объект arguments (устаревший способ, для общего понимания)

До появления rest-параметров использовался специальный объект `arguments`, доступный внутри обычных функций:

```javascript
function total() {
    let sum = 0;
    for (let i = 0; i < arguments.length; i++) {
        sum += arguments[i];
    }
    return sum;
}
```

Rest-параметры считаются более современным и удобным подходом, так как результат — обычный массив со всеми его методами, в отличие от `arguments`.

### 6. Практический пример: функция расчёта среднего значения

```javascript
function average(...numbers) {
    if (numbers.length === 0) return 0;
    let sum = numbers.reduce((total, n) => total + n, 0);
    return sum / numbers.length;
}

console.log(average(4, 8, 15, 16, 23, 42));
```

### Резюме урока

- Значения параметров по умолчанию задаются через `параметр = значение` в объявлении функции.
- Rest-параметр (`...имя`) собирает произвольное число аргументов в обычный массив.
- Лишние переданные аргументы, не собранные rest-параметром, JavaScript просто игнорирует, не выдавая ошибку.

---

## Урок 4.3. Стрелочные функции (arrow functions)
**Время: 40 минут**

### Цель урока
Освоить синтаксис стрелочных функций — компактный современный способ записи функций в JavaScript.

### 1. Базовый синтаксис стрелочных функций

```javascript
const add = (a, b) => {
    return a + b;
};

console.log(add(5, 3));   // 8
```

### 2. Сокращённая запись для функций с одним выражением

Если тело функции состоит из одного выражения, фигурные скобки и `return` можно опустить — результат выражения возвращается автоматически:

```javascript
const add = (a, b) => a + b;
console.log(add(5, 3));   // 8

const square = x => x ** 2;   // одна скобка вокруг параметра можно опустить
console.log(square(5));       // 25

const sayHi = () => console.log("Привет!");   // без параметров - скобки обязательны
sayHi();
```

### 3. Сравнение с обычной функцией

```javascript
// Обычная функция
function multiply(a, b) {
    return a * b;
}

// Стрелочная функция
const multiply = (a, b) => a * b;
```

### 4. Стрелочные функции как аргументы других функций

Стрелочные функции особенно часто используются как компактный способ передать функцию в качестве аргумента, например в методы массивов (подробно разберём в Модуле 5):

```javascript
let numbers = [1, 2, 3, 4, 5];

let doubled = numbers.map(n => n * 2);
console.log(doubled);   // [2, 4, 6, 8, 10]

let evens = numbers.filter(n => n % 2 === 0);
console.log(evens);      // [2, 4]
```

### 5. Важное отличие: поведение this

У стрелочных функций особое поведение ключевого слова `this` — они не создают собственный контекст `this`, а используют `this` из окружающего кода. Эта особенность выходит за рамки базового уровня курса, но важно знать: из-за неё стрелочные функции не рекомендуется использовать как методы объектов, если внутри метода нужен доступ к самому объекту через `this`.

```javascript
const person = {
    name: "Алина",
    // Не рекомендуется:
    greet: () => {
        console.log(`Привет, ${this.name}`);   // this здесь работает не так, как ожидается
    }
};
```

### 6. Когда использовать стрелочные функции

- Короткие функции, особенно передаваемые как аргументы (`map`, `filter`, обработчики событий).
- Функции, где не требуется собственный контекст `this`.

Для методов объектов и в ситуациях, где важен контекст `this`, лучше использовать обычный синтаксис функции (`function` или сокращённая запись метода в объекте).

### Резюме урока

- Стрелочные функции (`=>`) — компактный современный синтаксис, особенно удобный для коротких функций.
- Для функции с одним выражением можно опустить фигурные скобки и `return`.
- Стрелочные функции по-особому обрабатывают `this`, поэтому не рекомендуются как методы объектов.

---

## Урок 4.4. Область видимости и замыкания (closures)
**Время: 45 минут**

### Цель урока
Понять разницу между локальной и глобальной областью видимости, а также освоить одну из ключевых концепций JavaScript — замыкания.

### 1. Блочная область видимости

Переменные, объявленные через `let` и `const`, видны только внутри блока `{}`, в котором были созданы:

```javascript
if (true) {
    let message = "Привет";
    console.log(message);   // Привет
}

console.log(message);   // ReferenceError: message is not defined
```

### 2. Локальные и глобальные переменные

```javascript
let globalVar = "Я глобальная";

function showVar() {
    let localVar = "Я локальная";
    console.log(globalVar);   // доступна
    console.log(localVar);    // доступна
}

showVar();
console.log(localVar);   // ReferenceError - localVar недоступна снаружи функции
```

### 3. Что такое замыкание (closure)

Замыкание — это функция, которая «запоминает» переменные из окружения (области видимости), в котором была создана, даже после того как это окружение формально завершило выполнение.

```javascript
function createCounter() {
    let count = 0;
    
    return function() {
        count++;
        return count;
    };
}

const counter = createCounter();
console.log(counter());   // 1
console.log(counter());   // 2
console.log(counter());   // 3
```

Здесь внутренняя функция «запоминает» переменную `count` из внешней функции `createCounter`, даже после того как `createCounter` уже завершила выполнение.

### 4. Практическое применение замыканий

Замыкания часто используются для создания приватных переменных — данных, недоступных напрямую снаружи, но управляемых через определённые функции:

```javascript
function createBankAccount(initialBalance) {
    let balance = initialBalance;
    
    return {
        deposit(amount) {
            balance += amount;
            console.log(`Баланс пополнен. Текущий баланс: ${balance}`);
        },
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(1000);
account.deposit(500);
console.log(account.getBalance());   // 1500
console.log(account.balance);          // undefined - напрямую недоступно
```

### 5. Замыкания в циклах — частая ловушка

```javascript
for (var i = 1; i <= 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// выведет: 4 4 4 (из-за особенностей var)

for (let i = 1; i <= 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// выведет: 1 2 3 (let создаёт новую переменную для каждой итерации)
```

Это ещё одна причина, по которой в современном JavaScript предпочтительнее использовать `let` вместо `var`.

### 6. Резюме концепции

Замыкания — довольно абстрактная тема для новичков, но важно запомнить главное: внутренняя функция «помнит» переменные внешней функции даже после её завершения. Эта концепция лежит в основе многих продвинутых паттернов JavaScript.

### Резюме урока

- Переменные, объявленные через `let`/`const`, ограничены блочной областью видимости `{}`.
- Замыкание — функция, сохраняющая доступ к переменным окружения, в котором была создана.
- Замыкания часто используются для создания «приватных» данных, недоступных напрямую извне.

---

## Урок 4.5. Практика: написание функций для задач
**Время: 45 минут**

### Цель урока
Закрепить материал модуля, реализовав несколько функций для решения практических задач.

### 1. Задача 1. Функция проверки палиндрома

```javascript
function isPalindrome(text) {
    let cleaned = text.toLowerCase().replaceAll(" ", "");
    let reversed = cleaned.split("").reverse().join("");
    return cleaned === reversed;
}

console.log(isPalindrome("шалаш"));   // true
console.log(isPalindrome("JavaScript"));  // false
```

### 2. Задача 2. Функция подсчёта статистики массива чисел

```javascript
function getStats(numbers) {
    return {
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        sum: numbers.reduce((total, n) => total + n, 0),
        average: numbers.reduce((total, n) => total + n, 0) / numbers.length
    };
}

console.log(getStats([4, 8, 15, 16, 23, 42]));
```

### 3. Задача 3. Мини-калькулятор с отдельными функциями

```javascript
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const multiply = (a, b) => a * b;
const divide = (a, b) => b === 0 ? "Ошибка: деление на ноль" : a / b;

function calculate(operation, a, b) {
    switch (operation) {
        case "+": return add(a, b);
        case "-": return subtract(a, b);
        case "*": return multiply(a, b);
        case "/": return divide(a, b);
        default: return "Неизвестная операция";
    }
}

console.log(calculate("+", 5, 3));   // 8
console.log(calculate("/", 5, 0));   // Ошибка: деление на ноль
```

### 4. Задача 4. Функция подсчёта частоты слов в тексте

```javascript
function wordFrequency(text) {
    let words = text.toLowerCase().split(" ");
    let frequency = {};
    
    for (let word of words) {
        frequency[word] = (frequency[word] || 0) + 1;
    }
    
    return frequency;
}

console.log(wordFrequency("кот собака кот попугай собака кот"));
// { кот: 3, собака: 2, попугай: 1 }
```

### 5. Задача 5. Функция генерации случайного пароля

```javascript
function generatePassword(length = 10) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    
    for (let i = 0; i < length; i++) {
        password += characters[Math.floor(Math.random() * characters.length)];
    }
    
    return password;
}

console.log(generatePassword());
console.log(generatePassword(16));
```

### 6. Рекомендации по написанию собственных функций

- Одна функция должна решать одну чётко определённую задачу.
- Давай функциям понятные глагольные имена в camelCase: `calculateTotal()`, а не `func1()`.
- Возвращай результат через `return`, а не только выводи через `console.log()` — так функцию проще переиспользовать.
- Учитывай граничные случаи: пустой массив, деление на ноль, некорректный ввод.

### Резюме урока

- Практика написания функций закрепляет понимание параметров, `return`, стрелочных функций и области видимости.
- Хорошо спроектированная функция решает одну задачу и может быть легко переиспользована в других частях программы.
