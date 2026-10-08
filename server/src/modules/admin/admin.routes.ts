import { Router } from 'express';

import { getAuthUser, requireAuth } from '../auth/require-auth.js';
import { requirePermission } from '../auth/require-permission.js';
import { permissionsSchema, userIdParamsSchema } from './admin.schemas.js';
import { listUsers, updatePermissions } from './admin.service.js';

export const adminRouter = Router();

// Гарди на весь роутер: спершу «хто ти» (401), потім «чи можна тобі» (403)
adminRouter.use(requireAuth, requirePermission('isAdmin'));

adminRouter.get('/users', async (_req, res) => {
  res.json(await listUsers());
});

adminRouter.patch('/users/:id/permissions', async (req, res) => {
  const { id } = userIdParamsSchema.parse(req.params);
  const changes = permissionsSchema.parse(req.body);

  res.json(await updatePermissions(getAuthUser(req), id, changes));
});
