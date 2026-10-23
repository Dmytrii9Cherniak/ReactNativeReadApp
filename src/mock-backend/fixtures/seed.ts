import type { CatalogBook } from '@/features/catalog';

import { DAY_MS, dayKey, emptyDaily } from '../rules';
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

function seedUser(fixture: (typeof FIXTURE_USERS)[number]): UserRecord {
  const isDemoReader = fixture.id === 'u-user';

  return {
    ...fixture,
    createdAt: daysAgo(120),
    factionChangedAt: null,
    lastStoryDay: isDemoReader ? dayKey() : null,
    // Блок «Сьогодні» з дизайн-документа: історія +1, вогники 12 з 20 (+6), реклама 2 з 3 (+3)
    daily: isDemoReader ? { day: dayKey(), story: 1, fires: 12, ads: 2, adXp: 3 } : emptyDaily(),
  };
}

export function createSeed(version: number): Db {
  const now = new Date().toISOString();
  const published: BookRecord[] = FIXTURE_BOOKS.map((book) => ({
    ...book,
    status: 'published',
    submittedBy: null,
    submittedAt: daysAgo(60),
  }));
  const pending: BookRecord[] = PENDING_BOOKS.map(({ book, submittedBy }, index) => ({
    ...book,
    status: 'pending',
    submittedBy,
    submittedAt: daysAgo(index),
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
      firedBy: [],
    })),
    pendingSignups: [],
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
