# Модуль 10. Итоговый проект

---

## Урок 10.1. Планирование проекта (например, система учёта библиотеки)
**Время: 40 минут**

### Цель урока
Научиться формулировать техническое задание для итогового проекта на Java.

### 1. Выбор темы итогового проекта

Учитывая освоенные темы курса (ООП, коллекции, исключения, файлы, JDBC), хорошими темами для итогового проекта являются:

- **Система учёта библиотеки** (расширение примера из Модуля 9) с полноценным CRUD (создание, чтение, обновление, удаление) через базу данных.
- **Система учёта студентов и оценок** с сохранением в базу данных и вычислением статистики.
- **Приложение для учёта задач (To-Do)** с приоритетами, категориями и сохранением в SQLite.
- **Простой интернет-магазин (консольный)** с товарами, корзиной и учётом заказов.

### 2. Структура технического задания

1. **Задача.** Какую проблему решает приложение?
2. **Классы.** Какие классы и интерфейсы потребуются?
3. **Коллекции.** Какие структуры Java Collections Framework будут использованы?
4. **Хранение данных.** База данных (JDBC) или файл?
5. **Обработка ошибок.** Какие исключения (checked/unchecked, собственные) предполагается использовать?

### 3. Пример технического задания

**Проект:** Система учёта задач с приоритетами

**Задача:** Помочь пользователю вести список задач с приоритетами и сроками, сохраняя данные между запусками.

**Классы:** `Task` (задача), `TaskRepository` (работа с базой данных), `TaskManager` (бизнес-логика — сортировка, фильтрация).

**Коллекции:** `List<Task>` для хранения задач в памяти после загрузки из базы.

**Хранение данных:** SQLite через JDBC, таблица `tasks`.

**Обработка ошибок:** собственное исключение `InvalidTaskException` для валидации данных, обработка `SQLException` при работе с базой.

### 4. Оценка объёма задачи

Итоговый проект должен быть реализуем за отведённое время модуля (около 5 часов) и явно опираться минимум на 4–5 тем курса: ООП (классы, интерфейсы), коллекции, исключения, JDBC.

### 5. Планирование структуры пакетов

```
task_manager/
├── src/
│   └── com/codeway/taskmanager/
│       ├── Main.java
│       ├── model/
│       │   └── Task.java
│       ├── repository/
│       │   └── TaskRepository.java
│       └── exception/
│           └── InvalidTaskException.java
```

### 6. Домашнее задание к уроку

Составь техническое задание для своего итогового проекта по образцу из пункта 3: задача, классы, коллекции, хранение данных, обработка ошибок.

### Резюме урока

- Итоговый проект должен явно опираться на реальные темы курса: ООП, коллекции, исключения, JDBC.
- Разделение на пакеты по назначению классов (`model`, `repository`, `exception`) отражает архитектурные подходы, применяемые в реальных Java-проектах.
- Хорошее техническое задание заранее определяет структуру классов и подход к хранению данных.

---

## Урок 10.2. Проектирование структуры классов
**Время: 60 минут**

### Цель урока
Спроектировать структуру классов итогового проекта до начала полной реализации.

### 1. Проектирование модели данных: класс Task

```java
package com.codeway.taskmanager.model;

public class Task {
    private int id;
    private String title;
    private String priority;
    private boolean completed;
    
    public Task(String title, String priority) {
        this.title = title;
        this.priority = priority;
        this.completed = false;
    }
    
    public Task(int id, String title, String priority, boolean completed) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.completed = completed;
    }
    
    // Геттеры и сеттеры
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public String getPriority() { return priority; }
    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }
    
    @Override
    public String toString() {
        return "[" + (completed ? "✓" : " ") + "] " + id + ". " + title + " (приоритет: " + priority + ")";
    }
}
```

### 2. Проектирование собственного исключения

```java
package com.codeway.taskmanager.exception;

public class InvalidTaskException extends RuntimeException {
    public InvalidTaskException(String message) {
        super(message);
    }
}
```

### 3. Проектирование репозитория (интерфейс + реализация)

Хорошей практикой в более крупных Java-проектах является проектирование репозитория сначала как интерфейса, описывающего доступные операции, с последующей конкретной реализацией:

