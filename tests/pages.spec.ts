import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockApi } from './fixtures';
import type { UserRole } from '../src/types';

const routes: {
  path: string;
  role?: UserRole;
  heading: string;
  ready?: string;
}[] = [
  { path: '/', heading: 'Hashamatli kunlaringiz', ready: 'Navro‘z saroyi' },
  { path: '/login', heading: 'Xush kelibsiz' },
  { path: '/register', heading: 'A’zo bo‘lish' },
  { path: '/venues/halls/1', heading: 'Navro‘z saroyi' },
  { path: '/venues/bars/1', heading: 'Sokin Lounge' },
  {
    path: '/dashboard',
    role: 'VENUE_OWNER',
    heading: 'Mening joylarim',
    ready: 'Navro‘z saroyi',
  },
  {
    path: '/dashboard/venues',
    role: 'VENUE_OWNER',
    heading: 'Mening joylarim',
    ready: 'Navro‘z saroyi',
  },
  {
    path: '/dashboard/add',
    role: 'VENUE_OWNER',
    heading: 'Yangi joy qo‘shish',
    ready: 'I. Asosiy ma’lumotlar',
  },
  {
    path: '/dashboard/bookings',
    role: 'VENUE_OWNER',
    heading: 'Bronlar',
    ready: 'To‘y zaliga kelgan bronlar',
  },
  {
    path: '/dashboard/calendar',
    role: 'VENUE_OWNER',
    heading: 'Taqvimni bloklash',
    ready: 'Taqvim smenasini bloklash',
  },
  {
    path: '/dashboard/venues/halls/1',
    role: 'VENUE_OWNER',
    heading: 'Joyni tahrirlash',
    ready: 'Navro‘z saroyi',
  },
  {
    path: '/dashboard/venues/bars/1',
    role: 'VENUE_OWNER',
    heading: 'Joyni tahrirlash',
    ready: 'Sokin Lounge',
  },
  {
    path: '/admin',
    role: 'ADMIN',
    heading: 'Umumiy ko‘rsatkichlar',
    ready: 'Jami foydalanuvchilar',
  },
  {
    path: '/admin/dashboard',
    role: 'ADMIN',
    heading: 'Umumiy ko‘rsatkichlar',
    ready: 'Jami foydalanuvchilar',
  },
  {
    path: '/admin/users',
    role: 'ADMIN',
    heading: 'Foydalanuvchilar',
    ready: 'Dilshod',
  },
  {
    path: '/admin/venues',
    role: 'ADMIN',
    heading: 'Joylar boshqaruvi',
    ready: 'Navro‘z saroyi',
  },
  {
    path: '/admin/settings/telegram',
    role: 'ADMIN',
    heading: 'Telegram bot sozlamalari',
    ready: 'Toyxona Test Bot',
  },
  { path: '/missing-page', heading: 'Sahifa topilmadi' },
];

for (const { path, role, heading, ready } of routes) {
  test(`page audit: ${path}`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|did not match|maximum update depth/i.test(message.text())
      )
        errors.push(message.text());
    });
    await mockApi(page, role);
    await page.goto(path);
    await expect(
      page.getByRole('heading', { name: heading, level: 1 }),
    ).toBeVisible();
    if (ready)
      await expect(
        page.getByText(ready, { exact: true }).first(),
      ).toBeVisible();
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => ({
      width: innerWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    expect(
      overflow.scroll,
      `Horizontal overflow on ${path}`,
    ).toBeLessThanOrEqual(overflow.width + 1);
    expect(errors).toEqual([]);
    if (process.env.PLAYWRIGHT_CAPTURE_PAGES) {
      await page.screenshot({
        path: testInfo.outputPath('page.png'),
        fullPage: true,
      });
    }
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      accessibility.violations.map((item) => ({
        id: item.id,
        targets: item.nodes.map((node) => node.target),
        summary: item.nodes[0]?.failureSummary,
      })),
    ).toEqual([]);
  });
}
