/**
 * Ліміти з дизайн-документа — лише для підписів «12 з 20», «2 з 3».
 * Нараховує й перевіряє сервер; змінюватимуться — разом із ним.
 */
export const XP_LIMITS = {
  fireXp: 0.5,
  firesPerDay: 20,
  adsPerDay: 3,
  factionCooldownDays: 30,
} as const;
