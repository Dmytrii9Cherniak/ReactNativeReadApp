# Архітектура

```
src/
  app/                       Роути Expo Router. Тонкі обгортки: беруть параметри й рендерять екран фічі.
    _layout.tsx              Stack, шрифти, заставка, відновлення сесії, закриті маршрути (Stack.Protected)
    (main)/_layout.tsx       Головна навігація (Drawer): телефон — виїзне меню + свайп, планшет — бокова панель
  features/<name>/           Фіча = самодостатній модуль (аналог Angular module)
    index.ts                 Публічний API. Ззовні імпортуємо ТІЛЬКИ звідси
    <name>-screen.tsx        Екран фічі
    <name>.api.types.ts      Контракт даних = майбутні ендпоінти бекенду
    <name>.api.ts            Яка реалізація діє зараз (тестовий сервер → HTTP без змін в екранах)
    <name>.store.ts          Стан (zustand)
    components/ hooks/ lib/  UI, хуки, чисті функції фічі
    types.ts                 DTO — так дані повертає бекенд
  mock-backend/              Тестовий сервер у пам'яті (до появи бекенду) — див. нижче
  shared/                    Не знає про фічі
    ui/                      Text, Button, TextField, Checkbox, Chip, Card, Screen, UnderlineTabs, Icon…
    theme/                   tokens.ts — палітри «Зона» і «Вогнище», відступи, радіуси, типографіка
    i18n/                    Тексти UA (за замовчуванням) / EN, useT(), errorText(), formatRelativeTime()
    hooks/                   useLayout, useAsync, useSubmit, useDebouncedCallback
    lib/                     dialogs (notify / confirm), kv-storage, persist, api-error (коди помилок), api-session (токен)
    constants/               брейкпоінти й розміри
  config/env.ts              Змінні середовища, `isDemo`
```

## Фічі

| Фіча          | Що робить                                                                    |
| ------------- | ---------------------------------------------------------------------------- |
| `auth`        | Вхід, реєстрація з кодом, ролі й дозволи (`can`, `useCan`), сесія            |
| `catalog`     | Бібліотека з пошуком, обкладинки, сітка, текст книги                         |
| `book`        | Сторінка книги                                                               |
| `shelves`     | Полиці: Хочу прочитати / Читаю / Прочитано, «Мої книги»                      |
| `reader`      | Читання з каталогу, панель «Aa», збережена позиція                           |
| `settings`    | Яскравість, розмір і шрифт тексту книг, мова, підтримка                      |
| `progression` | Досвід, 10 рангів, 7 угруповань, бейдж «non stop», профіль, вибір угруповань |
| `campfire`    | «Біля вогнища»: стрічка, історія, нова історія, вогники                      |
| `upload`      | Надсилання книги на перевірку                                                |
| `moderation`  | Черга перевірки книг та історій                                              |
| `admin`       | Користувачі й ролі                                                           |
| `about`       | Про застосунок, Умови використання                                           |
| `navigation`  | Меню (вміст Drawer): користувач, пункти за роллю, вихід                      |

Залежності між фічами (лише через `index.ts`, без циклів):
`book → catalog, shelves, reader, auth` · `shelves → catalog` · `reader → catalog, settings` ·
`campfire → progression, settings, auth` · `progression → auth` · `settings → progression, auth` ·
`navigation → auth, progression` · `admin → auth` · `upload → catalog`.

## Ролі й доступи

| Дозвіл (`Permission`)                                                  | Гість | user | moderator | admin |
| ---------------------------------------------------------------------- | :---: | :--: | :-------: | :---: |
| Бібліотека, читання, «Біля вогнища» (читати), налаштування             |  ✅   |  ✅  |    ✅     |  ✅   |
| `shelves`, `profile`, `campfire.tell`, `campfire.fire`, `books.upload` |   —   |  ✅  |    ✅     |  ✅   |
| `moderation` (книги й історії)                                         |   —   |  —   |    ✅     |  ✅   |
| `users.manage` (ролі)                                                  |   —   |  —   |     —     |  ✅   |

- Матриця — `features/auth/lib/permissions.ts`. Пункти меню мають `permission` і ховаються без нього.
- Маршрути без дозволу закриті через `Drawer.Protected` / `Stack.Protected` — недоступні навіть за прямим посиланням. Вхід і реєстрація — лише для гостей: після входу ці екрани закриваються самі.
- Сервер (поки `mock-backend`) перевіряє ті самі права незалежно від клієнта.

## Дані й бекенд

- Контракт фічі (`<name>.api.types.ts`) = майбутні ендпоінти; повний опис для бекенду — [docs/API.md](./docs/API.md).
- Екрани й стори працюють лише через `<name>.api.ts`. Зараз там `mockServer.<name>` з `src/mock-backend`.
- **`src/mock-backend`** поводиться як справжній сервер: «база» (таблиці як у БД, зберігається на пристрої), токен у `shared/lib/api-session`, перевірка ролей, ліміти XP, ті самі DTO й коди помилок (`ApiError`). Демо-акаунти й код підтвердження — `mock-backend/fixtures/users.ts`.
- Коли бекенд готовий: у кожному `<name>.api.ts` `mockServer.<name>` → HTTP-клієнт (токен — з `apiSession`), `env.isDemo = false`, папку `mock-backend` видалити. Екрани не змінюються.
- Помилки: сервер повертає код (`ApiErrorCode`), текст для людини — `errorText(t, error)` з `t.errors`.

## Ранги (дизайн-документ)

- Пороги XP — `progression/lib/ranks.ts`; назви рангів 1–8 для кожного угруповання — `lib/rank-names.ts` (лор, однаковий для всіх мов); 9–10 «Чорнобиль», «Моноліт» — універсальні.
- Нараховує XP лише сервер (`mock-backend/rules.ts`): історія +1 (1/день), вогник +0.5 автору (до 20/день, лише від «Новенький»+, не собі, один з акаунта), реклама +1…5 (3/день). «non stop» — 90 днів поспіль з історією.
- `RankLabel`: ранні ранги сірим, від «Сталкера» — золотистим.

## Адаптивність

- Брейкпоінт один: `TABLET_MIN_WIDTH` (768) у `shared/constants/layout.ts`; тип розкладки — `useLayout()`.
- Меню: телефон — `drawerType: 'front'` (☰ або свайп від лівого краю), планшет — `'permanent'` (бокова панель, без свайпу).
- Сітки рахують кількість колонок від фактичної ширини; форми й тексти — у колонці `MAX_CONTENT_WIDTH` (`shared/ui/Screen`).

## Правила

- Залежності: `app → features → shared`. `shared` не імпортує `features`. `mock-backend` імпортує з фіч лише типи.
- Між фічами — тільки через `@/features/<name>`.
- Стилі — `StyleSheet.create` внизу файлу компонента. Значення — тільки з токенів (`colors.surface`, `spacing.lg`).
- Текст — тільки через `shared/ui/Text` (`variant`, `color`). Рядки інтерфейсу — тільки через `useT()`.
- Іконки — `shared/ui/Icon` (Feather).
- Платформи: iOS, Android, Web. Різна реалізація — окремий файл `*.web.ts(x)` з тим самим API. Спільний контракт — у `*.types.ts`.
- Сповіщення й підтвердження — тільки `notify` / `confirm` з `shared/lib/dialogs` (свої компоненти застосунку, однакові на всіх платформах). Системні `Alert`, `window.alert/confirm` — заборонені.
- Нові пакети — через `npx expo install`.
- Перед комітом: `npm run check` (typecheck + ESLint + Prettier).
