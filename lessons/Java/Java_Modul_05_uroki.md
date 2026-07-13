# Модуль 5. Массивы и строки

---

## Урок 5.1. Одномерные и многомерные массивы
**Время: 50 минут**

### Цель урока
Изучить массивы в Java: объявление, доступ к элементам, многомерные массивы.

### 1. Массивы — объекты в Java

В отличие от C++, где массив является примитивной конструкцией языка, в Java массив — это полноценный объект, хранящий свою длину и создаваемый через ключевое слово `new` (либо через специальный литеральный синтаксис).

### 2. Объявление и создание массива

```java
int[] numbers = new int[5];              // массив на 5 элементов, заполненный нулями по умолчанию
int[] scores = {90, 85, 78, 92, 88};   // массив с инициализацией

String[] names = new String[3];        // массив строк, заполненный null по умолчанию
```

### 3. Значения по умолчанию

При создании массива через `new` без явной инициализации элементы получают значение по умолчанию для своего типа: `0` для числовых типов, `false` для `boolean`, `null` для ссылочных типов (включая `String`).

### 4. Доступ к элементам и длина массива

```java
int[] numbers = {10, 20, 30, 40, 50};

System.out.println(numbers[0]);          // 10
System.out.println(numbers.length);      // 5 (свойство, а не метод - без скобок!)

numbers[1] = 99;
```

### 5. Выход за границы массива

В отличие от C++, где выход за границы массива приводит к неопределённому поведению (Урок 5.1 курса C++), Java **всегда** проверяет корректность индекса во время выполнения и выбрасывает исключение `ArrayIndexOutOfBoundsException` при выходе за границы:

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers[10]);   // ArrayIndexOutOfBoundsException
```

Это одно из ключевых различий философии безопасности между Java и C++ — Java жертвует небольшой частью производительности ради значительно большей безопасности во время выполнения.

### 6. Многомерные массивы

```java
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

System.out.println(matrix[0][0]);   // 1
System.out.println(matrix[1][2]);   // 6
System.out.println(matrix.length);       // 3 (количество строк)
System.out.println(matrix[0].length);   // 3 (количество столбцов в первой строке)
```

### 7. Перебор многомерного массива

```java
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}

// или через for-each:
for (int[] row : matrix) {
    for (int value : row) {
        System.out.print(value + " ");
    }
    System.out.println();
}
```

### 8. Массив методов Arrays (кратко, подробно в Уроке 5.4)

```java
import java.util.Arrays;

int[] numbers = {5, 3, 1, 4, 2};
System.out.println(Arrays.toString(numbers));   // [5, 3, 1, 4, 2] - удобный вывод содержимого массива
```

### Резюме урока

- Массивы в Java — полноценные объекты, хранящие свою длину в свойстве `.length` (без скобок, в отличие от методов).
- В отличие от C++, Java всегда проверяет границы массива во время выполнения, выбрасывая `ArrayIndexOutOfBoundsException` при выходе за пределы.
- Многомерные массивы объявляются через `тип[][]` и представляют собой, по сути, «массив массивов».

---

## Урок 5.2. Класс String и его методы
**Время: 45 минут**

### Цель урока
Изучить особенности класса String в Java и его основные методы.

### 1. Неизменяемость строк (String immutability)

Ключевая особенность строк в Java — их неизменяемость (immutability): после создания объект `String` никогда не изменяется, любая операция, «модифицирующая» строку, на самом деле создаёт новый объект:

```java
String text = "Hello";
text.concat(" World");         // создаёт НОВУЮ строку, но не изменяет исходную text!
System.out.println(text);      // Hello (не изменилось!)

