/** @vitest-environment node */

import { describe, expect, test } from 'vitest';
import {
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_LENGTH,
  newPasswordSchema,
  PASSWORD_CEILING_MESSAGE,
  PASSWORD_FLOOR_MESSAGE,
  passwordBytes,
} from './password.schema';

// A CJK character: three bytes in UTF-8, one UTF-16 unit.
const CJK = String.fromCodePoint(0x5bc6);
// An emoji: four bytes in UTF-8, two UTF-16 units.
const EMOJI = String.fromCodePoint(0x1f511);
// A precomposed accented letter: two bytes in UTF-8, one character.
const ACCENTED = String.fromCodePoint(0xe9);

const refusal = (value: string) =>
  newPasswordSchema
    .safeParse(value)
    .error?.issues.map(({ message }) => message);

describe('newPasswordSchema floor', () => {
  test.each([
    { name: '11 ASCII characters', value: 'a'.repeat(11) },
    { name: '6 emoji, 12 UTF-16 units', value: EMOJI.repeat(6) },
    { name: '11 emoji, 22 UTF-16 units', value: EMOJI.repeat(11) },
  ])('refuses $name', ({ value }) => {
    expect(refusal(value)).toEqual([PASSWORD_FLOOR_MESSAGE]);
  });

  test.each([
    { name: '12 ASCII characters', value: 'a'.repeat(12) },
    { name: '12 emoji', value: EMOJI.repeat(12) },
    { name: '12 three-byte characters', value: CJK.repeat(12) },
    {
      name: '11 ASCII characters and one emoji',
      value: `${'a'.repeat(11)}${EMOJI}`,
    },
  ])('takes $name', ({ value }) => {
    expect(newPasswordSchema.safeParse(value).success).toBe(true);
  });

  test('counts code points, as the engine does, not UTF-16 units', () => {
    const value = EMOJI.repeat(6);
    expect(value.length).toBe(MIN_PASSWORD_LENGTH);
    expect(Array.from(value)).toHaveLength(6);
    expect(newPasswordSchema.safeParse(value).success).toBe(false);
  });
});

describe('newPasswordSchema byte ceiling', () => {
  test.each([
    { name: '72 ASCII characters', value: 'a'.repeat(72) },
    { name: '24 three-byte characters', value: CJK.repeat(24) },
    { name: '18 four-byte emoji', value: EMOJI.repeat(18) },
    {
      name: '70 ASCII characters and one accented letter',
      value: `${'a'.repeat(70)}${ACCENTED}`,
    },
  ])('takes $name, 72 bytes', ({ value }) => {
    expect(passwordBytes(value)).toBe(MAX_PASSWORD_BYTES);
    expect(newPasswordSchema.safeParse(value).success).toBe(true);
  });

  test.each([
    { name: '73 ASCII characters', value: 'a'.repeat(73), bytes: 73 },
    { name: '25 three-byte characters', value: CJK.repeat(25), bytes: 75 },
    { name: '19 four-byte emoji', value: EMOJI.repeat(19), bytes: 76 },
    {
      name: '71 ASCII characters and one accented letter',
      value: `${'a'.repeat(71)}${ACCENTED}`,
      bytes: 73,
    },
  ])('refuses $name, $bytes bytes', ({ value, bytes }) => {
    expect(passwordBytes(value)).toBe(bytes);
    expect(refusal(value)).toEqual([PASSWORD_CEILING_MESSAGE]);
  });

  test('measures bytes, not characters or UTF-16 units', () => {
    const value = `${'a'.repeat(71)}${ACCENTED}`;
    expect(value.length).toBe(72);
    expect(newPasswordSchema.safeParse(value).success).toBe(false);

    const emoji = EMOJI.repeat(19);
    expect(emoji.length).toBe(38);
    expect(newPasswordSchema.safeParse(emoji).success).toBe(false);
  });

  test('tells the user the limit without engine terms', () => {
    expect(PASSWORD_CEILING_MESSAGE).toContain('72 bytes');
    expect(PASSWORD_CEILING_MESSAGE).not.toMatch(/bcrypt|utf-?8/i);
  });
});
