import type { UploadApi } from '@/features/upload';
import { ApiError } from '@/shared/lib/api-error';

import { createId } from '../db';
import { emit } from '../events';
import { respond } from '../respond';
import { requireUser } from '../session';

export const uploadHandlers: UploadApi = {
  submitBook: ({ title, author, description, language, file }) =>
    respond((db) => {
      const user = requireUser(db);

      if (!title.trim() || !author.trim()) {
        throw new ApiError('validation');
      }

      // Справжній бекенд зберігає файл у сховищі й розбирає текст після схвалення
      db.books.push({
        id: createId('b'),
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        language,
        format: file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 'epub',
        coverUrl: null,
        readCount: 0,
        status: 'pending',
        rejectReason: null,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
      });
      emit('admin');
    }),
};