```java
package com.codeway.taskmanager.repository;

import com.codeway.taskmanager.model.Task;
import java.util.List;

public interface TaskRepository {
    void add(Task task);
    List<Task> getAll();
    void update(Task task);
    void delete(int id);
}
```

```java
public class SqliteTaskRepository implements TaskRepository {
    // реализация методов через JDBC (см. Урок 10.3)
}
```

Такое разделение на интерфейс и реализацию позволяет позже легко заменить способ хранения данных (например, с SQLite на другую базу данных), не изменяя код, использующий репозиторий через интерфейс.

### 4. Схема взаимодействия классов

```
Main.java (меню, пользовательский ввод)
   │
   └──> TaskRepository (интерфейс)
              │
              └──> SqliteTaskRepository (реализация через JDBC)
                         │
                         └──> Task (модель данных)
```

### 5. Валидация данных в конструкторе Task

```java
public Task(String title, String priority) {
    if (title == null || title.isBlank()) {
        throw new InvalidTaskException("Название задачи не может быть пустым");
    }
    this.title = title;
    this.priority = priority;
    this.completed = false;
}
```

### 6. Компиляция многопакетного проекта в IntelliJ IDEA

В отличие от компиляции через терминал (что требовало бы явного указания classpath для многопакетных проектов), IntelliJ IDEA автоматически обрабатывает структуру пакетов и зависимости между файлами при запуске проекта через встроенную кнопку «Run».

### Резюме урока

- Проектирование модели данных (`Task`) отдельно от логики хранения (`TaskRepository`) — важный архитектурный принцип, изученный ранее в курсе на примере ООП (Модуль 6).
- Использование интерфейса для репозитория позволяет легко заменить конкретную реализацию хранения данных в будущем.
- Валидация данных прямо в конструкторе модели (с выбросом собственного исключения) — хорошая практика, обеспечивающая, что объект `Task` всегда находится в корректном состоянии.

---

## Урок 10.3. Реализация основного функционала
**Время: 90 минут**

### Цель урока
Реализовать рабочую версию итогового проекта на основе спроектированной структуры классов.

### 1. Полная реализация SqliteTaskRepository

```java
package com.codeway.taskmanager.repository;

import com.codeway.taskmanager.model.Task;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SqliteTaskRepository implements TaskRepository {
    private final String url;
    
    public SqliteTaskRepository(String url) {
        this.url = url;
        createTableIfNotExists();
    }
    
    private void createTableIfNotExists() {
        String sql = """
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                priority TEXT,
                completed INTEGER
            )
            """;
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (SQLException e) {
            System.out.println("Ошибка создания таблицы: " + e.getMessage());
        }
    }
    
    @Override
    public void add(Task task) {
        String sql = "INSERT INTO tasks (title, priority, completed) VALUES (?, ?, ?)";
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, task.getTitle());
            pstmt.setString(2, task.getPriority());
            pstmt.setInt(3, task.isCompleted() ? 1 : 0);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Ошибка добавления задачи: " + e.getMessage());
        }
    }
    
    @Override
    public List<Task> getAll() {
        List<Task> tasks = new ArrayList<>();
        String sql = "SELECT * FROM tasks";
        
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                Task task = new Task(
                    rs.getInt("id"),
                    rs.getString("title"),
                    rs.getString("priority"),
                    rs.getInt("completed") == 1
                );
                tasks.add(task);
            }
        } catch (SQLException e) {
            System.out.println("Ошибка загрузки задач: " + e.getMessage());
        }
        
        return tasks;
    }
    
    @Override
    public void update(Task task) {
        String sql = "UPDATE tasks SET completed = ? WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, task.isCompleted() ? 1 : 0);
            pstmt.setInt(2, task.getId());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Ошибка обновления задачи: " + e.getMessage());
        }
    }
    
    @Override
    public void delete(int id) {
        String sql = "DELETE FROM tasks WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Ошибка удаления задачи: " + e.getMessage());
        }
    }
}
```

### 2. Главный класс с меню

