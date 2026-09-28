/**
 * Uzbek phone number formatting and validation utilities.
 * Consolidated here to avoid duplication across login/register pages.
 */

/**
 * Formats a raw input string to "+998 XX XXX XX XX" display format.
 * Strips non-digits, handles 998-prefix, caps at 9 national digits.
 */
export function formatUzbekPhone(value: string): string {
  const digits = value.replace(/\D/g, '');

  let national = digits;
  if (national.startsWith('998')) {
    national = national.slice(3);
  }

  // Cap at 9 national digits
  national = national.slice(0, 9);

  if (national.length === 0) {
    return '+998 ';
  }

  let formatted = '+998 ' + national.slice(0, 2);
  if (national.length > 2) formatted += ' ' + national.slice(2, 5);
  if (national.length > 5) formatted += ' ' + national.slice(5, 7);
  if (national.length > 7) formatted += ' ' + national.slice(7, 9);

  return formatted;
}

/**
 * Returns true if the phone string contains exactly 12 digits starting with 998.
 */
export function isValidUzbekPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 12 && digits.startsWith('998');
}

/**
 * Converts display-format phone to E.164 string: "+998XXXXXXXXX"
 */
export function toE164Phone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+${digits}`;
}
