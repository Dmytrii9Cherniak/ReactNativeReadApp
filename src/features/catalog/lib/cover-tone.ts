import { coverTones } from '@/shared/theme';

/** Стабільний тон заглушки обкладинки: та сама книга — завжди той самий колір. */
export function getCoverTone(bookId: string): string {
  let hash = 0;

  for (const char of bookId) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }

  return coverTones[Math.abs(hash) % coverTones.length];
}
