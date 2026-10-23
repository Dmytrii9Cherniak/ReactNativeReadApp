import type { BookSubmission } from './types';

/**
 * Контракт завантаження = майбутній ендпоінт (потрібен токен):
 *   POST /books/submissions   multipart: title, author, description, language, file → 202
 * Книга потрапляє в чергу модерації; у бібліотеці — після схвалення.
 */
export interface UploadApi {
  submitBook(submission: BookSubmission): Promise<void>;
}
