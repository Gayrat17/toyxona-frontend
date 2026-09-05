import type { Page, Request } from '@playwright/test';
import type {
  Bar,
  WeddingHall,
  User,
  UserRole,
  Shift,
  Package,
  HallBooking,
  BarBooking,
  BusyShift,
  BusyBarSlot,
} from '../src/types';

export function futureDate(days = 1) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const users: User[] = [
  {
    id: 1,
    first_name: 'Admin',
    phone_number: '+998901111111',
    role: 'ADMIN',
    is_verified: true,
    is_staff: true,
    is_active: true,
    date_joined: '2026-01-01',
  },
  {
    id: 2,
    first_name: 'Ali',
    phone_number: '+998902222222',
    role: 'VENUE_OWNER',
    is_verified: true,
    is_staff: false,
    is_active: true,
    date_joined: '2026-01-01',
  },
  {
    id: 3,
    first_name: 'Dilshod',
    phone_number: '+998903333333',
    role: 'CLIENT',
    is_verified: false,
    is_staff: false,
    is_active: true,
    date_joined: '2026-01-01',
  },
];
const common = {
  owner: 2,
  owner_phone: '+998902222222',
  region: 1,
  district: 1,
  address: 'Toshkent shahri, Amir Temur ko‘chasi, 10-uy',
  description: 'Test uchun zal tavsifi. Keng va yorug‘ marosimlar zali.',
  cover_image_url: '/images/hero-hall.jpg',
  required_deposit: '1000000.00',
  created_at: '2026-01-01',
  amenities: ['parking', 'wifi', 'stage'],
  video_url: 'https://example.com/video',
  map_link: 'https://example.com/map',
  gallery_images: [
    { id: 1, image_url: '/images/hero-hall.jpg', created_at: '2026-01-01' },
    { id: 2, image_url: '/images/auth-side.jpg', created_at: '2026-01-01' },
  ],
};
export const halls: WeddingHall[] = [
  {
    ...common,
    id: 1,
    name: 'Navro‘z saroyi',
    max_capacity: 500,
    price_per_person: '175000.00',
    is_approved: true,
  },
  {
    ...common,
    id: 2,
    name: 'Zarafshon zali',
    max_capacity: 300,
    price_per_person: '120000.00',
    is_approved: false,
  },
];
export const bars: Bar[] = [
  {
    ...common,
    id: 1,
    name: 'Sokin Lounge',
    capacity: 40,
    price_per_hour: '250000.00',
    is_approved: false,
  },
];
const shifts: Shift[] = [
  {
    id: 1,
    hall: 1,
    name: 'Tushlik',
    start_time: '11:00:00',
    end_time: '15:00:00',
    is_active: true,
  },
  {
    id: 2,
    hall: 1,
    name: 'Kechki',
    start_time: '17:00:00',
    end_time: '22:00:00',
    is_active: true,
  },
  {
    id: 3,
    hall: 2,
    name: 'Kunduzgi',
    start_time: '10:00:00',
    end_time: '15:00:00',
    is_active: true,
  },
];
const packages: Package[] = [
  {
    id: 1,
    hall: 1,
    guest_count: 300,
    price: '30000000.00',
    description: 'Standart menyu',
  },
  {
    id: 2,
    hall: 2,
    guest_count: 200,
    price: '20000000.00',
    description: 'Maxsus menyu',
  },
];
const baseBooking = {
  id: 1,
  user: 3,
  user_phone: '+998903333333',
  date: futureDate(),
  total_price: '30000000.00',
  deposit_amount: '1000000.00',
  is_deposit_paid: false,
  status: 'PENDING' as const,
  remaining_amount: 29000000,
  created_at: '2026-01-01',
};
export const botConfig = {
  bot_token: '1234...masked',
  bot_username: 'toyxona_test_bot',
  bot_name: 'Toyxona Test Bot',
  short_description: 'Bronlar uchun bot',
  description: 'Test sozlamalari',
  webhook_url: 'https://example.com/api/v1/bot/webhook/',
  is_active: true,
  updated_at: '2026-01-01T12:00:00Z',
};

function multipart(request: Request): Record<string, unknown> {
  const text = request.postData() || '';
  const boundary = request
    .headers()
    ['content-type']?.match(/boundary=(.+)/)?.[1];
  if (!boundary) return {};
  const data: Record<string, unknown> = {};
  for (const part of text.split(`--${boundary}`)) {
    const name = part.match(/name="([^"]+)"/i)?.[1];
    const value = part.split('\r\n\r\n')[1];
    if (name && value !== undefined) {
      const filename = part.match(/filename="([^"]*)"/)?.[1];
      const entry =
        filename === undefined ? value.replace(/\r\n$/, '') : { filename };
      data[name] =
        name in data
          ? [
              ...(Array.isArray(data[name])
                ? (data[name] as unknown[])
                : [data[name]]),
              entry,
            ]
          : entry;
    }
  }
  return data;
}

