# Модуль 6. Объектно-ориентированное программирование

---

## Урок 6.1. Классы и объекты, конструкторы
**Время: 45 минут**

### Цель урока
Изучить базовые понятия ООП в синтаксисе Java: классы, объекты и конструкторы.

### 1. Класс и объект в Java

В Java абсолютно всё (кроме примитивов) является объектом какого-либо класса — сам язык глубоко построен вокруг парадигмы ООП сильнее, чем C++, где ООП является лишь одной из поддерживаемых парадигм.

```java
public class Car {
    String brand;
    String model;
    int year;
}

public class Main {
    public static void main(String[] args) {
        Car myCar = new Car();
        myCar.brand = "Toyota";
        myCar.model = "Camry";
        myCar.year = 2022;
        
        System.out.println(myCar.brand + " " + myCar.model);
    }
}
```

Ключевое слово `new` обязательно для создания объекта в Java — в отличие от C++, где объект можно создать и без `new` (в стеке, Урок 8.1 курса C++), в Java абсолютно все объекты создаются в куче через `new`.

### 2. Конструктор класса

```java
public class Car {
    String brand;
    String model;
    int year;
    
    Car(String brand, String model, int year) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }
}

public class Main {
    public static void main(String[] args) {
        Car myCar = new Car("Toyota", "Camry", 2022);
        System.out.println(myCar.brand);
    }
}
```

### 3. Ключевое слово this

`this` ссылается на текущий объект и часто используется для различения атрибута класса и параметра конструктора/метода с одинаковым именем:

```java
Car(String brand, String model, int year) {
    this.brand = brand;   // this.brand - атрибут объекта, brand - параметр конструктора
    this.model = model;
    this.year = year;
}
```

### 4. Конструктор по умолчанию

Если класс не объявляет ни одного конструктора, Java автоматически предоставляет конструктор по умолчанию без параметров. Как только объявлен хотя бы один пользовательский конструктор, автоматический конструктор по умолчанию больше не генерируется:

```java
public class Point {
    int x, y;
}

Point p = new Point();   // работает, используется автоматический конструктор
```

### 5. Вызов одного конструктора из другого: this(...)

```java
public class Car {
    String brand;
    int year;
    
    Car(String brand) {
        this(brand, 2024);   // вызов другого конструктора того же класса
    }
    
    Car(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }
}
```

Вызов `this(...)` обязательно должен быть первой инструкцией в теле конструктора.

### 6. Несколько объектов одного класса

```java
Car car1 = new Car("Toyota", "Camry", 2022);
Car car2 = new Car("BMW", "X5", 2023);

System.out.println(car1.brand);   // Toyota
System.out.println(car2.brand);   // BMW
```

### Резюме урока

- В Java объекты создаются исключительно через ключевое слово `new` — в отличие от C++, не существует объектов, создаваемых напрямую в стеке.
- `this` ссылается на текущий объект и часто используется для различения атрибута класса и одноимённого параметра.
- Вызов `this(...)` в начале конструктора позволяет переиспользовать логику другого конструктора того же класса.

---

## Урок 6.2. Поля и методы, модификаторы доступа
**Время: 40 минут**

### Цель урока
Изучить методы класса и модификаторы доступа в Java.

### 1. Методы класса (аналог инстанс-методов)

```java
public class Car {
    String brand;
    int mileage;
    
    Car(String brand) {
        this.brand = brand;
        this.mileage = 0;
    }
    
    void drive(int distance) {
        mileage += distance;
        System.out.println("Проехали " + distance + " км. Общий пробег: " + mileage + " км");
    }
    
    String info() {
        return brand + ", пробег: " + mileage + " км";
    }
}
```

Обрати внимание: в отличие от методов в `main` (Модуль 4), эти методы **не** являются `static` — они принадлежат конкретному объекту и вызываются через него (`myCar.drive(100)`), а не напрямую от имени класса.

### 2. Модификаторы доступа в Java

| Модификатор | Доступ |
|---|---|
| `public` | доступен из любого места программы |
| `private` | доступен только внутри самого класса |
| `protected` | доступен внутри пакета и в дочерних классах (даже из других пакетов) |
| *(без модификатора, package-private)* | доступен только внутри того же пакета |

Java, в отличие от C++, добавляет четвёртый уровень доступа — «по умолчанию» (package-private), когда модификатор просто не указан.

### 3. Пример использования модификаторов

