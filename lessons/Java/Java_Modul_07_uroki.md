# Модуль 7. Коллекции (Java Collections Framework)

---

## Урок 7.1. Список ArrayList
**Время: 45 минут**

### Цель урока
Изучить ArrayList — динамический список Java Collections Framework, решающий ограничение фиксированного размера обычных массивов.

### 1. Проблема фиксированного размера массивов (повторение)

Как отмечалось в Уроке 5.1, обычные массивы Java имеют фиксированный размер. `ArrayList` — часть Java Collections Framework, предоставляющая динамический список, аналогичный `vector` в C++ или списку в Python.

### 2. Объявление и создание ArrayList

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();       // рекомендуемый способ: объявление через интерфейс List
ArrayList<Integer> numbers = new ArrayList<>();   // прямое объявление через ArrayList
```

Обрати внимание на использование обёрточного класса `Integer` вместо примитива `int` — коллекции Java могут хранить только объекты, а не примитивы напрямую (см. Урок 2.4 про автоупаковку).

### 3. Объявление через интерфейс List — хорошая практика

Объявление переменной через интерфейс `List<String>`, а не конкретный класс `ArrayList<String>`, — рекомендуемая практика в Java, позволяющая позже легко заменить реализацию (например, на `LinkedList`) без изменения остального кода, использующего эту переменную.

### 4. Добавление и удаление элементов

```java
List<String> fruits = new ArrayList<>();

fruits.add("яблоко");
fruits.add("банан");
fruits.add("груша");

fruits.remove("банан");           // удаление по значению
fruits.remove(0);                    // удаление по индексу

System.out.println(fruits.size());   // текущее количество элементов
```

### 5. Доступ к элементам

```java
List<String> fruits = new ArrayList<>();
fruits.add("яблоко");
fruits.add("банан");

System.out.println(fruits.get(0));   // яблоко
fruits.set(0, "апельсин");             // изменение элемента по индексу
```

В отличие от обычных массивов, `ArrayList` не поддерживает прямую индексацию через `[]` — доступ осуществляется через методы `.get()` и `.set()`.

### 6. Перебор ArrayList

```java
for (String fruit : fruits) {
    System.out.println(fruit);
}

for (int i = 0; i < fruits.size(); i++) {
    System.out.println(fruits.get(i));
}
```

### 7. Практический пример

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        List<Double> grades = new ArrayList<>();
        
        for (int i = 0; i < 3; i++) {
            System.out.print("Введите оценку: ");
            grades.add(scanner.nextDouble());
        }
        
        double sum = 0;
        for (double grade : grades) {
            sum += grade;
        }
        
        System.out.println("Средняя оценка: " + (sum / grades.size()));
    }
}
```

### Резюме урока

- `ArrayList` — динамический список из Java Collections Framework, способный хранить только объекты (используются обёрточные классы для примитивов).
- Рекомендуется объявлять переменные через интерфейс `List`, а не конкретную реализацию `ArrayList`.
- Доступ к элементам осуществляется через методы `.get()`/`.set()`, а не прямую индексацию, как у обычных массивов.

---

## Урок 7.2. Множество HashSet
**Время: 40 минут**

### Цель урока
Изучить HashSet — коллекцию, хранящую только уникальные элементы.

### 1. Что такое HashSet

`HashSet` — реализация интерфейса `Set`, хранящая только уникальные элементы без определённого порядка (в отличие от `LinkedHashSet`, сохраняющего порядок добавления, и `TreeSet`, хранящего элементы отсортированными).

```java
import java.util.HashSet;
import java.util.Set;

Set<Integer> numbers = new HashSet<>();

numbers.add(5);
numbers.add(3);
numbers.add(5);   // дубликат - будет проигнорирован

System.out.println(numbers);   // [3, 5] (порядок не гарантирован для HashSet)
System.out.println(numbers.size());   // 2
```

### 2. Основные операции с Set

```java
Set<String> fruits = new HashSet<>();
fruits.add("яблоко");
fruits.add("банан");

fruits.remove("банан");

System.out.println(fruits.contains("яблоко"));   // true
```

