// Першим: налаштування zod мають діяти до створення будь-яких схем
import './config/zod.js';

import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/client.js';

const server = createApp().listen(env.PORT, (error) => {
  if (error) {
    throw error;
  }

  console.log(`API: http://localhost:${env.PORT}`);
});

/** Коректна зупинка: дочекатися поточних запитів і закрити з'єднання з базою. */
function shutdown() {
  server.close(() => {
    void pool.end().then(() => process.exit(0));
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
