/**
 * Розробка однією командою: `npm run dev`.
 *
 * 1. База й пошта — Docker (server/docker-compose.yml), чекаємо, поки PostgreSQL буде готовий.
 * 2. API — у фоні, його логи йдуть з префіксом [api].
 * 3. Expo — на передньому плані: йому потрібен справжній термінал, інакше не буде QR-коду
 *    і клавіш (w, r, j). Тому тут не concurrently, а Expo з `stdio: 'inherit'`.
 *
 * Ctrl+C зупиняє API і Expo. Контейнери лишаються працювати — `npm run db:down` у server/.
 */
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const readline = require('node:readline');

const rootDir = path.join(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const API_PREFIX = '\x1b[33m[api]\x1b[0m';

/** Шлях до виконуваного файлу пакета з його package.json (поле bin). */
function resolveBin(packageName, fromDir) {
  const packageJsonPath = require.resolve(`${packageName}/package.json`, { paths: [fromDir] });
  const { bin } = require(packageJsonPath);
  const relativePath = typeof bin === 'string' ? bin : bin[packageName];

  return path.join(path.dirname(packageJsonPath), relativePath);
}

function startDatabase() {
  const result = spawnSync('docker', ['compose', 'up', '-d', '--wait'], {
    cwd: serverDir,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    console.error('Не вдалося запустити базу. Чи запущений Docker Desktop?');
    process.exit(1);
  }
}

/** Те саме, що `npm run dev` у server/, але без проміжного npm — щоб процес коректно зупинявся. */
function startApi() {
  const api = spawn(
    process.execPath,
    [resolveBin('tsx', serverDir), 'watch', '--env-file=.env', 'src/index.ts'],
    {
      cwd: serverDir,
      env: { ...process.env, FORCE_COLOR: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  for (const stream of [api.stdout, api.stderr]) {
    readline
      .createInterface({ input: stream })
      .on('line', (line) => console.log(`${API_PREFIX} ${line}`));
  }

  api.on('exit', (code) => {
    if (code) {
      console.log(`${API_PREFIX} зупинився з кодом ${code}`);
    }
  });

  return api;
}

function startExpo() {
  return spawn(process.execPath, [resolveBin('expo', rootDir), 'start'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

startDatabase();

const api = startApi();
const expo = startExpo();

// Ctrl+C отримують усі процеси в терміналі. Цей скрипт не виходить одразу, а чекає на Expo.
process.on('SIGINT', () => {});

expo.on('exit', (code) => {
  api.kill();
  process.exitCode = code ?? 0;
});
