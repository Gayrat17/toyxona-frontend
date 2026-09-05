import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { futureDate, mockApi } from './fixtures';

const unavailable = {
  status: 503,
  contentType: 'application/json',
  body: JSON.stringify({ detail: 'Service unavailable' }),
};

test('catalog sends and preserves filters, including the event date', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto('/');
  await page.getByLabel('Viloyat', { exact: true }).selectOption('1');
  await page.getByLabel('Tuman', { exact: true }).selectOption('1');
  await page.getByLabel('Joy nomi', { exact: true }).fill('Navro‘z');
  await page.getByLabel('Tadbir sanasi').fill(futureDate());
  await page.getByRole('button', { name: 'Qidirish', exact: true }).click();
  await expect(page).toHaveURL(/date=/);
  await expect
    .poll(
      () =>
        state.requests.filter(
          (request) =>
            request.path === '/venues/halls/' &&
            request.query.date === futureDate(),
        ).length,
    )
    .toBeGreaterThan(0);
  const request = state.requests.find(
    (item) =>
      item.path === '/venues/halls/' && item.query.date === futureDate(),
  )!;
  expect(request.query).toMatchObject({
    region: '1',
    district: '1',
    search: 'Navro‘z',
    date: futureDate(),
  });
  await page.reload();
  await expect(page.getByLabel('Joy nomi', { exact: true })).toHaveValue(
    'Navro‘z',
  );
  await expect(page.getByLabel('Tadbir sanasi')).toHaveValue(futureDate());
  await expect(page.locator('a[href^="/venues/halls/1?date="]')).toBeVisible();
});

test('catalog paginates beyond the first page and invalid categories fall back safely', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/?category=invalid');
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toBeVisible();
  await expect(page.getByText('Sokin Lounge', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Yana ko‘rsatish' }).click();
  await expect(page.getByText('Zarafshon zali', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Yana ko‘rsatish' }),
  ).toHaveCount(0);
});

test('catalog keeps successful results and ignores errors from inactive categories', async ({
  page,
}) => {
  await mockApi(page);
  await page.route('**/api/v1/venues/halls/**', (route) =>
    route.fulfill(unavailable),
  );
  await page.goto('/');
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Ayrim joylarni');
  await expect(page.getByText('Sokin Lounge', { exact: true })).toBeVisible();
  await page
    .getByRole('group', { name: 'Joy turi' })
    .getByRole('button', { name: 'Barlar', exact: true })
    .click();
  await expect(page).toHaveURL(/category=bars/);
  await expect(page.getByRole('alert', { name: 'Xatolik xabari' })).toHaveCount(
    0,
  );
});

test('protected routes preserve the destination and login returns to it', async ({
  page,
}) => {
  const state = await mockApi(page, undefined, { loginRole: 'VENUE_OWNER' });
  await page.goto('/dashboard/calendar');
  await expect(page).toHaveURL(/\/login\?next=/);
  await page
    .getByLabel('Telefon raqam', { exact: true })
    .fill('(90) 222-22-22');
  await page.getByLabel('Parol', { exact: true }).fill('test-password-123');
  await page.getByRole('button', { name: 'Kirish', exact: true }).click();
  await expect(page).toHaveURL('/dashboard/calendar');
  expect(
    state.requests.find((request) => request.path === '/auth/jwt/create/')?.body
      .phone_number,
  ).toBe('+998902222222');
});

test('bad login credentials stay on the form and never trigger token refresh', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.route('**/api/v1/auth/jwt/create/', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'No active account' }),
    }),
  );
  await page.goto('/login');
  await page.getByLabel('Telefon raqam', { exact: true }).fill('+998903333333');
  await page.getByLabel('Parol', { exact: true }).fill('wrong-password');
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByRole('button', { name: 'Kirish', exact: true }).click();
    await expect(
      page.getByRole('alert', { name: 'Xatolik xabari' }),
    ).toContainText('Telefon raqami yoki parol');
    await expect(
      page.getByRole('button', { name: 'Kirish', exact: true }),
    ).toBeEnabled();
  }
  await expect(page).toHaveURL(/\/login(?:\?next=.+)?$/);
  expect(
    state.requests.some((request) => request.path === '/auth/jwt/refresh/'),
  ).toBe(false);
});

