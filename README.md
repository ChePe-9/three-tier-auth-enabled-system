# Lab 1: Программный комплекс с трехуровневой архитектурой

## Описание проекта

Этот проект представляет собой программный комплекс, реализующий трехуровневую архитектуру (клиент-сервер-база данных). Он включает механизм авторизации пользователей, работу с базой данных PostgreSQL через ORM SQLAlchemy и взаимодействие через RESTful API.

## Функциональность

### Авторизация и регистрация пользователей:
- Пользователи могут регистрироваться через форму.
- Реализована безопасная авторизация с использованием JWT-токенов.

### Управление данными:
- CRUD-операции для категорий товаров.
- CRUD-операции для товаров, связанных с категориями.
- Создание заказов для авторизованных пользователей.
- Добавление товаров в заказы.

### Безопасность:
- Пароли хранятся в захешированном виде с использованием алгоритма `argon2`.
- Все запросы к защищенным маршрутам требуют JWT-токена.

### Интерфейс:
- Клиентская часть написана на HTML + JavaScript.
- Пользовательский интерфейс позволяет выполнять CRUD-операции через форму.

## Используемые технологии

### Backend
- **FastAPI**: Для создания серверной части и обработки HTTP-запросов.
- **SQLAlchemy**: ORM для работы с базой данных.
- **psycopg2**: Драйвер для подключения к PostgreSQL.
- **python-jose**: Для генерации и проверки JWT-токенов.
- **argon2-cffi**: Для безопасного хеширования паролей.

### Frontend
- **HTML**: Структура клиентской части.
- **JavaScript**: Логика взаимодействия с сервером через API.

### База данных
- **PostgreSQL**: Реляционная база данных для хранения данных пользователей, категорий, товаров, заказов и позиций заказа.

## Структура проекта

```plaintext
project/
│
├── app/ # Серверная часть
│   ├── main.py # Главный файл FastAPI
│   ├── models.py # Модели SQLAlchemy
│   ├── schemas.py # Pydantic модели для валидации данных
│   ├── crud.py # CRUD операции для работы с базой данных
│   └── database.py # Настройки подключения к базе данных
│
├── client/ # Клиентская часть
│   ├── index.html # Главная страница
│   └── script.js # JavaScript для взаимодействия с API
│
└── requirements.txt # Зависимости проекта
```
## Как запустить проект

1. **Установите зависимости**:
   ```bash
   pip install -r requirements.txt
   ```
2. **Создайте базу данных PostgreSQL:**:
   - Убедитесь, что PostgreSQL установлен.
   - Создайте новую базу данных и настройте строку подключения в .env:
   ```plaintext
   DATABASE_URL=postgresql://postgres:your_password@localhost/your_database_name?client_encoding=utf8
   ```
   ### SQL-запросы для создания базы данных ###
   Ниже представлены SQL-запросы для создания структуры базы данных проекта. База данных состоит из 5 таблиц: пользователи, категории товаров, товары, заказы и позиции заказа.
   
   2.1. **Таблица пользователей (users)**:
   ```sql
      -- Таблица пользователей
      CREATE TABLE users (
         id SERIAL PRIMARY KEY,
         username VARCHAR(50) UNIQUE NOT NULL,
         password_hash VARCHAR(255) NOT NULL
      );
   ```
   2.2. **Таблица категорий товаров (categories)**:
   ```sql
      -- Таблица категорий товаров
      CREATE TABLE categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL
      );
   ```
   2.3. **Таблица товаров (products)**:
   ```sql
      -- Таблица товаров
      CREATE TABLE products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE
      );
   ```
   2.4. **Таблица заказов (orders)**:
   ```sql
      -- Таблица заказов
      CREATE TABLE orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending'
      );
   ```
   2.5. **Таблица позиций заказа (order_items)**:
   ```sql
      -- Таблица позиций заказа
      CREATE TABLE order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          quantity INTEGER NOT NULL CHECK (quantity > 0)
      );
   ```
   2.6. **Таблица позиций заказа (order_items)**:
   ```sql
      -- Создание индексов для оптимизации запросов
      CREATE INDEX idx_user_username ON users(username);
      CREATE INDEX idx_product_category ON products(category_id);
      CREATE INDEX idx_order_user ON orders(user_id);
      CREATE INDEX idx_order_item_order ON order_items(order_id);
      CREATE INDEX idx_order_item_product ON order_items(product_id);
   ```
4. **Запустите сервер:**:
   ```bash
   uvicorn app.main:app --reload
   ```
5. **Откройте приложение в браузере**:
   ```plaintext
   http://127.0.0.1:8000/
   ```
## Особенности реализации

### Трехуровневая архитектура:
- **Клиентское приложение**: `index.html` + `script.js`.
- **Серверная часть**: FastAPI + SQLAlchemy.
- **База данных**: PostgreSQL.

### Безопасность:
- Хеширование паролей с помощью алгоритма `argon2` для защиты.
- Авторизация через JWT-токены для безопасного доступа к защищенным маршрутам.

### CRUD-операции:
- Проект работает с 5 таблицами:
  - **Пользователи (users)**: Хранит информацию о зарегистрированных пользователях.
  - **Категории (categories)**: Хранит категории товаров.
  - **Товары (products)**: Хранит товары, связанные с категориями.
  - **Заказы (orders)**: Хранит заказы, созданные пользователями.
  - **Позиции заказа (order_items)**: Хранит связи между заказами и товарами.

### Взаимодействие через API:
- Все данные обрабатываются через RESTful API.
- Клиентская часть использует JavaScript для отправки запросов.

## Пример использования

### Регистрация нового пользователя:
- Откройте форму регистрации и укажите имя пользователя и пароль.
- После успешной регистрации перейдите к форме авторизации.

### Авторизация:
- Введите имя пользователя и пароль для получения JWT-токена.
- При успешной авторизации откроется панель управления данными.

### CRUD-операции:
- Создание категорий, товаров, заказов и добавление товаров в заказы.
- Просмотр списка категорий, товаров, пользователей и заказов.

## Требования к системе

- **Python**: Версия 3.7 или выше.
- **PostgreSQL**: База данных должна быть доступна локально или удаленно.
- **Зависимости**: Установите все необходимые зависимости из файла `requirements.txt`.
## Зависимости
  ```plaintext
  fastapi==0.95.2
  uvicorn==0.23.2
  sqlalchemy==1.4.46
  psycopg2-binary==2.9.6
  argon2-cffi==21.3.0
  python-jose[cryptography]==3.3.0
  httpx==0.24.1
  ```
