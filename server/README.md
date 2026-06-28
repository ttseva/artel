# Artel Backend

Серверная часть платформы для локальных мастеров «Артель».

## Стек технологий
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (JSON Web Token)
- bcryptjs (хеширование паролей)

## Установка и запуск

1. Перейдите в папку сервера:
   ```bash
   cd server
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Создайте файл `.env` в корне папки `server` и добавьте:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/artel
   JWT_SECRET=your_secret_key
   ```

4. Запустите сервер:
   ```bash
   npm run dev
   ```

## Доступные скрипты
- `npm start` — запуск сервера (production)
- `npm run dev` — запуск с автоперезагрузкой (nodemon)
- `npm run seed` — заполнить БД тестовыми данными (пользователи, изделия, заказы, сообщения)
- `npm run fuzz` — запуск фаззинг-тестирования API

## Структура
- `/src/config` — настройки и подключение к БД
- `/src/controllers` — бизнес-логика
- `/src/middleware` — промежуточные обработчики (авторизация)
- `/src/models` — Mongoose-схемы (User, Product, Order, Message)
- `/src/routes` — маршрутизация API
