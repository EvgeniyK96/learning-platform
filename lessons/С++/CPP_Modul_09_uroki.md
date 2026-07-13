# Модуль 9. Файлы и исключения

---

## Урок 9.1. Чтение и запись файлов (fstream)
**Время: 50 минут**

### Цель урока
Научиться читать и записывать текстовые файлы в C++ с помощью библиотеки fstream.

### 1. Библиотека fstream

Для работы с файлами в C++ используется стандартная библиотека `<fstream>`, предоставляющая три основных класса: `ofstream` (запись), `ifstream` (чтение), `fstream` (чтение и запись).

### 2. Запись в файл: ofstream

```cpp
#include <fstream>
#include <iostream>
using namespace std;

int main() {
    ofstream outFile("notes.txt");
    
    if (outFile.is_open()) {
        outFile << "Первая строка" << endl;
        outFile << "Вторая строка" << endl;
        outFile.close();
    } else {
        cout << "Не удалось открыть файл для записи" << endl;
    }
    
    return 0;
}
```

Проверка `is_open()` важна — попытка открыть файл может завершиться неудачей (например, из-за отсутствия прав доступа), и работа с неоткрытым потоком приведёт к ошибкам.

### 3. Чтение из файла: ifstream

```cpp
ifstream inFile("notes.txt");
string line;

if (inFile.is_open()) {
    while (getline(inFile, line)) {
        cout << line << endl;
    }
    inFile.close();
} else {
    cout << "Не удалось открыть файл для чтения" << endl;
}
```

`getline(inFile, line)` считывает файл построчно, возвращая `false`, когда достигнут конец файла — это условие естественным образом завершает цикл `while`.

### 4. Дозапись в файл: режим app

По умолчанию `ofstream` перезаписывает файл заново. Чтобы добавить данные в конец существующего файла, не удаляя его содержимое, используется режим `ios::app`:

```cpp
ofstream outFile("notes.txt", ios::app);
outFile << "Добавленная строка" << endl;
outFile.close();
```

### 5. Чтение файла целиком в строку

```cpp
#include <sstream>

ifstream inFile("notes.txt");
stringstream buffer;
buffer << inFile.rdbuf();
string content = buffer.str();

cout << content << endl;
```

### 6. Автоматическое закрытие файла (RAII)

Объекты `ofstream`/`ifstream` в C++ автоматически закрывают файл в своём деструкторе, когда выходят из области видимости — это означает, что явный вызов `.close()` часто не строго обязателен (хотя явное закрытие остаётся хорошей практикой для ясности кода и предсказуемости момента освобождения ресурса):

```cpp
void writeToFile() {
    ofstream outFile("notes.txt");
    outFile << "Текст";
}   // outFile автоматически закрывается здесь, даже без явного .close()
```

Этот принцип называется RAII (Resource Acquisition Is Initialization) — фундаментальная идиома C++, тесно связанная с умными указателями (Урок 8.4): ресурс автоматически освобождается, когда владеющий им объект уничтожается.

### 7. Практический пример: подсчёт строк в файле

```cpp
#include <fstream>
#include <iostream>
using namespace std;

int main() {
    ifstream inFile("notes.txt");
    string line;
    int count = 0;
    
    while (getline(inFile, line)) {
        count++;
    }
    
    cout << "Количество строк: " << count << endl;
    return 0;
}
```

### Резюме урока

- `ofstream` используется для записи в файл, `ifstream` — для чтения, оба требуют подключения `<fstream>`.
- Проверка `.is_open()` важна для обработки ситуаций, когда файл не удалось открыть.
- Объекты потоков файлов следуют идиоме RAII — автоматически закрываются при выходе из области видимости, аналогично умным указателям.

---

## Урок 9.2. Исключения: try, catch, throw
**Время: 45 минут**

### Цель урока
Научиться обрабатывать ошибки времени выполнения с помощью механизма исключений C++.

### 1. Что такое исключение (повторение общей концепции)

Исключение — механизм обработки ошибочных ситуаций во время выполнения программы, позволяющий передать управление в специальный обработчик вместо немедленного аварийного завершения программы. Концепция аналогична исключениям в Python и JavaScript, но с некоторыми синтаксическими особенностями C++.

### 2. Генерация исключения: throw

```cpp
double divide(double a, double b) {
    if (b == 0) {
        throw runtime_error("Деление на ноль недопустимо");
    }
    return a / b;
}
```

`runtime_error` — один из стандартных классов исключений C++, определённых в `<stdexcept>`, принимающий текстовое сообщение об ошибке.

### 3. Обработка исключения: try/catch

```cpp
#include <stdexcept>
#include <iostream>
using namespace std;

int main() {
    try {
        double result = divide(10, 0);
        cout << result << endl;
    } catch (const runtime_error &e) {
        cout << "Произошла ошибка: " << e.what() << endl;
    }
    
    return 0;
}
```

Метод `.what()` возвращает текстовое сообщение, переданное при создании исключения через `throw`.

### 4. Стандартные классы исключений

