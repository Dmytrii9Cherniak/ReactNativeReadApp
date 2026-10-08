import { HttpError } from '../../shared/http/errors.js';
import { getAuthUser } from './require-auth.js';

import type { RequestHandler } from 'express';

export type Permission = 'isAdmin' | 'canModerateBooks' | 'canModerateStories';

/**
 * Гард за правами — ставиться ПІСЛЯ requireAuth.
 * Адмін має всі права; решта — лише ті, що їм видані.
 */
export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    const user = getAuthUser(req);

    if (!user.isAdmin && !user[permission]) {
      throw new HttpError(403, 'forbidden', 'Недостатньо прав');
    }

    next();
  };
}
