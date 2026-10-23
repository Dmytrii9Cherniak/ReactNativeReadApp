import * as DocumentPicker from 'expo-document-picker';

import type { BookFile } from '../types';

export const BOOK_FILE_TYPES = ['application/epub+zip', 'application/pdf'];
export const COVER_FILE_TYPES = ['image/*'];

/** Вибір файлу на пристрої; null — користувач передумав. */
export async function pickFile(types: string[]): Promise<BookFile | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: types, copyToCacheDirectory: true });

  if (result.canceled) {
    return null;
  }

  const [asset] = result.assets;

  return { name: asset.name, uri: asset.uri, mimeType: asset.mimeType ?? null };
}
