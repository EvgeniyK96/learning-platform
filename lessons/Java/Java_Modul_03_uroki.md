# Модуль 3. Управляющие конструкции

---

## Урок 3.1. Условия if / else if / else, switch
**Время: 45 минут**

### Цель урока
Научиться управлять логикой программы в зависимости от условий в синтаксисе Java.

### 1. Базовая конструкция if / else if / else

```java
int score = 75;
char grade;

if (score >= 90) {
    grade = 'A';
} else if (score >= 75) {
    grade = 'B';
} else if (score >= 60) {
    grade = 'C';
} else {
    grade = 'F';
}

System.out.println("Твоя оценка: " + grade);
```

Синтаксис полностью аналогичен C++ и JavaScript.

### 2. Тернарный оператор

```java
int age = 20;
String status = (age >= 18) ? "взрослый" : "несовершеннолетний";
System.out.println(status);
```

### 3. Конструкция switch (классический синтаксис)

```java
int day = 3;

switch (day) {
    case 1:
        System.out.println("Понедельник");
        break;
    case 2:
        System.out.println("Вторник");
        break;
    case 3:
        System.out.println("Среда");
        break;
    default:
        System.out.println("Другой день");
}
```

В отличие от C++, `switch` в Java может работать не только с целочисленными типами, но и с `String`:

```java
String day = "Среда";

switch (day) {
    case "Суббота":
    case "Воскресенье":
        System.out.println("Выходной");
        break;
    case "Среда":
        System.out.println("Середина недели");
        break;
    default:
        System.out.println("Обычный день");
}
```

### 4. Современный синтаксис switch-выражения (Java 14+)

Начиная с более новых версий Java, доступен более компактный и безопасный синтаксис switch-выражения со стрелочным оператором `->`, не требующим `break`:

```java
String day = "Среда";

String result = switch (day) {
    case "Суббота", "Воскресенье" -> "Выходной";
    case "Среда" -> "Середина недели";
    default -> "Обычный день";
};

System.out.println(result);
```

Этот синтаксис устраняет проблему забытого `break` (fall-through), знакомую по классическому `switch`, и позволяет использовать `switch` как выражение, сразу возвращающее значение.

### 5. Важность break в классическом switch

```java
int x = 1;

switch (x) {
    case 1:
        System.out.println("Один");
        // забыли break!
    case 2:
        System.out.println("Два");
        break;
}
// Выведет и "Один", и "Два" - fall-through, знакомая проблема классического switch
```

### 6. Типичные ошибки новичков

- Используют `=` вместо `==` внутри условия (в Java, в отличие от C++, это приводит к ошибке компиляции, если условие не является типом `boolean`, что делает эту ошибку менее опасной, чем в C++).
- Забывают `break` в классическом `switch`.
- Путают `.equals()` и `==` при сравнении строк внутри условий (см. Урок 2.3).

### Резюме урока

- `if/else if/else` — основная конструкция ветвления, синтаксически схожая с другими C-подобными языками.
- В отличие от C++, `switch` в Java поддерживает работу со строками `String`, а не только с целочисленными типами.
- Современный синтаксис switch-выражения со стрелкой `->` устраняет проблему fall-through и позволяет использовать `switch` как выражение.

---

## Урок 3.2. Цикл for
**Время: 40 минут**

### Цель урока
Освоить классический цикл for в Java.

### 1. Синтаксис цикла for

```java
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}
```

Структура идентична циклам `for` в C++ и JavaScript: инициализация; условие; шаг.

### 2. Перебор массива через for

```java
int[] numbers = {10, 20, 30, 40, 50};

for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}
```

В отличие от C++, массивы в Java хранят свою длину в свойстве `.length` — не нужно отдельно вычислять размер через `sizeof`.

### 3. Расширенный цикл for-each

```java
int[] numbers = {10, 20, 30, 40, 50};

for (int number : numbers) {
    System.out.println(number);
}
```

For-each — рекомендуемый способ перебора элементов, когда индекс не нужен, аналогично range-based for в C++.