test('registration validates confirmation and respects the owner invitation', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto('/register?role=VENUE_OWNER');
  await expect(page.getByRole('radio', { name: 'Joy egasi' })).toBeChecked();
  await page.getByLabel('Ismingiz', { exact: true }).fill('Yangi Egasi');
  await page.getByLabel('Telefon raqam', { exact: true }).fill('90 222 22 22');
  await page.getByLabel('Parol', { exact: true }).fill('password-1234');
  await page.getByLabel('Parolni tasdiqlang').fill('different-1234');
  await page
    .getByRole('button', { name: 'Ro‘yxatdan o‘tish', exact: true })
    .click();
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Parollar bir xil emas');
  expect(
    state.requests.some((request) => request.path === '/auth/users/'),
  ).toBe(false);
  await page.getByLabel('Parolni tasdiqlang').fill('password-1234');
  await page
    .getByRole('button', { name: 'Ro‘yxatdan o‘tish', exact: true })
    .click();
  await expect(page).toHaveURL('/dashboard/venues');
  expect(
    state.requests.find((request) => request.path === '/auth/users/')?.body
      .role,
  ).toBe('VENUE_OWNER');
});

test('a client cannot open admin pages', async ({ page }) => {
  const state = await mockApi(page, 'CLIENT');
  await page.goto('/admin/users');
  await expect(page).toHaveURL('/');
  expect(
    state.requests.some((request) => request.path.startsWith('/admin/')),
  ).toBe(false);
});

test('concurrent expired access tokens rotate once, including the refresh token', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  let refreshes = 0;
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    if (request.url().includes('/auth/jwt/refresh/')) {
      refreshes++;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access: 'new-access', refresh: 'new-refresh' }),
      });
    }
    if (request.headers().authorization === 'Bearer test-access')
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Expired token' }),
      });
    return route.fallback();
  });
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: 'Boshqaruv paneli' }),
  ).toBeVisible();
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toBeVisible();
  expect(refreshes).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('refresh_token'))).toBe(
    'new-refresh',
  );
  expect(
    state.requests
      .filter((request) => request.authorization)
      .every((request) => request.authorization === 'Bearer new-access'),
  ).toBe(true);
});

