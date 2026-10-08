import { Router } from 'express';

import { createRateLimit } from '../../shared/http/rate-limit.js';
import {
  emailOnlySchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schemas.js';
import {
  forgotPassword,
  login,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from './auth.service.js';
import { revokeSession, rotateSession } from './sessions.service.js';

/** Ліміт на чутливі дії з однієї IP: вхід, реєстрація, коди. */
const authRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, limit: 30 });

export const authRouter = Router();

authRouter.post('/register', authRateLimit, async (req, res) => {
  await register(registerSchema.parse(req.body));
  res.status(204).end();
});

authRouter.post('/verify-email', authRateLimit, async (req, res) => {
  res.json(await verifyEmail(verifyEmailSchema.parse(req.body)));
});

authRouter.post('/resend-verification', authRateLimit, async (req, res) => {
  await resendVerification(emailOnlySchema.parse(req.body));
  res.status(204).end();
});

authRouter.post('/login', authRateLimit, async (req, res) => {
  res.json(await login(loginSchema.parse(req.body)));
});

authRouter.post('/forgot-password', authRateLimit, async (req, res) => {
  await forgotPassword(emailOnlySchema.parse(req.body));
  res.status(204).end();
});

authRouter.post('/reset-password', authRateLimit, async (req, res) => {
  res.json(await resetPassword(resetPasswordSchema.parse(req.body)));
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);

  res.json(await rotateSession(refreshToken));
});

authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);

  await revokeSession(refreshToken);
  res.status(204).end();
});
