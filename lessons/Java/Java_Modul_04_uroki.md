# Модуль 4. Методы (функции)

---

## Урок 4.1. Объявление и вызов методов
**Время: 40 минут**

### Цель урока
Научиться объявлять и вызывать методы в Java (в Java функции всегда называются методами, так как обязательно принадлежат какому-либо классу).

### 1. Методы vs функции: терминология Java

В Java нет «свободных» функций, существующих вне класса, как в Python или C++ — любой блок переиспользуемого кода обязательно является методом какого-либо класса. Пока мы работаем с методом `main`, все дополнительные методы также объявляются внутри того же класса.

### 2. Объявление метода

```java
public class Main {
    
    static int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        int result = add(5, 3);
        System.out.println(result);   // 8
    }
}
```

Как и в C++, обязательно указывается тип возвращаемого значения и типы всех параметров.

### 3. Модификатор static

Обрати внимание на ключевое слово `static` перед методом `add`. Поскольку метод `main` сам является `static`, он может напрямую вызывать только другие `static`-методы того же класса без создания объекта. Полное понимание разницы между `static` и обычными («инстанс») методами придёт вместе с изучением ООП в Модуле 6 — пока используем `static` для всех вспомогательных методов, вызываемых напрямую из `main`.

### 4. Метод без возвращаемого значения: void

```java
static void greet(String name) {
    System.out.println("Привет, " + name + "!");
}

public static void main(String[] args) {
    greet("Алина");
}
```

### 5. Функция isPrime — практический пример

```java
static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i < n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}

public static void main(String[] args) {
    System.out.println(isPrime(7));    // true
    System.out.println(isPrime(10));   // false
}
```

### 6. Порядок объявления методов в классе

В отличие от C++, где требовались прототипы функций для вызова до места их полного определения (Урок 4.1 курса C++), в Java порядок объявления методов внутри класса не важен — метод можно вызывать из другого метода того же класса независимо от того, объявлен ли он выше или ниже по тексту файла:

```java
public class Main {
    public static void main(String[] args) {
        System.out.println(square(5));   // работает, хотя square объявлен ниже
    }
    
    static int square(int x) {
        return x * x;
    }
}
```

### Резюме урока

- В Java все методы обязательно принадлежат какому-либо классу — «свободных» функций, как в Python или C++, не существует.
- При объявлении метода обязательно указываются тип возвращаемого значения и типы всех параметров, аналогично C++.
- В отличие от C++, порядок объявления методов внутри класса не важен для их взаимного вызова — прототипы не требуются.

---

## Урок 4.2. Параметры и возвращаемые значения
**Время: 40 минут**

### Цель урока
Углубить понимание работы с параметрами и возвращаемыми значениями методов Java.

### 1. Передача примитивов: только по значению

В Java параметры примитивных типов **всегда** передаются по значению — метод получает копию, и изменения внутри метода не влияют на оригинальную переменную:

```java
static void increment(int x) {
    x = x + 1;
}

public static void main(String[] args) {
    int number = 5;
    increment(number);
    System.out.println(number);   // 5 (не изменилось)
}
```

### 2. Важная особенность: в Java нет передачи по ссылке для примитивов

В отличие от C++ (Урок 4.2 курса C++), в Java **не существует** механизма передачи примитивов по ссылке (`&`). Если методу нужно «изменить» несколько значений, стандартный подход — вернуть объект или массив, объединяющий несколько результатов, либо использовать объект-обёртку:

```java
static int[] getMinMax(int[] arr) {
    int min = arr[0], max = arr[0];
    for (int value : arr) {
        if (value < min) min = value;
        if (value > max) max = value;
    }
    return new int[]{min, max};   // возвращаем оба значения через массив
}

public static void main(String[] args) {
    int[] numbers = {5, 3, 8, 1, 9};
    int[] result = getMinMax(numbers);
    System.out.println("Мин: " + result[0] + ", Макс: " + result[1]);
}
```

### 3. Передача объектов: по значению ссылки

Хотя примитивы передаются строго по значению, объекты (включая массивы) в Java передаются немного иначе: метод получает копию **ссылки** на объект, а не копию самого объекта — это означает, что метод не может заменить объект целиком для вызывающего кода, но может изменить его внутреннее состояние:

```java
static void modifyArray(int[] arr) {
    arr[0] = 999;   // изменяет содержимое исходного массива!
}

public static void main(String[] args) {
    int[] numbers = {1, 2, 3};
    modifyArray(numbers);
    System.out.println(numbers[0]);   // 999 (изменилось!)
}
```

Эта особенность иногда называется «передача по значению ссылки» и часто вызывает путаницу у новичков — важно понимать, что сама переменная-ссылка копируется, но объект, на который она указывает, остаётся одним и тем же в памяти.

### 4. Метод, возвращающий объект

```java
static String buildGreeting(String name, int age) {
    return "Привет, " + name + "! Тебе " + age + " лет.";
}

public static void main(String[] args) {
    String message = buildGreeting("Данияр", 20);
    System.out.println(message);
}
```

