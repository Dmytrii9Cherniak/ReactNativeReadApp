import type { BookLanguage } from '@/features/catalog';

/** Файл книги, обраний на пристрої. */
export interface BookFile {
  name: string;
  uri: string;
  mimeType: string | null;
}

export interface BookSubmission {
  title: string;
  author: string;
  description: string;
  language: BookLanguage;
  file: BookFile;
  cover: BookFile | null;
}

export type SubmissionStatus = 'pending' | 'published' | 'hidden' | 'rejected';

export interface MySubmission {
  id: string;
  kind: 'book' | 'story';
  title: string;
  status: SubmissionStatus;
  rejectReason: string | null;
  submittedAt: string;
}
