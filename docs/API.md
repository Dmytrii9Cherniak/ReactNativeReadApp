# API (контракт для бекенду)

Що застосунок очікує від бекенду. DTO — `src/features/*/types.ts`, контракти — `src/features/*/*.api.types.ts`. Поки бекенду немає, їх реалізує тестовий сервер `src/mock-backend` з тими самими типами, правилами й кодами помилок — його можна читати як робочу специфікацію.

- Формат: JSON. Захищені запити — `Authorization: Bearer <token>` (🔒). Роль — у дужках.
- Помилки: `{ "error": { "code": "<ApiErrorCode>", "message": "…" } }`. Коди — `src/shared/lib/api-error.ts`:
  `unauthorized` (401), `forbidden` (403), `not_found` (404), `validation` (422), `invalid_credentials`, `email_taken`, `invalid_code`, `story_limit`, `ad_limit`, `faction_cooldown`, `fire_own_story`, `already_fired`, `cannot_modify_self`, `account_blocked`, `wrong_password` (усі — 409/422 на розсуд бекенду, клієнт дивиться лише на `code`).

## Авторизація й акаунт

| Метод  | Шлях                    | Тіло                               | Відповідь                     |
| ------ | ----------------------- | ---------------------------------- | ----------------------------- |
| POST   | `/auth/login`           | `{ email, password }`              | `Session`                     |
| POST   | `/auth/signup`          | `{ nickname, email, password }`    | `202` — код надіслано         |
| POST   | `/auth/verify`          | `{ email, code }`                  | `Session`                     |
| POST   | `/auth/resend-code`     | `{ email }`                        | `204`                         |
| POST   | `/auth/password/forgot` | `{ email }`                        | `202` — і для невідомої пошти |
| POST   | `/auth/password/reset`  | `{ email, code, password }`        | `Session`                     |
| GET    | `/auth/me` 🔒           | —                                  | `User`                        |
| POST   | `/auth/logout` 🔒       | —                                  | `204`                         |
| PATCH  | `/me` 🔒                | `{ nickname }`                     | `User`                        |
| PUT    | `/me/email` 🔒          | `{ email, password }`              | `User`                        |
| PUT    | `/me/password` 🔒       | `{ currentPassword, newPassword }` | `204`                         |
| DELETE | `/me` 🔒                | `{ password }`                     | `204`                         |

```ts
User    { id; nickname; email; role: 'admin' | 'user'; createdAt }
Session { token: string; user: User }
```

Невірний поточний пароль → `wrong_password`. Зміна пошти на бекенді — з кодом підтвердження на нову адресу. Видалення акаунта прибирає полиці, історії, вогники й сповіщення; опубліковані книги лишаються без завантажувача. Після зміни пароля бекенд відкликає інші сесії.

Реєстрація: пароль ≥ 8 символів, код — 6 цифр з листа; «Я не робот» — Cloudflare Turnstile (токен віджета — разом із `signup`). Нові користувачі — роль `user`, угруповання `loners`, 0 XP.

## Каталог і полиці

| Метод  | Шлях                            | Тіло        | Відповідь      |
| ------ | ------------------------------- | ----------- | -------------- |
| GET    | `/books?search=&limit=&offset=` | —           | `CatalogPage`  |
| GET    | `/books/:id`                    | —           | `CatalogBook`  |
| GET    | `/books/:id/content`            | —           | `BookContent`  |
| GET    | `/me/books` 🔒                  | —           | `ShelfEntry[]` |
| PUT    | `/me/books/:bookId` 🔒          | `{ shelf }` | `ShelfEntry`   |
| DELETE | `/me/books/:bookId` 🔒          | —           | `204`          |

```ts
CatalogBook { id; title; author; description; language: 'uk' | 'en'; format: 'epub' | 'pdf';
              coverUrl: string | null; readCount: number }   // readCount = кількість полиць «Прочитано»
CatalogPage { items: CatalogBook[]; total: number; nextOffset: number | null }
BookContent { bookId: string; paragraphs: string[];           // текст, розібраний з EPUB/PDF на сервері
              chapters: { title: string; paragraph: number }[] } // зміст: розділ і номер першого абзацу
ShelfEntry  { book: CatalogBook; shelf: 'want' | 'reading' | 'read'; updatedAt: string }
```

Каталог і текст — лише опубліковані книги, доступні й гостям.

## Завантаження книги

| Метод | Шлях                    | Тіло                                                            | Відповідь |
| ----- | ----------------------- | --------------------------------------------------------------- | --------- |
| POST  | `/books/submissions` 🔒 | multipart: `title, author, description, language, file, cover?` | `202`     |