### 5. Метод, возвращающий массив

```java
static int[] createSquares(int n) {
    int[] squares = new int[n];
    for (int i = 0; i < n; i++) {
        squares[i] = (i + 1) * (i + 1);
    }
    return squares;
}

public static void main(String[] args) {
    int[] result = createSquares(5);
    for (int value : result) {
        System.out.print(value + " ");
    }
    // 1 4 9 16 25
}
```

### 6. varargs — переменное число аргументов

Java поддерживает синтаксис для приёма произвольного числа аргументов одного типа, аналогичный `*args` в Python:

```java
static int sum(int... numbers) {
    int total = 0;
    for (int number : numbers) {
        total += number;
    }
    return total;
}

public static void main(String[] args) {
    System.out.println(sum(1, 2, 3));         // 6
    System.out.println(sum(10, 20, 30, 40));  // 100
}
```

Внутри метода `numbers` доступен как обычный массив.

### Резюме урока

- Примитивные типы в Java всегда передаются в методы строго по значению — не существует механизма передачи по ссылке, аналогичного C++.
- Объекты и массивы передаются «по значению ссылки»: метод не может заменить сам объект для вызывающего кода, но может изменить его внутреннее состояние.
- Синтаксис varargs (`тип... имя`) позволяет методу принимать произвольное число аргументов, аналогично `*args` в Python.

---

## Урок 4.3. Перегрузка методов (overloading)
**Время: 35 минут**

### Цель урока
Изучить перегрузку методов в Java — аналог перегрузки функций в C++.

### 1. Что такое перегрузка методов

Как и в C++ (Урок 4.3 курса C++), перегрузка позволяет иметь несколько методов с одинаковым именем, но разными параметрами:

```java
static int add(int a, int b) {
    return a + b;
}

static double add(double a, double b) {
    return a + b;
}

public static void main(String[] args) {
    System.out.println(add(5, 3));         // вызовет версию с int: 8
    System.out.println(add(5.5, 3.2));     // вызовет версию с double: 8.7
}
```

### 2. Перегрузка по количеству параметров

```java
static int add(int a, int b) {
    return a + b;
}

static int add(int a, int b, int c) {
    return a + b + c;
}
```

### 3. Ограничения перегрузки (аналогично C++)

Методы не могут перегружаться только по типу возвращаемого значения — компилятор должен уметь однозначно определить нужную версию только по списку параметров.

### 4. Конструкторы как частый случай перегрузки

Перегрузка особенно часто применяется к конструкторам класса (подробно разберём в Модуле 6), позволяя создавать объекты разными способами:

```java
public class Point {
    int x, y;
    
    Point() {                 // конструктор без параметров
        this(0, 0);              // вызов другого конструктора того же класса
    }
    
    Point(int x, int y) {   // конструктор с параметрами
        this.x = x;
        this.y = y;
    }
}
```

Ключевое слово `this(...)` для вызова другого конструктора того же класса подробно разберём в Модуле 6.

### 5. Практический пример: перегруженные методы вычисления площади

```java
static double area(double side) {
    return side * side;
}

static double area(double length, double width) {
    return length * width;
}

public static void main(String[] args) {
    System.out.println("Площадь квадрата: " + area(5.0));
    System.out.println("Площадь прямоугольника: " + area(4.0, 6.0));
}
```

### 6. Автоматическое определение версии методом при неоднозначности

Иногда при вызове перегруженного метода с аргументами смешанных типов Java может столкнуться с неоднозначностью — в таких случаях лучше явно указывать тип аргумента (например, добавлять суффикс `.0` для double или явно приводить тип), чтобы избежать путаницы и потенциальных ошибок компиляции.

### Резюме урока

- Перегрузка методов в Java работает по тому же принципу, что и в C++: одно имя, разные наборы параметров.
- Методы не могут перегружаться только по типу возвращаемого значения.
- Перегрузка особенно часто применяется к конструкторам класса, позволяя создавать объекты несколькими различными способами.

---

## Урок 4.4. Рекурсия
**Время: 40 минут**

### Цель урока
Освоить рекурсию в контексте синтаксиса Java.

### 1. Повторение концепции рекурсии

Как и в предыдущих языках курса, рекурсивный метод — метод, вызывающий сам себя, с обязательным базовым случаем и рекурсивным случаем.

### 2. Классический пример: факториал

```java
static long factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

public static void main(String[] args) {
    System.out.println(factorial(5));   // 120
}
```

Обрати внимание на тип возвращаемого значения `long` вместо `int` — факториал быстро растёт и может превысить диапазон `int` уже для сравнительно небольших чисел.

### 3. Числа Фибоначчи

```java
static int fibonacci(int n) {
    if (n <= 1) {
        return n;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
}

public static void main(String[] args) {
    for (int i = 0; i < 10; i++) {
        System.out.print(fibonacci(i) + " ");
    }
    // 0 1 1 2 3 5 8 13 21 34
}
```

### 4. StackOverflowError