```java
public class Car {
    private String brand;   // доступен только внутри класса
    public int year;          // доступен отовсюду
    
    public Car(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }
    
    public String getBrand() {   // публичный метод для доступа к приватному полю
        return brand;
    }
}
```

### 4. static поля и методы (повторение и расширение)

```java
public class Car {
    static int totalCars = 0;   // общий для всех объектов
    String brand;
    
    Car(String brand) {
        this.brand = brand;
        totalCars++;   // увеличиваем общий счётчик при каждом создании объекта
    }
}

public class Main {
    public static void main(String[] args) {
        Car car1 = new Car("Toyota");
        Car car2 = new Car("BMW");
        System.out.println(Car.totalCars);   // 2 (обращение через имя класса, а не объекта)
    }
}
```

### 5. Статические методы класса

```java
public class MathHelper {
    static int square(int x) {
        return x * x;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(MathHelper.square(5));   // 25, вызов без создания объекта MathHelper
    }
}
```

Статические методы вызываются напрямую через имя класса и не требуют создания объекта — именно поэтому метод `main` объявлен `static`: JVM должна иметь возможность вызвать его без предварительного создания объекта класса `Main`.

### 6. Методы, вызывающие другие методы того же объекта

```java
public class Rectangle {
    double width, height;
    
    Rectangle(double w, double h) {
        width = w;
        height = h;
    }
    
    double area() {
        return width * height;
    }
    
    double perimeter() {
        return 2 * (width + height);
    }
    
    void describe() {
        System.out.println("Площадь: " + area() + ", периметр: " + perimeter());
    }
}
```

### Резюме урока

- Java поддерживает четыре уровня доступа: `public`, `private`, `protected` и package-private (без модификатора).
- Инстанс-методы (не `static`) принадлежат конкретному объекту и вызываются через него, `static`-методы — через имя класса без создания объекта.
- Статичность метода `main` объясняется необходимостью для JVM вызвать его без предварительного создания объекта.

---

## Урок 6.3. Инкапсуляция, геттеры и сеттеры
**Время: 40 минут**

### Цель урока
Изучить принцип инкапсуляции в контексте Java-конвенций.

### 1. Стандартная практика: приватные поля с геттерами и сеттерами

В Java широко распространена практика делать все поля класса `private` и предоставлять доступ к ним только через публичные геттеры и сеттеры — это считается общепринятым стандартом качества кода в языке (в большей степени, чем во многих других изученных в курсе языках):

```java
public class BankAccount {
    private String owner;
    private double balance;
    
    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }
    
    public double getBalance() {
        return balance;
    }
    
    public void setBalance(double balance) {
        if (balance < 0) {
            System.out.println("Баланс не может быть отрицательным");
        } else {
            this.balance = balance;
        }
    }
    
    public String getOwner() {
        return owner;
    }
}
```

### 2. Соглашение об именовании геттеров и сеттеров

Стандартное соглашение Java: геттер для поля `balance` называется `getBalance()`, сеттер — `setBalance()`. Для полей типа `boolean` геттер часто называется с префиксом `is` вместо `get`:

```java
private boolean active;

public boolean isActive() {
    return active;
}

public void setActive(boolean active) {
    this.active = active;
}
```

### 3. Автоматическая генерация геттеров/сеттеров в IDE

IntelliJ IDEA (и большинство других Java IDE) предоставляет функцию автоматической генерации геттеров и сеттеров для полей класса (обычно через сочетание клавиш `Alt+Insert` → «Generate» → «Getters and Setters») — это избавляет от необходимости писать этот часто повторяющийся код вручную.

### 4. Валидация данных в сеттерах

```java
public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        setAge(age);   // используем сеттер даже в конструкторе для единой валидации
    }
    
    public void setAge(int age) {
        if (age < 0 || age > 150) {
            System.out.println("Некорректный возраст, установлено значение по умолчанию");
            this.age = 0;
        } else {
            this.age = age;
        }
    }
    
    public int getAge() {
        return age;
    }
}
```

### 5. Неизменяемые классы (immutable classes) — обзорно

По аналогии с неизменяемостью `String` (Урок 5.2), в Java распространена практика создания собственных неизменяемых классов — классов, объекты которых нельзя изменить после создания (только `final`-поля, только геттеры, без сеттеров):

