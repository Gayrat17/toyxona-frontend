import axios from 'axios';

const FIELD_LABELS: Record<string, string> = {
  phone_number: 'Telefon raqami',
  password: 'Parol',
  re_password: 'Parol tasdig‘i',
  first_name: 'Ism',
  name: 'Nom',
  address: 'Manzil',
  region: 'Viloyat',
  district: 'Tuman',
  capacity: 'Sig‘im',
  max_capacity: 'Sig‘im',
  required_deposit: 'Zakalat',
  price_per_hour: 'Soatlik narx',
  price_per_person: 'Kishi boshiga narx',
  date: 'Sana',
  shift: 'Smena',
  package: 'Paket',
  guest_count: 'Mehmonlar soni',
  start_time: 'Boshlanish vaqti',
  end_time: 'Tugash vaqti',
  cover_image: 'Asosiy rasm',
  bot_token: 'Bot tokeni',
  webhook_url: 'Webhook manzili',
};

function messages(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(messages);
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(messages);
  return [];
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.',
): string {
  if (!axios.isAxiosError(error))
    return error instanceof Error ? error.message : fallback;
  if (!error.response)
    return 'Server bilan bog‘lanib bo‘lmadi. Internet aloqasini tekshirib, qayta urinib ko‘ring.';
  if (error.response.status >= 500)
    return 'Xizmat vaqtincha ishlamayapti. Birozdan so‘ng qayta urinib ko‘ring.';
  if (error.response.status === 401)
    return 'Telefon raqami yoki parol noto‘g‘ri, yoki sessiya muddati tugagan. Qayta kiring.';
  if (error.response.status === 403)
    return 'Bu amalni bajarish uchun ruxsatingiz yo‘q.';
  const data: unknown = error.response.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const details = Object.entries(data).flatMap(([field, value]) => {
      const text = messages(value).join(' ');
      if (!text) return [];
      return [FIELD_LABELS[field] ? `${FIELD_LABELS[field]}: ${text}` : text];
    });
    if (details.length) return details.join(' ');
  }
  return fallback;
}

export function isNotFound(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
