# API (контракт для бекенду)

Що застосунок очікує від бекенду. DTO — `src/features/*/types.ts`, контракти — `src/features/*/*.api.types.ts`. Поки бекенду немає, їх реалізує тестовий сервер `src/mock-backend` з тими самими типами, правилами й кодами помилок — його можна читати як робочу специфікацію.

- Формат: JSON. Захищені запити — `Authorization: Bearer <token>` (🔒). Роль — у дужках.
- Помилки: `{ "error": { "code": "<ApiErrorCode>", "message": "…" } }`. Коди — `src/shared/lib/api-error.ts`:
  `unauthorized` (401), `forbidden` (403), `not_found` (404), `validation` (422), `invalid_credentials`, `email_taken`, `invalid_code`, `story_limit`, `ad_limit`, `faction_cooldown`, `fire_own_story`, `already_fired`, `cannot_change_own_role` (усі — 409/422 на розсуд бекенду, клієнт дивиться лише на `code`).

## Авторизація

| Метод | Шлях                | Тіло                            | Відповідь             |
| ----- | ------------------- | ------------------------------- | --------------------- |
| POST  | `/auth/login`       | `{ email, password }`           | `Session`             |
| POST  | `/auth/signup`      | `{ nickname, email, password }` | `202` — код надіслано |
| POST  | `/auth/verify`      | `{ email, code }`               | `Session`             |
| POST  | `/auth/resend-code` | `{ email }`                     | `204`                 |
| GET   | `/auth/me` 🔒       | —                               | `User`                |
| POST  | `/auth/logout` 🔒   | —                               | `204`                 |

```ts
User    { id; nickname; email; role: 'admin' | 'moderator' | 'user'; createdAt }
Session { token: string; user: User }
```

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
BookContent { bookId: string; paragraphs: string[] }          // текст, розібраний з EPUB/PDF на сервері
ShelfEntry  { book: CatalogBook; shelf: 'want' | 'reading' | 'read'; updatedAt: string }
```

Каталог і текст — лише опубліковані книги, доступні й гостям.

## Завантаження й модерація

| Метод | Шлях                               | Тіло / роль                                                     | Відповідь          |
| ----- | ---------------------------------- | --------------------------------------------------------------- | ------------------ |
| POST  | `/books/submissions` 🔒            | multipart: `title, author, description, language, file, cover?` | `202`              |
| GET   | `/moderation/:kind` 🔒             | moderator, admin · `kind`: `books` \| `stories`                 | `ModerationItem[]` |
| POST  | `/moderation/:kind/:id/approve` 🔒 | moderator, admin                                                | `204`              |
| POST  | `/moderation/:kind/:id/reject` 🔒  | moderator, admin                                                | `204`              |

```ts
ModerationItem { id; kind: 'book' | 'story'; title; author; submittedBy: string; submittedAt }
```

## Досвід, ранги, угруповання

| Метод | Шлях              | Тіло            | Відповідь        |
| ----- | ----------------- | --------------- | ---------------- |
| GET   | `/me/progress` 🔒 | —               | `Progress`       |
| POST  | `/me/ad-views` 🔒 | —               | `AdReward`       |
| GET   | `/factions`       | —               | `FactionStats[]` |
| PUT   | `/me/faction` 🔒  | `{ factionId }` | `Progress`       |

```ts
FactionId = 'loners' | 'bandits' | 'military' | 'duty' | 'freedom' | 'scientists' | 'mercenaries'
Progress { xp: number; factionId; factionChangedAt: string | null; storiesCount; firesReceived;
           nonStop: { streak: number; earned: number };
           today: { story: number; fires: number; ads: number; adXp: number } }
AdReward     { xp: number; progress: Progress }
FactionStats { id: FactionId; members: number }
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
Story { id; title; body; createdAt; status: 'pending' | 'published'; fires: number; firedByMe: boolean;
        author: { id; nickname; xp: number; factionId: FactionId; hasNonStop: boolean } }
```

Стрічка: опубліковані + власні на перевірці (модератор бачить усі). Історії `user` спершу йдуть на модерацію; moderator / admin — публікуються одразу.

## Адміністрування

| Метод | Шлях                  | Тіло       | Відповідь |
| ----- | --------------------- | ---------- | --------- |
| GET   | `/admin/users` 🔒     | admin      | `User[]`  |
| PATCH | `/admin/users/:id` 🔒 | `{ role }` | `User`    |

Власну роль змінити не можна → `cannot_change_own_role`.

## База даних (пропозиція)

Тестовий сервер тримає ті самі таблиці — `src/mock-backend/db.ts`.

```
users            id, email (unique), nickname, password_hash, role, created_at,
                 xp, faction_id, faction_changed_at, stories_count, fires_received,
                 non_stop_streak, non_stop_earned, last_story_day
user_daily       user_id → users, day, story, fires, ads, ad_xp          PK (user_id, day)
pending_signups  email (PK), nickname, password_hash, code_hash, expires_at
books            id, title, author, description, language, format, file_key, cover_key,
                 status (pending | published), submitted_by → users, submitted_at
user_books       user_id → users, book_id → books, shelf, updated_at   PK (user_id, book_id)
stories          id, author_id → users, title, body, status, created_at
story_fires      user_id → users, story_id → stories, created_at        PK (user_id, story_id)
```

- `readCount` = кількість `user_books` з `shelf = 'read'`; `Story.fires` = кількість `story_fires`.
- Рейтинг угруповань (тиждень) — сума XP учасників; кількість учасників — `count(users) group by faction_id`.