text = text.concat(" World");   // нужно явно переприсвоить результат
System.out.println(text);      // Hello World
```

### 2. Основные методы String

| Метод | Действие |
|---|---|
| `.length()` | длина строки |
| `.charAt(i)` | символ по индексу |
| `.substring(start, end)` | подстрока |
| `.indexOf(x)` | индекс первого вхождения (или -1) |
| `.toUpperCase()` / `.toLowerCase()` | изменение регистра |
| `.trim()` | удаление пробелов по краям |
| `.replace(a, b)` | замена подстроки |
| `.split(regex)` | разбиение строки на массив по разделителю |

```java
String text = "  Привет, Мир!  ";
System.out.println(text.trim());               // "Привет, Мир!"
System.out.println(text.toUpperCase());
System.out.println(text.trim().length());        

String[] words = "яблоко,банан,груша".split(",");
System.out.println(words[0]);   // яблоко
```

### 3. Сравнение строк: equals vs ==

Повторение важной темы из Урока 2.3: для сравнения содержимого строк всегда используется `.equals()`, а не `==`:

```java
String a = "Java";
String b = "Java";
String c = new String("Java");

System.out.println(a == b);          // true (строковые литералы могут кэшироваться в JVM - String Pool)
System.out.println(a == c);          // false (c создан явно через new, отдельный объект)
System.out.println(a.equals(c));     // true (сравнение содержимого)
```

Особенность `a == b`, возвращающая `true` для строковых литералов, связана с механизмом String Pool в JVM (JVM переиспользует одинаковые строковые литералы), но полагаться на это поведение не стоит — правило «всегда используй `.equals()` для сравнения строк» остаётся универсальным.

### 4. Конкатенация строк: + vs StringBuilder

```java
String result = "Привет" + ", " + "мир" + "!";
System.out.println(result);
```

Оператор `+` удобен для простой конкатенации, но при многократном объединении строк в цикле создаёт множество промежуточных объектов `String`, что неэффективно (подробнее в следующем уроке про `StringBuilder`).

### 5. Форматирование строк: String.format()

```java
String name = "Алина";
int age = 20;
String message = String.format("Меня зовут %s, мне %d лет", name, age);
System.out.println(message);
```

### 6. Практический пример: проверка формата

```java
String email = "test@mail.com";

if (email.contains("@") && email.contains(".")) {
    System.out.println("Похоже на корректный email");
} else {
    System.out.println("Некорректный формат");
}
```

### Резюме урока

- Строки в Java неизменяемы (immutable) — любая «модификация» строки создаёт новый объект, а не изменяет исходный.
- Для сравнения содержимого строк всегда следует использовать `.equals()`, а не `==`, несмотря на особенность String Pool для литералов.
- `String.format()` предоставляет удобный способ форматированного вывода, аналогичный `printf`.

---

## Урок 5.3. StringBuilder и работа с изменяемыми строками
**Время: 40 минут**

### Цель урока
Изучить StringBuilder — эффективный инструмент для построения и изменения строк.

### 1. Проблема эффективности при многократной конкатенации

Из-за неизменяемости `String` (Урок 5.2), построение длинной строки через многократную конкатенацию оператором `+` в цикле неэффективно — каждая операция создаёт новый объект строки в памяти:

```java
String result = "";
for (int i = 0; i < 1000; i++) {
    result += i + ", ";   // на каждой итерации создаётся НОВЫЙ объект String!
}
```

### 2. Класс StringBuilder — изменяемая альтернатива

`StringBuilder` — класс, специально предназначенный для эффективного построения и изменения строк, так как, в отличие от `String`, является изменяемым (mutable):

```java
StringBuilder sb = new StringBuilder();

for (int i = 0; i < 1000; i++) {
    sb.append(i).append(", ");   // изменяет ТОТ ЖЕ объект, без создания новых
}

String result = sb.toString();   // преобразование обратно в обычную String в конце
```

### 3. Основные методы StringBuilder

| Метод | Действие |
|---|---|
| `.append(x)` | добавляет к концу |
| `.insert(index, x)` | вставляет по индексу |
| `.delete(start, end)` | удаляет часть |
| `.reverse()` | разворачивает содержимое |
| `.toString()` | преобразует обратно в String |

```java
StringBuilder sb = new StringBuilder("Hello");
sb.append(", World!");
System.out.println(sb);            // Hello, World!