```java
package com.codeway.taskmanager;

import com.codeway.taskmanager.exception.InvalidTaskException;
import com.codeway.taskmanager.model.Task;
import com.codeway.taskmanager.repository.SqliteTaskRepository;
import com.codeway.taskmanager.repository.TaskRepository;

import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        TaskRepository repository = new SqliteTaskRepository("jdbc:sqlite:tasks.db");
        Scanner scanner = new Scanner(System.in);
        
        int choice;
        do {
            System.out.println("\n1. Показать задачи\n2. Добавить задачу\n3. Отметить выполненной\n4. Удалить задачу\n5. Выход");
            System.out.print("Выберите действие: ");
            choice = scanner.nextInt();
            scanner.nextLine();
            
            switch (choice) {
                case 1 -> {
                    List<Task> tasks = repository.getAll();
                    tasks.forEach(System.out::println);
                }
                case 2 -> {
                    try {
                        System.out.print("Название задачи: ");
                        String title = scanner.nextLine();
                        System.out.print("Приоритет (высокий/средний/низкий): ");
                        String priority = scanner.nextLine();
                        
                        Task task = new Task(title, priority);
                        repository.add(task);
                        System.out.println("Задача добавлена");
                    } catch (InvalidTaskException e) {
                        System.out.println("Ошибка: " + e.getMessage());
                    }
                }
                case 3 -> {
                    System.out.print("ID задачи: ");
                    int id = scanner.nextInt();
                    Task task = repository.getAll().stream()
                        .filter(t -> t.getId() == id)
                        .findFirst()
                        .orElse(null);
                    
                    if (task != null) {
                        task.setCompleted(true);
                        repository.update(task);
                        System.out.println("Задача отмечена выполненной");
                    } else {
                        System.out.println("Задача не найдена");
                    }
                }
                case 4 -> {
                    System.out.print("ID задачи для удаления: ");
                    int id = scanner.nextInt();
                    repository.delete(id);
                    System.out.println("Задача удалена");
                }
                case 5 -> System.out.println("До встречи!");
                default -> System.out.println("Некорректный выбор");
            }
        } while (choice != 5);
    }
}
```

### 3. Постепенная проверка функционала

Рекомендуется проверять каждую операцию репозитория отдельно (сначала добавление, затем выборку, затем обновление и удаление), прежде чем интегрировать всё в единое меню.

### Резюме урока

- Реализация итогового проекта на Java типично включает модель данных, интерфейс и реализацию репозитория, а также главный класс с пользовательским интерфейсом.
- Использование Stream API (`.stream().filter().findFirst()`) демонстрирует более современный, функциональный подход к поиску элементов в коллекции.
- Постепенная проверка каждой части функционала — важная практика, применимая независимо от конкретного языка программирования.

---

## Урок 10.4. Тестирование и отладка
**Время: 60 минут**

### Цель урока
Проверить работу итогового проекта на разных сценариях и исправить найденные ошибки.

### 1. Ручное тестирование по сценариям

- Добавление новой задачи — сохраняется ли она в базе данных?
- Отметка задачи выполненной — обновляется ли статус в базе?
- Удаление задачи — исчезает ли она из списка?
- Повторный запуск программы — загружаются ли ранее сохранённые задачи?

### 2. Проверка граничных случаев

- Что произойдёт при добавлении задачи с пустым названием (должно сработать `InvalidTaskException`)?
- Что произойдёт при попытке отметить/удалить задачу с несуществующим ID?
- Что произойдёт при некорректном пользовательском вводе в меню (например, текст вместо числа)?
- Что произойдёт при первом запуске, когда файла базы данных ещё не существует?

### 3. Типичные ошибки в Java-проектах, которые стоит проверить

```java
// NullPointerException при работе с объектами, которые могут быть null
// InputMismatchException при некорректном вводе через Scanner (нужен try/catch)
// Забытая обработка SQLException в одном из методов репозитория
// Индексация параметров PreparedStatement с 0 вместо 1 (частая опечатка)
```

### 4. Использование отладчика IntelliJ IDEA

Как и с VS Code для C++ (Урок 10.4 курса C++), IntelliJ IDEA предоставляет мощный встроенный отладчик — точки останова, пошаговое выполнение, просмотр значений переменных в реальном времени. Значительно эффективнее многочисленных `System.out.println()` для поиска сложных ошибок.

### 5. Обработка InputMismatchException при вводе

