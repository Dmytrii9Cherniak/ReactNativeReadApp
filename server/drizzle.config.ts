import { existsSync } from 'node:fs';

import { defineConfig } from 'drizzle-kit';

// drizzle-kit не читає .env сам — підвантажуємо вбудованим засобом Node
if (existsSync('.env')) {
  process.loadEnvFile();
}

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL не задано в server/.env');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
});
