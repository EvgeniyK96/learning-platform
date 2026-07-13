# Модуль 5. Массивы и объекты

---

## Урок 5.1. Массивы: создание и базовые методы
**Время: 45 минут**

### Цель урока
Изучить массив как структуру данных в JavaScript: создание, доступ к элементам, основные методы.

### 1. Что такое массив

Массив (`array`) — упорядоченная коллекция значений, которая может содержать данные разных типов.

```javascript
let fruits = ["яблоко", "банан", "груша"];
let mixed = [1, "два", 3.0, true];
```

### 2. Доступ к элементам по индексу

Нумерация элементов начинается с 0:

```javascript
console.log(fruits[0]);              // яблоко
console.log(fruits[fruits.length - 1]);  // груша (последний элемент)
```

### 3. Изменение элементов массива

```javascript
fruits[1] = "апельсин";
console.log(fruits);   // ['яблоко', 'апельсин', 'груша']
```

### 4. Основные методы массивов

| Метод | Действие |
|---|---|
| `.push(x)` | добавляет элемент в конец |
| `.pop()` | удаляет и возвращает последний элемент |
| `.unshift(x)` | добавляет элемент в начало |
| `.shift()` | удаляет и возвращает первый элемент |
| `.indexOf(x)` | возвращает индекс элемента (или -1) |
| `.includes(x)` | проверяет наличие элемента (true/false) |
| `.slice(start, end)` | возвращает часть массива, не изменяя оригинал |
| `.splice(start, count)` | удаляет/добавляет элементы, изменяя оригинал |

```javascript
let numbers = [5, 3, 1, 4, 2];
numbers.push(10);
console.log(numbers);        // [5, 3, 1, 4, 2, 10]
console.log(numbers.length); // 6

numbers.sort();
console.log(numbers);        // [1, 10, 2, 3, 4, 5] - сортировка по умолчанию строковая!
```

> Важная особенность: метод `.sort()` без аргументов сортирует элементы как строки. Для корректной числовой сортировки нужно передать функцию сравнения: `numbers.sort((a, b) => a - b)`.

### 5. Перебор массива

```javascript
let fruits = ["яблоко", "банан", "груша"];

for (let fruit of fruits) {
    console.log(fruit);
}

fruits.forEach(fruit => console.log(fruit));   // альтернативный способ
```

### 6. Практический пример

```javascript
let grades = [];

for (let i = 0; i < 3; i++) {
    let grade = Number(prompt("Введите оценку:"));
    grades.push(grade);
}

let average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
console.log(`Средняя оценка: ${average}`);
```

### Резюме урока

- Массив — упорядоченная коллекция значений с индексацией от 0.
- Основные методы: `.push()`, `.pop()`, `.shift()`, `.unshift()`, `.indexOf()`, `.includes()`.
- `.sort()` без аргументов сортирует как строки — для чисел нужна функция сравнения.

---

## Урок 5.2. Методы массивов высшего порядка: map, filter, reduce
**Время: 50 минут**

### Цель урока
Освоить три ключевых метода функциональной обработки массивов — фундамент современного JavaScript.

### 1. Метод map()

`map()` создаёт новый массив, применяя переданную функцию к каждому элементу исходного массива:

```javascript
let numbers = [1, 2, 3, 4, 5];
let doubled = numbers.map(n => n * 2);
console.log(doubled);   // [2, 4, 6, 8, 10]
console.log(numbers);   // [1, 2, 3, 4, 5] - оригинал не изменился
```

### 2. Метод filter()

`filter()` создаёт новый массив, содержащий только элементы, для которых переданная функция вернула `true`:

```javascript
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let evens = numbers.filter(n => n % 2 === 0);
console.log(evens);   // [2, 4, 6, 8, 10]
```

### 3. Метод reduce()

`reduce()` «сворачивает» массив в единое значение, последовательно применяя функцию к аккумулятору и каждому элементу:

```javascript
let numbers = [1, 2, 3, 4, 5];
let sum = numbers.reduce((accumulator, current) => accumulator + current, 0);
console.log(sum);   // 15
```

Второй аргумент `reduce()` (здесь `0`) — начальное значение аккумулятора.

### 4. Комбинирование методов

Главная сила этих методов — в возможности объединять их в цепочку для решения комплексных задач:

```javascript
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let result = numbers
    .filter(n => n % 2 === 0)   // оставляем только чётные
    .map(n => n * n)              // возводим в квадрат
    .reduce((sum, n) => sum + n, 0);  // суммируем

console.log(result);   // 220
```

### 5. Работа с массивами объектов

```javascript
let students = [
    { name: "Алина", age: 20, grade: 85 },
    { name: "Данияр", age: 19, grade: 92 },
    { name: "Аружан", age: 22, grade: 78 }
];

let names = students.map(s => s.name);
console.log(names);   // ["Алина", "Данияр", "Аружан"]

let excellent = students.filter(s => s.grade >= 85);
console.log(excellent);

let averageGrade = students.reduce((sum, s) => sum + s.grade, 0) / students.length;
console.log(averageGrade);
```

