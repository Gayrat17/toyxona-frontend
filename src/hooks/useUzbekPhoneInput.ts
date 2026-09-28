'use client';

import { useState, useCallback } from 'react';
import { formatUzbekPhone, isValidUzbekPhone, toE164Phone } from '@/utils/phone';

/**
 * Reusable hook for Uzbek phone number input fields.
 * Handles formatting, cursor protection, digit-only input and max-length enforcement.
 *
 * Usage:
 *   const phone = useUzbekPhoneInput();
 *   <input value={phone.value} onChange={phone.handleChange} onKeyDown={phone.handleKeyDown} ... />
 */
export function useUzbekPhoneInput(initialValue = '+998 ') {
  const [value, setValue] = useState(initialValue);

  /** Prevent editing inside the "+998 " prefix and block non-digit characters. */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const selStart = input.selectionStart ?? 0;
      const selEnd = input.selectionEnd ?? 0;

      // Allow navigation, tab, shortcuts
      if (
        e.key === 'Tab' || e.key === 'Enter' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'Home' || e.key === 'End' ||
        e.ctrlKey || e.metaKey || e.altKey
      ) return;

      // Block backspace / delete inside prefix "+998 " (5 chars)
      if (e.key === 'Backspace' && selStart <= 5 && selEnd <= 5) {
        e.preventDefault();
        return;
      }
      if (e.key === 'Delete' && selStart < 5) {
        e.preventDefault();
        return;
      }

      // Block non-digit characters
      if (e.key.length === 1 && !/\d/.test(e.key)) {
        e.preventDefault();
        return;
      }

      // If cursor is inside prefix and a digit is typed, append to national digits
      if (e.key.length === 1 && /\d/.test(e.key) && selStart < 5 && selEnd <= 5) {
        e.preventDefault();
        const national = value.replace(/\D/g, '').slice(3);
        if (national.length < 9) {
          setValue(formatUzbekPhone(value + e.key));
        }
        return;
      }

      // Block typing beyond 9 national digits
      const digits = value.replace(/\D/g, '');
      const national = digits.startsWith('998') ? digits.slice(3) : digits;
      if (national.length >= 9 && selStart === selEnd) {
        e.preventDefault();
      }
    },
    [value],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(formatUzbekPhone(e.target.value));
  }, []);

  /** Move cursor to end of prefix on focus if field is empty. */
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '+998 ' || e.target.value === '+998') {
      const len = e.target.value.length;
      requestAnimationFrame(() => e.target.setSelectionRange(len, len));
    }
  }, []);

  /** Prevent clicking inside the prefix. */
  const handleClick = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if ((input.selectionStart ?? 0) < 5 && input.selectionStart === input.selectionEnd) {
      if (input.value === '+998 ') input.setSelectionRange(5, 5);
    }
  }, []);

  const isValid = useCallback(() => isValidUzbekPhone(value), [value]);
  const toE164 = useCallback(() => toE164Phone(value), [value]);

  return { value, handleKeyDown, handleChange, handleFocus, handleClick, isValid, toE164 };
}