sb.insert(5, " there");
System.out.println(sb);            // Hello there, World!

sb.reverse();
System.out.println(sb);
```

### 4. Практический пример: разворот строки

```java
String text = "Java";
String reversed = new StringBuilder(text).reverse().toString();
System.out.println(reversed);   // avaJ
```

### 5. StringBuilder vs String: когда что использовать

- **String** — когда строка не будет часто изменяться, для хранения и передачи текстовых данных.
- **StringBuilder** — когда предстоит многократное построение или изменение строки, особенно внутри циклов.

### 6. StringBuffer — потокобезопасная альтернатива (обзорно)

Java также предоставляет класс `StringBuffer`, идентичный по функциональности `StringBuilder`, но синхронизированный для безопасного использования в многопоточной среде (что выходит за рамки базового курса) — за счёт этого `StringBuffer` работает несколько медленнее. Для большинства однопоточных сценариев рекомендуется именно `StringBuilder`.

### Резюме урока

- `StringBuilder` — изменяемый класс для эффективного построения и изменения строк, в отличие от неизменяемого `String`.
- Многократная конкатенация строк в цикле через `+` неэффективна и обычно заменяется цепочкой вызовов `.append()` у `StringBuilder`.
- `StringBuffer` — потокобезопасный аналог `StringBuilder`, применяемый значительно реже в однопоточных сценариях.

---

## Урок 5.4. Сортировка и поиск в массивах (Arrays)
**Время: 40 минут**

### Цель урока
Изучить вспомогательный класс Arrays с готовыми методами для работы с массивами.

### 1. Класс java.util.Arrays

`Arrays` — вспомогательный класс стандартной библиотеки, предоставляющий набор статических методов для типичных операций с массивами.

### 2. Сортировка: Arrays.sort()

```java
import java.util.Arrays;

int[] numbers = {5, 3, 1, 4, 2};
Arrays.sort(numbers);
System.out.println(Arrays.toString(numbers));   // [1, 2, 3, 4, 5]
```

### 3. Поиск в отсортированном массиве: binarySearch

```java
int[] sortedNumbers = {1, 2, 3, 4, 5};
int index = Arrays.binarySearch(sortedNumbers, 3);
System.out.println(index);   // 2 (индекс найденного элемента)
```

> Важно: `binarySearch` работает корректно только с уже отсортированным массивом — попытка использовать его на неотсортированных данных даёт непредсказуемый результат.

### 4. Копирование массивов

```java
int[] original = {1, 2, 3, 4, 5};
int[] copy = Arrays.copyOf(original, original.length);   // полная копия
int[] partial = Arrays.copyOfRange(original, 1, 4);          // копия части массива [2, 3, 4]
```

### 5. Сравнение массивов и заполнение

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};

System.out.println(a == b);                // false (разные объекты)
System.out.println(Arrays.equals(a, b));   // true (сравнение содержимого)

int[] filled = new int[5];
Arrays.fill(filled, 7);   // заполняет весь массив значением 7
System.out.println(Arrays.toString(filled));   // [7, 7, 7, 7, 7]
```

### 6. Удобный вывод содержимого: Arrays.toString()

Как отмечалось в предыдущих уроках, обычный `System.out.println(массив)` выведет не содержимое, а служебную информацию об объекте массива — для читаемого вывода необходимо использовать `Arrays.toString()`:

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers);                  // [I@1b6d3586 (бесполезная информация)
System.out.println(Arrays.toString(numbers));  // [1, 2, 3] (то, что нужно)
```

### 7. Практический пример: сортировка и вывод топ-3 значений

```java
int[] scores = {85, 92, 78, 95, 88, 73};
Arrays.sort(scores);

