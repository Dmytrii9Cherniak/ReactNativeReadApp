# API (Node + Express + PostgreSQL)

Повна документація — запуск з нуля, змінні середовища, база, ендпоінти, помилки — у [кореневому README](../README.md).

Коротко, з цієї папки:

```bash
npm install
cp .env.example .env     # + два секрети з `npm run secret`
npm run db:up            # PostgreSQL + Mailpit у Docker
npm run db:migrate       # таблиці
npm run dev              # http://localhost:3000/health → {"status":"ok"}
```