test('logout removes tokens and cached private data', async ({
  page,
  isMobile,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues');
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toBeVisible();
  if (isMobile)
    await page.getByRole('button', { name: 'Menyuni ochish' }).click();
  await page.getByRole('button', { name: 'Chiqish', exact: true }).click();
  await expect(page).toHaveURL(/\/login(?:\?next=.+)?$/);
  expect(
    await page.evaluate(() => [
      localStorage.getItem('access_token'),
      localStorage.getItem('refresh_token'),
    ]),
  ).toEqual([null, null]);
  const before = state.requests.length;
  await page.getByRole('link', { name: 'Bosh sahifaga qaytish' }).click();
  await expect(page.getByText('Navro‘z saroyi', { exact: true })).toBeVisible();
  expect(
    state.requests.slice(before).every((request) => !request.authorization),
  ).toBe(true);
});

test('owner pagination uses API links and tab switching resets the page', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues');
  await page.getByRole('button', { name: 'Keyingi', exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(page.getByText('Zarafshon zali', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Barlar / Lounge', exact: true })
    .click();
  await expect(page).toHaveURL(/tab=bars&page=1/);
  await expect(page.getByText('Sokin Lounge', { exact: true })).toBeVisible();
  expect(
    state.requests
      .filter((request) => /^\/venues\/(halls|bars)\/$/.test(request.path))
      .every((request) => request.query.my_venues === 'true'),
  ).toBe(true);
});

test('hall edit preserves prices, clears optional links and resets dependent districts', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues/halls/1');
  await expect(
    page.getByLabel('Kishi boshiga narx (UZS)', { exact: true }),
  ).toHaveValue('175000.00');
  await page
    .getByLabel('Kishi boshiga narx (UZS)', { exact: true })
    .fill('190000');
  await page
    .getByLabel('Xarita havolasi (ixtiyoriy)', { exact: true })
    .fill('');
  await page.getByLabel('Video havolasi (ixtiyoriy)', { exact: true }).fill('');
  await page.getByLabel('Viloyat *', { exact: true }).selectOption('2');
  await expect(
    page.getByLabel('Tuman / shahar *', { exact: true }),
  ).toHaveValue('');
  await page.getByLabel('Tuman / shahar *', { exact: true }).selectOption('2');
  await page
    .getByRole('button', { name: 'Galereya rasmi 1 ni o‘chirish', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'O‘zgarishlarni saqlash', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'O‘zgarishlar muvaffaqiyatli saqlandi',
  );
  expect(
    state.requests.find(
      (request) =>
        request.path === '/venues/halls/1/' && request.method === 'PATCH',
    )?.body,
  ).toMatchObject({
    price_per_person: '190000',
    map_link: '',
    video_url: '',
    region: '2',
    district: '2',
    deleted_gallery_ids: '[1]',
  });
});

test('bar details provide a working edit form instead of a read-only page', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues/bars/1');
  await page
    .getByLabel('Joy nomi *', { exact: true })
    .fill('Yangilangan Lounge');
  await page
    .getByLabel('1 soatlik ijara narxi (UZS) *', { exact: true })
    .fill('350000');
  await page
    .getByRole('button', { name: 'O‘zgarishlarni saqlash', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'O‘zgarishlar muvaffaqiyatli saqlandi',
  );
  expect(
    state.requests.find(
      (request) =>
        request.path === '/venues/bars/1/' && request.method === 'PATCH',
    )?.body,
  ).toMatchObject({ name: 'Yangilangan Lounge', price_per_hour: '350000' });
});

test('venue creation rejects invalid amounts and invalid image uploads', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/add');
  await page.getByLabel('Asosiy rasmni yuklash').setInputFiles({
    name: 'invalid.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg></svg>'),
  });
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('5 MB');
  await page.getByLabel('Joy nomi *', { exact: true }).fill('Yangi zal');
  await page
    .getByLabel('Tavsif *', { exact: true })
    .fill('Keng va yorug‘ yangi to‘y zali.');
  await page.getByLabel('Viloyat *', { exact: true }).selectOption('1');
  await page.getByLabel('Tuman / shahar *', { exact: true }).selectOption('1');
  await page
    .getByLabel('Aniq manzil *', { exact: true })
    .fill('Toshkent, 10-uy');
  await page
    .getByLabel('Kishi boshiga narx (UZS)', { exact: true })
    .fill('150000');
  await page
    .getByLabel('Talab qilinadigan zakalat (UZS) *', { exact: true })
    .fill('-500');
  await page
    .getByRole('button', { name: 'Joyni saqlash', exact: true })
    .click();
  await expect(page.locator('#required_deposit-error')).toBeVisible();
  expect(
    state.requests.some(
      (request) =>
        request.path === '/venues/halls/' && request.method === 'POST',
    ),
  ).toBe(false);
});

test('an owner cannot edit a venue belonging to somebody else', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  state.halls[0].owner = 99;
  await page.goto('/dashboard/venues/halls/1');
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Faqat o‘zingizga tegishli joyni');
  await expect(
    page.getByRole('button', { name: 'O‘zgarishlarni saqlash' }),
  ).toHaveCount(0);
});

test('owner calendar loads all owned halls and clears stale shift selections', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/calendar');
  await page
    .getByLabel('Restoranni tanlang', { exact: true })
    .selectOption('1');
  await page.getByLabel('Smenani tanlang', { exact: true }).selectOption('2');
  await page
    .getByLabel('Restoranni tanlang', { exact: true })
    .selectOption('2');
  await expect(page.getByLabel('Smenani tanlang', { exact: true })).toHaveValue(
    '',
  );
  await page.getByLabel('Smenani tanlang', { exact: true }).selectOption('3');
  await page.getByLabel('Yopiladigan sana').fill(futureDate());
  await page.getByLabel('Yopish sababi').fill('Ta’mirlash');
  await page
    .getByRole('button', { name: 'Smenani bloklash', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'Smena belgilangan sanada bloklandi',
  );
  expect(
    state.requests.find((request) => request.path === '/venues/blocks/')?.body,
  ).toMatchObject({ hall: 2, shift: 3, date: futureDate() });
  expect(
    state.requests
      .filter((request) => request.path === '/venues/halls/')
      .every((request) => request.query.my_venues === 'true'),
  ).toBe(true);
});

test('anonymous booking returns to the same venue and date after login', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto(`/venues/halls/1?date=${futureDate()}`);
  await page.getByRole('link', { name: 'Bron qilish uchun kirish' }).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  expect(new URL(page.url()).searchParams.get('next')).toBe(
    `/venues/halls/1?date=${futureDate()}`,
  );
  expect(
    state.requests.some(
      (request) =>
        request.path === '/bookings/hall/' && request.method === 'POST',
    ),
  ).toBe(false);
});

