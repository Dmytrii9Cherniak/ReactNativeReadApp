export interface PdfReaderProps {
  /** file:// на iOS/Android, blob: на web */
  uri: string;
  /** Сторінка, з якої відкрити документ (з 1). Читається лише при монтуванні. */
  initialPage: number;
  onPageChange: (page: number, pageCount: number) => void;
}