```java
public final class ImmutablePoint {
    private final double x;
    private final double y;
    
    public ImmutablePoint(double x, double y) {
        this.x = x;
        this.y = y;
    }
    
    public double getX() { return x; }
    public double getY() { return y; }
    // сеттеров нет вообще - объект нельзя изменить после создания
}
```

### 6. Зачем нужна инкапсуляция на практике (повторение общей идеи)

Как и в предыдущих изученных языках, инкапсуляция защищает данные от некорректных значений, позволяет изменять внутреннюю реализацию класса без влияния на использующий его код, и делает интерфейс класса понятнее для других разработчиков — в Java эта практика особенно строго формализована через повсеместное использование `private` полей с геттерами/сеттерами.

### Резюме урока

- В Java принято делать все поля класса `private` и предоставлять доступ через публичные геттеры/сеттеры — эта практика считается стандартом качества кода.
- Для полей типа `boolean` геттер обычно называется с префиксом `is`, а не `get`.
- Неизменяемые классы (без сеттеров, с `final`-полями) — важный паттерн в Java, снижающий риск непредвиденных изменений состояния объекта.

---

## Урок 6.4. Наследование, ключевое слово extends
**Время: 45 минут**

### Цель урока
Изучить наследование классов в Java.

### 1. Базовый синтаксис наследования

```java
public class Vehicle {
    String brand;
    
    Vehicle(String brand) {
        this.brand = brand;
    }
    
    void info() {
        System.out.println("Транспортное средство: " + brand);
    }
}

public class Car extends Vehicle {
    int doors;
    
    Car(String brand, int doors) {
        super(brand);   // вызов конструктора родительского класса
        this.doors = doors;
    }
}

public class Main {
    public static void main(String[] args) {
        Car myCar = new Car("Toyota", 4);
        myCar.info();                  // унаследованный метод
        System.out.println(myCar.doors);   // 4
    }
}
```

Ключевое слово `extends` объявляет наследование, `super(...)` вызывает конструктор родительского класса — аналог `super().__init__()` в Python.

### 2. Единичное наследование в Java

Важное отличие от некоторых других языков: Java поддерживает только единичное наследование классов — класс может наследовать только от одного родительского класса (в отличие, например, от C++, где возможно множественное наследование). Для достижения похожего эффекта в Java используются интерфейсы (Урок 6.6).

### 3. Все классы неявно наследуют Object

Каждый класс в Java, даже если явно не указано `extends`, неявно наследует от базового класса `Object` — это класс-предок для абсолютно всех классов в языке, предоставляющий базовые методы вроде `toString()`, `equals()`, `hashCode()`.

### 4. Переопределение методов: @Override

```java
public class Vehicle {
    void move() {
        System.out.println("Транспортное средство движется");
    }
}

public class Boat extends Vehicle {
    @Override
    void move() {
        System.out.println("Лодка плывёт по воде");
    }
}
```

Аннотация `@Override` не обязательна технически, но настоятельно рекомендуется — она указывает компилятору на намерение переопределить метод родителя, и компилятор выдаст ошибку, если сигнатура метода не соответствует ни одному методу родительского класса (например, из-за опечатки).

### 5. Вызов метода родителя через super

```java
public class Car extends Vehicle {
    @Override
    void info() {
        super.info();   // вызов реализации родительского метода
        System.out.println("Дополнительная информация об автомобиле");
    }
}
```

### 6. Модификатор final для запрета наследования

Ключевое слово `final`, помимо констант (Урок 2.5), может применяться к классу, чтобы запретить его наследование:

```java
public final class UnextendableClass {
    // этот класс нельзя унаследовать
}

public class SubClass extends UnextendableClass {   // ошибка компиляции
}
```

Аналогично, `final` можно применить к отдельному методу, чтобы запретить его переопределение в наследниках.

### Резюме урока

- Наследование в Java задаётся через ключевое слово `extends`, вызов конструктора родителя — через `super(...)`.
- В отличие от некоторых языков, Java поддерживает только единичное наследование классов; все классы неявно наследуют от `Object`.
- Аннотация `@Override` (не обязательна, но рекомендуется) помогает компилятору проверить корректность переопределения метода родительского класса.

---

## Урок 6.5. Полиморфизм и переопределение методов
**Время: 40 минут**

### Цель урока
Изучить полиморфизм в Java, который, в отличие от C++, работает «из коробки» без дополнительного ключевого слова virtual.

### 1. Полиморфизм в Java «из коробки»

