import type { CampfireApi } from '@/features/campfire';
import { ApiError } from '@/shared/lib/api-error';

import { createId, type Db, type StoryRecord, type UserRecord } from '../db';
import { toStory } from '../mappers';
import { respond } from '../respond';
import { XP_RULES, dayKey, isYesterday, todayOf } from '../rules';
import { STAFF_ROLES, findCurrentUser, requireUser } from '../session';

/** Опубліковані бачать усі; на перевірці — лише автор і модератори. */
function isVisible(story: StoryRecord, viewer: UserRecord | null): boolean {
  return (
    story.status === 'published' ||
    (viewer !== null && (viewer.id === story.authorId || STAFF_ROLES.includes(viewer.role)))
  );
}

function findVisible(db: Db, id: string, viewer: UserRecord | null): StoryRecord {
  const story = db.stories.find((item) => item.id === id);

  if (!story || !isVisible(story, viewer)) {
    throw new ApiError('not_found');
  }

  return story;
}

/** Серія «non stop»: історія щодня без пропуску; кожні 90 днів поспіль — +1 бейдж. */
function trackNonStop(user: UserRecord): void {
  user.nonStopStreak = isYesterday(user.lastStoryDay) ? user.nonStopStreak + 1 : 1;
  user.lastStoryDay = dayKey();

  if (user.nonStopStreak >= XP_RULES.nonStopDays) {
    user.nonStopEarned += 1;
    user.nonStopStreak = 0;
  }
}

export const campfireHandlers: CampfireApi = {
  list: () =>
    respond((db) => {
      const viewer = findCurrentUser(db);

      return db.stories
        .filter((story) => isVisible(story, viewer))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((story) => toStory(db, story, viewer));
    }),

  get: (id) =>
    respond((db) => {
      const viewer = findCurrentUser(db);

      return toStory(db, findVisible(db, id, viewer), viewer);
    }),

  create: ({ title, body }) =>
    respond((db) => {
      const user = requireUser(db);
      const today = todayOf(user);

      if (!title.trim() || !body.trim()) {
        throw new ApiError('validation');
      }

      if (today.story >= XP_RULES.storiesPerDay) {
        throw new ApiError('story_limit');
      }

      const story: StoryRecord = {
        id: createId('s'),
        authorId: user.id,
        title: title.trim(),
        body: body.trim(),
        createdAt: new Date().toISOString(),
        // Історії, як і книги, проходять модерацію; модератори й адміни публікують одразу
        status: STAFF_ROLES.includes(user.role) ? 'published' : 'pending',
        firedBy: [],
        baseFires: 0,
      };

      db.stories.push(story);
      today.story += 1;
      user.xp += XP_RULES.story;
      user.storiesCount += 1;
      trackNonStop(user);

      return toStory(db, story, user);
    }),

  fire: (id) =>
    respond((db) => {
      const user = requireUser(db);
      const story = findVisible(db, id, user);

      if (story.authorId === user.id) {
        throw new ApiError('fire_own_story');
      }

      if (story.firedBy.includes(user.id)) {
        throw new ApiError('already_fired');
      }

      story.firedBy.push(user.id);

      const author = db.users.find((item) => item.id === story.authorId);

      if (author) {
        author.firesReceived += 1;

        const authorToday = todayOf(author);

        // Захист від накруток: досвід лише від «Новенького» і вище, не більше 20 вогників на добу
        if (user.xp >= XP_RULES.minXpToGiveFire && authorToday.fires < XP_RULES.firesPerDay) {
          authorToday.fires += 1;
          author.xp += XP_RULES.fire;
        }
      }

      return toStory(db, story, user);
    }),
};
