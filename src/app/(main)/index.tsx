import { LibraryScreen } from '@/features/catalog';
import { ContinueReading } from '@/features/reader';

/** Бібліотека + «Продовжити читання» над сіткою (дві фічі збираються тут, у маршруті). */
export default function LibraryRoute() {
  return <LibraryScreen header={<ContinueReading />} />;
}
