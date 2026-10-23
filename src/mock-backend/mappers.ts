import type { User } from '@/features/auth';
import type { Story } from '@/features/campfire';
import type { CatalogBook } from '@/features/catalog';
import type { Progress } from '@/features/progression';

import { XP_RULES, todayOf } from './rules';

import type { BookRecord, Db, StoryRecord, UserRecord } from './db';

/** Перетворення записів «БД» у відповіді API — без паролів і службових полів. */

export const toUser = (user: UserRecord): User => ({
  id: user.id,
  nickname: user.nickname,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export const toBook = ({
  status: _s,
  submittedBy: _b,
  submittedAt: _a,
  rejectReason: _r,
  ...book
}: BookRecord): CatalogBook => book;

export function toProgress(user: UserRecord): Progress {
  const today = todayOf(user);

  return {
    xp: user.xp,
    factionId: user.factionId,
    factionChangedAt: user.factionChangedAt,
    storiesCount: user.storiesCount,
    firesReceived: user.firesReceived,
    nonStop: { streak: user.nonStopStreak, earned: user.nonStopEarned },
    today: {
      story: today.story * XP_RULES.story,
      fires: today.fires,
      ads: today.ads,
      adXp: today.adXp,
    },
  };
}

export function toStory(db: Db, story: StoryRecord, viewer: UserRecord | null): Story {
  const author = db.users.find((user) => user.id === story.authorId);

  return {
    id: story.id,
    title: story.title,
    body: story.body,
    createdAt: story.createdAt,
    status: story.status,
    fires: story.baseFires + story.fires.length,
    firedByMe: viewer ? story.fires.some((fire) => fire.userId === viewer.id) : false,
    author: {
      id: story.authorId,
      nickname: author?.nickname ?? '—',
      xp: author?.xp ?? 0,
      factionId: author?.factionId ?? 'loners',
      hasNonStop: (author?.nonStopEarned ?? 0) > 0,
    },
  };
}