| GET | `/me/submissions` 🔒 | — | `MySubmission[]` |

```ts
MySubmission { id; kind: 'book' | 'story'; title; status: 'pending' | 'published' | 'hidden' | 'rejected';
               rejectReason: string | null; submittedAt }
```

Книга отримує статус `pending` і з'являється в черзі адмінки; автор бачить стан у «Мої надсилання» й отримує сповіщення. Після завантаження бекенд фоновою задачею розбирає EPUB у `BookContent` (абзаци + зміст з заголовків). PDF — окремо (витяг тексту або рендер сторінок).

## Досвід, ранги, угруповання

| Метод | Шлях               | Тіло            | Відповідь         |
| ----- | ------------------ | --------------- | ----------------- |
| GET   | `/me/progress` 🔒  | —               | `Progress`        |
| POST  | `/me/ad-views` 🔒  | —               | `AdReward`        |
| GET   | `/factions`        | —               | `FactionStats[]`  |
| GET   | `/factions/rating` | —               | `FactionRating[]` |
| PUT   | `/me/faction` 🔒   | `{ factionId }` | `Progress`        |

```ts
FactionId = 'loners' | 'bandits' | 'military' | 'duty' | 'freedom' | 'scientists' | 'mercenaries'
Progress { xp: number; factionId; factionChangedAt: string | null; storiesCount; firesReceived;
           nonStop: { streak: number; earned: number };
           today: { story: number; fires: number; ads: number; adXp: number } }
AdReward     { xp: number; progress: Progress }
FactionStats { id: FactionId; members: number }
FactionRating { id: FactionId; weekXp: number }   // XP учасників за поточний тиждень (пн–нд), за спаданням
```

Правила (рахує лише сервер, ліміти скидаються щодоби):

| Дія               | XP   | Ліміт                                                                            |
| ----------------- | ---- | -------------------------------------------------------------------------------- |
| Історія           | +1   | 1 на день → інакше `story_limit`                                                 |
| Вогник (автору)   | +0.5 | 20 зарахованих на день; лише від акаунтів з ≥ 10 XP; не собі; один з акаунта     |
| Перегляд реклами  | +1…5 | 3 на день → інакше `ad_limit`; нараховувати після підтвердження рекламної мережі |
| Зміна угруповання | —    | раз на 30 днів → інакше `faction_cooldown`                                       |
| Бейдж «non stop»  | —    | 90 днів поспіль з історією → `earned + 1`, серія з нуля; пропуск — серія з нуля  |

Пороги рангів: 0, 10, 50, 150, 400, 900, 1 800, 3 500, 10 000 (Чорнобиль), 15 000 (Моноліт). Назви рангу клієнт бере сам з `xp` + `factionId`.

## Біля вогнища

| Метод | Шлях                    | Тіло              | Відповідь |
| ----- | ----------------------- | ----------------- | --------- |
| GET   | `/stories`              | —                 | `Story[]` |
| GET   | `/stories/:id`          | —                 | `Story`   |
| POST  | `/stories` 🔒           | `{ title, body }` | `Story`   |
| POST  | `/stories/:id/fires` 🔒 | —                 | `Story`   |

```ts
Story { id; title; body; createdAt; status: 'pending' | 'published' | 'hidden' | 'rejected'; fires: number; firedByMe: boolean;
        author: { id; nickname; xp: number; factionId: FactionId; hasNonStop: boolean } }
```

Стрічка: опубліковані + власні на перевірці й відхилені (адмін бачить усі). Історії `user` спершу перевіряє адмін; історії адміна публікуються одразу.

## Сповіщення

| Метод | Шлях                            | Відповідь                        |
| ----- | ------------------------------- | -------------------------------- |
| GET   | `/me/notifications` 🔒          | `AppNotification[]`              |
| POST  | `/me/notifications/read-all` 🔒 | `204`                            |
| GET   | `/me/events` 🔒 (SSE)           | подія `notifications` — «є нові» |

```ts
AppNotification { id; kind; params: { title?; text?; amount?; role? }; createdAt; read: boolean }
kind = 'book_approved' | 'book_rejected' | 'story_approved' | 'story_rejected'
     | 'xp_adjusted' | 'role_changed' | 'announcement'
```

Сервер надсилає лише вид і параметри — текст складає застосунок мовою користувача.

## Адмінка (роль admin)

Усі запити — 🔒 і лише `role = 'admin'` (інакше `forbidden`). Кожна дія пишеться в журнал (`audit_log`).

