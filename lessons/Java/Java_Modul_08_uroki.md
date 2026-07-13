# Модуль 8. Исключения и работа с файлами

---

## Урок 8.1. Исключения: try, catch, finally
**Время: 45 минут**

### Цель урока
Изучить механизм исключений в Java, включая блок finally, отсутствующий в C++.

### 1. Базовый синтаксис try/catch

```java
public class Main {
    public static void main(String[] args) {
        try {
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Ошибка: " + e.getMessage());
        }
    }
}
```

Метод `.getMessage()` возвращает текстовое описание исключения.

### 2. Блок finally

В отличие от C++ (где блок `finally` отсутствует, Урок 9.2 курса C++), Java предоставляет блок `finally`, который выполняется **всегда** — независимо от того, было выброшено исключение или нет:

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Ошибка: " + e.getMessage());
} finally {
    System.out.println("Этот блок выполнится в любом случае");
}
```

`finally` обычно используется для освобождения ресурсов (закрытия файлов, соединений с базой данных), которые должны быть освобождены независимо от исхода операции.

### 3. Обработка нескольких типов исключений

```java
try {
    int[] numbers = {1, 2, 3};
    System.out.println(numbers[5]);
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Индекс вне диапазона: " + e.getMessage());
} catch (Exception e) {
    System.out.println("Другая ошибка: " + e.getMessage());
}
```

Как и в других изученных языках, более специфичные исключения должны обрабатываться раньше более общих.

### 4. Многокатч (Java 7+): обработка нескольких типов одним блоком

```java
try {
    // код, который может выбросить один из нескольких типов исключений
} catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {
    System.out.println("Одна из двух ошибок: " + e.getMessage());
}
```

### 5. try-with-resources — автоматическое закрытие ресурсов (Java 7+)

Для ресурсов, реализующих интерфейс `AutoCloseable` (например, файловых потоков), Java предоставляет специальный синтаксис `try-with-resources`, автоматически закрывающий ресурс по завершении блока, даже при возникновении исключения — концептуально похоже на конструкцию `with` в Python:

```java
try (Scanner fileScanner = new Scanner(new File("data.txt"))) {
    while (fileScanner.hasNextLine()) {
        System.out.println(fileScanner.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("Файл не найден: " + e.getMessage());
}
// fileScanner автоматически закрыт здесь, даже без явного .close()
```

### 6. Генерация собственного исключения: throw

```java
static double divide(double a, double b) {
    if (b == 0) {
        throw new ArithmeticException("Деление на ноль недопустимо");
    }
    return a / b;
}
```

### Резюме урока

- В отличие от C++, Java предоставляет блок `finally`, гарантированно выполняющийся независимо от исхода блока `try`.
- Многокатч (`catch (Тип1 | Тип2 e)`) позволяет обрабатывать несколько типов исключений одним блоком кода.
- `try-with-resources` автоматически закрывает ресурсы (файлы и др.), реализующие `AutoCloseable`, аналогично `with` в Python.

---

## Урок 8.2. Checked и unchecked исключения, throws
**Время: 40 минут**

### Цель урока
Изучить уникальную для Java классификацию исключений на проверяемые (checked) и непроверяемые (unchecked).

### 1. Checked (проверяемые) исключения

Checked-исключения — особенность, характерная именно для Java (отсутствует в большинстве других изученных в курсе языков): компилятор **обязывает** явно обработать такие исключения через `try/catch` либо объявить их в сигнатуре метода через `throws` — иначе код просто не скомпилируется:

```java
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        FileReader reader = new FileReader("data.txt");   // ОШИБКА КОМПИЛЯЦИИ без обработки IOException
    }
}
```

Правильная версия — с обработкой:

```java
public static void main(String[] args) {
    try {
        FileReader reader = new FileReader("data.txt");
    } catch (IOException e) {
        System.out.println("Ошибка при открытии файла: " + e.getMessage());
    }
}
```

### 2. Unchecked (непроверяемые) исключения

Unchecked-исключения (наследники `RuntimeException`, такие как `ArithmeticException`, `ArrayIndexOutOfBoundsException`, `NullPointerException`) компилятор не требует обрабатывать явно — программа скомпилируется, даже если такое исключение потенциально может возникнуть и не обработано:

```java
int[] numbers = {1, 2, 3};
System.out.println(numbers[10]);   // скомпилируется без try/catch, но упадёт при выполнении
```

### 3. Иерархия исключений Java

```
Throwable
├── Error                (серьёзные системные ошибки, обычно не обрабатываются приложением)
└── Exception
     ├── RuntimeException    (unchecked - IllegalArgumentException, NullPointerException и др.)
     └── (остальные)           (checked - IOException, SQLException и др.)
