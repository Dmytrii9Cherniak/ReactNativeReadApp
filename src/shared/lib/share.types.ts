export interface ShareContent {
  /** Текст повідомлення: назва книги, цитата… */
  message: string;
  /** Шлях у застосунку, напр. `/book/b-02` — перетвориться на посилання */
  path: string;
}

/** Як поділились: системним меню чи посилання скопійовано (web без Web Share API). */
export type ShareResult = 'shared' | 'copied' | 'dismissed';