### 3. Удаление дубликатов из списка через HashSet

Одно из самых частых практических применений — быстрое удаление дубликатов из существующей коллекции:

```java
List<Integer> numbersWithDuplicates = List.of(1, 2, 2, 3, 3, 3, 4);
Set<Integer> uniqueNumbers = new HashSet<>(numbersWithDuplicates);
System.out.println(uniqueNumbers);
```

### 4. Операции над множествами: объединение, пересечение, разность

```java
Set<Integer> a = new HashSet<>(List.of(1, 2, 3, 4));
Set<Integer> b = new HashSet<>(List.of(3, 4, 5, 6));

Set<Integer> union = new HashSet<>(a);
union.addAll(b);                       // объединение
System.out.println(union);   // [1, 2, 3, 4, 5, 6]

Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);         // пересечение
System.out.println(intersection);   // [3, 4]

Set<Integer> difference = new HashSet<>(a);
difference.removeAll(b);          // разность
System.out.println(difference);   // [1, 2]
```

### 5. LinkedHashSet и TreeSet — альтернативные реализации Set

```java
Set<Integer> linkedSet = new LinkedHashSet<>();   // сохраняет порядок добавления
Set<Integer> treeSet = new TreeSet<>();               // автоматически хранит элементы отсортированными

linkedSet.add(5);
linkedSet.add(1);
linkedSet.add(3);
System.out.println(linkedSet);   // [5, 1, 3] - порядок добавления сохранён

treeSet.add(5);
treeSet.add(1);
treeSet.add(3);
System.out.println(treeSet);   // [1, 3, 5] - автоматически отсортировано
```

### 6. Практический пример: подсчёт уникальных слов в тексте

```java
import java.util.HashSet;
import java.util.Set;

String text = "кот собака кот попугай собака кот";
Set<String> uniqueWords = new HashSet<>();

for (String word : text.split(" ")) {
    uniqueWords.add(word);
}

System.out.println("Уникальных слов: " + uniqueWords.size());
```

### Резюме урока

- `HashSet` хранит только уникальные элементы без гарантированного порядка, эффективно проверяя наличие элемента через `.contains()`.
- `LinkedHashSet` сохраняет порядок добавления элементов, `TreeSet` автоматически поддерживает элементы отсортированными.
- Методы `addAll()`, `retainAll()`, `removeAll()` реализуют операции объединения, пересечения и разности множеств.

---

## Урок 7.3. Отображение HashMap
**Время: 50 минут**

### Цель урока
Изучить HashMap — коллекцию для хранения пар «ключ: значение».

### 1. Что такое HashMap

`HashMap` — реализация интерфейса `Map`, хранящая данные в виде пар «ключ: значение», аналогично словарю (`dict`) в Python или `map` в C++:

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();

ages.put("Алина", 20);
ages.put("Данияр", 19);
ages.put("Аружан", 22);

System.out.println(ages.get("Алина"));   // 20
```

### 2. Безопасное получение значения

```java
System.out.println(ages.get("Ерлан"));                    // null (ключ не найден)
System.out.println(ages.getOrDefault("Ерлан", 0));   // 0 (значение по умолчанию, если ключ не найден)
```

`getOrDefault()` — безопасная альтернатива прямому `.get()`, предотвращающая работу с `null` при отсутствии ключа.

### 3. Проверка наличия ключа

```java
if (ages.containsKey("Алина")) {
    System.out.println("Алина есть в словаре");
}

if (ages.containsValue(20)) {
    System.out.println("Кто-то имеет возраст 20");
}
```

### 4. Изменение и удаление значений

```java
ages.put("Алина", 21);      // изменение существующего значения (put используется и для добавления, и для изменения)
ages.remove("Данияр");     // удаление по ключу
```

### 5. Перебор HashMap

```java
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// или отдельно по ключам/значениям:
for (String name : ages.keySet()) {
    System.out.println(name);
}

