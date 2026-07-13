# Модуль 7. Объектно-ориентированное программирование

---

## Урок 7.1. Классы и объекты
**Время: 45 минут**

### Цель урока
Понять базовые понятия ООП — класс и объект, научиться создавать простые классы с атрибутами.

### 1. Что такое объектно-ориентированное программирование

ООП — это подход к программированию, при котором данные и функции для работы с ними объединяются в единую сущность — объект. Такой подход помогает моделировать реальные вещи (машины, пользователей, товары) в виде структур кода.

### 2. Класс и объект

**Класс** — это «чертёж» или шаблон, описывающий, какие данные (атрибуты) и действия (методы) будут у объекта. **Объект** — это конкретный экземпляр, созданный по этому чертежу.

```python
class Car:
    pass

my_car = Car()      # my_car - объект (экземпляр) класса Car
```

### 3. Метод __init__ и атрибуты объекта

Специальный метод `__init__` автоматически вызывается при создании нового объекта и используется для задания начальных значений атрибутов:

```python
class Car:
    def __init__(self, brand, model, year):
        self.brand = brand
        self.model = model
        self.year = year

my_car = Car("Toyota", "Camry", 2022)
print(my_car.brand)   # Toyota
print(my_car.year)    # 2022
```

### 4. Параметр self

`self` — это ссылка на сам объект, через которую внутри класса можно обращаться к его атрибутам. `self` всегда указывается первым параметром любого метода класса, но при вызове метода передавать его вручную не нужно — Python делает это автоматически.

### 5. Создание нескольких объектов

```python
car1 = Car("Toyota", "Camry", 2022)
car2 = Car("BMW", "X5", 2023)

print(car1.brand)   # Toyota
print(car2.brand)   # BMW
```

Каждый объект хранит свои собственные значения атрибутов независимо от других объектов того же класса.

### 6. Практический пример: класс Student

```python
class Student:
    def __init__(self, name, age, course):
        self.name = name
        self.age = age
        self.course = course

student1 = Student("Алина", 20, "Python с нуля")
student2 = Student("Данияр", 19, "Python с нуля")

print(f"{student1.name}, {student1.age} лет, курс: {student1.course}")
```

### Резюме урока

- Класс — это шаблон, объект — конкретный экземпляр этого шаблона.
- Метод `__init__` задаёт начальные значения атрибутов при создании объекта.
- `self` — ссылка на текущий объект, через которую метод обращается к его атрибутам.

---

## Урок 7.2. Атрибуты и методы класса
**Время: 40 минут**

### Цель урока
Научиться добавлять в класс методы — функции, которые описывают поведение объектов, а не только их данные.

### 1. Что такое метод класса

Метод — это функция, объявленная внутри класса, которая описывает поведение объекта. В отличие от обычных атрибутов (данных), методы задают, что объект «умеет делать».

```python
class Car:
    def __init__(self, brand, model, year):
        self.brand = brand
        self.model = model
        self.year = year

    def info(self):
        return f"{self.brand} {self.model}, {self.year} год"

my_car = Car("Toyota", "Camry", 2022)
print(my_car.info())   # Toyota Camry, 2022 год
```

### 2. Методы, изменяющие состояние объекта

```python
class Car:
    def __init__(self, brand, model, mileage=0):
        self.brand = brand
        self.model = model
        self.mileage = mileage

    def drive(self, distance):
        self.mileage += distance
        print(f"Проехали {distance} км. Общий пробег: {self.mileage} км")

my_car = Car("Toyota", "Camry")
my_car.drive(150)     # Проехали 150 км. Общий пробег: 150 км
my_car.drive(80)      # Проехали 80 км. Общий пробег: 230 км
```

### 3. Атрибуты класса vs атрибуты объекта

Атрибут, объявленный внутри класса, но вне `__init__`, называется **атрибутом класса** — он общий для всех объектов этого класса (в отличие от атрибутов объекта, у каждого экземпляра свои):

```python
class Car:
    wheels = 4    # атрибут класса - одинаковый для всех автомобилей

    def __init__(self, brand):
        self.brand = brand    # атрибут объекта - свой у каждого

car1 = Car("Toyota")
car2 = Car("BMW")

print(car1.wheels)   # 4
print(car2.wheels)   # 4
```

### 4. Методы, использующие другие методы

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

    def describe(self):
        return f"Площадь: {self.area()}, периметр: {self.perimeter()}"

rect = Rectangle(5, 3)
print(rect.describe())   # Площадь: 15, периметр: 16
```

### 5. Практический пример: класс BankAccount

```python
class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        print(f"Баланс пополнен на {amount}. Текущий баланс: {self.balance}")

    def withdraw(self, amount):
        if amount > self.balance:
            print("Недостаточно средств")
        else:
            self.balance -= amount
            print(f"Снято {amount}. Текущий баланс: {self.balance}")

