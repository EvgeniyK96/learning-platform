# Модуль 9. Работа с базами данных (JDBC)

---

## Урок 9.1. Введение в JDBC, подключение к базе данных
**Время: 45 минут**

### Цель урока
Понять, что такое JDBC, и научиться устанавливать соединение с базой данных из Java-программы.

### 1. Что такое JDBC

JDBC (Java Database Connectivity) — стандартный API Java для взаимодействия с реляционными базами данных, аналогичный по назначению модулю `sqlite3` в Python (Урок 8.6 курса Python) или библиотеке JDBC-аналогов в других языках. JDBC предоставляет единый интерфейс для работы с разными базами данных (MySQL, PostgreSQL, SQLite, Oracle и др.) через соответствующие драйверы.

### 2. Драйвер JDBC

Для подключения к конкретной базе данных требуется соответствующий JDBC-драйвер — библиотека, реализующая стандартный интерфейс JDBC для конкретной СУБД. Для учебных целей удобно использовать SQLite — лёгкую встроенную базу данных, не требующую отдельной установки сервера (аналогично тому, как она использовалась в курсе Python).

### 3. Подключение библиотеки SQLite JDBC

В реальном проекте (например, через систему сборки Maven или Gradle) необходимо подключить зависимость драйвера SQLite JDBC. Для учебных целей в IntelliJ IDEA можно добавить `.jar`-файл драйвера напрямую в настройки проекта («Project Structure → Libraries»).