### 6. Другие полезные методы: find, some, every

```javascript
let numbers = [1, 2, 3, 4, 5];

console.log(numbers.find(n => n > 3));      // 4 - первый подходящий элемент
console.log(numbers.some(n => n > 3));      // true - есть хотя бы один подходящий
console.log(numbers.every(n => n > 3));     // false - не все подходят
```

### Резюме урока

- `map()` преобразует каждый элемент массива, `filter()` отбирает подходящие элементы, `reduce()` сворачивает массив в одно значение.
- Ни один из этих методов не изменяет исходный массив — все возвращают новый результат.
- Методы можно комбинировать в цепочку для последовательной обработки данных.

---

## Урок 5.3. Объекты: создание, доступ к свойствам, методы
**Время: 45 минут**

### Цель урока
Изучить объект как ключевую структуру данных JavaScript: создание, доступ к свойствам, методы объекта.

### 1. Создание объекта

```javascript
let student = {
    name: "Алина",
    age: 20,
    course: "JS с нуля"
};
```

### 2. Доступ к свойствам

Есть два способа обращения к свойствам объекта — через точку и через квадратные скобки:

```javascript
console.log(student.name);        // Алина
console.log(student["age"]);       // 20
```

Квадратные скобки нужны, когда имя свойства хранится в переменной или содержит пробелы/спецсимволы:

```javascript
let key = "course";
console.log(student[key]);   // JS с нуля
```

### 3. Добавление и изменение свойств

```javascript
student.phone = "+7 700 000 00 00";   // добавили новое свойство
student.age = 21;                        // изменили существующее
```

### 4. Удаление свойства

```javascript
delete student.phone;
```

### 5. Методы объекта

Объект может содержать не только данные, но и функции — такие функции называются методами:

```javascript
let student = {
    name: "Алина",
    age: 20,
    greet() {
        console.log(`Привет, меня зовут ${this.name}`);
    }
};

student.greet();   // Привет, меня зовут Алина
```

Ключевое слово `this` внутри метода ссылается на сам объект, у которого этот метод вызван.

### 6. Перебор свойств объекта

```javascript
let student = { name: "Алина", age: 20, course: "JS с нуля" };

for (let key in student) {
    console.log(`${key}: ${student[key]}`);
}

console.log(Object.keys(student));     // ["name", "age", "course"]
console.log(Object.values(student));   // ["Алина", 20, "JS с нуля"]
console.log(Object.entries(student));  // [["name", "Алина"], ["age", 20], ...]
```

### 7. Проверка наличия свойства

```javascript
console.log("name" in student);          // true
console.log(student.hasOwnProperty("phone"));  // false
```

### Резюме урока

- Объект хранит данные в виде пар «ключ: значение» и может содержать как данные, так и методы.
- Доступ к свойствам — через точку (`.свойство`) или квадратные скобки (`["свойство"]`).
- `this` внутри метода объекта ссылается на сам объект, у которого этот метод был вызван.

---

## Урок 5.4. Деструктуризация массивов и объектов
**Время: 35 минут**

### Цель урока
Освоить деструктуризацию — удобный синтаксис для извлечения значений из массивов и объектов в отдельные переменные.

### 1. Деструктуризация массива

```javascript
let coordinates = [10, 20];
let [x, y] = coordinates;

console.log(x, y);   // 10 20
```

### 2. Пропуск элементов при деструктуризации массива

```javascript
let colors = ["красный", "зелёный", "синий"];
let [first, , third] = colors;   // пропускаем второй элемент

console.log(first, third);   // красный синий
```

### 3. Деструктуризация объекта

```javascript
let student = { name: "Алина", age: 20, course: "JS с нуля" };
let { name, age } = student;

console.log(name, age);   // Алина 20
```

Важное отличие от массивов: при деструктуризации объекта имена переменных должны совпадать с именами свойств (если не указано иное).

### 4. Переименование при деструктуризации объекта

```javascript
let student = { name: "Алина", age: 20 };
let { name: studentName, age: studentAge } = student;

console.log(studentName, studentAge);   // Алина 20
```

### 5. Значения по умолчанию при деструктуризации

```javascript
let student = { name: "Алина" };
let { name, age = 18 } = student;   // age не указан в объекте — используется значение по умолчанию

console.log(name, age);   // Алина 18
```

### 6. Деструктуризация в параметрах функции

Один из самых частых практических случаев — деструктуризация прямо в параметрах функции:

```javascript
function printStudent({ name, age }) {
    console.log(`${name}, ${age} лет`);
}

printStudent({ name: "Данияр", age: 19 });
```

### Резюме урока

- Деструктуризация массива происходит по позиции: `let [a, b] = array`.
- Деструктуризация объекта происходит по имени свойства: `let { name, age } = object`.
- Деструктуризация особенно удобна в параметрах функций, принимающих объект.

---

## Урок 5.5. Spread и rest операторы
**Время: 35 минут**

### Цель урока
Научиться использовать оператор `...` для «распаковки» и «сборки» массивов и объектов.

### 1. Spread-оператор с массивами

Spread-оператор «распаковывает» элементы массива:

