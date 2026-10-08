import type { User } from '../../db/schema.js';

/** Те, що клієнт бачить про користувача: без хеша пароля і службових полів. */
export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    canModerateBooks: user.canModerateBooks,
    canModerateStories: user.canModerateStories,
  };
}

export type PublicUser = ReturnType<typeof toPublicUser>;
