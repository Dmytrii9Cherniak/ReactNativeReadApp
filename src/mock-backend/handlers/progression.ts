import type { FactionId, ProgressionApi } from '@/features/progression';
import { ApiError } from '@/shared/lib/api-error';

import { toProgress } from '../mappers';
import { respond } from '../respond';
import { DAY_MS, XP_RULES, todayOf } from '../rules';
import { requireUser } from '../session';

const randomInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));

export const progressionHandlers: ProgressionApi = {
  getProgress: () => respond((db) => toProgress(requireUser(db))),

  watchAd: () =>
    respond((db) => {
      const user = requireUser(db);
      const today = todayOf(user);

      if (today.ads >= XP_RULES.adsPerDay) {
        throw new ApiError('ad_limit');
      }

      // Справжній бекенд нараховує після підтвердження перегляду від рекламної мережі
      const xp = randomInt(XP_RULES.adMin, XP_RULES.adMax);

      today.ads += 1;
      today.adXp += xp;
      user.xp += xp;

      return { xp, progress: toProgress(user) };
    }),

  listFactions: () =>
    respond((db) =>
      (Object.keys(db.factionBaseMembers) as FactionId[]).map((id) => ({
        id,
        members:
          db.factionBaseMembers[id] + db.users.filter((user) => user.factionId === id).length,
      })),
    ),

  joinFaction: (factionId) =>
    respond((db) => {
      const user = requireUser(db);

      if (user.factionId === factionId) {
        throw new ApiError('validation');
      }

      const changedAt = user.factionChangedAt ? new Date(user.factionChangedAt).getTime() : null;

      if (changedAt !== null && Date.now() - changedAt < XP_RULES.factionCooldownDays * DAY_MS) {
        throw new ApiError('faction_cooldown');
      }

      user.factionId = factionId;
      user.factionChangedAt = new Date().toISOString();

      return toProgress(user);
    }),
};