### 4. Вложенные циклы for

```java
for (int i = 1; i <= 3; i++) {
    for (int j = 1; j <= 3; j++) {
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

### 5. Изменение шага цикла

```java
for (int i = 0; i <= 20; i += 2) {
    System.out.print(i + " ");
}
```

### 6. Практический пример: таблица умножения

```java
Scanner scanner = new Scanner(System.in);
System.out.print("Введите число: ");
int number = scanner.nextInt();

for (int i = 1; i <= 10; i++) {
    System.out.println(number + " x " + i + " = " + (number * i));
}
```

### Резюме урока

- Синтаксис цикла `for` в Java идентичен C++ и JavaScript.
- Массивы Java хранят свою длину в свойстве `.length`, что упрощает работу с ними по сравнению с обычными массивами C++.
- Расширенный цикл for-each (`for (тип элемент : массив)`) — рекомендуемый способ перебора, когда индекс элемента не требуется.

---

## Урок 3.3. Циклы while и do...while
**Время: 35 минут**

### Цель урока
Научиться использовать циклы while и do...while в Java.

### 1. Цикл while

```java
int count = 1;

while (count <= 5) {
    System.out.println(count);
    count++;
}
```

### 2. Цикл do...while

```java
int count = 10;

do {
    System.out.println(count);
    count++;
} while (count <= 5);
// выведет 10, так как тело выполняется хотя бы раз
```

### 3. Практический пример: игра «Угадай число»

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int secretNumber = 42;
        int guess;
        
        do {
            System.out.print("Угадай число от 1 до 100: ");
            guess = scanner.nextInt();
            
            if (guess < secretNumber) {
                System.out.println("Больше!");
            } else if (guess > secretNumber) {
                System.out.println("Меньше!");
            }
        } while (guess != secretNumber);
        
        System.out.println("Ты угадал!");
    }
}
```

### 4. break и continue

```java
int count = 0;

while (true) {
    count++;
    if (count > 5) {
        break;
    }
    if (count % 2 == 0) {
        continue;
    }
    System.out.println(count);
}
```

### 5. Метки (labels) для вложенных циклов

В отличие от C++, Java поддерживает именованные метки для управления вложенными циклами через `break`/`continue` — более идиоматичное решение, чем логический флаг:

```java
outerLoop:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) {
            break outerLoop;   // прерывает оба цикла сразу
        }
        System.out.println(i + " " + j);
    }
}
```

### 6. Выбор между for, while и do...while

Принцип выбора аналогичен уже изученным языкам: `for` — при известном количестве повторений, `while` — при повторении по условию, `do...while` — когда тело цикла должно выполниться хотя бы один раз.

### Резюме урока

- Циклы `while` и `do...while` в Java синтаксически идентичны C++, отличие `do...while` — гарантированное выполнение тела хотя бы один раз.
- В отличие от C++, Java поддерживает именованные метки для `break`/`continue`, что упрощает управление вложенными циклами.
- Выбор конкретного вида цикла зависит от того, известно ли заранее число повторений.

---

## Урок 3.4. break, continue, вложенные циклы
**Время: 45 минут**

### Цель урока
Углубить понимание break, continue и вложенных циклов, включая использование меток.

### 1. Повторение: break и continue

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) break;
    System.out.print(i + " ");
}
// 1 2 3 4

for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;
    System.out.print(i + " ");
}
// 1 3 5 7 9
```

### 2. Метки с continue

Метки в Java работают не только с `break`, но и с `continue` — позволяя пропустить итерацию именно внешнего цикла:

```java
outerLoop:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) {
            continue outerLoop;   // переходит к следующей итерации ВНЕШНЕГО цикла
        }
        System.out.println(i + " " + j);
    }
}
```

### 3. Практический пример: треугольник из звёздочек

```java
int height = 5;

