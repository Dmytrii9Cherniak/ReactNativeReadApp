export type ModerationKind = 'book' | 'story';

/** Елемент черги перевірки — книга чи історія, надіслана користувачем. */
export interface ModerationItem {
  id: string;
  kind: ModerationKind;
  title: string;
  /** Автор книги або нік автора історії */
  author: string;
  submittedBy: string;
  submittedAt: string;
}
