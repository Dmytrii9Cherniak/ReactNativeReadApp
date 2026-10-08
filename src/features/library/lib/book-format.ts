import { SUPPORTED_FORMATS, type BookFormat, type ReadingProgress } from '../types';

/** 'Book.PDF' -> 'pdf', 'notes.docx' -> null */
export function detectBookFormat(fileName: string): BookFormat | null {
  const ext = fileName.split('.').pop()?.toLowerCase();

  return SUPPORTED_FORMATS.find((f) => f === ext) ?? null;
}

export function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '');
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) {
    return '';
  }

  const mb = bytes / 1024 / 1024;

  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Підпис прогресу в списку: «12 / 340» для сторінок, «37%» для решти. */
export function formatProgress({ location, fraction }: ReadingProgress): string {
  switch (location.type) {
    case 'page':
      return `${location.page} / ${location.pageCount}`;
    case 'cfi':
    case 'line':
      return `${Math.round(fraction * 100)}%`;
  }
}
