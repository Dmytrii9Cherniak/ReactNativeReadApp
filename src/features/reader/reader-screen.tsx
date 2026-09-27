import { Stack } from 'expo-router';

import { useBook, type Book } from '@/features/library';
import { CenteredMessage } from '@/shared/ui';

import { PdfBook } from './components/pdf-book';
import { TextReader } from './components/text-reader';

export function ReaderScreen({ bookId }: { bookId: string }) {
  const book = useBook(bookId);

  if (!book) {
    return <CenteredMessage title="Книгу не знайдено" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <BookReader book={book} />
    </>
  );
}

/** Вибір рідера за форматом. */
function BookReader({ book }: { book: Book }) {
  switch (book.format) {
    case 'txt':
      return <TextReader book={book} />;
    case 'pdf':
      return <PdfBook book={book} />;
    case 'epub':
      return (
        <CenteredMessage
          title="Формат у розробці"
          description="Рідер для EPUB буде на наступних кроках"
        />
      );
  }
}