export async function mockApi(
  page: Page,
  role?: UserRole,
  options?: { loginRole?: UserRole; empty?: boolean },
) {
  const state = {
    user: structuredClone(
      users.find(
        (user) => user.role === (role || options?.loginRole || 'CLIENT'),
      )!,
    ),
    users: options?.empty ? [] : structuredClone(users),
    halls: options?.empty ? [] : structuredClone(halls),
    bars: options?.empty ? [] : structuredClone(bars),
    shifts: options?.empty ? [] : structuredClone(shifts),
    packages: options?.empty ? [] : structuredClone(packages),
    hallBookings: options?.empty
      ? []
      : ([{ ...baseBooking, hall: 1, shift: 1, package: 1 }] as HallBooking[]),
    barBookings: options?.empty
      ? []
      : ([
          {
            ...baseBooking,
            bar: 1,
            start_time: '18:00:00',
            end_time: '20:00:00',
          },
        ] as BarBooking[]),
    busyShifts: [
      {
        date: futureDate(),
        shift_id: 1,
        shift_name: 'Tushlik',
        status: 'BOOKED',
        booking_status: 'PENDING',
      },
    ] as BusyShift[],
    busySlots: [
      {
        date: futureDate(),
        start_time: '18:00:00',
        end_time: '20:00:00',
        status: 'BOOKED',
        booking_status: 'PENDING',
      },
    ] as BusyBarSlot[],
    config: structuredClone(botConfig),
    requests: [] as {
      path: string;
      method: string;
      query: Record<string, string>;
      body: Record<string, unknown>;
      authorization?: string;
    }[],
  };
  if (role)
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'test-access');
      localStorage.setItem('refresh_token', 'test-refresh');
    });
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace('/api/v1', '');
    const method = request.method();
    let body: Record<string, unknown> = {};
    if (method !== 'GET') {
      try {
        body = request
          .headers()
          ['content-type']?.includes('multipart/form-data')
          ? multipart(request)
          : request.postDataJSON() || {};
      } catch {
        /* No payload. */
      }
    }
    state.requests.push({
      path,
      method,
      query: Object.fromEntries(url.searchParams),
      body,
      authorization: request.headers().authorization,
    });
    const send = (data: unknown, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    const paginate = <T>(items: T[]) => {
      const current = Number(url.searchParams.get('page') || 1);
      // A non-default page size catches hard-coded assumptions in the frontend.
      return {
        count: items.length,
        next:
          current < items.length
            ? `${url.origin}${url.pathname}?page=${current + 1}`
            : null,
        previous:
          current > 1
            ? `${url.origin}${url.pathname}?page=${current - 1}`
            : null,
        results: items.slice(current - 1, current),
      };
    };
    if (path === '/auth/users/me/') return send(state.user);
    if (path === '/auth/jwt/create/')
      return send({ access: 'logged-in-access', refresh: 'logged-in-refresh' });
    if (path === '/auth/jwt/refresh/')
      return send({ access: 'rotated-access', refresh: 'rotated-refresh' });
    if (path === '/auth/users/' && method === 'POST') {
      state.user = { ...state.user, role: body.role as UserRole };
      return send(state.user, 201);
    }
    if (path === '/venues/regions/')
      return send(
        paginate([
          {
            id: 1,
            name: 'Toshkent shahri',
            districts: [{ id: 1, region: 1, name: 'Yunusobod' }],
          },
          {
            id: 2,
            name: 'Samarqand',
            districts: [{ id: 2, region: 2, name: 'Samarqand shahri' }],
          },
        ]),
      );
    const venueRoute = path.match(/^\/venues\/(halls|bars)\/(?:(\d+)\/)?$/);
    if (venueRoute) {
      const type = venueRoute[1] as 'halls' | 'bars';
      const id = venueRoute[2] ? Number(venueRoute[2]) : null;
      const venue = state[type].find((item) => item.id === id);
      if (method === 'PATCH' && venue) {
        for (const key of [
          'name',
          'description',
          'address',
          'map_link',
          'video_url',
          'required_deposit',
          'price_per_person',
          'price_per_hour',
        ])
          if (key in body) Object.assign(venue, { [key]: body[key] });
        for (const key of ['region', 'district', 'capacity', 'max_capacity'])
          if (key in body) Object.assign(venue, { [key]: Number(body[key]) });
        if (typeof body.amenities === 'string')
          venue.amenities = JSON.parse(body.amenities);
        if (typeof body.deleted_gallery_ids === 'string') {
          const ids = JSON.parse(body.deleted_gallery_ids);
          venue.gallery_images = venue.gallery_images?.filter(
            (image) => !ids.includes(image.id),
          );
        }
        if (body.delete_cover_image === 'true') {
          venue.cover_image = null;
          venue.cover_image_url = null;
        }
        return send(venue);
      }
      if (method === 'POST') {
        const base = {
          ...common,
          id: 4,
          owner: state.user.id,
          name: String(body.name),
          description: String(body.description),
          address: String(body.address),
          region: Number(body.region),
          district: Number(body.district),
          required_deposit: String(body.required_deposit),
          map_link: String(body.map_link || ''),
          video_url: String(body.video_url || ''),
          amenities: JSON.parse(String(body.amenities || '[]')) as string[],
          gallery_images: [],
        };
        if (type === 'halls') {
          const created: WeddingHall = {
            ...base,
            max_capacity: Number(body.max_capacity),
            price_per_person: String(body.price_per_person),
          };
          state.halls.push(created);
          return send(created, 201);
        }
        const created: Bar = {
          ...base,
          capacity: Number(body.capacity),
          price_per_hour: String(body.price_per_hour),
        };
        state.bars.push(created);
        return send(created, 201);
      }
      if (id) return venue ? send(venue) : send({ detail: 'Not found.' }, 404);
      let list: (WeddingHall | Bar)[] = state[type];
      if (url.searchParams.get('search'))
        list = list.filter((item) =>
          item.name
            .toLowerCase()
            .includes(url.searchParams.get('search')!.toLowerCase()),
        );
      return send(paginate(list));
    }
    if (path === '/venues/shifts/') {
      if (method === 'POST') {
        const shift = { ...body, id: 4, is_active: true } as unknown as Shift;
        state.shifts.push(shift);
        return send(shift, 201);
      }
      return send(paginate(state.shifts));
    }
    if (path === '/venues/packages/') {
      if (method === 'POST') {
        const pkg = { ...body, id: 4 } as unknown as Package;
        state.packages.push(pkg);
        return send(pkg, 201);
      }
      return send(paginate(state.packages));
    }
    if (path === '/venues/decorations/')
      return send(
        paginate([
          { id: 1, hall: 1, name: 'Gullar', additional_price: '2000000.00' },
        ]),
      );
    if (path === '/venues/blocks/') {
      state.busyShifts.push({
        date: String(body.date),
        shift_id: Number(body.shift),
        shift_name: 'Blok',
        status: 'BLOCKED',
      });
      return send({ id: 1, ...body }, 201);
    }
    const calendar = path.match(/^\/bookings\/calendar\/(hall|bar)\/(\d+)\/$/);
    if (calendar)
      return send(
        calendar[1] === 'hall'
          ? {
              hall_id: Number(calendar[2]),
              year: Number(url.searchParams.get('year')),
              month: Number(url.searchParams.get('month')),
              busy_shifts: Number(calendar[2]) === 1 ? state.busyShifts : [],
            }
          : {
              bar_id: Number(calendar[2]),
              year: Number(url.searchParams.get('year')),
              month: Number(url.searchParams.get('month')),
              busy_slots: state.busySlots,
            },
      );
    const bookingRoute = path.match(/^\/bookings\/(hall|bar)\/(?:(\d+)\/)?$/);
    if (bookingRoute) {
      const type = bookingRoute[1];
      const id = Number(bookingRoute[2]);
      const list: (HallBooking | BarBooking)[] =
        type === 'hall' ? state.hallBookings : state.barBookings;
      if (method === 'POST') {
        if (type === 'hall')
          state.busyShifts.push({
            date: String(body.date),
            shift_id: Number(body.shift),
            shift_name: 'Kechki',
            status: 'BOOKED',
            booking_status: 'PENDING',
          });
        else
          state.busySlots.push({
            date: String(body.date),
            start_time: String(body.start_time),
            end_time: String(body.end_time),
            status: 'BOOKED',
            booking_status: 'PENDING',
          });
        return send({ ...baseBooking, ...body, id: 3 }, 201);
      }
      if (method === 'PATCH') {
        const booking = list.find((item) => item.id === id)!;
        Object.assign(booking, body);
        return send(booking);
      }
      return send(paginate(list));
    }
    if (path === '/admin/users/') return send(paginate(state.users));
    if (/^\/admin\/users\/\d+\/$/.test(path)) {
      const user = state.users.find(
        (item) => item.id === Number(path.split('/')[3]),
      )!;
      Object.assign(user, body);
      return send(user);
    }
    if (path.startsWith('/admin/venues/')) {
      const [, , , type, rawId] = path.split('/');
      const list = type === 'hall' ? state.halls : state.bars;
      const item = list.find((venue) => venue.id === Number(rawId))!;
      Object.assign(item, body);
      return send(item);
    }
    if (path === '/bot/admin/bot-config/') {
      if (method === 'PATCH') {
        Object.assign(state.config, body);
        return send({ message: 'Sozlamalar saqlandi.', config: state.config });
      }
      return send(state.config);
    }
    return send({ detail: `Unhandled test endpoint: ${path}` }, 404);
  });
  return state;
}
