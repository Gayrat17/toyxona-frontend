import { localDateString, parseLocalDate } from './date';

export interface CatalogFilters {
  category: 'all' | 'halls' | 'bars';
  region: string;
  district: string;
  search: string;
  min_capacity: number;
  date: string;
}

export const EMPTY_FILTERS: CatalogFilters = {
  category: 'all',
  region: '',
  district: '',
  search: '',
  min_capacity: 0,
  date: '',
};

export function readCatalogFilters(
  params: Pick<URLSearchParams, 'get'>,
): CatalogFilters {
  const category = params.get('category');
  const capacity = Number(params.get('min_capacity'));
  const date = params.get('date') || '';
  const region = /^\d+$/.test(params.get('region') || '')
    ? params.get('region')!
    : '';
  return {
    category: category === 'halls' || category === 'bars' ? category : 'all',
    region,
    district:
      region && /^\d+$/.test(params.get('district') || '')
        ? params.get('district')!
        : '',
    search: (params.get('search') || '').trim(),
    min_capacity:
      Number.isFinite(capacity) && capacity > 0
        ? Math.min(1000, Math.floor(capacity))
        : 0,
    date: parseLocalDate(date) && date >= localDateString() ? date : '',
  };
}

export function catalogSearchParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.region) params.set('region', filters.region);
  if (filters.region && filters.district)
    params.set('district', filters.district);
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.min_capacity > 0)
    params.set('min_capacity', String(filters.min_capacity));
  if (filters.date) params.set('date', filters.date);
  return params;
}
