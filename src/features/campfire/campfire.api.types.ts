import type { NewStory, Story } from './types';

/**
 * Контракт «Біля вогнища» = майбутні ендпоінти:
 *   GET  /stories               → Story[]   (опубліковані + власні на перевірці)
 *   GET  /stories/:id           → Story
 *   POST /stories   { title, body } → Story (1 на день, +1 XP)          — токен
 *   POST /stories/:id/fires     → Story     (+0.5 XP автору, з лімітами) — токен
 */
export interface CampfireApi {
  list(): Promise<Story[]>;
  get(id: string): Promise<Story>;
  create(story: NewStory): Promise<Story>;
  fire(id: string): Promise<Story>;
}
