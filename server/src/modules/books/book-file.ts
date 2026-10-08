import { open } from 'node:fs/promises';
import os from 'node:os';

import multer from 'multer';

import { env } from '../../config/env.js';
import { HttpError } from '../../shared/http/errors.js';

import type { BookFormat } from '../../db/schema.js';
import type { RequestHandler } from 'express';

export const CONTENT_TYPES: Record<BookFormat, string> = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  txt: 'text/plain; charset=utf-8',
};

/** 'Book.PDF' → 'pdf', 'notes.docx' → null */
export function detectFormat(fileName: string): BookFormat | null {
  const extension = fileName.split('.').pop()?.toLowerCase();

  return extension === 'pdf' || extension === 'epub' || extension === 'txt' ? extension : null;
}

const SNIFF_BYTES = 4096;
/**
 * EPUB — це ZIP, де першим файлом іде `mimetype` з текстом `application/epub+zip`
 * (вимога специфікації OCF): ім'я цього файлу починається з байта 30 заголовка ZIP.
 */
const EPUB_MARKER = 'mimetypeapplication/epub+zip';

/** Перевірка вмісту за сигнатурою: розширення файлу можна підробити. */
export async function hasValidSignature(filePath: string, format: BookFormat): Promise<boolean> {
  const handle = await open(filePath, 'r');

  try {
    const { buffer, bytesRead } = await handle.read(Buffer.alloc(SNIFF_BYTES), 0, SNIFF_BYTES, 0);
    const head = buffer.subarray(0, bytesRead);

    switch (format) {
      case 'pdf':
        return head.subarray(0, 5).toString('latin1') === '%PDF-';
      case 'epub':
        return head.subarray(30, 30 + EPUB_MARKER.length).toString('latin1') === EPUB_MARKER;
      case 'txt':
        // Текст не містить нульових байтів — на відміну від бінарних файлів
        return bytesRead > 0 && !head.includes(0);
    }
  } finally {
    await handle.close();
  }
}

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: env.MAX_BOOK_SIZE_MB * 1024 * 1024, files: 1 },
});

/**
 * multipart/form-data з одним файлом у полі `file` → req.file (тимчасовий файл на диску).
 * Помилки multer перетворюються на наш формат помилок.
 */
export const receiveBookFile: RequestHandler = (req, res, next) => {
  upload.single('file')(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      next(
        error.code === 'LIMIT_FILE_SIZE'
          ? new HttpError(413, 'file_too_large', `Файл більший за ${env.MAX_BOOK_SIZE_MB} МБ`)
          : new HttpError(400, 'invalid_upload', 'Очікується один файл у полі file'),
      );

      return;
    }

    next(error);
  });
};