```java
try {
    choice = scanner.nextInt();
} catch (java.util.InputMismatchException e) {
    System.out.println("Пожалуйста, введите число");
    scanner.next();   // очистка некорректного токена из буфера ввода
    continue;
}
```

### 6. Чек-лист готовности проекта

- [ ] Все функции из технического задания реализованы.
- [ ] Программа не завершается аварийно при некорректном пользовательском вводе.
- [ ] Данные корректно сохраняются и загружаются из базы данных между запусками.
- [ ] Все запросы к базе данных, содержащие пользовательский ввод, используют `PreparedStatement`.
- [ ] Собственные исключения корректно обрабатываются в пользовательском интерфейсе.
- [ ] Код разделён на логические пакеты (model, repository, exception).

### Резюме урока

- Тестирование Java-проекта должно включать проверку типичных для языка ошибок: NullPointerException, InputMismatchException, забытую обработку SQLException.
- Отладчик IntelliJ IDEA — значительно более эффективный инструмент поиска ошибок по сравнению с многочисленными выводами через println.
- Чек-лист готовности — систематический способ проверить проект перед финальной презентацией.

---

## Урок 10.5. Презентация проекта
**Время: 40 минут**

### Цель урока
Подготовить итоговый проект к демонстрации и защитить проделанную работу.

### 1. Финальное оформление кода

- Убедиться, что структура пакетов логична и понятна.
- Проверить, что все геттеры/сеттеры и переопределённые методы (`toString()` и др.) корректно сгенерированы.
- Убрать отладочные `System.out.println()`, оставленные во время разработки.
- Добавить `README.md` с описанием проекта, структуры и инструкцией по запуску.

### 2. Пример README.md

```markdown
# Task Manager

Консольное приложение на Java для управления задачами с сохранением в базу данных SQLite.

## Возможности
- Добавление, выполнение и удаление задач с приоритетами
- Сохранение данных между запусками через JDBC + SQLite

## Структура проекта
- model/ — модель данных Task
- repository/ — работа с базой данных через JDBC
- exception/ — собственные исключения

## Как запустить
Открыть проект в IntelliJ IDEA и запустить Main.java
```

### 3. Структура презентации проекта

1. **Идея.** Какую задачу решает проект? (1 минута)
2. **Демонстрация.** Показать работу приложения: добавление, выполнение, удаление задач, перезапуск с сохранёнными данными. (2–3 минуты)
3. **Технические детали.** Структура пакетов, использованные коллекции, подход к обработке исключений, работа с JDBC. (2 минуты)
4. **Возможные улучшения.** Что можно было бы добавить: графический интерфейс (JavaFX/Swing), сортировка и фильтрация задач, многопользовательский режим. (1 минута)

### 4. Частые вопросы, к которым стоит подготовиться

- Почему выбрана именно такая структура пакетов (model/repository/exception)?
- Как обеспечивается защита от SQL-инъекций в проекте?
- Как обрабатываются checked и unchecked исключения в разных частях проекта?
- Как можно было бы адаптировать проект для использования Stream API более широко?

### 5. Значение итогового проекта

Итоговый проект демонстрирует практическое владение ключевыми возможностями Java: ООП (интерфейсы, наследование, инкапсуляция), коллекциями, системой исключений (включая уникальную для Java классификацию checked/unchecked), и работой с базами данных через JDBC — центральными темами, встречающимися в подавляющем большинстве реальных Java-приложений.

### 6. Что дальше после курса

- **Фреймворк Spring** — стандарт индустрии для корпоративной Java-разработки, значительно упрощающий работу с базами данных, веб-серверами и многим другим.
- **Maven/Gradle** — системы сборки, необходимые для управления зависимостями в реальных проектах (в отличие от ручного добавления `.jar`-файлов, использованного в этом курсе).
- **Многопоточность в Java** (`Thread`, `ExecutorService`) — для задач, требующих параллельных вычислений.
- **Углублённое изучение Stream API и функционального программирования** в Java.

### Резюме урока

- Перед презентацией важно привести код в аккуратный вид, проверить структуру пакетов и подготовить понятную документацию.
- Презентация должна включать живую демонстрацию работы приложения, а не только описание архитектуры на словах.
- Итоговый проект показывает владение ключевыми возможностями Java: ООП, коллекциями, системой исключений и работой с базами данных через JDBC.