System.out.println("Топ-3 результата:");
for (int i = scores.length - 1; i >= scores.length - 3; i--) {
    System.out.println(scores[i]);
}
```

### Резюме урока

- Класс `Arrays` предоставляет готовые статические методы для сортировки, поиска, копирования и сравнения массивов.
- `Arrays.toString()` — необходимый инструмент для читаемого вывода содержимого массива, так как прямой вывод массива через `println` не даёт полезной информации.
- `Arrays.binarySearch()` требует предварительно отсортированного массива для корректной работы.

---

## Урок 5.5. Практика: обработка массивов и строк
**Время: 50 минут**

### Цель урока
Закрепить материал модуля, решив несколько практических задач.

### 1. Задача 1. Удаление дубликатов из массива (через промежуточное множество)

```java
import java.util.*;

int[] numbers = {1, 2, 2, 3, 3, 3, 4};
Set<Integer> uniqueSet = new LinkedHashSet<>();

for (int number : numbers) {
    uniqueSet.add(number);
}

System.out.println(uniqueSet);   // [1, 2, 3, 4]
```

(`Set` и коллекции подробно разберём в Модуле 7 — здесь пример забегает немного вперёд.)

### 2. Задача 2. Разворот массива на месте

```java
static void reverseArray(int[] arr) {
    int left = 0, right = arr.length - 1;
    
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++;
        right--;
    }
}

public static void main(String[] args) {
    int[] numbers = {1, 2, 3, 4, 5};
    reverseArray(numbers);
    System.out.println(Arrays.toString(numbers));   // [5, 4, 3, 2, 1]
}
```

### 3. Задача 3. Подсчёт вхождений слова в текст

```java
static int countWordOccurrences(String text, String word) {
    String[] words = text.toLowerCase().split(" ");
    int count = 0;
    
    for (String w : words) {
        if (w.equals(word.toLowerCase())) {
            count++;
        }
    }
    
    return count;
}

public static void main(String[] args) {
    String text = "кот собака кот попугай собака кот";
    System.out.println(countWordOccurrences(text, "кот"));   // 3
}
```

### 4. Задача 4. Проверка, является ли строка анаграммой другой

```java
static boolean isAnagram(String a, String b) {
    char[] arrA = a.toLowerCase().replace(" ", "").toCharArray();
    char[] arrB = b.toLowerCase().replace(" ", "").toCharArray();
    
    Arrays.sort(arrA);
    Arrays.sort(arrB);
    
    return Arrays.equals(arrA, arrB);
}

public static void main(String[] args) {
    System.out.println(isAnagram("листок", "столик"));   // true
}
```

### 5. Задача 5. Построение CSV-строки через StringBuilder

```java
static String buildCsvRow(String[] values) {
    StringBuilder sb = new StringBuilder();
    
    for (int i = 0; i < values.length; i++) {
        sb.append(values[i]);
        if (i < values.length - 1) {
            sb.append(",");
        }
    }
    
    return sb.toString();
}

public static void main(String[] args) {
    String[] data = {"Алина", "20", "Алматы"};
    System.out.println(buildCsvRow(data));   // Алина,20,Алматы
}
```

### 6. Общие рекомендации

- Используй `Arrays.toString()` для отладочного вывода содержимого массивов.
- Для построения строк в циклах используй `StringBuilder` вместо конкатенации через `+`.
- Помни о неизменяемости `String` — методы вроде `.trim()`, `.replace()` возвращают новую строку, а не изменяют исходную.

### Резюме урока

- Практика по обработке массивов и строк закрепляет понимание неизменяемости String, эффективности StringBuilder и готовых методов класса Arrays.
- Многие типичные задачи обработки текста (анаграммы, подсчёт слов) требуют комбинации методов String и вспомогательных структур.
- Внимательность к особенностям Java (неизменяемость строк, проверка границ массива) — важная часть написания надёжного кода на этом языке.
