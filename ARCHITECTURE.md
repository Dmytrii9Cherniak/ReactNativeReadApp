# Архітектура

```
src/
  app/                    Роути Expo Router. Тонкі обгортки: беруть параметри й рендерять екран фічі.
  features/<name>/        Фіча = самодостатній модуль (аналог Angular module)
    index.ts              Публічний API. Ззовні імпортуємо ТІЛЬКИ звідси
    <name>-screen.tsx     Екран фічі
    components/           UI фічі
    hooks/                Хуки фічі
    lib/                  Чисті функції (без React / IO)
    <name>.store.ts       Стан (zustand)
    <name>.storage.ts     Файли / сховище (iOS/Android)
    <name>.storage.web.ts Те саме для web (IndexedDB)
    types.ts
  shared/                 Не знає про фічі
    ui/                   Базові компоненти: Text, Button, Screen, ScreenHeader, InfoRow, Loader, CenteredMessage
    theme/                tokens.ts — кольори, відступи, радіуси, шрифти, типографіка
    lib/                  Утиліти (dialogs — confirm / showMessage для всіх платформ)
    constants/
  config/env.ts           Змінні середовища (EXPO_PUBLIC_*)
```

Фічі: `library` (список, імпорт, видалення книг), `reader` (читання), `settings`.

## Правила

- Залежності: `app → features → shared`. `shared` не імпортує `features`.
- Між фічами — тільки через `@/features/<name>`.
- Стилі — `StyleSheet.create` внизу файлу компонента. Значення — тільки з токенів (`colors.surface`, `spacing.lg`), без hex і магічних чисел.
- Текст — тільки через `shared/ui/Text` (`variant`, `color`).
- Платформи: iOS, Android, Web. Різна реалізація — окремий файл `*.web.ts(x)` з тим самим API (Metro підставляє сам). Спільний контракт — у `*.types.ts`.
- Не використовувати `Alert` з react-native напряму — тільки `shared/lib/dialogs` (на web `Alert` не працює).
- Тема одна — темна (`app.json → userInterfaceStyle: "dark"`).
- Нові пакети — через `npx expo install`.
- Перед комітом: `npm run check` (typecheck + ESLint + Prettier). Межі між шарами й заборона `Alert` перевіряються ESLint.
