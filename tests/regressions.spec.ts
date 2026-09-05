import { expect, test, type Route } from '@playwright/test';
import { futureDate, mockApi, users } from './fixtures';
import { formatDateUz, parseLocalDate } from '../src/utils/date';

const outage = {
  status: 503,
  contentType: 'application/json',
  body: JSON.stringify({ detail: 'Service unavailable' }),
};
const expired = {
  status: 401,
  contentType: 'application/json',
  body: JSON.stringify({ detail: 'Token expired' }),
};

test('completed registration cannot be submitted again when automatic sign-in fails', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.route('**/api/v1/auth/jwt/create/', (route) =>
    route.fulfill(expired),
  );
  await page.goto('/register');
  await page.getByLabel('Ismingiz', { exact: true }).fill('Yangi Mijoz');
  await page.getByLabel('Telefon raqam', { exact: true }).fill('90 333 33 33');
  await page.getByLabel('Parol', { exact: true }).fill('password-1234');
  await page.getByLabel('Parolni tasdiqlang').fill('password-1234');
  await page
    .getByRole('button', { name: 'Ro‘yxatdan o‘tish', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Hisob yaratildi, ammo avtomatik kirish yakunlanmadi.',
  );
  await expect(
    page.getByRole('button', { name: 'Hisob yaratildi', exact: true }),
  ).toBeDisabled();
  expect(
    state.requests.filter(
      (request) => request.path === '/auth/users/' && request.method === 'POST',
    ),
  ).toHaveLength(1);
  await page.getByRole('link', { name: 'Tizimga kiring', exact: true }).click();
  await expect(page).toHaveURL('/login');
});

test('refresh network failure preserves credentials, while an invalid refresh clears them', async ({
  page,
}) => {
  await mockApi(page, 'CLIENT');
  await page.route('**/api/v1/auth/users/me/', (route) =>
    route.fulfill(expired),
  );
  await page.route('**/api/v1/auth/jwt/refresh/', (route) =>
    route.fulfill(outage),
  );
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Kirish', exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('refresh_token'))).toBe(
    'test-refresh',
  );
  await page.route('**/api/v1/auth/jwt/refresh/', (route) =>
    route.fulfill(expired),
  );
  await page.reload();
  await expect(
    page.getByRole('link', { name: 'Kirish', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => [
      localStorage.getItem('access_token'),
      localStorage.getItem('refresh_token'),
    ]),
  ).toEqual([null, null]);
});

