import { env } from '@/config/env';

import { ApiError, NETWORK_ERROR, toApiError } from './api-error';

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** Для захищених ендпоінтів — підставляє `Authorization: Bearer` */
  accessToken?: string;
}

async function send(path: string, { method = 'GET', body, accessToken }: RequestOptions) {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR, "Немає зв'язку з сервером");
  }

  if (!response.ok) {
    throw toApiError(response.status, await response.json().catch(() => null));
  }

  return response;
}

/** Запит з JSON-відповіддю. */
export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await send(path, options);

  return (await response.json()) as T;
}

/** Запит без тіла відповіді (204). */
export async function requestVoid(path: string, options: RequestOptions = {}): Promise<void> {
  await send(path, options);
}