```

### 4. Объявление throws в сигнатуре метода

Вместо обработки checked-исключения через `try/catch` внутри самого метода, можно «передать ответственность» вызывающему коду, объявив исключение в сигнатуре метода через `throws`:

```java
static void readFile(String filename) throws IOException {
    FileReader reader = new FileReader(filename);
    // ...
}

public static void main(String[] args) {
    try {
        readFile("data.txt");   // теперь обработка обязательна здесь, в вызывающем коде
    } catch (IOException e) {
        System.out.println("Ошибка: " + e.getMessage());
    }
}
```

### 5. Почему checked-исключения вызывают споры среди Java-разработчиков

Механизм checked-исключений уникален для Java (большинство других языков, включая C++, Python, C#, не имеют аналога) и остаётся предметом дискуссий в сообществе: с одной стороны, он заставляет разработчика явно задумываться об обработке потенциальных ошибок ввода-вывода и подобных ситуаций; с другой — может приводить к избыточному, «шумному» коду, если обрабатывать каждое checked-исключение формально, без реальной пользы.

### 6. Практический пример: метод с throws

```java
import java.io.IOException;

static int readNumberFromFile(String filename) throws IOException {
    Scanner fileScanner = new Scanner(new java.io.File(filename));
    int number = fileScanner.nextInt();
    fileScanner.close();
    return number;
}

public static void main(String[] args) {
    try {
        int number = readNumberFromFile("number.txt");
        System.out.println("Прочитано число: " + number);
    } catch (IOException e) {
        System.out.println("Не удалось прочитать файл: " + e.getMessage());
    }
}
```

### Резюме урока

- Checked-исключения (например, `IOException`) обязательно должны быть обработаны через `try/catch` либо объявлены в сигнатуре метода через `throws` — иначе код не скомпилируется.
- Unchecked-исключения (наследники `RuntimeException`) не требуют обязательной обработки компилятором, хотя это остаётся хорошей практикой.
- Механизм checked-исключений уникален для Java среди изученных в курсе языков и является предметом дискуссий в сообществе разработчиков.

---

## Урок 8.3. Собственные классы исключений
**Время: 35 минут**

### Цель урока
Научиться создавать собственные классы исключений для более специфичных ситуаций в приложении.

### 1. Создание собственного unchecked-исключения

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
}
```

Наследование от `RuntimeException` делает исключение unchecked — не требующим обязательной обработки компилятором.

### 2. Создание собственного checked-исключения

```java
public class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}
```

Наследование напрямую от `Exception` (а не от `RuntimeException`) делает исключение checked — требующим обязательной обработки или объявления через `throws`.

### 3. Использование собственного исключения

```java
public class BankAccount {
    private double balance;
    
    public BankAccount(double balance) {
        this.balance = balance;
    }
    
    public void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientFundsException("Недостаточно средств на счёте");
        }
        balance -= amount;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount(1000);
        
        try {
            account.withdraw(1500);
        } catch (InsufficientFundsException e) {
            System.out.println("Ошибка: " + e.getMessage());
        }
    }
}
```

### 4. Использование checked-исключения с throws

