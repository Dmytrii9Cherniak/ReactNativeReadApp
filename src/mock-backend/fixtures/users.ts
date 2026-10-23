import type { Role } from '@/features/auth';
import type { FactionId } from '@/features/progression';

export interface FixtureUser {
  id: string;
  email: string;
  password: string;
  nickname: string;
  role: Role;
  xp: number;
  factionId: FactionId;
  storiesCount: number;
  firesReceived: number;
  nonStopStreak: number;
  nonStopEarned: number;
}

/** Код підтвердження пошти в демо-режимі (справжній бекенд надсилає випадковий код листом). */
export const DEMO_VERIFICATION_CODE = '123456';

/** Демо-акаунти — по одному на кожну роль. Показуються на екрані входу в демо-режимі. */
export const DEMO_ACCOUNTS: { email: string; password: string; role: Role }[] = [
  { email: 'admin@stalker.books', password: 'admin123', role: 'admin' },
  { email: 'moder@stalker.books', password: 'moder123', role: 'moderator' },
  { email: 'user@stalker.books', password: 'user123', role: 'user' },
];

const author = (id: string, nickname: string, xp: number, factionId: FactionId): FixtureUser => ({
  id,
  email: `${id}@example.com`,
  password: `${id}-password`,
  nickname,
  role: 'user',
  xp,
  factionId,
  storiesCount: 0,
  firesReceived: 0,
  nonStopStreak: 0,
  nonStopEarned: 0,
});

export const FIXTURE_USERS: FixtureUser[] = [
  {
    id: 'u-admin',
    email: DEMO_ACCOUNTS[0].email,
    password: DEMO_ACCOUNTS[0].password,
    nickname: 'Адмін_Зони',
    role: 'admin',
    xp: 3600,
    factionId: 'duty',
    storiesCount: 210,
    firesReceived: 4870,
    nonStopStreak: 40,
    nonStopEarned: 2,
  },
  {
    id: 'u-moder',
    email: DEMO_ACCOUNTS[1].email,
    password: DEMO_ACCOUNTS[1].password,
    nickname: 'Модер_Кордону',
    role: 'moderator',
    xp: 950,
    factionId: 'freedom',
    storiesCount: 88,
    firesReceived: 1430,
    nonStopStreak: 5,
    nonStopEarned: 0,
  },
  {
    // Профіль з дизайн-документа (розділ 9)
    id: 'u-user',
    email: DEMO_ACCOUNTS[2].email,
    password: DEMO_ACCOUNTS[2].password,
    nickname: 'Сірий_84',
    role: 'user',
    xp: 150,
    factionId: 'loners',
    storiesCount: 34,
    firesReceived: 512,
    nonStopStreak: 34,
    nonStopEarned: 1,
  },
  { ...author('u-rys', 'Рись_84', 210, 'loners'), storiesCount: 19, firesReceived: 230 },
  {
    ...author('u-odynak', 'Одинак_с_Кордону', 2100, 'duty'),
    storiesCount: 140,
    firesReceived: 2950,
    nonStopEarned: 1,
  },
  { ...author('u-novachok', 'Новачок88', 25, 'scientists'), storiesCount: 3, firesReceived: 31 },
  author('u-82ac', 'user_82ac', 60, 'bandits'),
  author('u-ua17', 'reader_ua_17', 12, 'military'),
  author('u-ostalker', 'O.STALKER_UA', 420, 'mercenaries'),
];