test('late unauthorized responses from a logged-out account never retry under the next account', async ({
  page,
  isMobile,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  let pending: Route | undefined;
  let ownedRequests = 0;
  await page.route('**/api/v1/venues/halls/**', async (route) => {
    if (
      new URL(route.request().url()).searchParams.get('my_venues') === 'true'
    ) {
      ownedRequests++;
      if (!pending) {
        pending = route;
        return;
      }
    }
    return route.fallback();
  });
  await page.goto('/dashboard/venues');
  await expect.poll(() => !!pending).toBe(true);
  if (isMobile)
    await page.getByRole('button', { name: 'Menyuni ochish' }).click();
  await page.getByRole('button', { name: 'Chiqish', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Xush kelibsiz' }),
  ).toBeVisible();
  state.user = structuredClone(users.find((user) => user.role === 'CLIENT')!);
  await page.getByLabel('Telefon raqam', { exact: true }).fill('90 333 33 33');
  await page.getByLabel('Parol', { exact: true }).fill('password-1234');
  await page.getByRole('button', { name: 'Kirish', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByText('Sokin Lounge', { exact: true })).toBeVisible();
  await pending!.fulfill(expired);
  // A fresh public navigation also flushes any late response handlers.
  await page
    .getByRole('link', { name: 'To‘y zallari', exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/category=halls/);
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toBeVisible();
  expect(ownedRequests).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('access_token'))).toBe(
    'logged-in-access',
  );
});

test('creating a venue submits multipart media and redirects to its editable saved record', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/add');
  await page
    .getByLabel('Joy nomi *', { exact: true })
    .fill('Yangi Marosim Zali');
  await page
    .getByLabel('Tavsif *', { exact: true })
    .fill('Yangi, keng va yorug‘ marosimlar zali.');
  await page.getByLabel('Viloyat *', { exact: true }).selectOption('1');
  await page.getByLabel('Tuman / shahar *', { exact: true }).selectOption('1');
  await page
    .getByLabel('Aniq manzil *', { exact: true })
    .fill('Toshkent shahri, 20-uy');
  await page
    .getByLabel('Kishi boshiga narx (UZS)', { exact: true })
    .fill('180000');
  await page
    .getByLabel('Talab qilinadigan zakalat (UZS) *', { exact: true })
    .fill('1000000');
  await page
    .getByLabel('Asosiy rasmni yuklash')
    .setInputFiles('public/images/hero-hall.jpg');
  await page
    .getByLabel('Rasm qo‘shish', { exact: true })
    .setInputFiles([
      'public/images/hero-hall.jpg',
      'public/images/auth-side.jpg',
    ]);
  await page
    .getByRole('checkbox', { name: 'Bepul Wi-Fi', exact: true })
    .check();
  await page
    .getByRole('button', { name: 'Joyni saqlash', exact: true })
    .click();
  await expect(page).toHaveURL('/dashboard/venues/halls/4');
  await expect(page.getByLabel('Joy nomi *', { exact: true })).toHaveValue(
    'Yangi Marosim Zali',
  );
  const payload = state.requests.find(
    (request) => request.path === '/venues/halls/' && request.method === 'POST',
  )!.body;
  expect(payload).toMatchObject({
    name: 'Yangi Marosim Zali',
    region: '1',
    district: '1',
    price_per_person: '180000',
    cover_image: { filename: 'hero-hall.jpg' },
    gallery_images: [
      { filename: 'hero-hall.jpg' },
      { filename: 'auth-side.jpg' },
    ],
  });
  expect(JSON.parse(String(payload.amenities))).toContain('wifi');
});

test('failed venue saves preserve drafts and do not overwrite persisted records', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.route('**/api/v1/venues/bars/1/', (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill(outage)
      : route.fallback(),
  );
  await page.goto('/dashboard/venues/bars/1');
  await expect(page.getByLabel('Viloyat *', { exact: true })).toHaveValue('1');
  await expect(
    page.getByLabel('Tuman / shahar *', { exact: true }),
  ).toHaveValue('1');
  await page
    .getByLabel('Joy nomi *', { exact: true })
    .fill('Saqlanmagan o‘zgarish');
  await page
    .getByRole('button', { name: 'O‘zgarishlarni saqlash', exact: true })
    .click();
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Xizmat vaqtincha ishlamayapti');
  await expect(page.getByLabel('Joy nomi *', { exact: true })).toHaveValue(
    'Saqlanmagan o‘zgarish',
  );
  expect(state.bars[0].name).toBe('Sokin Lounge');
});

test('hall setup creates real shifts and package totals', async ({ page }) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues/halls/1');
  const shifts = page.getByRole('form', {
    name: 'Smena qo‘shish',
    exact: true,
  });
  await shifts.getByLabel('Smena nomi', { exact: true }).fill('Ertalab');
  await shifts.getByLabel('Boshlanish', { exact: true }).fill('08:00');
  await shifts.getByLabel('Tugash', { exact: true }).fill('10:00');
  await shifts
    .getByRole('button', { name: 'Smena qo‘shish', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Smena qo‘shildi.');
  const packages = page.getByRole('form', {
    name: 'Paket qo‘shish',
    exact: true,
  });
  await packages.getByLabel('Mehmonlar soni', { exact: true }).fill('100');
  await packages
    .getByLabel('Jami narx (UZS)', { exact: true })
    .fill('12000000');
  await packages
    .getByRole('button', { name: 'Paket qo‘shish', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Narx paketi qo‘shildi.',
  );
  expect(
    state.requests.find(
      (request) =>
        request.path === '/venues/shifts/' && request.method === 'POST',
    )?.body,
  ).toMatchObject({ hall: 1, start_time: '08:00:00', end_time: '10:00:00' });
  expect(
    state.requests.find(
      (request) =>
        request.path === '/venues/packages/' && request.method === 'POST',
    )?.body,
  ).toMatchObject({ hall: 1, guest_count: 100, price: '12000000' });
});

test('calendar and booking date selection remain synchronized across months', async ({
  page,
}) => {
  await mockApi(page, 'CLIENT');
  await page.goto(`/venues/halls/1?date=${futureDate()}`);
  const calendar = page.getByRole('region', {
    name: 'Bandlik taqvimi',
    exact: true,
  });
  await expect(
    calendar.getByRole('button', {
      name: formatDateUz(futureDate()),
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  const anotherMonth = futureDate(40);
  const nearbyDate = futureDate(
    parseLocalDate(anotherMonth)!.getDate() === 1 ? 41 : 39,
  );
  await page.getByLabel('1. Tadbir sanasi', { exact: true }).fill(anotherMonth);
  await expect(
    calendar.getByRole('button', {
      name: formatDateUz(anotherMonth),
      exact: true,
    }),
  ).toHaveAttribute('aria-pressed', 'true');
  await calendar
    .getByRole('button', { name: formatDateUz(nearbyDate), exact: true })
    .click();
  await calendar
    .getByRole('button', { name: 'Shu sanani tanlash', exact: true })
    .click();
  await expect(
    page.getByLabel('1. Tadbir sanasi', { exact: true }),
  ).toHaveValue(nearbyDate);
});

test('malformed calendar data is unknown availability, not a free booking slot', async ({
  page,
}) => {
  await mockApi(page, 'CLIENT');
  await page.route('**/api/v1/bookings/calendar/bar/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ unexpected: [] }),
    }),
  );
  await page.goto(`/venues/bars/1?date=${futureDate()}`);
  await expect(
    page.getByText(
      'Taqvimni yuklab bo‘lmadi. Bandlik holati hozircha noma’lum.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Bron so‘rovini yuborish' }),
  ).toBeDisabled();
});

test('successful admin user blocking and venue approval update the actual API record', async ({
  page,
}) => {
  const state = await mockApi(page, 'ADMIN');
  await page.goto('/admin/users');
  const client = page.getByRole('row').filter({ hasText: '+998903333333' });
  await client.getByRole('button', { name: 'Bloklash', exact: true }).click();
  await expect(client.getByText('Bloklangan', { exact: true })).toBeVisible();
  expect(state.users.find((user) => user.id === 3)!.is_active).toBe(false);
  await page.goto('/admin/venues');
  const hall = page.getByRole('row').filter({ hasText: 'Zarafshon zali' });
  await hall.getByRole('button', { name: 'Tasdiqlash', exact: true }).click();
  await expect(hall.getByText('Tasdiqlangan', { exact: true })).toBeVisible();
  expect(state.halls.find((venue) => venue.id === 2)!.is_approved).toBe(true);
});

test('empty datasets show honest empty states instead of fake cards or bookings', async ({
  page,
}) => {
  await mockApi(page, 'VENUE_OWNER', { empty: true });
  await page.goto('/dashboard/venues');
  await expect(
    page
      .getByRole('main')
      .getByRole('link', { name: /Yangi joy qo[‘']shish/ })
      .first(),
  ).toBeVisible();
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toHaveCount(
    0,
  );
  await expect(
    page.getByRole('button', { name: 'Keyingi', exact: true }),
  ).toHaveCount(0);
  await page.goto('/dashboard/bookings');
  await expect(
    page.getByText(/kelib tushgan bronlar yo‘q|kelib tushgan bronlar yo'q/),
  ).toHaveCount(2);
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('mobile booking tables scroll without splitting phone numbers or duplicating header labels', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'This regression affects compact layouts.');
  await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/bookings');
  await expect(page.getByRole('banner').locator('.badge-outline')).toBeHidden();
  const phone = page
    .getByRole('cell', { name: '+998903333333', exact: true })
    .first();
  await expect(phone).toBeVisible();
  expect(
    await phone.evaluate((cell) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      return range.getClientRects().length;
    }),
  ).toBe(1);
  const region = page
    .getByRole('region', { name: 'Bronlar jadvali', exact: true })
    .first();
  expect(
    await region.evaluate(
      (element) => element.scrollWidth > element.clientWidth,
    ),
  ).toBe(true);
  await region.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await expect(
    region.getByRole('button', { name: 'Rad etish', exact: true }),
  ).toBeInViewport();
});

test('mobile visitors can jump directly to the booking form', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Desktop has an adjacent sticky booking form.');
  await mockApi(page);
  await page.goto('/venues/halls/1');
  await page.getByRole('link', { name: 'Bron qilish', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Zalni band qilish', exact: true }),
  ).toBeInViewport();
});
