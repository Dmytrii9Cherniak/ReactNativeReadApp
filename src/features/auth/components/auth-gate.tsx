import { useAuthStore } from '../auth.store';
import { isAllowed } from '../lib/permissions';

import type { Permission } from '../types';
import type { ReactNode } from 'react';

interface AuthGateProps {
  children: ReactNode;
  /** Потрібне право; без нього — достатньо бути залогіненим */
  permission?: Permission;
  /** Що показати замість вмісту (за замовчуванням — нічого) */
  fallback?: ReactNode;
}

/**
 * Аналог структурної директиви (*ngIf="isLoggedIn"): вміст лише для залогінених / з правом.
 *
 *   <AuthGate permission="isAdmin"><AdminButton /></AuthGate>
 *   <AuthGate fallback={<LoginButton />}><LogoutButton /></AuthGate>
 *
 * Це лише UI: справжній захист — гарди на сервері (requireAuth, requirePermission).
 */
export function AuthGate({ children, permission, fallback = null }: AuthGateProps) {
  const allowed = useAuthStore((s) => isAllowed(s.user, permission));

  if (!allowed) {
    return fallback;
  }

  return children;
}

/** Протилежне до AuthGate: вміст лише для гостей (кнопки «Увійти», «Реєстрація»). */
export function GuestOnly({ children }: { children: ReactNode }) {
  const isGuest = useAuthStore((s) => s.status === 'guest');

  if (!isGuest) {
    return null;
  }

  return children;
}
