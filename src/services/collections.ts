import { api } from './api';
import type { PaginatedResponse } from '@/types';

type Params = Record<string, string | number | boolean | undefined>;

export function normalizePage<T>(
  data: T[] | PaginatedResponse<T>,
): PaginatedResponse<T> {
  if (Array.isArray(data))
    return { count: data.length, next: null, previous: null, results: data };
  if (data && Array.isArray(data.results)) return data;
  throw new Error('Serverdan kutilmagan ma’lumot keldi. Qayta urinib ko‘ring.');
}

export function nextPageNumber(next: string | null): number | undefined {
  if (!next) return undefined;
  const page = Number(
    new URL(next, 'https://pagination.local').searchParams.get('page'),
  );
  return Number.isSafeInteger(page) && page > 0 ? page : undefined;
}

/** Follow DRF pagination without ever forwarding the access token to a next URL's host. */
export async function fetchCollection<T>(
  path: string,
  params?: Params,
): Promise<T[]> {
  const items: T[] = [];
  const seen = new Set<string>();
  let query = params;
  for (let page = 0; page < 1000; page++) {
    const response = await api.get<T[] | PaginatedResponse<T>>(path, {
      params: query,
    });
    const data = normalizePage(response.data);
    items.push(...data.results);
    if (!data.next) return items;
    const next = new URL(data.next, 'https://pagination.local').search;
    if (!next || seen.has(next))
      throw new Error('Sahifalashda xatolik yuz berdi. Qayta urinib ko‘ring.');
    seen.add(next);
    query = { ...params, ...Object.fromEntries(new URLSearchParams(next)) };
  }
  throw new Error('Ma’lumotlar hajmi juda katta. Qidiruvni aniqlashtiring.');
}
