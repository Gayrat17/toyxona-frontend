import { expect, test } from '@playwright/test';
import { formatPhoneNumber, isValidPhoneNumber } from '../src/services/auth';
import {
  normalizePage,
  nextPageNumber,
  fetchCollection,
} from '../src/services/collections';
import { api } from '../src/services/api';
import { safeExternalUrl, safeRedirect } from '../src/utils/navigation';
import {
  localDateString,
  parseLocalDate,
  timeMinutes,
  timesOverlap,
} from '../src/utils/date';
import { activeBooking, busyShift, formatMoney } from '../src/utils/booking';
import { getMediaUrl } from '../src/utils/media';
import { getErrorMessage } from '../src/utils/errors';
import { readCatalogFilters, catalogSearchParams } from '../src/utils/catalog';
import { moneySchema, venueFormSchema } from '../src/lib/venue-form-schema';

test('phone normalization accepts Uzbek national and international formats only', () => {
  for (const value of [
    '90 123 45 67',
    '(90) 123-45-67',
    '+998 90 123 45 67',
    '998901234567',
  ]) {
    expect(formatPhoneNumber(value)).toBe('+998901234567');
    expect(isValidPhoneNumber(value)).toBe(true);
  }
  for (const value of ['', '+1901234567', '90123456', '9989012345678'])
    expect(isValidPhoneNumber(value)).toBe(false);
});

test('redirects stay internal, honor roles and reject encoded bypasses', () => {
  for (const value of [
    null,
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/%5cexample.com',
    '/%2fexample.com',
    '/%61dmin/users',
    '/admin/users',
    '/dashboard/venues',
    '/login?next=/',
    '/%E0%A4%A',
  ])
    expect(safeRedirect(value, 'CLIENT')).toBe('/');
  expect(
    safeRedirect('/venues/bars/2?date=2026-12-31#booking-form', 'CLIENT'),
  ).toBe('/venues/bars/2?date=2026-12-31#booking-form');
  expect(safeRedirect('/dashboard/bookings', 'VENUE_OWNER')).toBe(
    '/dashboard/bookings',
  );
  expect(safeRedirect('/admin/users', 'ADMIN')).toBe('/admin/users');
  expect(safeExternalUrl('javascript:alert(1)')).toBeUndefined();
  expect(safeExternalUrl('https://example.com/map')).toBe(
    'https://example.com/map',
  );
});

test('dates round-trip locally and reject overflow dates', () => {
  expect(localDateString(new Date(2026, 8, 5))).toBe('2026-09-05');
  expect(localDateString(parseLocalDate('2028-02-29')!)).toBe('2028-02-29');
  for (const value of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '2026-00-05',
    '2026-1-01',
    '2026-09-05T00:00:00Z',
  ])
    expect(parseLocalDate(value)).toBeNull();
});

test('time validation uses half-open slots, so adjacent reservations do not overlap', () => {
  expect(timeMinutes('23:59:59')).toBe(1439);
  expect(timeMinutes('24:00')).toBeNaN();
  expect(timeMinutes('12:60')).toBeNaN();
  expect(timesOverlap('20:00', '22:00', '18:00', '20:00')).toBe(false);
  expect(timesOverlap('19:59', '22:00', '18:00', '20:00')).toBe(true);
  expect(timesOverlap('17:00', '18:00', '18:00', '20:00')).toBe(false);
  expect(timesOverlap('17:00', '21:00', '18:00', '20:00')).toBe(true);
});

test('rejected and cancelled reservations are not busy, but unknown status and blocks are', () => {
  for (const status of ['PENDING', 'CONFIRMED', 'HOLD', undefined] as const)
    expect(activeBooking(status)).toBe(true);
  for (const status of ['CANCELLED', 'REJECTED'] as const)
    expect(activeBooking(status)).toBe(false);
  expect(
    busyShift({
      date: '2026-09-06',
      shift_id: 1,
      shift_name: 'Test',
      status: 'BLOCKED',
      booking_status: 'CANCELLED',
    }),
  ).toBe(true);
  expect(formatMoney(undefined)).toBe('—');
  expect(formatMoney('')).toBe('—');
  expect(formatMoney('invalid')).toBe('—');
  expect(formatMoney(0)).toBe('0 UZS');
});

test('media stays reachable through the proxy and unsafe protocols are rejected', () => {
  expect(getMediaUrl('http://127.0.0.1:8000/media/hall.jpg')).toBe(
    '/media/hall.jpg',
  );
  expect(getMediaUrl('media/hall.jpg')).toBe('/media/hall.jpg');
  expect(getMediaUrl('https://cdn.example.com/photo.jpg')).toBe(
    'https://cdn.example.com/photo.jpg',
  );
  for (const value of [
    'javascript:alert(1)',
    '//example.com/photo.jpg',
    'http://localhost:8000/internal.png',
    'data:text/html,hello',
  ])
    expect(getMediaUrl(value)).toBe('');
});

