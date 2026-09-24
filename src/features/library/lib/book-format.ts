import { SUPPORTED_FORMATS, type BookFormat } from '../types';

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
