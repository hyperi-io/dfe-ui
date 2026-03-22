import { renderHook } from '@testing-library/react';
import type { FormInstance } from 'antd';
import { describe, expect, test } from 'vitest';
import z from 'zod';
import { useAntdZodResolver } from './useAntdZodResolver';

type ResolverFn = (form: FormInstance) => {
  validator: (rule: unknown, value: unknown) => Promise<void>;
};

const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.email({ message: 'Invalid email' }),
  mappings: z.array(
    z.tuple([
      z.string().min(1, { message: 'Source field is required' }),
      z.string().min(1, { message: 'Destination field is required' }),
    ]),
  ),
});

describe('useAntdZodResolver', () => {
  test('returns a function that produces a rule with a validator', () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    const formValidation = result.current as ResolverFn;

    expect(formValidation).toBeInstanceOf(Function);

    const mockForm = {
      getFieldsValue: () => ({}),
    } as FormInstance;
    const rule = formValidation(mockForm);

    expect(rule).toHaveProperty('validator');
    expect(rule.validator).toBeInstanceOf(Function);
  });

  test('validator rejects when schema validation fails', async () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    const formValidation = result.current as ResolverFn;

    const mockForm = {
      getFieldsValue: () => ({ username: '', email: '' }),
    };
    const rule = formValidation(mockForm as never);

    await expect(rule.validator!({ field: 'username' }, '')).rejects.toBe(
      'Username is required',
    );
  });

  test('validator resolves when schema validation passes', async () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    const formValidation = result.current as ResolverFn;

    const mockForm = {
      getFieldsValue: () => ({
        username: 'john',
        email: 'john@example.com',
        mappings: [['src', 'dest']],
      }),
    } as FormInstance;
    const rule = formValidation(mockForm);

    await expect(
      rule.validator!({ field: 'username' }, 'john'),
    ).resolves.toBeUndefined();
  });

  test('validator matches error to field path for nested Form.List fields', async () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    const formValidation = result.current as ResolverFn;

    const mockForm = {
      getFieldsValue: () => ({
        mappings: [['', 'dest']], // empty source field
      }),
    } as FormInstance;
    const rule = formValidation(mockForm);

    await expect(
      rule.validator!({ field: ['mappings', 0, 0] }, ''),
    ).rejects.toBe('Source field is required');
  });

  test('validator returns first matching error when field is null', async () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    const formValidation = result.current as ResolverFn;

    const mockForm = {
      getFieldsValue: () => ({ username: '', email: '' }),
    } as FormInstance;
    const rule = formValidation(mockForm);

    await expect(rule.validator!({ field: null }, '')).rejects.toBeDefined();
  });
});
