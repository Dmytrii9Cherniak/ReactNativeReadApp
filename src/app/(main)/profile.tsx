import { AchievementsCard } from '@/features/achievements';
import { ProfileScreen } from '@/features/progression';
import { ReadingStatsCard } from '@/features/reader';

/** Профіль + статистика читання й досягнення (різні фічі збираються тут, у маршруті). */
export default function ProfileRoute() {
  return (
    <ProfileScreen
      extra={
        <>
          <ReadingStatsCard />
          <AchievementsCard />
        </>
      }
    />
  );
}
