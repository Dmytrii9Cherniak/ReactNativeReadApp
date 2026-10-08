# ReactNativeReadApp

Рідер книг для Android, iOS і Web (PDF, EPUB, TXT) з власним бекендом для акаунтів.

- **Застосунок** (корінь репозиторію): Expo / React Native. Бібліотека, рідер, статистика читання й ранги. Працює повністю офлайн: усі дані зберігаються на пристрої.
- **Сервер** (папка `server/`): Node.js + Express + PostgreSQL. Реєстрація, вхід, підтвердження пошти, скидання пароля, ролі.

> Поточний стан: вхід, реєстрація, підтвердження пошти й скидання пароля працюють у застосунку (вкладка «Профіль»). На сервері готові каталог книг, завантаження, модерація і полиці з прогресом — застосунок їх поки не використовує, перевірка через `server/api.http`. Без сервера застосунок працює в гостьовому режимі: бібліотека, читання й ранги — локальні.

---

## Зміст

1. [Технології](#технології)
2. [Що потрібно встановити](#що-потрібно-встановити)
3. [Перший запуск з нуля](#перший-запуск-з-нуля)
4. [Щоденний запуск](#щоденний-запуск)
5. [Різниця між `npm run dev` і `npx expo start`](#різниця-між-npm-run-dev-і-npx-expo-start)
6. [Порти](#порти)
7. [Змінні середовища](#змінні-середовища)
8. [База даних](#база-даних)
9. [API](#api)
10. [Команди](#команди)
11. [Структура проєкту](#структура-проєкту)
12. [Типові проблеми](#типові-проблеми)

---

## Технології

### Застосунок

| Що                  | Технологія                                                     |
| ------------------- | -------------------------------------------------------------- |
| Фреймворк           | Expo SDK 57, React Native 0.86, React 19                       |
| Мова                | TypeScript (strict)                                            |
| Навігація           | Expo Router (маршрути — файли в `src/app/`)                    |
| Стан                | zustand                                                        |
| Сховище на телефоні | JSON-файли через `expo-file-system`                            |
| Сховище у браузері  | IndexedDB (`idb-keyval`)                                       |
| PDF                 | `react-pdf` (лише web; на телефоні — після власної збірки EAS) |
| Великі списки / TXT | `@shopify/flash-list`                                          |
| Якість коду         | ESLint (`eslint-config-expo`) + Prettier                       |

### Сервер

| Що                   | Технологія                                                         |
| -------------------- | ------------------------------------------------------------------ |
| Середовище           | Node.js 22+                                                        |
| HTTP                 | Express 5                                                          |
| База                 | PostgreSQL 17 (у Docker)                                           |
| ORM і міграції       | Drizzle ORM + drizzle-kit                                          |
| Валідація            | zod                                                                |
| Паролі               | argon2id (`argon2`)                                                |
| Токени               | JWT HS256 (`jose`) + refresh-токени в базі                         |
| Пошта                | nodemailer; для розробки — Mailpit (перехоплює листи локально)     |
| Завантаження файлів  | multer (multipart/form-data) + перевірка сигнатур PDF / EPUB / TXT |
| Файлове сховище      | диск сервера (`server/storage/`), інтерфейс готовий до S3 / MinIO  |
| Безпека HTTP         | helmet, cors, express-rate-limit                                   |
| Запуск TS без збірки | tsx (з автоперезапуском при змінах)                                |

---

## Що потрібно встановити

| Програма                                                          | Навіщо                        | Перевірка                                          |
| ----------------------------------------------------------------- | ----------------------------- | -------------------------------------------------- |
| [Node.js 22+](https://nodejs.org) (з npm)                         | застосунок і сервер           | `node -v`                                          |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | PostgreSQL і Mailpit          | `docker -v`; Docker Desktop має бути **запущений** |
| [Git](https://git-scm.com)                                        | клонування                    | `git --version`                                    |
| [Expo Go](https://expo.dev/go) на телефоні                        | запуск застосунку на телефоні | версія з підтримкою SDK 57                         |

Телефон і комп'ютер мають бути в одній Wi-Fi мережі.

---

## Перший запуск з нуля

Команди для Windows PowerShell. На macOS / Linux замість `Copy-Item` — `cp`.

### 1. Клонувати й встановити залежності

```powershell
git clone <url-репозиторію> ReactNativeReadApp
cd ReactNativeReadApp

npm install              # залежності застосунку (+ копіює воркер pdf.js у public/)

cd server
npm install              # залежності сервера
```

### 2. Налаштувати сервер

Ви в папці `server/`:

```powershell
Copy-Item .env.example .env
npm run secret           # друкує випадковий рядок → вставити в .env як JWT_ACCESS_SECRET
npm run secret           # ще один, інший → CODE_HMAC_SECRET
```

Відкрийте `server/.env` і вставте обидва значення:

```dotenv
JWT_ACCESS_SECRET=<перший рядок>
CODE_HMAC_SECRET=<другий рядок>
```

Без них сервер не стартує: змінні перевіряються при запуску.

### 3. Підняти базу й створити таблиці

```powershell
npm run db:up            # PostgreSQL + Mailpit у Docker (перший раз — завантаження образів)
npm run db:migrate       # застосовує міграції з server/drizzle/ → створює таблиці
```

`db:migrate` нічого не виводить, якщо все добре. Перевірка — наступний крок.

### 4. Запустити все

```powershell
cd ..                    # назад у корінь
npm run dev
```

### 5. Перевірити

| Що                     | Де                                                                   | Очікується                                    |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| Сервер і база          | http://localhost:3000/health                                         | `{"status":"ok"}`                             |
| Пошта (Mailpit)        | http://localhost:8025                                                | вебінтерфейс зі списком листів                |
| Застосунок на телефоні | QR-код у терміналі → сканувати в Expo Go (Android) або камерою (iOS) | екран «Бібліотека»                            |
| Застосунок у браузері  | клавіша `w` у терміналі                                              | той самий застосунок на http://localhost:8081 |

---

## Щоденний запуск

Docker Desktop має бути запущений. Далі з кореня репозиторію:

```powershell
npm run dev
```

Зупинка — `Ctrl+C`. Контейнери Docker при цьому лишаються працювати (це нормально, вони майже не навантажують систему). Зупинити їх повністю: `npm run db:down` у `server/`. Дані бази при цьому **не** видаляються, бо зберігаються в Docker-volume `reader_pgdata`.

Після `git pull`, якщо змінилися залежності чи схема бази:

```powershell
npm install
cd server
npm install
npm run db:migrate
cd ..
```

---

## Різниця між `npm run dev` і `npx expo start`

|                                  | `npm run dev` (з кореня)                   | `npx expo start` (з кореня) |
| -------------------------------- | ------------------------------------------ | --------------------------- |
| PostgreSQL + Mailpit (Docker)    | ✅ запускає й чекає, поки база буде готова | ❌                          |
| API-сервер (порт 3000)           | ✅ у фоні, логи з префіксом `[api]`        | ❌                          |
| Expo (QR, клавіші `w`, `r`, `j`) | ✅                                         | ✅                          |
| Потрібен Docker Desktop          | так                                        | ні                          |
| `Ctrl+C` зупиняє                 | API і Expo                                 | Expo                        |

**Чи запускається база від `npx expo start`?** Ні. `npx expo start` запускає лише Metro (збирач застосунку) і сервер розробки Expo. Ні Docker, ні API він не чіпає.

**Чи можна працювати тільки з `npx expo start`?** Так. Бібліотека, читання, статистика й ранги працюють локально (гостьовий режим). Не працюватимуть лише вхід, реєстрація та інше, що звертається до сервера: форма покаже «Немає зв'язку з сервером».

**Як працює `npm run dev` (`scripts/dev.js`):**

1. `docker compose up -d --wait` у `server/` піднімає контейнери і чекає healthcheck PostgreSQL.
2. Запускає API так само, як `npm run dev` у `server/` (tsx watch), і виводить його логи з префіксом `[api]`.
3. Запускає Expo з прямим доступом до терміналу. Інакше Expo вимикає інтерактивний режим, і зникають QR-код і клавіші. Саме тому тут не використовується `concurrently`.

Сервер окремо (наприклад, щоб тестувати API без застосунку):

```powershell
cd server
npm run db:up
npm run dev              # те саме, що [api] у npm run dev з кореня
```

---

## Порти

| Порт | Що                                        | Звідки                      |
| ---- | ----------------------------------------- | --------------------------- |
| 8081 | Expo / Metro, web-версія застосунку       | `npx expo start`            |
| 3000 | API                                       | `server/.env` → `PORT`      |
| 5433 | PostgreSQL (у контейнері — 5432)          | `server/docker-compose.yml` |
| 1025 | Mailpit SMTP (сервер надсилає сюди листи) | `server/docker-compose.yml` |
| 8025 | Mailpit вебінтерфейс                      | `server/docker-compose.yml` |

PostgreSQL винесено на **5433**, бо 5432 на Windows часто зайнятий локально встановленим PostgreSQL.

---

## Змінні середовища

### Застосунок: `.env` у корені (необов'язковий)

| Змінна                | За замовчуванням                | Що це                                          |
| --------------------- | ------------------------------- | ---------------------------------------------- |
| `EXPO_PUBLIC_APP_ENV` | `development`                   | Середовище; показується в «Налаштуваннях»      |
| `EXPO_PUBLIC_API_URL` | IP комп'ютера з Metro + `:3000` | Адреса API, якщо сервер не на цьому комп'ютері |

У застосунок потрапляють лише змінні з префіксом `EXPO_PUBLIC_`, і вони **видимі всім** у зібраному застосунку. Секрети сюди не класти.

### Сервер: `server/.env` (обов'язковий, шаблон — `server/.env.example`)

| Змінна                   | Обов'язкова | За замовчуванням                   | Що це                                                                              |
| ------------------------ | ----------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| `PORT`                   | ні          | `3000`                             | Порт API                                                                           |
| `DATABASE_URL`           | **так**     | —                                  | `postgres://reader:reader@localhost:5433/reader` для Docker з `docker-compose.yml` |
| `CORS_ORIGINS`           | ні          | `http://localhost:8081`            | Дозволені origins web-версії, через кому                                           |
| `JWT_ACCESS_SECRET`      | **так**     | —                                  | Підпис access-токенів, ≥ 32 символи (`npm run secret`)                             |
| `CODE_HMAC_SECRET`       | **так**     | —                                  | Ключ для хешування кодів з листів, ≥ 32 символи (`npm run secret`)                 |
| `SMTP_HOST`              | ні          | `localhost`                        | SMTP-сервер (Mailpit)                                                              |
| `SMTP_PORT`              | ні          | `1025`                             | Порт SMTP; `465` → TLS                                                             |
| `SMTP_USER`, `SMTP_PASS` | ні          | —                                  | Для справжнього SMTP-провайдера                                                    |
| `MAIL_FROM`              | ні          | `ReadApp <no-reply@readapp.local>` | Відправник листів                                                                  |
| `STORAGE_DIR`            | ні          | `storage`                          | Папка для файлів книг (відносно `server/`), у git не потрапляє                     |
| `MAX_BOOK_SIZE_MB`       | ні          | `50`                               | Максимальний розмір одного файлу книги                                             |

`server/.env` у git **не** потрапляє (`server/.gitignore`). Секрети для кожного середовища свої.

---

## База даних

PostgreSQL 17 у Docker. Користувач, пароль і база — `reader` / `reader` / `reader` (лише для локальної розробки).

Схема описана в коді: `server/src/db/schema.ts`. Міграції (SQL) лежать у `server/drizzle/` і комітяться в git.

### Таблиці

**`users`**: акаунти.

| Колонка                | Тип               | Примітка                                        |
| ---------------------- | ----------------- | ----------------------------------------------- |
| `id`                   | uuid              | PK                                              |
| `email`                | text, unique      | завжди в нижньому регістрі                      |
| `name`                 | text              |                                                 |
| `password_hash`        | text              | argon2id                                        |
| `email_verified_at`    | timestamptz, null | `null` — пошта не підтверджена, вхід заборонено |
| `is_admin`             | boolean           | керує правами інших                             |
| `can_moderate_books`   | boolean           | модерація книг                                  |
| `can_moderate_stories` | boolean           | модерація історій                               |
| `created_at`           | timestamptz       |                                                 |

**`refresh_tokens`**: сесії.

| Колонка      | Тип               | Примітка                                      |
| ------------ | ----------------- | --------------------------------------------- |
| `id`         | uuid              | PK                                            |
| `user_id`    | uuid → `users.id` | видалення користувача видаляє сесії           |
| `token_hash` | text, unique      | SHA-256 токена; сам токен не зберігається     |
| `expires_at` | timestamptz       | 30 днів                                       |
| `revoked_at` | timestamptz, null | вихід або токен уже використано при оновленні |
| `created_at` | timestamptz       |                                               |

**`email_codes`**: 6-значні коди з листів.

| Колонка       | Тип                                    | Примітка                                   |
| ------------- | -------------------------------------- | ------------------------------------------ |
| `id`          | uuid                                   | PK                                         |
| `user_id`     | uuid → `users.id`                      |                                            |
| `purpose`     | enum `verify_email` / `reset_password` |                                            |
| `code_hash`   | text                                   | HMAC-SHA256 коду; сам код не зберігається  |
| `attempts`    | integer                                | невдалі спроби; після 5 код не приймається |
| `expires_at`  | timestamptz                            | 15 хвилин                                  |
| `consumed_at` | timestamptz, null                      | використаний або замінений новим           |
| `created_at`  | timestamptz                            |                                            |

**`books`**: книги — і приватні, і в каталозі.

| Колонка                      | Тип                                                   | Примітка                                    |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `id`                         | uuid                                                  | PK                                          |
| `title`                      | text                                                  |                                             |
| `author`, `description`      | text, null                                            |                                             |
| `format`                     | enum `pdf` / `epub` / `txt`                           |                                             |
| `file_key`                   | text, unique                                          | ключ файлу у сховищі: `books/<id>.<format>` |
| `file_size`                  | integer                                               | байти                                       |
| `status`                     | enum `private` / `pending` / `published` / `rejected` | див. «Життєвий цикл книги»                  |
| `uploaded_by`                | uuid → `users.id`, null                               | хто завантажив; видалення акаунта → `null`  |
| `reviewed_by`, `reviewed_at` | uuid → `users.id` / timestamptz, null                 | хто й коли розглянув на модерації           |
| `rejection_reason`           | text, null                                            | причина відхилення (бачить власник)         |
| `created_at`, `updated_at`   | timestamptz                                           |                                             |

**`user_books`**: бібліотека користувача — зв'язок «багато до багатьох» між `users` і `books`.

| Колонка                  | Тип                                   | Примітка                                                                       |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------------------------ |
| `user_id` + `book_id`    | uuid → `users.id` / `books.id`        | разом — PK: одна книга в одного користувача один раз                           |
| `shelf`                  | enum `watchlist` / `reading` / `read` | полиця                                                                         |
| `location`               | jsonb, null                           | позиція читання в форматі застосунку: `{ type: 'page' \| 'cfi' \| 'line', … }` |
| `fraction`               | real                                  | прочитана частка 0..1                                                          |
| `furthest_pages`         | real, null                            | найдальша позиція в умовних сторінках; лише зростає                            |
| `added_at`, `updated_at` | timestamptz                           |                                                                                |

### Зв'язки

```
users ──1:N── refresh_tokens   сесії на різних пристроях
users ──1:N── email_codes      коди з листів
users ──1:N── books            uploaded_by: хто завантажив
users ──N:M── books            через user_books: полиці й прогрес у кожного свої
```

Видалення користувача видаляє його сесії, коди і записи `user_books`; опубліковані ним книги лишаються в каталозі. Видалення книги прибирає її з усіх полиць і видаляє файл.

### Життєвий цикл книги

```
private ──подати──▶ pending ──схвалити──▶ published
                       └──відхилити──▶ rejected ──подати знову──▶ pending
```

- Завантажена книга завжди спершу **приватна** і одразу лежить на полиці власника.
- У каталог (і гостям) потрапляє лише після схвалення модератором.
- Відхилена не видаляється: власник бачить причину і може подати знову.

### Робота зі схемою

```powershell
cd server
# 1. змінити src/db/schema.ts
npm run db:generate      # створює нову міграцію в drizzle/
npm run db:migrate       # застосовує її до бази
npm run db:studio        # переглянути дані в браузері (Drizzle Studio)
```

Повністю очистити базу (видаляє **всі** дані):

```powershell
docker compose down -v   # -v видаляє volume з даними
Remove-Item -Recurse -Force storage   # файли книг (macOS / Linux: rm -rf storage)
npm run db:up
npm run db:migrate
```

---

## API

Базова адреса: `http://localhost:3000`. Тіло запитів і відповідей — JSON.

Для ручної перевірки є `server/api.http` з готовими запитами. У WebStorm запит запускається кнопкою ▶, а токени з відповідей підставляються в наступні запити автоматично. Листи з кодами дивіться в Mailpit: http://localhost:8025.

### Ендпоінти

| Метод  | Шлях                            | Авторизація                     | Тіло                                                   | Успіх                                           |
| ------ | ------------------------------- | ------------------------------- | ------------------------------------------------------ | ----------------------------------------------- |
| GET    | `/health`                       | —                               | —                                                      | `200 {"status":"ok"}`                           |
| POST   | `/auth/register`                | —                               | `{ name, email, password, acceptTerms: true }`         | `204`, код на пошту                             |
| POST   | `/auth/verify-email`            | —                               | `{ email, code }`                                      | `200` сесія                                     |
| POST   | `/auth/resend-verification`     | —                               | `{ email }`                                            | `204`                                           |
| POST   | `/auth/login`                   | —                               | `{ email, password }`                                  | `200` сесія                                     |
| POST   | `/auth/refresh`                 | —                               | `{ refreshToken }`                                     | `200` нова сесія                                |
| POST   | `/auth/logout`                  | —                               | `{ refreshToken }`                                     | `204`                                           |
| POST   | `/auth/forgot-password`         | —                               | `{ email }`                                            | `204`, код на пошту                             |
| POST   | `/auth/reset-password`          | —                               | `{ email, code, password }`                            | `200` сесія                                     |
| GET    | `/me`                           | `Bearer`                        | —                                                      | `200` користувач                                |
| GET    | `/admin/users`                  | `Bearer` + `isAdmin`            | —                                                      | `200` список користувачів                       |
| PATCH  | `/admin/users/:id/permissions`  | `Bearer` + `isAdmin`            | `{ isAdmin?, canModerateBooks?, canModerateStories? }` | `200` користувач                                |
| GET    | `/books`                        | —                               | query: `search?`, `limit?` (1–50, 20), `offset?`       | `200 { items, nextOffset }` — лише опубліковані |
| POST   | `/books`                        | `Bearer`                        | multipart: `file`, `title`, `author?`, `description?`  | `201` книга (`private`)                         |
| GET    | `/books/uploads`                | `Bearer`                        | —                                                      | `200` мої завантаження, усі статуси             |
| GET    | `/books/:id`                    | необов'язково                   | —                                                      | `200` книга (якщо є доступ)                     |
| GET    | `/books/:id/file`               | необов'язково                   | —                                                      | `200` файл (якщо є доступ)                      |
| POST   | `/books/:id/submit`             | `Bearer`, власник               | —                                                      | `200` книга (`pending`)                         |
| DELETE | `/books/:id`                    | `Bearer`, власник або модератор | —                                                      | `204`                                           |
| GET    | `/moderation/books`             | `Bearer` + `canModerateBooks`   | —                                                      | `200` черга (`pending`)                         |
| POST   | `/moderation/books/:id/approve` | `Bearer` + `canModerateBooks`   | —                                                      | `200` книга (`published`)                       |
| POST   | `/moderation/books/:id/reject`  | `Bearer` + `canModerateBooks`   | `{ reason }`                                           | `200` книга (`rejected`)                        |
| GET    | `/me/books`                     | `Bearer`                        | —                                                      | `200` мої книги з полицями й прогресом          |
| PUT    | `/me/books/:bookId`             | `Bearer`                        | `{ shelf }`                                            | `204` додати / перекласти                       |
| PUT    | `/me/books/:bookId/progress`    | `Bearer`                        | `{ location, fraction, furthestPages? }`               | `204`                                           |
| DELETE | `/me/books/:bookId`             | `Bearer`                        | —                                                      | `204` прибрати з бібліотеки                     |

**Сесія** (відповідь входу, підтвердження, оновлення, скидання пароля):

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "q3Xb...",
  "user": {
    "id": "6f1c...",
    "email": "user@example.com",
    "name": "Діма",
    "isAdmin": false,
    "canModerateBooks": false,
    "canModerateStories": false
  }
}
```

- `accessToken` живе 15 хвилин і передається в заголовку `Authorization: Bearer <accessToken>`.
- `refreshToken` живе 30 днів і **одноразовий**: `/auth/refresh` відкликає його і видає нову пару. Якщо повторно надіслати вже використаний refresh-токен, сервер вважає, що його вкрали, і завершує **всі** сесії користувача. Тому клієнт має робити лише один refresh одночасно.

**Книга** у відповідях:

```json
{
  "id": "27f7...",
  "title": "Пікнік на узбіччі",
  "author": "Стругацькі",
  "description": null,
  "format": "pdf",
  "fileSize": 1048576,
  "status": "published",
  "rejectionReason": null,
  "uploader": { "id": "6f1c...", "name": "Діма" },
  "readCount": 3,
  "createdAt": "2026-10-08T17:00:00.000Z"
}
```

`readCount` — скільки користувачів поклали книгу на полицю `read`. Рахується з `user_books`, окремо не зберігається.

### Доступ до книг

| Статус                | Гість  | Будь-хто увійшовший | Власник                                   | Модератор книг                      | Адмін           |
| --------------------- | ------ | ------------------- | ----------------------------------------- | ----------------------------------- | --------------- |
| `published`           | бачить | бачить              | бачить, видаляє                           | бачить, видаляє                     | бачить, видаляє |
| `pending`, `rejected` | —      | —                   | бачить, видаляє, подає знову (`rejected`) | бачить, схвалює / відхиляє, видаляє | як модератор    |
| `private`             | —      | —                   | бачить, видаляє, подає                    | —                                   | —               |

- Приватну книгу не бачить ніхто, крім власника, навіть адмін: це особистий файл.
- Немає доступу → `404 book_not_found`, а не `403`: так не видно навіть факт існування чужої книги.
- Правила — в одному місці: `server/src/modules/books/book-access.ts`.

### Завантаження файлу

- `multipart/form-data`, файл у полі `file`, до `MAX_BOOK_SIZE_MB` (50 МБ).
- Формат визначається за розширенням і **перевіряється за вмістом**:
  - PDF починається з `%PDF-`;
  - EPUB — ZIP з `mimetype` = `application/epub+zip` на початку (вимога специфікації EPUB);
  - TXT не містить нульових байтів.
- Ліміт: 30 завантажень на годину з однієї IP.

### Правила валідації

| Поле          | Правило                                                   |
| ------------- | --------------------------------------------------------- |
| `email`       | коректна адреса; пробіли обрізаються, регістр не важливий |
| `password`    | 8–128 символів                                            |
| `name`        | 1–50 символів                                             |
| `code`        | рівно 6 цифр                                              |
| `acceptTerms` | має бути `true`                                           |

### Сценарії

**Реєстрація:**

1. `POST /auth/register` → `204`, на пошту приходить код.
2. `POST /auth/verify-email` з кодом → сесія (користувач одразу увійшов).

Повторна реєстрація на ще не підтверджену пошту оновлює ім'я й пароль і надсилає новий код. На підтверджену пошту → `409 email_taken`.

**Вхід:** `POST /auth/login` → сесія. Якщо пошта не підтверджена → `403 email_not_verified`, і на пошту автоматично йде новий код (далі `verify-email`).

**Скидання пароля:**

1. `POST /auth/forgot-password` → `204` завжди, навіть якщо такої пошти немає (щоб не можна було перевіряти чужі адреси).
2. `POST /auth/reset-password` з кодом і новим паролем → сесія. Усі інші сесії користувача завершуються.

### Обмеження

- Новий код на ту саму дію — не частіше разу на хвилину. Частіші запити тихо ігноруються, попередній код лишається дійсним.
- Код діє 15 хвилин, максимум 5 невдалих спроб. Новий код скасовує попередній.
- `register`, `verify-email`, `resend-verification`, `login`, `forgot-password`, `reset-password`: до 30 запитів за 15 хвилин з однієї IP, далі `429`.

### Помилки

Формат завжди однаковий:

```json
{ "error": { "code": "invalid_credentials", "message": "Невірна пошта або пароль" } }
```

| HTTP | `code`                | Коли                                                                 |
| ---- | --------------------- | -------------------------------------------------------------------- |
| 400  | `validation_error`    | тіло не пройшло валідацію; додатково є `issues: [{ path, message }]` |
| 400  | `invalid_json`        | тіло — не JSON                                                       |
| 400  | `invalid_code`        | код невірний, прострочений або вичерпано спроби                      |
| 401  | `unauthorized`        | немає заголовка `Authorization`                                      |
| 401  | `invalid_token`       | access-токен недійсний або прострочений → зробити refresh            |
| 401  | `invalid_session`     | refresh-токен недійсний → увійти знову                               |
| 401  | `invalid_credentials` | невірна пошта або пароль                                             |
| 403  | `email_not_verified`  | пошту не підтверджено, новий код надіслано                           |
| 403  | `forbidden`           | немає потрібного права (`requirePermission`)                         |
| 400  | `cannot_demote_self`  | адмін намагається зняти `isAdmin` із себе                            |
| 404  | `not_found`           | немає такого маршруту                                                |
| 404  | `user_not_found`      | немає користувача з таким id                                         |
| 400  | `file_required`       | у запиті немає файлу (поле `file`)                                   |
| 400  | `unsupported_format`  | не PDF / EPUB / TXT                                                  |
| 400  | `invalid_file`        | вміст файлу не відповідає формату                                    |
| 400  | `invalid_upload`      | некоректний multipart (кілька файлів, інше поле)                     |
| 404  | `book_not_found`      | книги немає або немає доступу до неї                                 |
| 404  | `not_pending`         | книги немає в черзі модерації (вже розглянута)                       |
| 409  | `invalid_status`      | подати можна лише власну `private` / `rejected` книгу                |
| 413  | `file_too_large`      | файл більший за `MAX_BOOK_SIZE_MB`                                   |
| 409  | `email_taken`         | пошта вже зареєстрована й підтверджена                               |
| 429  | `too_many_requests`   | перевищено ліміт запитів                                             |
| 500  | `internal_error`      | помилка сервера (деталі — у логах `[api]`)                           |

### Гарди

**Сервер** — справжній захист:

- `requireAuth`: є дійсний `Bearer`-токен, інакше `401`. Користувач читається з бази на кожен запит, тож зміна прав діє одразу.
- `requirePermission('isAdmin' | 'canModerateBooks' | 'canModerateStories')`: ставиться після `requireAuth`, інакше `403`. Адмін має всі права.

```ts
router.use(requireAuth, requirePermission('canModerateBooks'));
```

**Застосунок** — зручність, не захист:

| Що       | Де                                        | Як працює                                                                                    |
| -------- | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| UI       | `<AuthGate permission?>`, `<GuestOnly>`   | показує вміст лише залогіненим / з правом / гостям (аналог `*ngIf`)                          |
| Маршрути | `Stack.Protected` у `src/app/_layout.tsx` | екрани входу доступні лише гостям; після входу закриваються самі                             |
| Запити   | `withAuth((token) => requestJson(...))`   | без сесії запит не відправляється; прострочений access-токен оновлюється, запит повторюється |

```tsx
<AuthGate permission="isAdmin" fallback={<Text>Лише для адмінів</Text>}>
  <AdminPanel />
</AuthGate>
```

**Адреса API в застосунку** задається автоматично: у розробці — IP комп'ютера, на якому працює Metro (`Constants.expoConfig.hostUri`), і порт 3000. Інший сервер — `EXPO_PUBLIC_API_URL` у `.env` у корені.

### Приклад: curl

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## Команди

### Корінь (застосунок)

| Команда                        | Що робить                                                                  |
| ------------------------------ | -------------------------------------------------------------------------- |
| `npm run dev`                  | Docker + API + Expo однією командою                                        |
| `npx expo start` / `npm start` | лише Expo                                                                  |
| `npm run web`                  | Expo одразу з відкриттям у браузері                                        |
| `npm run check`                | typecheck + ESLint + Prettier, **перед кожним комітом**                    |
| `npm run typecheck`            | лише TypeScript                                                            |
| `npm run lint` / `lint:fix`    | ESLint / з автовиправленням                                                |
| `npm run format`               | відформатувати все Prettier                                                |
| `npm run doctor`               | перевірка конфігурації Expo (`expo-doctor`)                                |
| `npx expo install <пакет>`     | **єдиний** спосіб додавати пакети в застосунок: підбирає версію під SDK 57 |

### `server/`

| Команда                              | Що робить                                      |
| ------------------------------------ | ---------------------------------------------- |
| `npm run dev`                        | API з автоперезапуском при змінах              |
| `npm run build` / `npm start`        | збірка в `dist/` / запуск зібраного (продакшн) |
| `npm run check`                      | typecheck + Prettier                           |
| `npm run db:up` / `db:down`          | запустити / зупинити PostgreSQL і Mailpit      |
| `npm run db:generate`                | створити міграцію зі змін у `schema.ts`        |
| `npm run db:migrate`                 | застосувати міграції                           |
| `npm run db:studio`                  | переглядач бази в браузері                     |
| `npm run secret`                     | згенерувати секрет для `.env`                  |
| `npm run make-admin -- you@mail.com` | зробити користувача адміном (перший адмін)     |

---

## Структура проєкту

```
ReactNativeReadApp/
├── src/                       застосунок (деталі й правила — ARCHITECTURE.md)
│   ├── app/                   маршрути Expo Router (тонкі обгортки над екранами)
│   ├── features/              library, reader, stats, settings — самодостатні модулі
│   ├── shared/                UI-компоненти, тема, утиліти (не знають про фічі)
│   └── config/env.ts          змінні середовища застосунку
├── scripts/
│   ├── dev.js                 npm run dev: Docker + API + Expo
│   └── copy-pdf-worker.js     postinstall: воркер pdf.js → public/
├── server/                    бекенд (окремий Node-проєкт, свій package.json)
│   ├── src/
│   │   ├── config/env.ts      змінні середовища (перевіряються zod при старті)
│   │   ├── db/                клієнт і схема бази (Drizzle)
│   │   ├── modules/
│   │   │   ├── auth/          реєстрація, вхід, сесії, коди з листів
│   │   │   ├── users/         /me, репозиторій користувачів
│   │   │   ├── books/         каталог, завантаження, файли, правила доступу (book-access.ts)
│   │   │   ├── moderation/    черга модерації, схвалення / відхилення
│   │   │   ├── shelves/       /me/books: полиці й прогрес
│   │   │   ├── admin/         користувачі й права
│   │   │   └── health/        /health
│   │   ├── shared/            помилки й ліміти HTTP, пошта, файлове сховище, формат позиції читання
│   │   ├── app.ts             збірка Express-застосунку
│   │   └── index.ts           запуск сервера
│   ├── drizzle/               SQL-міграції (генеруються, комітяться)
│   ├── docker-compose.yml     PostgreSQL + Mailpit
│   ├── api.http               готові запити для ручної перевірки
│   ├── fixtures/              тестовий файл для api.http
│   ├── storage/               файли книг (STORAGE_DIR; у git не потрапляє)
│   └── .env.example           шаблон змінних середовища
├── ARCHITECTURE.md            архітектура й правила коду застосунку
├── app.json                   конфігурація Expo
└── eas.json                   профілі збірки EAS (APK)
```

---

## Типові проблеми

| Симптом                                                               | Причина                                                       | Що зробити                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `npm run dev`: «Не вдалося запустити базу»                            | Docker Desktop не запущений                                   | запустити Docker Desktop, повторити                                                                         |
| `/health` → `500`, у логах `28P01` / `password authentication failed` | API підключився не до Docker-бази, а до локального PostgreSQL | перевірити, що в `server/.env` порт **5433**; `npm run db:down`, `npm run db:up`                            |
| Сервер падає при старті з помилкою zod про `JWT_ACCESS_SECRET`        | немає секретів у `server/.env`                                | крок 2 [першого запуску](#2-налаштувати-сервер)                                                             |
| `relation "users" does not exist`                                     | таблиці не створені                                           | `npm run db:migrate` у `server/`                                                                            |
| Порт 3000 / 8081 зайнятий                                             | залишився процес з минулого запуску                           | закрити старий термінал або змінити `PORT` у `server/.env`                                                  |
| Expo Go не відкриває застосунок                                       | телефон і комп'ютер у різних мережах / VPN                    | одна Wi-Fi мережа, вимкнути VPN; або `npx expo start --tunnel`                                              |
| Вхід на телефоні: «Немає зв'язку з сервером», а в браузері працює     | Windows Firewall блокує вхідні на порт 3000                   | дозволити Node.js у приватних мережах (Windows питає при першому запуску) або додати правило для порту 3000 |
| Після змін застосунок працює «по-старому»                             | кеш Metro                                                     | `npx expo start -c` і повністю перезапустити Expo Go                                                        |
| `tsc`: `'/profile' is not assignable…`                                | типи маршрутів ще не згенеровані                              | один раз запустити `npx expo start` — типи перегенеруються                                                  |
| PDF на телефоні показує заглушку                                      | Expo Go не має нативного рендера PDF                          | очікувано; PDF на телефоні з'явиться з власною збіркою (EAS)                                                |