```java
public class Person {
    private int age;
    
    public void setAge(int age) throws InvalidAgeException {
        if (age < 0 || age > 150) {
            throw new InvalidAgeException("Некорректный возраст: " + age);
        }
        this.age = age;
    }
}

public class Main {
    public static void main(String[] args) {
        Person person = new Person();
        try {
            person.setAge(-5);
        } catch (InvalidAgeException e) {
            System.out.println("Ошибка: " + e.getMessage());
        }
    }
}
```

### 5. Дополнительные конструкторы для собственных исключений

Хорошей практикой считается предоставить несколько конструкторов, аналогично встроенным классам исключений Java:

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message);
    }
    
    public InsufficientFundsException(String message, Throwable cause) {
        super(message, cause);   // сохраняет исходную причину ошибки (chained exception)
    }
}
```

### 6. Когда создавать собственные классы исключений

Собственные классы исключений оправданы, когда: встроенных исключений Java недостаточно для точного описания специфичной для приложения ошибки, требуется передать дополнительную информацию об ошибке (не только текстовое сообщение), или важно явно отделить конкретный вид ошибки для целевой обработки в разных местах программы.

### Резюме урока

- Собственные unchecked-исключения наследуются от `RuntimeException`, checked-исключения — напрямую от `Exception`.
- Собственные классы исключений позволяют точнее описывать специфичные для приложения ошибочные ситуации по сравнению со встроенными общими классами.
- Хорошей практикой является предоставление нескольких конструкторов для собственного исключения, аналогично встроенным классам Java.

---

## Урок 8.4. Чтение и запись файлов (FileReader, FileWriter, BufferedReader)
**Время: 50 минут**

### Цель урока
Изучить основные классы Java для чтения и записи текстовых файлов.

### 1. Запись в файл: FileWriter

```java
import java.io.FileWriter;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try (FileWriter writer = new FileWriter("notes.txt")) {
            writer.write("Первая строка\n");
            writer.write("Вторая строка\n");
        } catch (IOException e) {
            System.out.println("Ошибка записи: " + e.getMessage());
        }
    }
}
```

Использование `try-with-resources` (Урок 8.1) гарантирует автоматическое закрытие файла после завершения блока.

### 2. Дозапись в файл

```java
try (FileWriter writer = new FileWriter("notes.txt", true)) {   // второй аргумент true - режим дозаписи
    writer.write("Добавленная строка\n");
} catch (IOException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

### 3. Чтение файла построчно: BufferedReader

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        try (BufferedReader reader = new BufferedReader(new FileReader("notes.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Ошибка чтения: " + e.getMessage());
        }
    }
}
```

`BufferedReader` оборачивает `FileReader`, добавляя буферизацию — значительно повышает эффективность чтения по сравнению с посимвольным чтением напрямую через `FileReader`, особенно для больших файлов.

### 4. Чтение файла через Scanner (альтернативный, часто более простой способ)

```java
import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

try (Scanner fileScanner = new Scanner(new File("notes.txt"))) {
    while (fileScanner.hasNextLine()) {
        System.out.println(fileScanner.nextLine());
    }
} catch (FileNotFoundException e) {
    System.out.println("Файл не найден: " + e.getMessage());
}
```

### 5. Современный способ: класс Files (Java 7+)

Для более простых сценариев (когда весь файл можно загрузить в память целиком) современная Java предоставляет ещё более лаконичный класс `Files`:

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.io.IOException;

try {
    List<String> lines = Files.readAllLines(Path.of("notes.txt"));
    for (String line : lines) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Ошибка: " + e.getMessage());
}
```