account = BankAccount("Ерлан", 1000)
account.deposit(500)
account.withdraw(300)
```

### Резюме урока

- Методы описывают поведение объекта и объявляются как обычные функции внутри класса с параметром `self`.
- Атрибуты класса общие для всех объектов, атрибуты объекта — индивидуальны для каждого экземпляра.
- Методы одного класса могут вызывать друг друга через `self`.

---

## Урок 7.3. Инкапсуляция
**Время: 35 минут**

### Цель урока
Понять принцип инкапсуляции и научиться защищать внутренние данные объекта от некорректного изменения извне.

### 1. Что такое инкапсуляция

Инкапсуляция — один из ключевых принципов ООП, суть которого в том, чтобы скрыть внутреннюю реализацию объекта и предоставить контролируемый доступ к его данным через методы, а не напрямую.

### 2. Уровни доступа в Python (условные)

В отличие от некоторых других языков, в Python нет строгих модификаторов доступа (`private`, `public`), но существует соглашение об именовании:

| Обозначение | Уровень доступа |
|---|---|
| `name` | публичный — доступен без ограничений |
| `_name` | защищённый (по соглашению — «не трогать снаружи») |
| `__name` | приватный (условно) — Python усложняет прямой доступ |

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance   # приватный атрибут

account = BankAccount("Алина", 1000)
print(account.__balance)   # AttributeError
```

### 3. Геттеры и сеттеры

Чтобы обеспечить безопасный доступ к приватным атрибутам, используются специальные методы — геттеры (для чтения) и сеттеры (для изменения с проверкой):

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance

    def get_balance(self):
        return self.__balance

    def set_balance(self, amount):
        if amount < 0:
            print("Баланс не может быть отрицательным")
        else:
            self.__balance = amount

account = BankAccount("Алина", 1000)
print(account.get_balance())    # 1000
account.set_balance(-500)          # Баланс не может быть отрицательным
account.set_balance(2000)
print(account.get_balance())    # 2000
```

### 4. Свойства (property) — более «питоничный» способ

Python предоставляет декоратор `@property`, который позволяет обращаться к геттеру и сеттеру так, будто это обычный атрибут:

```python
class BankAccount:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance

    @property
    def balance(self):
        return self.__balance

    @balance.setter
    def balance(self, amount):
        if amount < 0:
            print("Баланс не может быть отрицательным")
        else:
            self.__balance = amount

account = BankAccount("Алина", 1000)
print(account.balance)    # 1000, без скобок! как обычный атрибут
account.balance = 2000    # вызывает сеттер автоматически
```

### 5. Зачем нужна инкапсуляция на практике

- Защита данных от некорректных значений (например, отрицательный баланс, отрицательный возраст).
- Возможность изменить внутреннюю реализацию класса, не затрагивая код, который его использует.
- Более понятный и предсказуемый интерфейс класса для других разработчиков.

### Резюме урока

- Инкапсуляция скрывает внутренние детали реализации объекта и защищает данные от некорректного использования.
- В Python приватность атрибутов — это соглашение (`_` и `__`), а не строгое ограничение.
- Декоратор `@property` — рекомендуемый способ реализации геттеров и сеттеров в Python.

---

## Урок 7.4. Наследование
**Время: 45 минут**

### Цель урока
Научиться создавать дочерние классы, наследующие атрибуты и методы родительского класса, и расширять их новым функционалом.

### 1. Что такое наследование

Наследование позволяет создать новый класс на основе уже существующего, автоматически получив все его атрибуты и методы, и при этом добавить или изменить что-то своё. Это помогает избегать дублирования кода при работе со «связанными» сущностями.

```python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    def info(self):
        return f"{self.brand} {self.model}"

class ElectricCar(Car):     # ElectricCar наследует от Car
    def __init__(self, brand, model, battery_capacity):
        super().__init__(brand, model)     # вызываем __init__ родителя
        self.battery_capacity = battery_capacity

    def battery_info(self):
        return f"Ёмкость батареи: {self.battery_capacity} кВт·ч"

tesla = ElectricCar("Tesla", "Model 3", 75)
print(tesla.info())            # унаследованный метод: Tesla Model 3
print(tesla.battery_info())   # Ёмкость батареи: 75 кВт·ч
```

### 2. Функция super()

`super()` позволяет обратиться к методам родительского класса — чаще всего используется в `__init__` дочернего класса, чтобы не дублировать код инициализации родительских атрибутов.

### 3. Переопределение методов

Дочерний класс может переопределить (изменить поведение) метод родительского класса:

```python
class Car:
    def move(self):
        print("Автомобиль едет по дороге")

class Boat(Car):
    def move(self):
        print("Лодка плывёт по воде")

vehicles = [Car(), Boat()]
for v in vehicles:
    v.move()
