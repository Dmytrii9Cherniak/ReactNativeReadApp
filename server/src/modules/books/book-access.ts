import type { BookStatus, User } from '../../db/schema.js';

/** Що потрібно знати про книгу для перевірки доступу. */
interface BookAccessInfo {
  status: BookStatus;
  uploadedBy: string | null;
}

/** Гість — null. */
type Viewer = User | null;

const isOwner = (viewer: Viewer, book: BookAccessInfo) =>
  viewer !== null && book.uploadedBy === viewer.id;

const isBookModerator = (viewer: Viewer) =>
  viewer !== null && (viewer.isAdmin || viewer.canModerateBooks);

/**
 * Хто бачить книгу (і може її читати):
 * - published — усі, включно з гостями;
 * - private — лише власник (навіть адмін ні: це особиста книга);
 * - pending, rejected — власник і модератори книг.
 */
export function canViewBook(viewer: Viewer, book: BookAccessInfo): boolean {
  switch (book.status) {
    case 'published':
      return true;
    case 'private':
      return isOwner(viewer, book);
    case 'pending':
    case 'rejected':
      return isOwner(viewer, book) || isBookModerator(viewer);
  }
}

/** Видалити: власник — будь-яку свою; модератор — будь-яку, крім чужих приватних. */
export function canDeleteBook(viewer: Viewer, book: BookAccessInfo): boolean {
  return isOwner(viewer, book) || (isBookModerator(viewer) && book.status !== 'private');
}

/** Подати на модерацію: лише власник і лише приватну або відхилену. */
export function canSubmitBook(viewer: Viewer, book: BookAccessInfo): boolean {
  return isOwner(viewer, book) && (book.status === 'private' || book.status === 'rejected');
}