Ключевое отличие от C++: в Java **все** нестатические методы по умолчанию являются виртуальными (полиморфными) — не требуется дополнительное ключевое слово `virtual`, как в C++ (Урок 7.5 курса C++). Полиморфное поведение работает автоматически при переопределении методов:

```java
public class Animal {
    void makeSound() {
        System.out.println("Какой-то звук");
    }
}

public class Cat extends Animal {
    @Override
    void makeSound() {
        System.out.println("Мяу");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal animal = new Cat();   // ссылка типа Animal, но объект типа Cat
        animal.makeSound();             // корректно выведет "Мяу"
    }
}
```

### 2. Полиморфизм с массивом/коллекцией объектов

```java
public class Main {
    public static void main(String[] args) {
        Animal[] animals = {new Cat(), new Dog(), new Cow()};
        
        for (Animal animal : animals) {
            animal.makeSound();   // вызывает правильную версию для каждого объекта
        }
    }
}
```

### 3. Абстрактные классы

```java
public abstract class Shape {
    abstract double area();   // абстрактный метод - без реализации, "контракт" для наследников
    
    void describe() {           // обычный метод с реализацией - тоже доступен наследникам
        System.out.println("Площадь фигуры: " + area());
    }
}

public class Circle extends Shape {
    double radius;
    
    Circle(double radius) {
        this.radius = radius;
    }
    
    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}
```

Ключевое слово `abstract` перед классом означает, что его нельзя инстанцировать напрямую (`new Shape()` вызовет ошибку компиляции) — он служит только базой для наследования, аналогично абстрактным классам с чисто виртуальными функциями в C++.

### 4. instanceof — проверка типа объекта во время выполнения

```java
Animal animal = new Cat();

if (animal instanceof Cat) {
    System.out.println("Это кот!");
}
```

### 5. Приведение типов между родителем и наследником

```java
Animal animal = new Cat();

if (animal instanceof Cat) {
    Cat cat = (Cat) animal;   // явное приведение вниз по иерархии (downcasting)
    // теперь доступны методы, специфичные именно для Cat
}
```

### 6. Практический пример: коллекция фигур

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = new ArrayList<>();
        shapes.add(new Circle(5));
        shapes.add(new Circle(3));
        
        for (Shape shape : shapes) {
            shape.describe();   // полиморфный вызов
        }
    }
}
```

(`ArrayList` подробно разберём в Модуле 7.)

### Резюме урока

- В отличие от C++, в Java все нестатические методы полиморфны по умолчанию — не требуется ключевое слово `virtual`.
- `abstract`-класс нельзя инстанцировать напрямую, он служит только базой для наследования, аналогично абстрактным классам в C++.
- `instanceof` проверяет фактический тип объекта во время выполнения, что часто требуется перед явным приведением типа вниз по иерархии наследования.

---

## Урок 6.6. Абстрактные классы и интерфейсы
**Время: 50 минут**

### Цель урока
Изучить интерфейсы Java — механизм, компенсирующий отсутствие множественного наследования классов.

### 1. Проблема, которую решают интерфейсы

Поскольку Java не поддерживает множественное наследование классов (Урок 6.4), для ситуаций, когда объекту нужно соответствовать нескольким разным «контрактам» одновременно, используются **интерфейсы**.

### 2. Что такое интерфейс

Интерфейс — это полностью абстрактный «контракт», описывающий, какие методы должен реализовать класс, но (в базовом случае) без какой-либо реализации этих методов:

```java
public interface Movable {
    void move();
}

public interface Soundable {
    void makeSound();
}
```

### 3. Реализация интерфейса классом: implements

```java
public class Dog implements Movable, Soundable {
    @Override
    public void move() {
        System.out.println("Собака бежит");
    }
    
    @Override
    public void makeSound() {
        System.out.println("Гав!");
    }
}
```

Класс может реализовывать (`implements`) сразу **несколько** интерфейсов одновременно — именно так Java компенсирует отсутствие множественного наследования классов.

### 4. Интерфейс как тип

```java
Movable movable = new Dog();   // Dog можно использовать как Movable
movable.move();                     // Собака бежит
```

### 5. Разница между abstract class и interface

| | Абстрактный класс | Интерфейс |
|---|---|---|
| Наследование/реализация | Только одиночное (`extends`) | Множественная реализация (`implements`) |
| Поля | Могут быть любыми | Только `public static final` (константы) |
| Реализация методов | Может содержать обычные методы | Может содержать default-методы (см. ниже) |
| Конструкторы | Есть | Отсутствуют |

### 6. Default-методы интерфейса (Java 8+)

Начиная с Java 8, интерфейсы могут содержать методы с реализацией по умолчанию (`default`), которые классы могут не переопределять:

```java
public interface Greetable {
    default void greet() {
        System.out.println("Привет!");
    }
}