test('hall booking disables busy shifts, calculates prices and refreshes availability', async ({
  page,
}) => {
  const state = await mockApi(page, 'CLIENT');
  state.halls[0].owner_phone = undefined;
  await page.goto(`/venues/halls/1?date=${futureDate()}`);
  await expect(page.getByRole('radio', { name: /Tushlik/ })).toBeDisabled();
  await page.getByRole('radio', { name: /Kechki/ }).check();
  await page.getByRole('radio', { name: /300 kishilik/ }).check();
  await page.getByLabel('4. Bezatish (ixtiyoriy)').selectOption('1');
  await expect(page.getByText(/32[,\s]*000[,\s]*000 UZS/)).toBeVisible();
  await page.getByRole('button', { name: 'Bron so‘rovini yuborish' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText(
    'telefon raqami ko‘rsatilmagan',
  );
  await expect(page.getByRole('dialog')).not.toContainText('+998 90 123 45 67');
  expect(
    state.requests.find(
      (request) =>
        request.path === '/bookings/hall/' && request.method === 'POST',
    )?.body,
  ).toMatchObject({
    hall: 1,
    shift: 2,
    package: 1,
    decoration: 1,
    date: futureDate(),
  });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('radio', { name: /Kechki/ })).toBeDisabled();
});

test('calendar failure never displays false availability or enables booking', async ({
  page,
}) => {
  await mockApi(page, 'CLIENT');
  await page.route('**/api/v1/bookings/calendar/hall/**', (route) =>
    route.fulfill(unavailable),
  );
  await page.goto(`/venues/halls/1?date=${futureDate()}`);
  await expect(
    page.getByText(
      'Taqvimni yuklab bo‘lmadi. Bandlik holati hozircha noma’lum.',
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Bron so‘rovini yuborish' }),
  ).toBeDisabled();
  await expect(page.getByText('Bo‘sh', { exact: true })).toHaveCount(0);
});

test('bar booking rejects overlap and capacity overflow but accepts adjacent slots', async ({
  page,
}) => {
  const state = await mockApi(page, 'CLIENT');
  await page.goto(`/venues/bars/1?date=${futureDate()}`);
  await expect(
    page.getByText(/Tanlangan vaqt band vaqt bilan kesishmoqda/),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Bron so‘rovini yuborish' }),
  ).toBeDisabled();
  await page.getByLabel('Boshlanish', { exact: true }).fill('20:00');
  await page.getByLabel('3. Mehmonlar soni').fill('41');
  await expect(
    page.getByRole('button', { name: 'Bron so‘rovini yuborish' }),
  ).toBeDisabled();
  await page.getByLabel('3. Mehmonlar soni').fill('15');
  await page.getByRole('button', { name: 'Bron so‘rovini yuborish' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(
    state.requests.find(
      (request) =>
        request.path === '/bookings/bar/' && request.method === 'POST',
    )?.body,
  ).toMatchObject({ start_time: '20:00', end_time: '22:00', guest_count: 15 });
});

test('failed booking status updates remain errors instead of success', async ({
  page,
}) => {
  const state = await mockApi(page, 'VENUE_OWNER');
  await page.route('**/api/v1/bookings/hall/1/', (route) =>
    route.fulfill(unavailable),
  );
  await page.goto('/dashboard/bookings');
  await page
    .getByRole('button', { name: 'Tasdiqlash', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Xizmat vaqtincha ishlamayapti');
  await expect(page.getByText('Bron holati yangilandi.')).toHaveCount(0);
  expect(state.hallBookings[0].status).toBe('PENDING');
});

test('admin load failures do not fabricate users', async ({ page }) => {
  await mockApi(page, 'ADMIN');
  await page.route('**/api/v1/admin/users/**', (route) =>
    route.fulfill(unavailable),
  );
  await page.goto('/admin/users');
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Xizmat vaqtincha ishlamayapti');
  await expect(page.getByText('Ahror', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('admin actions show mutation failures and keep persisted status', async ({
  page,
}) => {
  const state = await mockApi(page, 'ADMIN');
  await page.route('**/api/v1/admin/venues/**', (route) =>
    route.fulfill(unavailable),
  );
  await page.goto('/admin/venues');
  await page
    .getByRole('button', { name: 'Tasdiqlash', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Xizmat vaqtincha ishlamayapti');
  expect(state.halls[1].is_approved).toBe(false);
  await expect(
    page.getByText('Joyning tasdiqlash holati yangilandi.'),
  ).toHaveCount(0);
});

test('admin dashboard uses API totals rather than sample statistics', async ({
  page,
}) => {
  await mockApi(page, 'ADMIN');
  await page.goto('/admin/dashboard');
  await expect(
    page
      .getByRole('heading', { name: 'Jami foydalanuvchilar' })
      .locator('../..'),
  ).toContainText('3');
  await expect(page.getByText('1,248', { exact: true })).toHaveCount(0);
  await expect(page.getByText('450M UZS', { exact: true })).toHaveCount(0);
});

test('Telegram settings never send a masked token and report failed saves', async ({
  page,
}) => {
  const state = await mockApi(page, 'ADMIN');
  await page.goto('/admin/settings/telegram');
  await expect(
    page.getByLabel('Yangi bot tokeni', { exact: true }),
  ).toHaveValue('');
  await page.getByLabel('Botning ko‘rinadigan nomi').fill('Yangilangan bot');
  await page
    .getByRole('button', { name: 'Saqlash va ishga tushirish' })
    .click();
  await expect(page.getByRole('status')).toContainText('Sozlamalar saqlandi.');
  const body = state.requests.find(
    (request) =>
      request.path === '/bot/admin/bot-config/' && request.method === 'PATCH',
  )?.body;
  expect(body).not.toHaveProperty('bot_token');
  expect(body).toMatchObject({ bot_name: 'Yangilangan bot' });
  await page.route('**/api/v1/bot/admin/bot-config/', async (route) =>
    route.request().method() === 'PATCH'
      ? route.fulfill(unavailable)
      : route.fallback(),
  );
  await page
    .getByRole('button', { name: 'Saqlash va ishga tushirish' })
    .click();
  await expect(
    page.getByRole('alert', { name: 'Xatolik xabari' }),
  ).toContainText('Xizmat vaqtincha ishlamayapti');
  await expect(
    page.getByText('Sozlamalar saqlandi.', { exact: true }),
  ).toHaveCount(0);
});

test('gallery supports keyboard close, restores focus and saved venues persist', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/venues/bars/1');
  const opener = page.getByRole('button', { name: '1-rasmni kattalashtirish' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await page
    .getByRole('button', { name: 'Joyni saqlash', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Saqlanganlardan olib tashlash' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Saqlanganlardan olib tashlash' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('mobile dashboard navigation opens, closes and follows routes', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Mobile navigation is only visible on small viewports.');
  await mockApi(page, 'VENUE_OWNER');
  await page.goto('/dashboard/venues');
  const opener = page.getByRole('button', { name: 'Menyuni ochish' });
  await opener.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await opener.click();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: 'Bronlar', exact: true })
    .click();
  await expect(page).toHaveURL('/dashboard/bookings');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('theme selection survives reload and mobile dark mode stays accessible', async ({
  page,
}) => {
  await mockApi(page);
  await page.goto('/login');
  await page.getByRole('button', { name: 'Qorong‘i mavzuga o‘tish' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(
    page.getByRole('button', { name: 'Yorug‘ mavzuga o‘tish' }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test('invalid detail IDs show an error without making NaN API requests', async ({
  page,
}) => {
  const state = await mockApi(page);
  await page.goto('/venues/halls/not-a-number');
  await expect(
    page.getByRole('heading', { name: 'Joy topilmadi' }),
  ).toBeVisible();
  expect(
    state.requests.some((request) => request.path.includes('/venues/halls/')),
  ).toBe(false);
});
