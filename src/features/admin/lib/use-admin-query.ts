import { useEffect, useState } from 'react';

import { useAsync } from '@/shared/hooks/use-async';

import { adminApi } from '../admin.api';

/**
 * Дані екрана адмінки: завантажуються за `key`, перечитуються після дії (`refresh`)
 * і самі, коли на сервері змінилась черга (нова заявка від користувача).
 */
export function useAdminQuery<T>(key: string, load: () => Promise<T>) {
  const [version, setVersion] = useState(0);
  const state = useAsync(`${key}#${version}`, load);
  const refresh = () => setVersion((value) => value + 1);

  useEffect(() => adminApi.subscribe(() => setVersion((value) => value + 1)), []);

  return { state, refresh };
}
