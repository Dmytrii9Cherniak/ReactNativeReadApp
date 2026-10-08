import { Router } from 'express';

import { getAuthUser, requireAuth } from '../auth/require-auth.js';
import { toPublicUser } from './public-user.js';

export const meRouter = Router();

/** Поточний користувач — за access-токеном. */
meRouter.get('/', requireAuth, (req, res) => {
  res.json(toPublicUser(getAuthUser(req)));
});