### 6. Практический пример: подсчёт строк в файле

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class Main {
    public static void main(String[] args) {
        int count = 0;
        
        try (BufferedReader reader = new BufferedReader(new FileReader("notes.txt"))) {
            while (reader.readLine() != null) {
                count++;
            }
        } catch (IOException e) {
            System.out.println("Ошибка: " + e.getMessage());
        }
        
        System.out.println("Количество строк: " + count);
    }
}
```

### Резюме урока

- `FileWriter`/`FileReader` — базовые классы для записи и чтения файлов, часто оборачиваются в `BufferedReader` для повышения эффективности.
- Работа с файлами в Java практически всегда требует обработки checked-исключения `IOException`.
- Современный класс `Files` (Java 7+) предоставляет более лаконичный синтаксис для простых сценариев работы с файлами целиком.

---

## Урок 8.5. Практика: программа с обработкой ошибок и файлами
**Время: 50 минут**

### Цель урока
Закрепить материал модуля, реализовав программу, объединяющую работу с файлами и обработку исключений.

### 1. Постановка задачи

Разработаем программу учёта расходов, аналогичную итоговой практике по этой теме в курсе C++ (Урок 9.4), но с использованием характерных для Java средств: собственных исключений, try-with-resources, коллекций.

### 2. Класс Expense с собственным исключением

```java
public class InvalidExpenseException extends RuntimeException {
    public InvalidExpenseException(String message) {
        super(message);
    }
}

public class Expense {
    String category;
    double amount;
    
    public Expense(String category, double amount) {
        if (amount < 0) {
            throw new InvalidExpenseException("Сумма расхода не может быть отрицательной");
        }
        this.category = category;
        this.amount = amount;
    }
    
    @Override
    public String toString() {
        return category + "," + amount;
    }
}
```

### 3. Функция сохранения расходов

```java
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;

static void saveExpenses(List<Expense> expenses, String filename) throws IOException {
    try (FileWriter writer = new FileWriter(filename)) {
        for (Expense expense : expenses) {
            writer.write(expense.toString() + "\n");
        }
    }
}
```

### 4. Функция загрузки расходов

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

static List<Expense> loadExpenses(String filename) {
    List<Expense> expenses = new ArrayList<>();
    
    try (BufferedReader reader = new BufferedReader(new FileReader(filename))) {
        String line;
        while ((line = reader.readLine()) != null) {
            String[] parts = line.split(",");
            expenses.add(new Expense(parts[0], Double.parseDouble(parts[1])));
        }
    } catch (IOException e) {
        System.out.println("Файл ещё не существует, начинаем с пустого списка");
    }
    
    return expenses;
}
```

### 5. Основная программа

```java
import java.util.List;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        String filename = "expenses.csv";
        List<Expense> expenses = loadExpenses(filename);
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Загружено расходов: " + expenses.size());
        
        while (true) {
            System.out.print("\nВведите категорию (или 'выход'): ");
            String category = scanner.next();
            
            if (category.equals("выход")) break;
            
            try {
                System.out.print("Введите сумму: ");
                double amount = scanner.nextDouble();
                
                Expense expense = new Expense(category, amount);
                expenses.add(expense);
                saveExpenses(expenses, filename);
                
                System.out.println("Расход добавлен и сохранён");
                
            } catch (InvalidExpenseException e) {
                System.out.println("Ошибка: " + e.getMessage());
            } catch (java.util.InputMismatchException e) {
                System.out.println("Некорректный ввод суммы");
                scanner.next();   // очистка некорректного ввода
            } catch (IOException e) {
                System.out.println("Ошибка сохранения файла: " + e.getMessage());
            }
        }
        
        double total = expenses.stream().mapToDouble(e -> e.amount).sum();
        System.out.println("\nОбщая сумма расходов: " + total);
    }
}
```

### 6. Разбор ключевых моментов

- Класс `Expense` сам проверяет корректность своих данных в конструкторе через собственное unchecked-исключение.
- Работа с файлами обёрнута в `try-with-resources`, гарантирующий закрытие файла даже при ошибке.
- Обрабатываются сразу три разных типа возможных ошибок: некорректные данные расхода, некорректный пользовательский ввод, ошибки файловой системы.

### Резюме урока

- Реальные Java-программы часто комбинируют работу с файлами, коллекциями и несколькими видами обработки исключений (checked и unchecked) для создания надёжных приложений.
- Собственные классы исключений позволяют классу самостоятельно валидировать свои данные, явно сигнализируя о конкретном виде ошибки.
- `try-with-resources` — рекомендуемый способ работы с файловыми ресурсами в современном Java-коде.