### 4. Установление соединения с базой данных

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) {
        String url = "jdbc:sqlite:school.db";
        
        try (Connection connection = DriverManager.getConnection(url)) {
            System.out.println("Соединение с базой данных установлено");
        } catch (SQLException e) {
            System.out.println("Ошибка подключения: " + e.getMessage());
        }
    }
}
```

Строка подключения (`url`) для SQLite указывает путь к файлу базы данных — при отсутствии файла он будет создан автоматически.

### 5. try-with-resources для соединения с базой данных

Как и файловые потоки (Модуль 8), интерфейс `Connection` реализует `AutoCloseable` — использование `try-with-resources` гарантирует, что соединение с базой данных будет корректно закрыто, освобождая ресурсы, даже при возникновении ошибки.

### 6. SQLException — checked-исключение

Практически все операции JDBC могут выбросить `SQLException` (checked-исключение, Урок 8.2) — работа с базами данных в Java всегда требует явной обработки этого исключения либо объявления через `throws`.

### 7. Строки подключения для других СУБД (обзорно)

Для понимания общей идеи — строки подключения для других распространённых баз данных выглядят похоже, но с указанием сервера, порта и учётных данных:

```
jdbc:mysql://localhost:3306/mydb
jdbc:postgresql://localhost:5432/mydb
```

### Резюме урока

- JDBC — стандартный API Java для взаимодействия с реляционными базами данных через соответствующие драйверы.
- Соединение с базой данных устанавливается через `DriverManager.getConnection(url)` и рекомендуется оборачивать в `try-with-resources`.
- Работа с JDBC практически всегда требует обработки checked-исключения `SQLException`.

---

## Урок 9.2. Выполнение SQL-запросов из Java
**Время: 50 минут**

### Цель урока
Научиться выполнять SQL-запросы к базе данных из Java-кода через Statement.

### 1. Интерфейс Statement

`Statement` — объект, используемый для выполнения SQL-запросов через установленное соединение:

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.sql.SQLException;

String url = "jdbc:sqlite:school.db";

try (Connection connection = DriverManager.getConnection(url);
     Statement statement = connection.createStatement()) {
    
    statement.execute("""
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER
        )
        """);
    
    System.out.println("Таблица создана");
    
} catch (SQLException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

Обрати внимание на текстовый блок (text block), заключённый в тройные кавычки `"""` — современный синтаксис Java (начиная с Java 15) для удобной записи многострочных строк, особенно полезный для SQL-запросов.

### 2. Добавление данных: executeUpdate

Для операций изменения данных (`INSERT`, `UPDATE`, `DELETE`) используется метод `executeUpdate()`, возвращающий количество затронутых строк:

```java
String insertSql = "INSERT INTO students (name, age) VALUES ('Алина', 20)";
int rowsAffected = statement.executeUpdate(insertSql);
System.out.println("Добавлено строк: " + rowsAffected);
```

### 3. Выборка данных: executeQuery и ResultSet

Для операций выборки данных (`SELECT`) используется метод `executeQuery()`, возвращающий объект `ResultSet` — курсор для перебора полученных строк результата:

```java
import java.sql.ResultSet;

String selectSql = "SELECT * FROM students";
ResultSet resultSet = statement.executeQuery(selectSql);

while (resultSet.next()) {
    int id = resultSet.getInt("id");
    String name = resultSet.getString("name");
    int age = resultSet.getInt("age");
    
    System.out.println(id + ": " + name + ", " + age + " лет");
}
```

Метод `.next()` перемещает курсор `ResultSet` к следующей строке результата и возвращает `false`, когда строки закончились — это условие естественным образом завершает цикл `while`.

### 4. Методы получения данных из ResultSet по типу столбца

```java
resultSet.getInt("age");         // получение значения как int
resultSet.getString("name");    // получение значения как String
resultSet.getDouble("price");   // получение значения как double
```

Значения можно получать как по имени столбца (как в примерах выше), так и по числовому индексу столбца (начиная с 1, а не с 0).

### 5. Обновление и удаление данных

```java
String updateSql = "UPDATE students SET age = 21 WHERE name = 'Алина'";
statement.executeUpdate(updateSql);

String deleteSql = "DELETE FROM students WHERE name = 'Алина'";
statement.executeUpdate(deleteSql);
```

### 6. Полный пример: создание, заполнение и выборка данных

```java
try (Connection connection = DriverManager.getConnection(url);
     Statement statement = connection.createStatement()) {
    
    statement.execute("CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)");
    statement.executeUpdate("INSERT INTO students (name, age) VALUES ('Данияр', 19)");
    
    ResultSet rs = statement.executeQuery("SELECT * FROM students");
    while (rs.next()) {
        System.out.println(rs.getString("name") + ", " + rs.getInt("age"));
    }
    
} catch (SQLException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

### Резюме урока

- `Statement.execute()` используется для команд без возврата данных (создание таблиц), `executeUpdate()` — для изменения данных, `executeQuery()` — для выборки.
- `ResultSet` — курсор для перебора результатов запроса `SELECT`, перемещаемый через `.next()`.
- Данные из `ResultSet` извлекаются типизированными методами (`getInt()`, `getString()` и др.) по имени или индексу столбца.

---

## Урок 9.3. PreparedStatement и защита от SQL-инъекций
**Время: 40 минут**

### Цель урока
Изучить PreparedStatement — безопасный способ выполнения параметризованных SQL-запросов.

### 1. Проблема SQL-инъекций при использовании Statement

Формирование SQL-запросов через прямую конкатенацию строк с пользовательским вводом — серьёзная уязвимость безопасности:

```java
// ОПАСНО! Никогда так не делай в реальном коде
String userName = "'; DROP TABLE students; --";
String sql = "SELECT * FROM students WHERE name = '" + userName + "'";
statement.execute(sql);   // потенциально катастрофические последствия
```

Если пользовательский ввод содержит специально сформированный текст (как в примере выше), это может изменить смысл всего SQL-запроса, что называется SQL-инъекцией — одной из самых опасных и распространённых уязвимостей веб-приложений.

### 2. Решение: PreparedStatement

`PreparedStatement` — безопасная альтернатива `Statement`, использующая параметризованные запросы с плейсхолдерами `?`, куда значения подставляются отдельно, а не через прямую конкатенацию строк:

```java
import java.sql.PreparedStatement;

String sql = "INSERT INTO students (name, age) VALUES (?, ?)";

try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
    pstmt.setString(1, "Алина");   // первый ? - имя (индексация с 1, а не с 0!)
    pstmt.setInt(2, 20);              // второй ? - возраст
    
    pstmt.executeUpdate();
} catch (SQLException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

При таком подходе значение пользовательского ввода никогда не интерпретируется как часть SQL-кода, что полностью устраняет риск SQL-инъекции.

### 3. Методы установки параметров по типу

```java
pstmt.setString(1, "текст");
pstmt.setInt(2, 42);
pstmt.setDouble(3, 19.99);
pstmt.setBoolean(4, true);
```

Индексация параметров `?` в `PreparedStatement` начинается с 1, а не с 0 — важная особенность, отличающаяся от привычной нумерации массивов и списков в Java.

### 4. Выборка данных через PreparedStatement

```java
String sql = "SELECT * FROM students WHERE age > ?";

try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
    pstmt.setInt(1, 19);
    ResultSet rs = pstmt.executeQuery();
    
    while (rs.next()) {
        System.out.println(rs.getString("name") + ", " + rs.getInt("age"));
    }
} catch (SQLException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

### 5. Переиспользование PreparedStatement для нескольких вставок

Одно из дополнительных преимуществ `PreparedStatement` — возможность эффективно повторно использовать один и тот же подготовленный запрос с разными значениями параметров, что особенно полезно при массовой вставке данных:

```java
String sql = "INSERT INTO students (name, age) VALUES (?, ?)";

try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
    String[][] data = {{"Алина", "20"}, {"Данияр", "19"}, {"Аружан", "22"}};
    
    for (String[] row : data) {
        pstmt.setString(1, row[0]);
        pstmt.setInt(2, Integer.parseInt(row[1]));
        pstmt.executeUpdate();
    }
} catch (SQLException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

### 6. Золотое правило безопасности JDBC

В реальной разработке практически всегда следует использовать `PreparedStatement` вместо обычного `Statement` при работе с любыми данными, приходящими от пользователя — это фундаментальное правило безопасности при работе с базами данных, применимое не только к Java, но и ко всем языкам программирования (аналогичный принцип рассматривался в Уроке 8.6 курса Python).

### Резюме урока

- `PreparedStatement` использует параметризованные запросы с плейсхолдерами `?`, полностью устраняя риск SQL-инъекций, в отличие от прямой конкатенации строк.
- Индексация параметров в `PreparedStatement` начинается с 1, а не с 0.
- Использование `PreparedStatement` вместо `Statement` для любых запросов, включающих пользовательский ввод, — фундаментальное правило безопасности при работе с базами данных.

---

## Урок 9.4. Практика: приложение с сохранением данных в базу
**Время: 55 минут**

### Цель урока
Закрепить материал модуля, реализовав приложение, полностью взаимодействующее с базой данных через JDBC.

### 1. Постановка задачи

Разработаем консольное приложение учёта студентов с сохранением данных в SQLite-базу через JDBC, используя исключительно `PreparedStatement` для безопасности.

### 2. Класс StudentRepository — инкапсуляция работы с базой данных

Хорошей практикой в реальных Java-приложениях является выделение всей логики работы с базой данных в отдельный класс (часто называемый репозиторием), а не смешивание её напрямую с пользовательским интерфейсом:

```java
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class StudentRepository {
    private final String url;
    
    public StudentRepository(String url) {
        this.url = url;
        createTableIfNotExists();
    }
    
    private void createTableIfNotExists() {
        String sql = "CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)";
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (SQLException e) {
            System.out.println("Ошибка создания таблицы: " + e.getMessage());
        }
    }
    
    public void addStudent(String name, int age) {
        String sql = "INSERT INTO students (name, age) VALUES (?, ?)";
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, name);
            pstmt.setInt(2, age);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Ошибка добавления: " + e.getMessage());
        }
    }
    
    public List<String> getAllStudents() {
        List<String> results = new ArrayList<>();
        String sql = "SELECT * FROM students";
        
        try (Connection conn = DriverManager.getConnection(url);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                results.add(rs.getInt("id") + ": " + rs.getString("name") + ", " + rs.getInt("age") + " лет");
            }
        } catch (SQLException e) {
            System.out.println("Ошибка выборки: " + e.getMessage());
        }
        
        return results;
    }
    
    public void deleteStudent(int id) {
        String sql = "DELETE FROM students WHERE id = ?";
        try (Connection conn = DriverManager.getConnection(url);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Ошибка удаления: " + e.getMessage());
        }
    }
}
```

### 3. Главный класс с меню

```java
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        StudentRepository repository = new StudentRepository("jdbc:sqlite:students.db");
        Scanner scanner = new Scanner(System.in);
        
        int choice;
        do {
            System.out.println("\n1. Показать студентов\n2. Добавить студента\n3. Удалить студента\n4. Выход");
            System.out.print("Выберите действие: ");
            choice = scanner.nextInt();
            scanner.nextLine();
            
            switch (choice) {
                case 1 -> {
                    List<String> students = repository.getAllStudents();
                    students.forEach(System.out::println);
                }
                case 2 -> {
                    System.out.print("Имя: ");
                    String name = scanner.nextLine();
                    System.out.print("Возраст: ");
                    int age = scanner.nextInt();
                    repository.addStudent(name, age);
                    System.out.println("Студент добавлен");
                }
                case 3 -> {
                    System.out.print("ID студента для удаления: ");
                    int id = scanner.nextInt();
                    repository.deleteStudent(id);
                    System.out.println("Студент удалён");
                }
                case 4 -> System.out.println("До свидания!");
                default -> System.out.println("Некорректный выбор");
            }
        } while (choice != 4);
    }
}
```

### 4. Разбор архитектурного подхода

Выделение класса `StudentRepository` отделяет логику работы с базой данных от пользовательского интерфейса (`main`) — этот принцип разделения ответственности широко применяется в реальных Java-приложениях, особенно построенных на популярных фреймворках вроде Spring, где подобные классы называются репозиториями или DAO (Data Access Object).

### 5. Использование ссылки на метод (method reference)

Обрати внимание на конструкцию `students.forEach(System.out::println)` — это ссылка на метод (method reference), компактная альтернатива лямбда-выражению `s -> System.out.println(s)`, часто используемая в связке со Stream API и коллекциями.

### Резюме урока

- Выделение отдельного класса-репозитория для работы с базой данных — распространённая практика разделения ответственности в реальных Java-приложениях.
- Все операции с пользовательским вводом в примере используют `PreparedStatement`, обеспечивая защиту от SQL-инъекций.
- Комбинация JDBC с коллекциями (`List`) и современным синтаксисом (`switch`-выражения, ссылки на методы) демонстрирует практическое применение большинства тем, изученных в курсе.