# Автомобиль едет по дороге
# Лодка плывёт по воде
```

### 4. Иерархия классов

Наследование может быть многоуровневым — класс может наследоваться от класса, который сам является дочерним для другого класса:

```python
class Vehicle:
    def __init__(self, brand):
        self.brand = brand

class Car(Vehicle):
    def __init__(self, brand, doors):
        super().__init__(brand)
        self.doors = doors

class SportsCar(Car):
    def __init__(self, brand, doors, top_speed):
        super().__init__(brand, doors)
        self.top_speed = top_speed

ferrari = SportsCar("Ferrari", 2, 340)
print(ferrari.brand, ferrari.doors, ferrari.top_speed)
```

### 5. Проверка принадлежности классу

```python
print(isinstance(ferrari, Car))       # True
print(isinstance(ferrari, Vehicle))   # True
print(isinstance(ferrari, Boat))       # False
```

### Резюме урока

- Наследование позволяет создавать новые классы на основе существующих, переиспользуя их код.
- `super()` обращается к методам и конструктору родительского класса.
- Дочерний класс может переопределять методы родителя, реализуя собственное поведение.

---

## Урок 7.5. Полиморфизм
**Время: 35 минут**

### Цель урока
Понять принцип полиморфизма и научиться писать код, который единообразно работает с объектами разных классов.

### 1. Что такое полиморфизм

Полиморфизм («много форм») — это возможность использовать объекты разных классов через единый интерфейс, если у них есть метод с одинаковым названием. Это позволяет писать более гибкий и универсальный код.

### 2. Пример полиморфизма

```python
class Cat:
    def make_sound(self):
        return "Мяу"

class Dog:
    def make_sound(self):
        return "Гав"

class Cow:
    def make_sound(self):
        return "Му"

animals = [Cat(), Dog(), Cow()]

for animal in animals:
    print(animal.make_sound())
# Мяу
# Гав
# Му
```

Обрати внимание: цикл `for` не знает заранее, объект какого именно класса он обрабатывает — он просто вызывает метод `make_sound()` у каждого объекта, а Python сам определяет, какую именно реализацию метода использовать.

### 3. Полиморфизм с наследованием

Чаще всего полиморфизм применяется вместе с наследованием — базовый класс определяет общий метод, а дочерние классы переопределяют его под свою специфику:

```python
class Shape:
    def area(self):
        raise NotImplementedError("Метод должен быть переопределён")

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Square(Shape):
    def __init__(self, side):
        self.side = side

    def area(self):
        return self.side ** 2

shapes = [Circle(5), Square(4)]

for shape in shapes:
    print(f"Площадь: {shape.area():.2f}")
```

### 4. Зачем нужен полиморфизм на практике

- Позволяет писать универсальные функции, работающие с разными типами объектов без дублирования кода.
- Упрощает добавление новых классов в систему — если новый класс реализует нужный метод, он автоматически будет работать со всем существующим кодом.
- Основа многих архитектурных паттернов в реальных программных проектах.

### 5. Утиная типизация (duck typing)

В Python полиморфизм работает даже без формального наследования — если у объекта есть метод с нужным именем, Python не требует, чтобы классы были связаны наследованием. Это называется «утиной типизацией»: «если оно крякает как утка — это утка».

### Резюме урока

- Полиморфизм позволяет использовать объекты разных классов через единый интерфейс (одинаковое имя метода).
- Часто применяется вместе с наследованием, но в Python работает и без него благодаря динамической типизации («утиная типизация»).
- Делает код более гибким и расширяемым.

---

## Урок 7.6. Магические методы
**Время: 40 минут**

### Цель урока
Познакомиться с магическими (специальными) методами Python и научиться настраивать поведение собственных классов при стандартных операциях.

### 1. Что такое магические методы

Магические методы (dunder-методы, от «double underscore») — специальные методы класса с именами вида `__имя__`, которые Python вызывает автоматически в определённых ситуациях: при создании объекта, его выводе на экран, сравнении с другим объектом и т.д. С одним таким методом — `__init__` — мы уже знакомы.

### 2. Метод __str__

Определяет, как объект будет выглядеть при выводе через `print()` или преобразовании в строку через `str()`:

```python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    def __str__(self):
        return f"{self.brand} {self.model}"

my_car = Car("Toyota", "Camry")
print(my_car)   # Toyota Camry (без __str__ было бы что-то вроде <__main__.Car object at 0x...>)
```

### 3. Метод __repr__

Похож на `__str__`, но предназначен для более технического, «отладочного» представления объекта — обычно используется в консоли и при работе с коллекциями объектов:

```python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    def __repr__(self):
        return f"Car(brand='{self.brand}', model='{self.model}')"