Библиотека `<stdexcept>` предоставляет несколько встроенных классов исключений для типичных ситуаций:

| Класс исключения | Типичная ситуация |
|---|---|
| `runtime_error` | общая ошибка времени выполнения |
| `invalid_argument` | некорректный аргумент функции |
| `out_of_range` | выход за допустимый диапазон (например, `.at()` для vector, Урок 6.1) |
| `logic_error` | логическая ошибка в программе |

### 5. Обработка нескольких типов исключений

```cpp
try {
    // код, который может выбросить разные исключения
    vector<int> numbers = {1, 2, 3};
    cout << numbers.at(10) << endl;   // выбросит out_of_range
} catch (const out_of_range &e) {
    cout << "Индекс вне диапазона: " << e.what() << endl;
} catch (const exception &e) {          // "запасной" обработчик для остальных исключений
    cout << "Другая ошибка: " << e.what() << endl;
}
```

Порядок блоков `catch` важен: более специфичные исключения должны обрабатываться раньше более общих (например, `out_of_range` перед общим `exception`), так как многие встроенные исключения C++ наследуются от общего базового класса `std::exception`.

### 6. Блок finally в C++? — особенность языка

В отличие от Python и JavaScript, в C++ **нет** отдельного блока `finally`. Вместо этого для гарантированного выполнения кода очистки при любом исходе (включая исключение) в C++ обычно полагаются на уже знакомую идиому RAII (Урок 9.1) — ресурсы автоматически освобождаются деструкторами объектов при выходе из области видимости, даже если было выброшено исключение.

### 7. Практический пример: безопасное деление

```cpp
double safeDivide(double a, double b) {
    if (b == 0) {
        throw invalid_argument("Деление на ноль");
    }
    return a / b;
}

int main() {
    try {
        cout << safeDivide(10, 2) << endl;   // 5
        cout << safeDivide(10, 0) << endl;   // выбросит исключение
    } catch (const invalid_argument &e) {
        cout << "Ошибка: " << e.what() << endl;
    }
    return 0;
}
```

### Резюме урока

- `throw` генерирует исключение, `try/catch` перехватывает и обрабатывает его, аналогично механизму в других языках.
- Библиотека `<stdexcept>` предоставляет набор стандартных классов исключений для типичных ситуаций.
- В отличие от Python/JavaScript, в C++ нет блока `finally` — вместо него используется идиома RAII для гарантированного освобождения ресурсов.

---

## Урок 9.3. Стандартные классы исключений
**Время: 35 минут**

### Цель урока
Углубить понимание иерархии стандартных исключений C++ и научиться создавать собственные классы исключений.

### 1. Иерархия стандартных исключений

Все стандартные исключения C++ наследуются от базового класса `std::exception`, что позволяет перехватывать любое стандартное исключение единым обработчиком, если конкретный тип не важен:

```cpp
try {
    // любой код, потенциально выбрасывающий стандартное исключение
} catch (const exception &e) {
    cout << "Произошла ошибка: " << e.what() << endl;
}
```

### 2. Основные ветви иерархии (обзорно)

```
std::exception
├── std::logic_error       (ошибки, обнаружимые до выполнения — некорректная логика программы)
│    ├── std::invalid_argument
│    ├── std::out_of_range
│    └── std::length_error
└── std::runtime_error      (ошибки, возникающие только во время выполнения)
     ├── std::overflow_error
     └── std::range_error
```

### 3. Создание собственного класса исключения

Для более специфичных ситуаций в конкретном приложении полезно создавать собственные классы исключений, наследуя их от `std::exception` или одного из его подклассов:

```cpp
#include <exception>
#include <string>

class InsufficientFundsException : public exception {
private:
    string message;
    
public:
    InsufficientFundsException(string msg) : message(msg) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
};
```

Метод `what()` должен быть переопределён с точной сигнатурой `const char* what() const noexcept` — эти модификаторы (`const`, `noexcept`) гарантируют, что метод не изменяет состояние объекта исключения и сам не выбросит новое исключение при вызове.

### 4. Использование собственного класса исключения

```cpp
class BankAccount {
private:
    double balance;
    
public:
    BankAccount(double b) : balance(b) {}
    
    void withdraw(double amount) {
        if (amount > balance) {
            throw InsufficientFundsException("Недостаточно средств на счёте");
        }
        balance -= amount;
    }
};

int main() {
    BankAccount account(1000);
    
    try {
        account.withdraw(1500);
    } catch (const InsufficientFundsException &e) {
        cout << "Ошибка: " << e.what() << endl;
    }
    
    return 0;
}
```

### 5. Перехват исключения по значению vs по ссылке

Исключения рекомендуется перехватывать по константной ссылке (`const ТипИсключения &e`), а не по значению — это позволяет избежать ненужного копирования объекта исключения и корректно работает с полиморфизмом (например, позволяет обработчику для базового класса `exception` перехватывать и объекты дочерних классов исключений):

