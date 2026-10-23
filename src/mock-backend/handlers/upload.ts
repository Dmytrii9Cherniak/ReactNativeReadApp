import type { MySubmission, UploadApi } from '@/features/upload';
import { ApiError } from '@/shared/lib/api-error';

import { saveUploadedContent } from '../book-files';
import { createId } from '../db';
import { emit } from '../events';
import { respond } from '../respond';
import { requireUser } from '../session';

export const uploadHandlers: UploadApi = {
  submitBook: async ({ title, author, description, language, file, cover }) => {
    const isEpub = !file.name.toLowerCase().endsWith('.pdf');
    const bookId = await respond((db) => {
      const user = requireUser(db);

      if (!title.trim() || !author.trim()) {
        throw new ApiError('validation');
      }

      const id = createId('b');

      db.books.push({
        id,
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        language,
        format: isEpub ? 'epub' : 'pdf',
        // Справжній бекенд кладе обкладинку в сховище й повертає її URL
        coverUrl: cover?.uri ?? null,
        readCount: 0,
        status: 'pending',
        rejectReason: null,
        submittedBy: user.id,
        submittedAt: new Date().toISOString(),
        isDemoText: false,
      });

      return id;
    });

    // Розбір тексту — як фонова задача бекенду; адмін бачить книгу вже з текстом
    await saveUploadedContent(bookId, file.uri, isEpub);
    emit('admin');
  },

  listMine: () =>
    respond((db) => {
      const user = requireUser(db);
      const books: MySubmission[] = db.books
        .filter((book) => book.submittedBy === user.id)
        .map((book) => ({
          id: book.id,
          kind: 'book',
          title: book.title,
          status: book.status,
          rejectReason: book.rejectReason,
          submittedAt: book.submittedAt,
        }));
      const stories: MySubmission[] = db.stories
        .filter((story) => story.authorId === user.id)
        .map((story) => ({
          id: story.id,
          kind: 'story',
          title: story.title,
          status: story.status,
          rejectReason: story.rejectReason,
          submittedAt: story.createdAt,
        }));

      return [...books, ...stories].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }),
};
