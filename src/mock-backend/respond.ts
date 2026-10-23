import { commit, getDb, type Db } from './db';

/** Затримка «мережі»: стани завантаження видно й без бекенду. */
const NETWORK_DELAY_MS = 250;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Обробник запиту: чекає «мережу», виконує дію над базою й зберігає зміни. */
export async function respond<T>(handler: (db: Db) => T): Promise<T> {
  await delay(NETWORK_DELAY_MS);

  const db = await getDb();
  const result = handler(db);

  await commit();

  return result;
}