public class Robot implements Greetable {
    // greet() не переопределён - будет использована реализация по умолчанию
}
```

### 7. Практический пример: система с несколькими интерфейсами

```java
public interface Flyable {
    void fly();
}

public interface Swimmable {
    void swim();
}

public class Duck implements Flyable, Swimmable {
    @Override
    public void fly() {
        System.out.println("Утка летит");
    }
    
    @Override
    public void swim() {
        System.out.println("Утка плывёт");
    }
}
```

### Резюме урока

- Интерфейсы описывают «контракт» методов, которые должен реализовать класс, компенсируя отсутствие множественного наследования классов в Java.
- Класс может реализовывать несколько интерфейсов одновременно через `implements`, в отличие от единичного наследования классов через `extends`.
- Default-методы интерфейса (Java 8+) позволяют предоставить реализацию по умолчанию, которую классы могут (но не обязаны) переопределять.

---

## Урок 6.7. Методы toString, equals, hashCode
**Время: 40 минут**

### Цель урока
Изучить три важнейших метода класса Object, часто переопределяемые в собственных классах.

### 1. Метод toString()

По умолчанию, унаследованный от `Object` метод `toString()` возвращает малополезное техническое представление объекта. Переопределение `toString()` позволяет задать понятное текстовое представление объекта:

```java
public class Car {
    String brand;
    String model;
    
    Car(String brand, String model) {
        this.brand = brand;
        this.model = model;
    }
    
    @Override
    public String toString() {
        return brand + " " + model;
    }
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car("Toyota", "Camry");
        System.out.println(car);            // автоматически вызовет toString(): Toyota Camry
        System.out.println(car.toString());   // то же самое явно
    }
}
```

`System.out.println()` автоматически вызывает `.toString()` для объекта, переданного ему в качестве аргумента.

### 2. Метод equals()

По умолчанию `equals()` (унаследованный от `Object`) сравнивает объекты так же, как оператор `==` — по ссылке, а не по содержимому. Переопределение `equals()` позволяет задать собственную логику сравнения «по значению»:

```java
public class Point {
    int x, y;
    
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return this.x == other.x && this.y == other.y;
    }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);
        
        System.out.println(p1 == p2);          // false (разные объекты)
        System.out.println(p1.equals(p2));     // true (одинаковое содержимое)
    }
}
```

### 3. Метод hashCode()

`hashCode()` возвращает целочисленный «хэш» объекта, используемый внутренне некоторыми коллекциями (например, `HashMap`, `HashSet`, Модуль 7) для эффективного хранения и поиска объектов. Существует важное правило: **если переопределён `equals()`, обязательно должен быть переопределён и `hashCode()`** — иначе объекты, равные по `equals()`, могут вести себя некорректно в хэш-коллекциях.

```java
@Override
public int hashCode() {
    return Objects.hash(x, y);   // Objects.hash() - удобный вспомогательный метод из java.util.Objects
}
```

### 4. Автоматическая генерация в IDE

Как и с геттерами/сеттерами (Урок 6.3), IntelliJ IDEA предоставляет функцию автоматической генерации корректных реализаций `toString()`, `equals()` и `hashCode()` для класса — на практике эти методы редко пишут полностью вручную.

### 5. Полный пример класса с переопределёнными методами

```java
import java.util.Objects;

public class Point {
    int x, y;
    
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
    
