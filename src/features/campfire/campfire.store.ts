import { create } from 'zustand';

import { campfireApi } from './campfire.api';

import type { NewStory, Story } from './types';

interface CampfireState {
  /** Стрічка; null — ще не завантажено */
  stories: Story[] | null;
  load: () => Promise<void>;
  fire: (id: string) => Promise<void>;
  create: (story: NewStory) => Promise<Story>;
  /** Підставити свіжу версію історії (після відкриття чи вогника) */
  upsert: (story: Story) => void;
}

/** Стрічка «Біля вогнища». Спільна для стрічки й сторінки історії — лічильники збігаються. */
export const useCampfireStore = create<CampfireState>()((set, get) => ({
  stories: null,

  async load() {
    set({ stories: await campfireApi.list() });
  },

  async fire(id) {
    get().upsert(await campfireApi.fire(id));
  },

  async create(story) {
    const created = await campfireApi.create(story);

    set({ stories: [created, ...(get().stories ?? [])] });

    return created;
  },

  upsert(story) {
    const { stories } = get();

    if (stories) {
      set({ stories: stories.map((item) => (item.id === story.id ? story : item)) });
    }
  },
}));