Аналогично переполнению стека в C++, слишком глубокая или бесконечная рекурсия в Java приводит к ошибке `StackOverflowError`:

```java
static int broken(int n) {
    return broken(n - 1);   // нет базового случая
}

public static void main(String[] args) {
    broken(1);   // приведёт к StackOverflowError
}
```

### 5. Рекурсивный метод для суммы цифр числа

```java
static int sumOfDigits(int n) {
    if (n < 10) {
        return n;
    }
    return n % 10 + sumOfDigits(n / 10);
}

public static void main(String[] args) {
    System.out.println(sumOfDigits(12345));   // 15
}
```

### 6. Рекурсия vs итерация

Как и в других изученных языках, для задач с большой глубиной рекурсии итеративное решение через цикл часто эффективнее и безопаснее с точки зрения использования памяти:

```java
static long factorialLoop(int n) {
    long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

### Резюме урока

- Рекурсия в Java следует тем же принципам, что и в других C-подобных языках: обязательный базовый случай и рекурсивный случай.
- Слишком глубокая рекурсия приводит к ошибке `StackOverflowError`, аналогичной переполнению стека в C++.
- Для операций с потенциально большими результатами (например, факториал) стоит заранее продумывать тип возвращаемого значения (`long` вместо `int`).

---

## Урок 4.5. Практика: набор методов для задач
**Время: 55 минут**

### Цель урока
Закрепить материал модуля, реализовав несколько методов для практических задач.

### 1. Задача 1. Метод проверки палиндрома

```java
static boolean isPalindrome(String text) {
    String cleaned = text.toLowerCase().replace(" ", "");
    String reversed = new StringBuilder(cleaned).reverse().toString();
    return cleaned.equals(reversed);
}

public static void main(String[] args) {
    System.out.println(isPalindrome("шалаш"));   // true
    System.out.println(isPalindrome("Java"));      // false
}
```

### 2. Задача 2. Метод подсчёта статистики массива

```java
static void printStats(int[] numbers) {
    int min = numbers[0], max = numbers[0], sum = 0;
    
    for (int number : numbers) {
        if (number < min) min = number;
        if (number > max) max = number;
        sum += number;
    }
    
    double average = (double) sum / numbers.length;
    
    System.out.println("Мин: " + min + ", Макс: " + max + ", Среднее: " + average);
}
```

### 3. Задача 3. Мини-калькулятор с отдельными методами

```java
static double add(double a, double b) { return a + b; }
static double subtract(double a, double b) { return a - b; }
static double multiply(double a, double b) { return a * b; }

static double divide(double a, double b) {
    if (b == 0) {
        System.out.println("Ошибка: деление на ноль");
        return 0;
    }
    return a / b;
}

public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    System.out.print("Введите операцию (+, -, *, /): ");
    String operation = scanner.next();
    System.out.print("Введите два числа: ");
    double x = scanner.nextDouble();
    double y = scanner.nextDouble();
    
    double result = switch (operation) {
        case "+" -> add(x, y);
        case "-" -> subtract(x, y);
        case "*" -> multiply(x, y);
        case "/" -> divide(x, y);
        default -> {
            System.out.println("Неизвестная операция");
            yield 0;
        }
    };
    
    System.out.println("Результат: " + result);
}
```

Ключевое слово `yield` используется внутри блока `default -> { }` для возврата значения из более сложного, многострочного блока switch-выражения.

### 4. Задача 4. Метод подсчёта частоты символов

```java
import java.util.HashMap;
import java.util.Map;

static Map<Character, Integer> countCharacters(String text) {
    Map<Character, Integer> frequency = new HashMap<>();
    
    for (char c : text.toCharArray()) {
        frequency.put(c, frequency.getOrDefault(c, 0) + 1);
    }
    
    return frequency;
}
```

(`HashMap` подробно разберём в Модуле 7 — здесь пример забегает немного вперёд для демонстрации.)

### 5. Задача 5. Рекурсивный метод быстрого возведения в степень

```java
static double power(double base, int exponent) {
    if (exponent == 0) return 1;
    if (exponent < 0) return 1 / power(base, -exponent);
    return base * power(base, exponent - 1);
}

public static void main(String[] args) {
    System.out.println(power(2, 10));    // 1024.0
    System.out.println(power(2, -2));     // 0.25
}
```

### 6. Рекомендации по написанию собственных методов

- Явно указывай типы параметров и возвращаемого значения.
- Для нескольких возвращаемых значений используй массив, объект или коллекцию, так как Java не поддерживает передачу примитивов по ссылке.
- Давай методам понятные глагольные имена в camelCase, следуя общим соглашениям Java.

### Резюме урока

- Практика написания методов закрепляет понимание типизации, перегрузки и возврата значений в Java.
- Отсутствие передачи примитивов по ссылке в Java требует альтернативных подходов для возврата нескольких значений из одного метода.
- Современный синтаксис switch-выражения с `yield` полезен для более компактной реализации ветвящейся логики, возвращающей значение.