| Метод  | Шлях                                                            | Тіло                    | Відповідь                         |
| ------ | --------------------------------------------------------------- | ----------------------- | --------------------------------- |
| GET    | `/admin/stats`                                                  | —                       | `AdminStats`                      |
| GET    | `/admin/books?status=&search=`                                  | —                       | `AdminBook[]`                     |
| GET    | `/admin/books/:id`                                              | —                       | `AdminBookDetails`                |
| PATCH  | `/admin/books/:id`                                              | `BookPatch`             | `AdminBook`                       |
| POST   | `/admin/books/:id/approve`                                      | —                       | `AdminBook`                       |
| POST   | `/admin/books/:id/reject`                                       | `{ reason }`            | `AdminBook`                       |
| POST   | `/admin/books/:id/hide` · `/restore`                            | —                       | `AdminBook`                       |
| DELETE | `/admin/books/:id`                                              | —                       | `204`                             |
| GET    | `/admin/stories?status=&search=`                                | —                       | `AdminStory[]`                    |
| POST   | `/admin/stories/:id/approve` · `/reject` · `/hide` · `/restore` | `{ reason }` для reject | `AdminStory`                      |
| DELETE | `/admin/stories/:id`                                            | —                       | `204`                             |
| GET    | `/admin/users?filter=all\|admins\|blocked&search=`              | —                       | `AdminUser[]`                     |
| GET    | `/admin/users/:id`                                              | —                       | `AdminUser`                       |
| PATCH  | `/admin/users/:id`                                              | `{ role }`              | `AdminUser`                       |
| POST   | `/admin/users/:id/block` · `/unblock`                           | `{ reason }` для block  | `AdminUser`                       |
| POST   | `/admin/users/:id/xp`                                           | `{ amount, reason }`    | `AdminUser`                       |
| POST   | `/admin/broadcasts`                                             | `{ title, message }`    | `204`                             |
| GET    | `/admin/audit?group=books\|stories\|users\|broadcast`           | —                       | `AuditEntry[]`                    |
| GET    | `/admin/events` (SSE)                                           | —                       | подія `admin` — «черга змінилась» |

Типи — `src/features/admin/types.ts`. Правила:

- Стан книги й історії: `pending` → `published` (схвалено) / `rejected` (з причиною); опубліковане можна `hidden` ↔ `published`. Видалення — назавжди.
- Схвалення / відхилення / зміна ролі / зміна XP — сповіщення користувачу; оголошення — сповіщення всім незаблокованим.
- Себе змінити (роль, блокування, XP) не можна → `cannot_modify_self`.
- Заблокований не може увійти й робити запити → `account_blocked`; бекенд при блокуванні відкликає його сесії.
- XP не стає від'ємним: зняти можна не більше, ніж є.
- Власні історії адміна публікуються одразу.

**Живі оновлення.** Усі дії — звичайні REST-запити. Сервер лише повідомляє «щось змінилось» (SSE або WebSocket), а клієнт перечитує потрібний список. На старті цілком досить і опитування раз на 30 с.

## База даних (пропозиція)

Тестовий сервер тримає ті самі таблиці — `src/mock-backend/db.ts`.

```
users            id, email (unique), nickname, password_hash, role, created_at,
                 xp, faction_id, faction_changed_at, stories_count, fires_received,
                 non_stop_streak, non_stop_earned, last_story_day,
                 is_blocked, block_reason
user_daily       user_id → users, day, story, fires, ads, ad_xp          PK (user_id, day)
pending_signups  email (PK), nickname, password_hash, code_hash, expires_at
books            id, title, author, description, language, format, file_key, cover_key,
                 status (pending | published | hidden | rejected), reject_reason,
                 submitted_by → users, submitted_at
user_books       user_id → users, book_id → books, shelf, updated_at   PK (user_id, book_id)
stories          id, author_id → users, title, body, status, reject_reason, created_at
story_fires      user_id → users, story_id → stories, created_at        PK (user_id, story_id)
notifications    id, user_id → users, kind, params (jsonb), created_at, read_at
audit_log        id, admin_id → users, action, target, details, created_at
```

- `readCount` = кількість `user_books` з `shelf = 'read'`; `Story.fires` = кількість `story_fires`.
- Рейтинг угруповань (тиждень) — сума XP учасників; кількість учасників — `count(users) group by faction_id`.

## Лише на пристрої (бекенд не потрібен)

- **Завантажені книги** — текст зберігається локально (`download:<bookId>`), читається без мережі.
- **Закладки, статистика читання, досягнення, тема/поля/вирівнювання рідера** — локальні сховища (zustand persist). Пізніше можна синхронізувати: `GET/PUT /me/bookmarks`, `POST /me/reading-sessions`.
- **Поділитися** — системне меню / буфер обміну з посиланням `stalkerbooks://…`.