for (int i = 1; i <= height; i++) {
    StringBuilder row = new StringBuilder();
    for (int j = 0; j < i; j++) {
        row.append("*");
    }
    System.out.println(row);
}
```

`StringBuilder` — эффективный класс для построения строк в цикле, подробнее разберём в Уроке 5.3.

### 4. Практический пример: поиск простого числа

```java
public static boolean isPrime(int number) {
    if (number < 2) return false;
    
    for (int i = 2; i <= Math.sqrt(number); i++) {
        if (number % i == 0) {
            return false;
        }
    }
    return true;
}
```

(Методы подробно разберём в Модуле 4 — здесь пример забегает немного вперёд.)

### 5. Множественная вложенность и читаемость кода

Хотя технически Java позволяет вкладывать циклы на любую глубину, слишком глубокая вложенность (более 3 уровней) обычно считается признаком того, что код стоит разбить на отдельные методы для улучшения читаемости — это общая рекомендация хорошего стиля, применимая ко всем изучаемым в курсе языкам.

### 6. Сравнение с подходом C++ (без меток)

В отличие от C++, где для выхода из нескольких вложенных циклов обычно требовался логический флаг (Урок 3.4 курса C++), встроенные метки Java делают эту задачу более прямолинейной и читаемой.

### Резюме урока

- Метки в Java работают как с `break`, так и с `continue`, позволяя точно управлять поведением вложенных циклов.
- Слишком глубокая вложенность циклов — признак того, что код стоит разбить на отдельные методы.
- Встроенная поддержка меток — удобство Java по сравнению с C++, где для аналогичной задачи обычно требуется логический флаг.

---

## Урок 3.5. Практика: решение задач с условиями и циклами
**Время: 60 минут**

### Цель урока
Закрепить материал модуля, решив несколько практических задач.

### 1. Задача 1. Определение чётности чисел от 1 до 20

```java
for (int number = 1; number <= 20; number++) {
    if (number % 2 == 0) {
        System.out.println(number + " - чётное");
    } else {
        System.out.println(number + " - нечётное");
    }
}
```

### 2. Задача 2. Сумма чисел от 1 до N

```java
Scanner scanner = new Scanner(System.in);
System.out.print("Введите N: ");
int n = scanner.nextInt();

int total = 0;
for (int i = 1; i <= n; i++) {
    total += i;
}

System.out.println("Сумма чисел от 1 до " + n + ": " + total);
```

### 3. Задача 3. Подсчёт гласных букв в слове

```java
Scanner scanner = new Scanner(System.in);
System.out.print("Введите слово: ");
String word = scanner.nextLine().toLowerCase();
String vowels = "aeiouаеёиоуыэюя";
int count = 0;

for (char letter : word.toCharArray()) {
    if (vowels.indexOf(letter) != -1) {
        count++;
    }
}

System.out.println("Количество гласных: " + count);
```

`.toCharArray()` преобразует строку в массив символов для удобного перебора.

### 4. Задача 4. FizzBuzz

```java
for (int number = 1; number <= 100; number++) {
    if (number % 3 == 0 && number % 5 == 0) {
        System.out.println("FizzBuzz");
    } else if (number % 3 == 0) {
        System.out.println("Fizz");
    } else if (number % 5 == 0) {
        System.out.println("Buzz");
    } else {
        System.out.println(number);
    }
}
```

### 5. Задача 5. Таблица умножения от 1 до 5

```java
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= 5; j++) {
        System.out.print((i * j) + "\t");
    }
    System.out.println();
}
```

### 6. Как подходить к решению подобных задач

1. Прочитай условие, определи входные и выходные данные и их типы.
2. Определи, какой вид цикла подходит для задачи.
3. Реши задачу пошагово словами перед написанием кода.
4. Проверь пограничные случаи (N = 0, пустая строка).

### Резюме урока

- Практика закрепляет понимание условий и циклов, синтаксически схожих с ранее изученными в курсе языками.
- Работа со строками в Java (например, `.toCharArray()`, `.indexOf()`) имеет свои особенности синтаксиса, характерные для языка.
- FizzBuzz и подобные классические задачи хорошо подходят для быстрого закрепления нового синтаксиса.
