import { renderHook } from '@testing-library/react';
import type { FormInstance } from 'antd';
import { describe, expect, test, vi } from 'vitest';
import z from 'zod';
import {
  getZodSchemaForRule,
  isZodFieldRequired,
  useAntdZodResolver,
} from './useAntdZodResolver';

type ResolverFn = (form: FormInstance) => {
  required?: boolean;
  validator: (rule: unknown, value: unknown) => Promise<void>;
};

const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.email({ message: 'Invalid email' }),
  nickname: z.string().optional(),
  notes: z.string().nullable(),
  label: z.string().optional().nullable(),
  nested: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    hint: z.string().optional(),
  }),
  mappings: z.array(
    z.tuple([
      z.string().min(1, { message: 'Source field is required' }),
      z.string().min(1, { message: 'Destination field is required' }),
    ]),
  ),
});

describe('isZodFieldRequired', () => {
  test('is true for plain required fields', () => {
    expect(isZodFieldRequired(schema, 'username')).toBe(true);
    expect(isZodFieldRequired(schema, 'email')).toBe(true);
    expect(isZodFieldRequired(schema, ['nested', 'title'])).toBe(true);
  });

  test('is false for optional, nullable, and nullish fields', () => {
    expect(isZodFieldRequired(schema, 'nickname')).toBe(false);
    expect(isZodFieldRequired(schema, 'notes')).toBe(false);
    expect(isZodFieldRequired(schema, 'label')).toBe(false);
    expect(isZodFieldRequired(schema, ['nested', 'hint'])).toBe(false);
  });
});

describe('useAntdZodResolver', () => {
  test('registers the schema so Form.Item can derive the required mark', () => {
    const { result } = renderHook(() => useAntdZodResolver(schema));
    expect(getZodSchemaForRule(result.current)).toBe(schema);
  });

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
        nested: { title: 't' },
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

  describe('one validation of the whole form is shared by its fields', () => {
    const rowsSchema = (parsed: () => void) =>
      z
        .object({
          rows: z.array(z.object({ name: z.string().min(1, 'Name required') })),
        })
        .refine(() => {
          parsed();
          return true;
        });
    const rows = (...names: string[]) => ({
      rows: names.map((name) => ({ name })),
    });

    test('equal values read for every row parse the form once', async () => {
      const parsed = vi.fn();
      const { result } = renderHook(() =>
        useAntdZodResolver(rowsSchema(parsed)),
      );
      // A fresh object each call, as Ant Design's getFieldsValue returns.
      const rule = (result.current as ResolverFn)({
        getFieldsValue: () => rows('a', '', 'c'),
      } as never);

      const checks = await Promise.allSettled(
        [0, 1, 2].map((i) =>
          rule.validator({ field: ['rows', i, 'name'] }, ''),
        ),
      );

      expect(parsed).toHaveBeenCalledTimes(1);
      expect(checks.map((c) => c.status)).toEqual([
        'fulfilled',
        'rejected',
        'fulfilled',
      ]);
    });

    test('values that changed are parsed again', async () => {
      const parsed = vi.fn();
      const { result } = renderHook(() =>
        useAntdZodResolver(rowsSchema(parsed)),
      );
      const current = rows('');
      const rule = (result.current as ResolverFn)({
        getFieldsValue: () => current,
      } as never);
      const check = () => rule.validator({ field: ['rows', 0, 'name'] }, '');

      await expect(check()).rejects.toBe('Name required');
      current.rows[0]!.name = 'fixed';
      await expect(check()).resolves.toBeUndefined();
      expect(parsed).toHaveBeenCalledTimes(2);
    });
  });
});
