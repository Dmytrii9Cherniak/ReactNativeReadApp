import type { User } from '../db/schema.js';

declare global {
  namespace Express {
    interface Request {
      /** Користувач запиту — встановлює middleware requireAuth */
      user?: User;
    }
  }
}

export {};