```cpp
catch (const exception &e) {   // рекомендуется
// catch (exception e) {         // менее эффективно, может "обрезать" информацию о дочернем типе
```

### 6. Повторный выброс исключения (re-throw)

Иногда обработчик исключения хочет выполнить некоторое действие (например, логирование), но затем передать исключение дальше по стеку вызовов — для этого используется `throw;` без аргументов внутри блока `catch`:

```cpp
try {
    // ... код ...
} catch (const exception &e) {
    cout << "Логирование ошибки: " << e.what() << endl;
    throw;   // повторно выбрасывает то же самое исключение дальше
}
```

### Резюме урока

- Все стандартные исключения C++ наследуются от `std::exception`, что позволяет обрабатывать их единым обработчиком при необходимости.
- Собственные классы исключений создаются наследованием от `std::exception` с переопределением метода `what()`.
- Исключения рекомендуется перехватывать по константной ссылке, чтобы избежать лишнего копирования и корректно работать с полиморфизмом исключений.

---

## Урок 9.4. Практика: программа с обработкой ошибок и файлами
**Время: 50 минут**

### Цель урока
Закрепить материал модуля, реализовав программу, объединяющую работу с файлами и обработку исключений.

### 1. Постановка задачи

Разработаем программу учёта расходов: пользователь вводит траты, программа сохраняет их в файл, с полной обработкой возможных ошибок (некорректный ввод, проблемы с файлом).

### 2. Класс Expense (расход)

```cpp
#include <iostream>
#include <fstream>
#include <vector>
#include <stdexcept>
using namespace std;

class Expense {
public:
    string category;
    double amount;
    
    Expense(string c, double a) : category(c), amount(a) {
        if (a < 0) {
            throw invalid_argument("Сумма расхода не может быть отрицательной");
        }
    }
};
```

### 3. Функция сохранения расходов в файл

```cpp
void saveExpenses(const vector<Expense> &expenses, const string &filename) {
    ofstream outFile(filename);
    
    if (!outFile.is_open()) {
        throw runtime_error("Не удалось открыть файл для записи: " + filename);
    }
    
    for (const auto &expense : expenses) {
        outFile << expense.category << "," << expense.amount << endl;
    }
    
    outFile.close();
}
```

### 4. Функция загрузки расходов из файла

```cpp
vector<Expense> loadExpenses(const string &filename) {
    vector<Expense> expenses;
    ifstream inFile(filename);
    
    if (!inFile.is_open()) {
        return expenses;   // файл ещё не существует - возвращаем пустой список, это не ошибка
    }
    
    string line;
    while (getline(inFile, line)) {
        size_t commaPos = line.find(',');
        if (commaPos != string::npos) {
            string category = line.substr(0, commaPos);
            double amount = stod(line.substr(commaPos + 1));   // stod - строка в double
            expenses.push_back(Expense(category, amount));
        }
    }
    
    return expenses;
}
```

### 5. Основная программа с полной обработкой ошибок

```cpp
int main() {
    string filename = "expenses.csv";
    vector<Expense> expenses = loadExpenses(filename);
    
    cout << "Загружено расходов: " << expenses.size() << endl;
    
    while (true) {
        string category;
        double amount;
        
        cout << "\nВведите категорию расхода (или 'выход' для завершения): ";
        cin >> category;
        
        if (category == "выход") {
            break;
        }
        
        cout << "Введите сумму: ";
        
        try {
            cin >> amount;
            if (cin.fail()) {
                throw invalid_argument("Некорректный ввод суммы");
            }
            
            expenses.push_back(Expense(category, amount));
            saveExpenses(expenses, filename);
            cout << "Расход добавлен и сохранён" << endl;
            
        } catch (const invalid_argument &e) {
            cout << "Ошибка ввода: " << e.what() << endl;
            cin.clear();
            cin.ignore(1000, '\n');
        } catch (const runtime_error &e) {
            cout << "Ошибка файла: " << e.what() << endl;
        }
    }
    
    double total = 0;
    for (const auto &expense : expenses) {
        total += expense.amount;
    }
    cout << "\nОбщая сумма расходов: " << total << endl;
    
    return 0;
}
```

### 6. Разбор обработки ошибок ввода

Проверка `cin.fail()` определяет, не завершился ли предыдущий `cin >> amount` неудачей (например, если пользователь ввёл текст вместо числа). `cin.clear()` сбрасывает флаг ошибки потока, а `cin.ignore(1000, '\n')` очищает оставшиеся некорректные символы из буфера ввода — без этих двух вызовов поток `cin` останется в «сломанном» состоянии и не сможет корректно принимать дальнейший ввод.

### Резюме урока

- Реальные программы на C++ часто комбинируют работу с файлами и обработку исключений для создания надёжных приложений.
- Собственный класс (`Expense`) может сам проверять корректность своих данных в конструкторе, выбрасывая исключение при некорректных значениях.
- Обработка ошибок ввода через `cin` требует дополнительных шагов (`cin.clear()`, `cin.ignore()`) для восстановления потока ввода в рабочее состояние после ошибки.
