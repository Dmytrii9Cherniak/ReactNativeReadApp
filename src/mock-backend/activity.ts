import {
  createId,
  type AuditRecord,
  type Db,
  type NotificationRecord,
  type UserRecord,
} from './db';
import { emit } from './events';

/** Сповіщення користувачу (таблиця notifications) + жива подія. */
export function notifyUser(
  db: Db,
  userId: string,
  kind: NotificationRecord['kind'],
  params: NotificationRecord['params'] = {},
): void {
  db.notifications.push({
    id: createId('n'),
    userId,
    kind,
    params,
    createdAt: new Date().toISOString(),
    read: false,
  });
  emit('notifications');
}

/** Запис у журнал дій адміністраторів (таблиця audit_log). */
export function logAction(
  db: Db,
  admin: UserRecord,
  action: AuditRecord['action'],
  target: string,
  details: string | null = null,
): void {
  db.audit.push({
    id: createId('a'),
    adminId: admin.id,
    action,
    target,
    details,
    createdAt: new Date().toISOString(),
  });
}