for (int age : ages.values()) {
    System.out.println(age);
}
```

### 6. Метод merge() и getOrDefault() для подсчёта частоты (практический паттерн)

```java
Map<String, Integer> wordCount = new HashMap<>();
String[] words = {"кот", "собака", "кот", "попугай", "собака", "кот"};

for (String word : words) {
    wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
}

System.out.println(wordCount);   // {кот=3, собака=2, попугай=1} (порядок не гарантирован)
```

### 7. LinkedHashMap и TreeMap — альтернативные реализации Map

Аналогично `Set`, у `Map` также есть реализации, сохраняющие порядок: `LinkedHashMap` (порядок добавления) и `TreeMap` (автоматическая сортировка по ключу) — используются в ситуациях, когда важен порядок элементов, в отличие от обычного `HashMap`.

### Резюме урока

- `HashMap` хранит пары «ключ: значение», эффективно обеспечивая доступ по ключу через `.get()`, `.put()`.
- `.getOrDefault()` — безопасный способ получения значения, предотвращающий работу с `null` при отсутствии ключа.
- Комбинация `.getOrDefault(key, 0) + 1` — распространённый паттерн подсчёта частоты элементов через `HashMap`.

---

## Урок 7.4. Обход коллекций, интерфейс Iterator
**Время: 35 минут**

### Цель урока
Изучить интерфейс Iterator — универсальный механизм обхода коллекций Java.

### 1. Что такое Iterator

`Iterator` — интерфейс, предоставляющий унифицированный способ последовательного обхода элементов любой коллекции Java Collections Framework, аналогично итераторам STL в C++ (Урок 6.3 курса C++).

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

List<String> fruits = new ArrayList<>(List.of("яблоко", "банан", "груша"));
Iterator<String> iterator = fruits.iterator();

while (iterator.hasNext()) {
    String fruit = iterator.next();
    System.out.println(fruit);
}
```

### 2. Основные методы Iterator

| Метод | Действие |
|---|---|
| `.hasNext()` | проверяет, есть ли ещё элементы для перебора |
| `.next()` | возвращает следующий элемент и продвигает итератор |
| `.remove()` | безопасно удаляет текущий элемент из коллекции во время перебора |

### 3. Безопасное удаление элементов во время перебора

Одна из главных причин использовать явный `Iterator` вместо for-each — безопасное удаление элементов прямо во время перебора коллекции. Попытка изменить коллекцию (например, через `.remove()` самой коллекции) во время перебора через for-each приводит к ошибке `ConcurrentModificationException`:

```java
List<Integer> numbers = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));

// ОШИБКА: изменение коллекции во время for-each
for (int number : numbers) {
    if (number % 2 == 0) {
        numbers.remove(Integer.valueOf(number));   // ConcurrentModificationException!
    }
}
```

```java
// ПРАВИЛЬНО: безопасное удаление через Iterator
Iterator<Integer> iterator = numbers.iterator();
while (iterator.hasNext()) {
    int number = iterator.next();
    if (number % 2 == 0) {
        iterator.remove();   // безопасное удаление текущего элемента
    }
}
```

### 4. Связь for-each и Iterator

Синтаксис for-each (`for (тип элемент : коллекция)`), уже неоднократно использованный в курсе, фактически является удобной «оболочкой» над использованием `Iterator` — компилятор автоматически разворачивает такой цикл в эквивалентный код с явным вызовом `.iterator()`, `.hasNext()`, `.next()`.

### 5. Iterator для Map

Для `Map` перебор через `Iterator` обычно выполняется по представлению `entrySet()`:

```java
Iterator<Map.Entry<String, Integer>> iterator = ages.entrySet().iterator();

while (iterator.hasNext()) {
    Map.Entry<String, Integer> entry = iterator.next();
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

### 6. Практический пример: удаление студентов с низкой оценкой

```java
List<Integer> grades = new ArrayList<>(List.of(85, 45, 92, 30, 78));
Iterator<Integer> iterator = grades.iterator();

while (iterator.hasNext()) {
    int grade = iterator.next();
    if (grade < 60) {
        iterator.remove();
    }
}

