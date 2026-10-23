import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

interface MenuState {
  /** Планшет / web: бокове меню згорнуте до іконок */
  isCollapsed: boolean;
  toggle: () => void;
}

/** Стан бокового меню — запам'ятовується між запусками. На телефоні не використовується. */
export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      toggle: () => set({ isCollapsed: !get().isCollapsed }),
    }),
    { name: 'menu', storage: persistStorage },
  ),
);
