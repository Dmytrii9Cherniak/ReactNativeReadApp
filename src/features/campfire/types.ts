import type { FactionId } from '@/features/progression';

/** Автор історії — публічні дані для підпису «Нік · Ранг · Угруповання». */
export interface StoryAuthor {
  id: string;
  nickname: string;
  xp: number;
  factionId: FactionId;
  hasNonStop: boolean;
}

/**
 * Статус: історії користувачів спершу перевіряє адмін. Автор бачить свої на перевірці
 * й відхилені, адмін — також приховані.
 */
export type StoryStatus = 'pending' | 'published' | 'hidden' | 'rejected';

export interface Story {
  id: string;
  title: string;
  body: string;
  author: StoryAuthor;
  createdAt: string;
  status: StoryStatus;
  fires: number;
  /** Чи запалив вогник поточний користувач */
  firedByMe: boolean;
}

export interface NewStory {
  title: string;
  body: string;
}
