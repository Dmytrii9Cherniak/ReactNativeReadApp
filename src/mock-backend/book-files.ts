import type { BookContent } from '@/features/catalog';
import { kvStorage } from '@/shared/lib/kv-storage';

import { parseEpub } from './epub';
import { buildBookParagraphs } from './fixtures/book-text';
import { readFileBytes } from './read-file';

import type { BookRecord } from './db';

/**
 * Текст книг — окремо від «бази» (як файли в сховищі в справжнього бекенду):
 * великий текст не роздуває кожне збереження бази.
 */
const contentKey = (bookId: string) => `mock-book-content:${bookId}`;

type StoredContent = Pick<BookContent, 'paragraphs' | 'chapters'>;

/** Тестові книги: розділи «Розділ N» стають змістом. */
function demoContent(book: BookRecord): StoredContent {
  const paragraphs = buildBookParagraphs(book);
  const chapters = paragraphs.flatMap((text, paragraph) =>
    text.startsWith('Розділ ') ? [{ title: text, paragraph }] : [],
  );

  return { paragraphs, chapters };
}

export async function loadContent(book: BookRecord): Promise<BookContent> {
  if (book.isDemoText) {
    return { bookId: book.id, ...demoContent(book) };
  }

  try {
    const raw = await kvStorage.getItem(contentKey(book.id));
    const stored = raw ? (JSON.parse(raw) as StoredContent) : null;

    return {
      bookId: book.id,
      paragraphs: stored?.paragraphs ?? [],
      chapters: stored?.chapters ?? [],
    };
  } catch {
    return { bookId: book.id, paragraphs: [], chapters: [] };
  }
}

/**
 * Розбір завантаженого файлу. EPUB → абзаци й зміст; PDF чи пошкоджений файл —
 * порожньо (рідер покаже пояснення). Збій розбору не скасовує надсилання книги.
 */
export async function saveUploadedContent(bookId: string, uri: string, isEpub: boolean) {
  if (!isEpub) {
    return;
  }

  try {
    const parsed = parseEpub(await readFileBytes(uri));

    if (parsed) {
      await kvStorage.setItem(contentKey(bookId), JSON.stringify(parsed));
    }
  } catch {
    // Не EPUB або не вдалося прочитати — книга лишається без тексту
  }
}

export async function removeContent(bookId: string): Promise<void> {
  try {
    await kvStorage.removeItem(contentKey(bookId));
  } catch {
    // Нема чого видаляти
  }
}