    @Override
    public String toString() {
        return "Point(" + x + ", " + y + ")";
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof Point)) return false;
        Point other = (Point) obj;
        return x == other.x && y == other.y;
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }
}
```

### 6. Зачем это важно на практике

Эти три метода — фундамент корректной работы объектов в реальных Java-программах: `toString()` упрощает отладку и логирование, `equals()`/`hashCode()` необходимы для правильного использования объектов в коллекциях, особенно хэш-based (`HashMap`, `HashSet`).

### Резюме урока

- `toString()` определяет текстовое представление объекта, автоматически используемое `System.out.println()` и другими средствами вывода.
- `equals()` позволяет задать сравнение объектов «по содержимому» вместо сравнения по ссылке, используемого по умолчанию.
- При переопределении `equals()` обязательно должен быть переопределён и `hashCode()` — иначе объекты могут работать некорректно в хэш-коллекциях, изучаемых в следующем модуле.

---

## Урок 6.8. Практика: разработка мини-приложения на ООП
**Время: 65 минут**

### Цель урока
Закрепить весь материал модуля, разработав приложение «Автопарк» с использованием классов, наследования, интерфейсов и полиморфизма.

### 1. Постановка задачи

Аналогично итоговым практикам по ООП в Python и C++, разработаем систему учёта автопарка, но с использованием характерных для Java возможностей — интерфейсов и переопределения `toString()`.

### 2. Интерфейс Maintainable

```java
public interface Maintainable {
    void performMaintenance();
}
```

### 3. Базовый абстрактный класс Vehicle

```java
public abstract class Vehicle implements Maintainable {
    protected String brand;
    protected String model;
    protected int year;
    
    public Vehicle(String brand, String model, int year) {
        this.brand = brand;
        this.model = model;
        this.year = year;
    }
    
    public abstract String getType();
    
    @Override
    public String toString() {
        return brand + " " + model + " (" + year + ") — " + getType();
    }
    
    @Override
    public void performMaintenance() {
        System.out.println("Проведено обслуживание: " + this);
    }
}
```

### 4. Дочерние классы

```java
public class Car extends Vehicle {
    private int seats;
    
    public Car(String brand, String model, int year, int seats) {
        super(brand, model, year);
        this.seats = seats;
    }
    
    @Override
    public String getType() {
        return "легковой автомобиль, " + seats + " мест";
    }
}

public class Truck extends Vehicle {
    private double loadCapacity;
    
    public Truck(String brand, String model, int year, double loadCapacity) {
        super(brand, model, year);
        this.loadCapacity = loadCapacity;
    }
    
    @Override
    public String getType() {
        return "грузовик, грузоподъёмность " + loadCapacity + " т";
    }
}
```

### 5. Класс Fleet — управление коллекцией

```java
import java.util.ArrayList;
import java.util.List;

public class Fleet {
    private List<Vehicle> vehicles = new ArrayList<>();
    
    public void addVehicle(Vehicle vehicle) {
        vehicles.add(vehicle);
        System.out.println("Добавлено: " + vehicle);
    }
    
    public void showAll() {
        System.out.println("\n--- Список автопарка ---");
        for (Vehicle vehicle : vehicles) {
            System.out.println(vehicle);   // автоматически вызовет переопределённый toString()
        }
    }
    
    public void performMaintenanceOnAll() {
        for (Vehicle vehicle : vehicles) {
            vehicle.performMaintenance();
        }
    }
}
```

(`ArrayList`/`List` подробно разберём в следующем модуле — здесь используются как готовый инструмент.)

### 6. Использование приложения

```java
public class Main {
    public static void main(String[] args) {
        Fleet fleet = new Fleet();
        
        fleet.addVehicle(new Car("Toyota", "Camry", 2022, 5));
        fleet.addVehicle(new Truck("Volvo", "FH16", 2020, 20.0));
        fleet.addVehicle(new Car("Honda", "Civic", 2023, 5));
        
        fleet.showAll();
        fleet.performMaintenanceOnAll();
    }
}
```

### 7. Что демонстрирует этот пример

- **Наследование:** `Car` и `Truck` наследуют от абстрактного класса `Vehicle`.
- **Интерфейс:** `Maintainable` — отдельный контракт, реализуемый через абстрактный класс.
- **Полиморфизм:** абстрактный метод `getType()` и переопределённый `toString()` работают по-разному для каждого класса, но вызываются единообразно.
- **Инкапсуляция:** атрибуты защищены модификаторами `private`/`protected`.

### Резюме урока

- Реальные Java-приложения комбинируют абстрактные классы, интерфейсы, наследование и переопределение методов `Object` (`toString()` и др.) для построения расширяемой архитектуры.
- Использование интерфейса (`Maintainable`) вместе с абстрактным классом (`Vehicle`) демонстрирует характерный для Java подход к организации кода.
- Этот пример — хорошая основа для итогового проекта курса, если он связан с учётом каких-либо объектов.
