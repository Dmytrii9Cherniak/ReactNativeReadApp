import type { BookSubmission, MySubmission } from './types';

/**
 * Контракт надсилань = майбутні ендпоінти (потрібен токен):
 *   POST /books/submissions   multipart: title, author, description, language, file, cover? → 202
 *   GET  /me/submissions                                                          → MySubmission[]
 * Книга потрапляє в чергу перевірки; у бібліотеці — після схвалення.
 */
export interface UploadApi {
  submitBook(submission: BookSubmission): Promise<void>;
  /** Мої книги та історії з поточним станом перевірки, нові першими */
  listMine(): Promise<MySubmission[]>;
}