System.out.println(grades);   // [85, 92, 78]
```

### Резюме урока

- `Iterator` — универсальный интерфейс для последовательного обхода коллекций, предоставляющий методы `.hasNext()`, `.next()`, `.remove()`.
- Изменение коллекции напрямую во время перебора через for-each приводит к `ConcurrentModificationException`; безопасное удаление возможно через `Iterator.remove()`.
- For-each является удобной «оболочкой» над использованием `Iterator» для случаев, когда изменение коллекции во время перебора не требуется.

---

## Урок 7.5. Практика: обработка коллекций объектов
**Время: 60 минут**

### Цель урока
Закрепить материал модуля, решив несколько практических задач с использованием коллекций Java.

### 1. Класс Student для практики

```java
public class Student {
    String name;
    int age;
    double grade;
    
    public Student(String name, int age, double grade) {
        this.name = name;
        this.age = age;
        this.grade = grade;
    }
    
    @Override
    public String toString() {
        return name + " (" + age + " лет, оценка: " + grade + ")";
    }
}
```

### 2. Задача 1. Список студентов старше 20 лет

```java
import java.util.*;
import java.util.stream.Collectors;

List<Student> students = List.of(
    new Student("Алина", 20, 85),
    new Student("Данияр", 19, 92),
    new Student("Аружан", 22, 78),
    new Student("Ерлан", 21, 95)
);

List<String> namesOver20 = students.stream()
    .filter(s -> s.age > 20)
    .map(s -> s.name)
    .collect(Collectors.toList());

System.out.println(namesOver20);   // [Аружан, Ерлан]
```

Stream API (`.stream()`, `.filter()`, `.map()`) — современный функциональный способ обработки коллекций в Java, во многом аналогичный `map`/`filter` в JavaScript и Python. Полноценное изучение Stream API выходит за рамки базового курса, но полезно познакомиться с базовым синтаксисом.

### 3. Задача 2. Средняя оценка студентов

```java
double averageGrade = students.stream()
    .mapToDouble(s -> s.grade)
    .average()
    .orElse(0);

System.out.println("Средняя оценка: " + averageGrade);
```

### 4. Задача 3. Группировка студентов по признаку (без Stream API, для закрепления базового синтаксиса)

```java
List<Student> passing = new ArrayList<>();
List<Student> failing = new ArrayList<>();

for (Student student : students) {
    if (student.grade >= 80) {
        passing.add(student);
    } else {
        failing.add(student);
    }
}

System.out.println("Успевающих: " + passing.size());
System.out.println("Неуспевающих: " + failing.size());
```

### 5. Задача 4. Подсчёт частоты возрастов через HashMap

```java
Map<Integer, Integer> ageFrequency = new HashMap<>();

for (Student student : students) {
    ageFrequency.put(student.age, ageFrequency.getOrDefault(student.age, 0) + 1);
}

System.out.println(ageFrequency);
```

### 6. Задача 5. Сортировка списка студентов по оценке

```java
List<Student> sortedStudents = new ArrayList<>(students);
sortedStudents.sort((a, b) -> Double.compare(b.grade, a.grade));   // по убыванию оценки

for (Student student : sortedStudents) {
    System.out.println(student);
}
```

Метод `.sort()` со специальным объектом-компаратором (здесь записан через лямбда-выражение) — стандартный способ сортировки коллекций Java по произвольному критерию.

### 7. Общие рекомендации по работе с коллекциями

- Объявляй переменные через интерфейсы (`List`, `Set`, `Map`), а не конкретные реализации.
- Используй `HashMap` с `getOrDefault()` для эффективного подсчёта и группировки данных.
- Для безопасного удаления элементов во время перебора используй явный `Iterator`.

### Резюме урока

- Java Collections Framework (List, Set, Map) вместе покрывает большинство типичных задач хранения и обработки коллекций объектов в реальных программах.
- Знакомство со Stream API открывает более современный, функциональный способ обработки коллекций, дополняющий классические циклы.
- Комбинация пользовательских классов (`Student`) с коллекциями — стандартный подход к моделированию и обработке реальных данных в Java-приложениях.
