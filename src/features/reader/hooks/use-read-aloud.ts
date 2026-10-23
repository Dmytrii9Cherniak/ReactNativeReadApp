import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';

import type { BookLanguage } from '@/features/catalog';
import { runInBackground } from '@/shared/lib/background';

export const SPEECH_RATES = [0.75, 1, 1.25, 1.5] as const;

const VOICE_LANGUAGE: Record<BookLanguage, string> = { uk: 'uk-UA', en: 'en-US' };

interface ReadAloudOptions {
  paragraphs: string[];
  language: BookLanguage;
  /** Озвучення перейшло на абзац — рідер прокручує до нього */
  onParagraph: (index: number) => void;
  /** Голосу для мови немає або синтез недоступний */
  onError: () => void;
}

/**
 * Озвучення голосом системи (expo-speech): абзац за абзацом з обраного місця.
 * Кожен запуск має свій номер — щоб старий запуск після «Стоп» не продовжив читати.
 */
export function useReadAloud({ paragraphs, language, onParagraph, onError }: ReadAloudOptions) {
  const [current, setCurrent] = useState<number | null>(null);
  const [rate, setRate] = useState<number>(1);
  const sessionRef = useRef(0);
  const onParagraphRef = useRef(onParagraph);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onParagraphRef.current = onParagraph;
    onErrorRef.current = onError;
  });

  const speakFrom = (index: number, speechRate: number, session: number) => {
    if (session !== sessionRef.current || index >= paragraphs.length) {
      setCurrent(null);

      return;
    }

    setCurrent(index);
    onParagraphRef.current(index);
    // Android не озвучує текст, довший за maxSpeechInputLength
    Speech.speak(paragraphs[index].slice(0, Speech.maxSpeechInputLength), {
      language: VOICE_LANGUAGE[language],
      rate: speechRate,
      onDone: () => speakFrom(index + 1, speechRate, session),
      onError: () => {
        // Помилка старого запуску (після «Стоп» чи зміни швидкості) — не наша
        if (session !== sessionRef.current) {
          return;
        }

        setCurrent(null);
        onErrorRef.current();
      },
    });
  };

  const start = (index: number, speechRate = rate) => {
    sessionRef.current += 1;

    const session = sessionRef.current;

    runInBackground(async () => {
      await Speech.stop();
      speakFrom(index, speechRate, session);
    });
  };

  const stop = () => {
    sessionRef.current += 1;
    setCurrent(null);
    runInBackground(() => Speech.stop());
  };

  /** Нова швидкість застосовується з поточного абзацу */
  const changeRate = (next: number) => {
    setRate(next);

    if (current !== null) {
      start(current, next);
    }
  };

  // Вийшли з рідера — замовкаємо
  useEffect(
    () => () => {
      sessionRef.current += 1;
      runInBackground(() => Speech.stop());
    },
    [],
  );

  return { current, isSpeaking: current !== null, rate, start, stop, changeRate };
}
