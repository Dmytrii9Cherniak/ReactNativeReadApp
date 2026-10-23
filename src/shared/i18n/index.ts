import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

import { en } from './en';
import { uk, type Messages } from './uk';

export type Language = 'uk' | 'en';

export const LANGUAGES: Language[] = ['uk', 'en'];

const messages: Record<Language, Messages> = { uk, en };

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

/** Мова інтерфейсу. За замовчуванням — українська; вибір зберігається між запусками. */
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'uk',
      setLanguage: (language) => set({ language }),
    }),
    { name: 'language', storage: persistStorage },
  ),
);

/** Тексти інтерфейсу поточною мовою: `const t = useT(); t.menu.myBooks`. */
export function useT(): Messages {
  return messages[useLanguageStore((s) => s.language)];
}

export { errorText } from './error-text';
export { formatRelativeTime } from './relative-time';
export type { Messages };