test('money and capacity schemas reject non-finite, negative and fractional values', () => {
  for (const value of ['0', '150000', '150000.50', ' 150000.50 '])
    expect(moneySchema.safeParse(value).success).toBe(true);
  for (const value of [
    '',
    '-1',
    'NaN',
    'Infinity',
    '1e6',
    '12.345',
    '1000000000001',
  ])
    expect(moneySchema.safeParse(value).success).toBe(false);
  const valid = {
    venue_type: 'BAR',
    name: 'Valid name',
    description: 'Valid description',
    region: '1',
    district: '1',
    address: 'Valid address',
    capacity: 40,
    required_deposit: '0',
    price_per_unit: '250000',
    map_link: '',
    video_url: '',
    amenities: [],
  };
  expect(venueFormSchema.safeParse(valid).success).toBe(true);
  expect(venueFormSchema.safeParse({ ...valid, capacity: 40.5 }).success).toBe(
    false,
  );
  expect(
    venueFormSchema.safeParse({ ...valid, map_link: 'javascript:alert(1)' })
      .success,
  ).toBe(false);
});

test('catalog URLs normalize untrusted values without losing valid filters', () => {
  const filters = readCatalogFilters(
    new URLSearchParams(
      'category=unknown&min_capacity=Infinity&district=5&date=2026-02-30',
    ),
  );
  expect(filters).toMatchObject({
    category: 'all',
    min_capacity: 0,
    district: '',
    date: '',
  });
  const valid = readCatalogFilters(
    new URLSearchParams(
      'category=bars&region=1&district=2&min_capacity=45&search=%20Test%20',
    ),
  );
  expect(catalogSearchParams(valid).toString()).toBe(
    'category=bars&region=1&district=2&search=Test&min_capacity=45',
  );
});

test('field errors remain useful, while server HTML and outages get safe messages', () => {
  expect(
    getErrorMessage({
      isAxiosError: true,
      response: { status: 400, data: { district: ['Select a valid choice.'] } },
    }),
  ).toBe('Tuman: Select a valid choice.');
  expect(
    getErrorMessage({
      isAxiosError: true,
      response: { status: 500, data: '<html>stack trace</html>' },
    }),
  ).not.toContain('<html>');
  expect(getErrorMessage({ isAxiosError: true })).toContain(
    'Server bilan bog‘lanib bo‘lmadi',
  );
});

test('pagination supports arrays, rejects bad shapes and extracts the real page number', () => {
  expect(normalizePage([{ id: 1 }])).toEqual({
    count: 1,
    next: null,
    previous: null,
    results: [{ id: 1 }],
  });
  expect(() => normalizePage(null as never)).toThrow('Serverdan kutilmagan');
  expect(
    nextPageNumber('http://127.0.0.1:8000/api/v1/venues/halls/?page=7'),
  ).toBe(7);
  for (const next of [null, '?page=-1', '?page=0', '?page=1.5', '?page=NaN'])
    expect(nextPageNumber(next)).toBeUndefined();
});

test('collection pagination never forwards credentials to a next-link host', async () => {
  const previousAdapter = api.defaults.adapter;
  const calls: { url: string | undefined; params: unknown }[] = [];
  api.defaults.adapter = async (config) => {
    calls.push({ url: config.url, params: config.params });
    return {
      config,
      headers: {},
      status: 200,
      statusText: 'OK',
      data: {
        count: 2,
        previous: null,
        next:
          calls.length === 1 ? 'https://external.example/steal?page=2' : null,
        results: [{ id: calls.length }],
      },
    };
  };
  try {
    expect(
      await fetchCollection('/venues/halls/', { my_venues: true }),
    ).toEqual([{ id: 1 }, { id: 2 }]);
    expect(calls).toEqual([
      { url: '/venues/halls/', params: { my_venues: true } },
      { url: '/venues/halls/', params: { my_venues: true, page: '2' } },
    ]);
  } finally {
    api.defaults.adapter = previousAdapter;
  }
});

test('looping pagination produces an error instead of an infinite request loop', async () => {
  const previousAdapter = api.defaults.adapter;
  let requests = 0;
  api.defaults.adapter = async (config) => {
    requests++;
    return {
      config,
      headers: {},
      status: 200,
      statusText: 'OK',
      data: { count: 3, previous: null, next: '?page=2', results: [] },
    };
  };
  try {
    await expect(fetchCollection('/venues/halls/')).rejects.toThrow(
      'Sahifalashda xatolik',
    );
    expect(requests).toBe(2);
  } finally {
    api.defaults.adapter = previousAdapter;
  }
});
