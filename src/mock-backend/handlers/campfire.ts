import type { CampfireApi } from '@/features/campfire';
import { ApiError } from '@/shared/lib/api-error';

import { createId, type Db, type StoryRecord, type UserRecord } from '../db';
import { emit } from '../events';
import { toStory } from '../mappers';
import { respond } from '../respond';
import { XP_RULES, awardXp, dayKey, isYesterday, todayOf } from '../rules';
import { findCurrentUser, isAdmin, requireUser } from '../session';

/**
 * Опубліковані бачать усі; адмін — усі; автор — свої на перевірці й відхилені
 * (щоб бачити статус). Приховані адміном — лише адмін.
 */
function isVisible(story: StoryRecord, viewer: UserRecord | null): boolean {
  if (story.status === 'published' || isAdmin(viewer)) {
    return true;
  }

  return viewer?.id === story.authorId && story.status !== 'hidden';
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
        // Історії, як і книги, перевіряє адмін; власні історії адміна публікуються одразу
        status: isAdmin(user) ? 'published' : 'pending',
        rejectReason: null,
        fires: [],
        baseFires: 0,
      };

      db.stories.push(story);
      today.story += 1;
      awardXp(db, user, XP_RULES.story);
      user.storiesCount += 1;
      trackNonStop(user);

      if (story.status === 'pending') {
        emit('admin');
      }

      return toStory(db, story, user);
    }),

  fire: (id) =>
    respond((db) => {
      const user = requireUser(db);
      const story = findVisible(db, id, user);

      if (story.authorId === user.id) {
        throw new ApiError('fire_own_story');
      }

      if (story.status !== 'published') {
        throw new ApiError('not_found');
      }

      if (story.fires.some((fire) => fire.userId === user.id)) {
        throw new ApiError('already_fired');
      }

      story.fires.push({ userId: user.id, at: new Date().toISOString() });

      const author = db.users.find((item) => item.id === story.authorId);

      if (author) {
        author.firesReceived += 1;

        const authorToday = todayOf(author);

        // Захист від накруток: досвід лише від «Новенького» і вище, не більше 20 вогників на добу
        if (user.xp >= XP_RULES.minXpToGiveFire && authorToday.fires < XP_RULES.firesPerDay) {
          authorToday.fires += 1;
          awardXp(db, author, XP_RULES.fire);
        }
      }

      return toStory(db, story, user);
    }),
};