```javascript
let numbers = [1, 2, 3];
console.log(...numbers);   // 1 2 3 (как отдельные аргументы)

let more = [0, ...numbers, 4];
console.log(more);   // [0, 1, 2, 3, 4]
```

### 2. Копирование массива через spread

```javascript
let original = [1, 2, 3];
let copy = [...original];    // создаёт новый независимый массив

copy.push(4);
console.log(original);   // [1, 2, 3] - оригинал не изменился
console.log(copy);         // [1, 2, 3, 4]
```

### 3. Объединение массивов

```javascript
let fruits = ["яблоко", "банан"];
let vegetables = ["морковь", "картофель"];

let food = [...fruits, ...vegetables];
console.log(food);   // ["яблоко", "банан", "морковь", "картофель"]
```

### 4. Spread-оператор с объектами

```javascript
let student = { name: "Алина", age: 20 };
let studentWithCourse = { ...student, course: "JS с нуля" };

console.log(studentWithCourse);
// { name: "Алина", age: 20, course: "JS с нуля" }
```

Это часто применяется для создания копии объекта с изменённым значением, не затрагивая оригинал:

```javascript
let updatedStudent = { ...student, age: 21 };
console.log(student);          // age не изменился
console.log(updatedStudent);   // age: 21
```

### 5. Spread в вызове функций

```javascript
function sum(a, b, c) {
    return a + b + c;
}

let numbers = [1, 2, 3];
console.log(sum(...numbers));   // 6
```

### 6. Rest-оператор — обратная операция

Rest-оператор (тот же синтаксис `...`, но «собирающий», а не «распаковывающий») уже встречался нам в параметрах функций (Урок 4.2). Он также применим при деструктуризации:

```javascript
let numbers = [1, 2, 3, 4, 5];
let [first, second, ...rest] = numbers;

console.log(first, second);   // 1 2
console.log(rest);              // [3, 4, 5]
```

### Резюме урока

- Spread-оператор (`...`) «распаковывает» массив или объект — используется для копирования, объединения и передачи в функции.
- Rest-оператор использует тот же синтаксис `...`, но «собирает» значения — используется в параметрах функций и деструктуризации.
- Spread с объектами — удобный способ создать копию с изменёнными значениями, не затрагивая оригинал.

---

## Урок 5.6. Практика: обработка массивов объектов
**Время: 50 минут**

### Цель урока
Закрепить материал модуля, решив несколько задач по обработке массивов объектов — самой частой структуры данных в реальных приложениях.

### 1. Исходные данные для практики

```javascript
let students = [
    { name: "Алина", age: 20, grade: 85, course: "JS с нуля" },
    { name: "Данияр", age: 19, grade: 92, course: "Python с нуля" },
    { name: "Аружан", age: 22, grade: 78, course: "JS с нуля" },
    { name: "Ерлан", age: 21, grade: 95, course: "Java с нуля" }
];
```

### 2. Задача 1. Получить список имён студентов старше 20 лет

```javascript
let names = students
    .filter(s => s.age > 20)
    .map(s => s.name);

console.log(names);   // ["Аружан", "Ерлан"]
```

### 3. Задача 2. Найти студента с самой высокой оценкой

```javascript
let topStudent = students.reduce((best, current) =>
    current.grade > best.grade ? current : best
);

console.log(topStudent);   // { name: "Ерлан", ... grade: 95 ... }
```

### 4. Задача 3. Сгруппировать студентов по курсу

```javascript
let byCourse = students.reduce((groups, student) => {
    let course = student.course;
    if (!groups[course]) {
        groups[course] = [];
    }
    groups[course].push(student.name);
    return groups;
}, {});

console.log(byCourse);
// { "JS с нуля": ["Алина", "Аружан"], "Python с нуля": ["Данияр"], "Java с нуля": ["Ерлан"] }
```

### 5. Задача 4. Отсортировать студентов по оценке (убывание)

```javascript
let sortedByGrade = [...students].sort((a, b) => b.grade - a.grade);
console.log(sortedByGrade.map(s => `${s.name}: ${s.grade}`));
```

> Обрати внимание: мы используем `[...students]` для создания копии массива перед сортировкой, чтобы не изменять порядок элементов в оригинальном массиве `students`.

### 6. Задача 5. Посчитать среднюю оценку по каждому курсу

```javascript
let courses = [...new Set(students.map(s => s.course))];

let averageByCourse = courses.map(course => {
    let courseStudents = students.filter(s => s.course === course);
    let average = courseStudents.reduce((sum, s) => sum + s.grade, 0) / courseStudents.length;
    return { course, average };
});

console.log(averageByCourse);
```

### Резюме урока

- Массивы объектов — стандартный способ хранения однотипных записей в реальных JavaScript-приложениях (данные пользователей, товары, задачи и т.д.).
- Комбинация методов `filter`, `map`, `reduce`, `sort` позволяет решать практически любую задачу обработки таких данных без явных циклов `for`.
- Работа с массивами объектов — база для дальнейшего изучения работы с данными от API (Модуль 9) и отображения данных на странице (Модуль 6).
