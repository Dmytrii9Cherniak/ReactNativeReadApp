import { useEffect, useSyncExternalStore } from 'react';

import { useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';

import { useAchievementsStore } from '../achievements.store';
import { useAchievements } from './use-achievements';

/**
 * Чи прочитано збережений список з диска. Через useSyncExternalStore, а не просто
 * `persist.hasHydrated()` у рендері: таке читання React Compiler закешував би назавжди.
 */
function useIsHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useAchievementsStore.persist.onFinishHydration(onChange),
    () => useAchievementsStore.persist.hasHydrated(),
  );
}

/** Кореневий layout: щойно досягнення отримано — сповіщення «Нове досягнення». */
export function useAchievementAnnouncer() {
  const t = useT();
  const achievements = useAchievements();
  const announced = useAchievementsStore((s) => s.announced);
  const announce = useAchievementsStore((s) => s.announce);
  const isHydrated = useIsHydrated();
  const fresh = achievements
    .filter((item) => item.isUnlocked && !announced.includes(item.achievement.id))
    .map((item) => item.achievement.id);
  const freshKey = fresh.join(',');

  useEffect(() => {
    // Поки збережений список не прочитано — не знаємо, що вже показували
    if (!isHydrated || !freshKey) {
      return;
    }

    const ids = freshKey.split(',') as typeof fresh;

    const titles = ids.map((id) => t.achievements.items[id].title);

    // Кілька одразу (перший вхід) — одне сповіщення, а не кілька підряд
    if (titles.length === 1) {
      notify.success(t.achievements.unlocked(titles[0]));
    } else {
      notify.success(`${t.achievements.title}: +${titles.length}`, titles.join(', '));
    }

    announce(ids);
  }, [freshKey, isHydrated, announce, t]);
}