```

### 4. Метод __eq__

Определяет поведение оператора `==` для объектов класса:

```python
class Car:
    def __init__(self, brand, model):
        self.brand = brand
        self.model = model

    def __eq__(self, other):
        return self.brand == other.brand and self.model == other.model

car1 = Car("Toyota", "Camry")
car2 = Car("Toyota", "Camry")

print(car1 == car2)   # True (без __eq__ было бы False - сравнивались бы адреса в памяти)
```

### 5. Другие полезные магические методы

| Метод | Что определяет |
|---|---|
| `__len__` | поведение функции `len(объект)` |
| `__add__` | поведение оператора `+` для объектов |
| `__lt__` | поведение оператора `<` (используется, например, в `sorted()`) |
| `__init__` | инициализация объекта при создании |

```python
class Cart:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

cart = Cart(["хлеб", "молоко", "яйца"])
print(len(cart))   # 3
```

### 6. Практический пример: класс Point с несколькими магическими методами

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __str__(self):
        return f"({self.x}, {self.y})"

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def __eq__(self, other):
        return self.x == other.x and self.y == other.y

p1 = Point(1, 2)
p2 = Point(3, 4)
p3 = p1 + p2

print(p3)              # (4, 6)
print(p1 == Point(1, 2))   # True
```

### Резюме урока

- Магические методы позволяют настроить поведение объектов класса при стандартных операциях: вывод на экран, сравнение, сложение и т.д.
- `__str__` определяет «человекочитаемое» представление объекта, `__eq__` — логику сравнения через `==`.
- Магические методы делают собственные классы такими же удобными в использовании, как встроенные типы Python.

---

## Урок 7.7. Практика: разработка мини-приложения на ООП
**Время: 60 минут**

### Цель урока
Закрепить весь материал модуля, разработав небольшое приложение «Автопарк» с использованием классов, наследования, инкапсуляции и полиморфизма.

### 1. Постановка задачи

Разработаем приложение для учёта автопарка компании. Требования:
- Базовый класс `Vehicle` с общими атрибутами (марка, модель, год).
- Дочерние классы `Car` и `Truck` с дополнительными атрибутами.
- Возможность добавлять транспорт в общий список (автопарк).
- Метод для вывода информации обо всех транспортных средствах.

### 2. Базовый класс Vehicle

```python
class Vehicle:
    def __init__(self, brand, model, year):
        self.brand = brand
        self.model = model
        self.year = year

    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"

    def info(self):
        return str(self)
```

### 3. Дочерние классы

```python
class Car(Vehicle):
    def __init__(self, brand, model, year, seats):
        super().__init__(brand, model, year)
        self.seats = seats

    def info(self):
        return f"{super().info()} — легковой автомобиль, {self.seats} мест"


class Truck(Vehicle):
    def __init__(self, brand, model, year, load_capacity):
        super().__init__(brand, model, year)
        self.load_capacity = load_capacity

    def info(self):
        return f"{super().info()} — грузовик, грузоподъёмность {self.load_capacity} т"
```

### 4. Класс Fleet (автопарк) — управление коллекцией объектов

```python
class Fleet:
    def __init__(self):
        self.vehicles = []

    def add_vehicle(self, vehicle):
        self.vehicles.append(vehicle)
        print(f"Добавлено: {vehicle.info()}")

    def show_all(self):
        print("\n--- Список автопарка ---")
        for vehicle in self.vehicles:
            print(vehicle.info())     # полиморфизм: у каждого свой info()

    def find_by_brand(self, brand):
        return [v for v in self.vehicles if v.brand.lower() == brand.lower()]
```

### 5. Использование приложения

```python
fleet = Fleet()

fleet.add_vehicle(Car("Toyota", "Camry", 2022, 5))
fleet.add_vehicle(Truck("Volvo", "FH16", 2020, 20))
fleet.add_vehicle(Car("Honda", "Civic", 2023, 5))

fleet.show_all()

toyotas = fleet.find_by_brand("Toyota")
print(f"\nНайдено автомобилей марки Toyota: {len(toyotas)}")
```

### 6. Что демонстрирует этот пример

- **Наследование:** `Car` и `Truck` наследуют общие атрибуты и метод от `Vehicle`.
- **Полиморфизм:** метод `info()` работает по-разному для разных классов, но вызывается единообразно в `show_all()`.
- **Инкапсуляция:** логика хранения и поиска транспорта скрыта внутри класса `Fleet`.
- **Композиция:** класс `Fleet` хранит и управляет объектами других классов.

### Резюме урока

- Реальные приложения на ООП обычно комбинируют наследование, полиморфизм и инкапсуляцию вместе, а не используют эти концепции по отдельности.
- Разделение ответственности между классами (`Vehicle`, `Car`, `Truck`, `Fleet`) делает код более организованным и расширяемым.
- Этот пример — хорошая основа для итогового проекта курса, если он связан с учётом каких-либо объектов.
