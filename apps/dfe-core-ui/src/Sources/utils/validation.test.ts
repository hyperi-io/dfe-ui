import { describe, expect, it } from 'vitest';

import { SOURCE_NAME_VALIDATOR, sourceNameValidator } from './validation';

const firstMessage = (value: string) => {
  const result = sourceNameValidator.safeParse(value);
  return result.success ? null : result.error.issues[0]?.message;
};

describe('sourceNameValidator', () => {
  it('accepts a DNS-1123 label that starts with a letter', () => {
    expect(sourceNameValidator.safeParse('aws-cloudtrail').success).toBe(true);
    expect(sourceNameValidator.safeParse('a').success).toBe(true);
    expect(sourceNameValidator.safeParse('cratesaudit2').success).toBe(true);
  });

  it('names the underscore fix when that is the only problem', () => {
    expect(firstMessage('aws_cloudtrail')).toBe(SOURCE_NAME_VALIDATOR.underscoreMessage);
  });

  it('refuses uppercase, a leading digit and a trailing hyphen', () => {
    expect(firstMessage('AwsCloudtrail')).toBe(SOURCE_NAME_VALIDATOR.message);
    expect(firstMessage('1aws')).toBe(SOURCE_NAME_VALIDATOR.message);
    expect(firstMessage('aws-')).toBe(SOURCE_NAME_VALIDATOR.message);
  });

  it('caps the name at the instance label length', () => {
    expect(sourceNameValidator.safeParse('a'.repeat(40)).success).toBe(true);
    expect(sourceNameValidator.safeParse('a'.repeat(41)).success).toBe(false);
  });

  it('still requires a name', () => {
    expect(firstMessage('')).toBe('Source is required');
  });
});
