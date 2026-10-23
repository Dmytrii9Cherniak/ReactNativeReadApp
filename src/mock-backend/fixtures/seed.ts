import type { CatalogBook } from '@/features/catalog';

import { DAY_MS, dayKey, emptyDaily, weekKey } from '../rules';
import { FIXTURE_BOOKS } from './books';
import { FIXTURE_STORIES } from './stories';
import { FIXTURE_USERS } from './users';

import type { BookRecord, Db, UserRecord } from '../db';

/** Книги в черзі модерації (макет «Перевірка надісланого»). */
const PENDING_BOOKS: { book: CatalogBook; submittedBy: string }[] = [
  {
    book: {
      id: 'b-p1',
      title: 'Сутінки над Янтарем',
      author: 'С. Кравець',
      description:
        'Науковий табір на озері Янтар, викид і троє людей, які мусять дочекатися ранку.',
      language: 'uk',
      format: 'epub',
      coverUrl: null,
      readCount: 0,
    },
    submittedBy: 'u-82ac',
  },
  {
    book: {
      id: 'b-p2',
      title: 'Дорога на Затон',
      author: 'Н. Полтава',
      description: 'Старий човняр погоджується перевезти групу через Затон — але не безкоштовно.',
      language: 'uk',
      format: 'pdf',
      coverUrl: null,
      readCount: 0,
    },
    submittedBy: 'u-ua17',
  },
  {
    book: {
      id: 'b-p3',
      title: 'Шепіт Рудого лісу',
      author: 'М. Іщенко',
      description: 'Ліс, у якому дерева пам’ятають більше, ніж люди.',
      language: 'uk',
      format: 'epub',
      coverUrl: null,
      readCount: 0,
    },
    submittedBy: 'u-ostalker',
  },
];

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString();

/** Заблокований тестовий акаунт — щоб у адмінці було що розблокувати. */
const BLOCKED: Record<string, string> = { 'u-ua17': 'Спам у назвах книг' };

function seedUser(fixture: (typeof FIXTURE_USERS)[number]): UserRecord {
  const isDemoReader = fixture.id === 'u-user';

  return {
    ...fixture,
    createdAt: daysAgo(120),
    factionChangedAt: null,
    lastStoryDay: isDemoReader ? dayKey() : null,
    // Блок «Сьогодні» з дизайн-документа: історія +1, вогники 12 з 20 (+6), реклама 2 з 3 (+3)
    daily: isDemoReader ? { day: dayKey(), story: 1, fires: 12, ads: 2, adXp: 3 } : emptyDaily(),
    blocked: fixture.id in BLOCKED,
    blockReason: BLOCKED[fixture.id] ?? null,
  };
}

export function createSeed(version: number): Db {
  const now = new Date().toISOString();
  const published: BookRecord[] = FIXTURE_BOOKS.map((book) => ({
    ...book,
    status: 'published',
    submittedBy: null,
    submittedAt: daysAgo(60),
    rejectReason: null,
    isDemoText: true,
  }));
  const pending: BookRecord[] = PENDING_BOOKS.map(({ book, submittedBy }, index) => ({
    ...book,
    status: 'pending',
    submittedBy,
    submittedAt: daysAgo(index),
    rejectReason: null,
    isDemoText: true,
  }));

  return {
    version,
    users: FIXTURE_USERS.map(seedUser),
    books: [...published, ...pending],
    // Полиці демо-користувача — як на макеті «Мої книги»
    shelves: ['b-02', 'b-01', 'b-04'].map((bookId) => ({
      userId: 'u-user',
      bookId,
      shelf: 'reading',
      updatedAt: now,
    })),
    stories: FIXTURE_STORIES.map(({ daysAgo: age, ...story }) => ({
      ...story,
      createdAt: daysAgo(age),
      rejectReason: null,
      fires: [],
    })),
    pendingSignups: [],
    passwordResets: [],
    // Вхідні демо-користувача: щоб розділ «Сповіщення» не був порожнім
    notifications: [
      {
        id: 'n-seed-1',
        userId: 'u-user',
        kind: 'announcement',
        params: {
          title: 'Ласкаво просимо до Stalker Books!',
          text: 'Розкажіть першу історію біля вогнища — за неї +1 XP.',
        },
        createdAt: daysAgo(1),
        read: false,
      },
      {
        id: 'n-seed-2',
        userId: 'u-user',
        kind: 'story_approved',
        params: { title: 'Детектор мовчить' },
        createdAt: daysAgo(2),
        read: true,
      },
    ],
    audit: [
      {
        id: 'a-seed-1',
        adminId: 'u-admin',
        action: 'user.block',
        target: 'reader_ua_17',
        details: BLOCKED['u-ua17'],
        createdAt: daysAgo(3),
      },
      {
        id: 'a-seed-2',
        adminId: 'u-admin',
        action: 'story.approve',
        target: 'Детектор мовчить',
        details: null,
        createdAt: daysAgo(2),
      },
    ],
    // Тижневий рейтинг «з історією», щоб таблиця не була порожньою
    factionWeek: {
      week: weekKey(),
      xp: {
        loners: 1840,
        bandits: 960,
        military: 1120,
        duty: 2210,
        freedom: 1530,
        scientists: 870,
        mercenaries: 640,
      },
    },
    // Кількість учасників з макета «Угруповання»
    factionBaseMembers: {
      loners: 8412,
      bandits: 5038,
      military: 4210,
      duty: 9764,
      freedom: 7129,
      scientists: 3356,
      mercenaries: 2887,
    },
  };
}
