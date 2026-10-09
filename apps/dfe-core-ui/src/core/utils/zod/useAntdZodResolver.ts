import { FormInstance, FormRule } from 'antd';
import { NamePath } from 'antd/es/form/interface';
import { useCallback } from 'react';
import z from 'zod';

type FieldPath = (string | number)[];

/** Zod's public `def` is a base union; wrappers keep extras we need to walk. */
type ZodDefBag = {
  type?: string;
  innerType?: z.ZodType;
  in?: z.ZodType;
  shape?: Record<string, z.ZodType>;
  element?: z.ZodType;
  items?: z.ZodType[];
};

const defOf = (schema: z.ZodType): ZodDefBag => schema.def as ZodDefBag;

const toFieldPath = (name: NamePath): FieldPath =>
  (Array.isArray(name) ? name : [name]) as FieldPath;

/**
 * Rule renders produced by {@link useAntdZodResolver} register their schema
 * here so `Form.Item` can derive the required asterisk from the item `name`
 * without callers passing the path into the rule.
 */
const schemaByResolver = new WeakMap<object, z.ZodType>();

export const getZodSchemaForRule = (rule: unknown): z.ZodType | undefined => {
  if (
    typeof rule === 'function' ||
    (typeof rule === 'object' && rule !== null)
  ) {
    return schemaByResolver.get(rule);
  }
  return undefined;
};

/** Unwrap optional / nullable / default wrappers without losing the flag. */
const isOptionalOrNullable = (schema: z.ZodType): boolean => {
  let current: z.ZodType | undefined = schema;
  while (current) {
    const def = defOf(current);
    const type = def.type;
    if (
      type === 'optional' ||
      type === 'nullable' ||
      type === 'default' ||
      type === 'prefault'
    ) {
      return true;
    }
    if (type === 'readonly' || type === 'nonoptional') {
      current = def.innerType;
      continue;
    }
    if (type === 'pipe' || type === 'transform' || type === 'overwrite') {
      current = def.in ?? def.innerType;
      continue;
    }
    break;
  }
  return false;
};

const unwrapToCore = (schema: z.ZodType): z.ZodType => {
  let current: z.ZodType = schema;
  while (current) {
    const def = defOf(current);
    const type = def.type;
    if (
      type === 'optional' ||
      type === 'nullable' ||
      type === 'default' ||
      type === 'prefault' ||
      type === 'readonly' ||
      type === 'nonoptional'
    ) {
      if (!def.innerType) break;
      current = def.innerType;
      continue;
    }
    if (type === 'pipe' || type === 'transform' || type === 'overwrite') {
      const next = def.in ?? def.innerType;
      if (!next) break;
      current = next;
      continue;
    }
    break;
  }
  return current;
};

/**
 * Whether a Form.Item for this path should show Ant Design's required mark.
 * Optional, nullable, and defaulted Zod fields are not required.
 */
export const isZodFieldRequired = (
  schema: z.ZodType,
  name: NamePath,
): boolean => {
  let current: z.ZodType | undefined = schema;
  for (const segment of toFieldPath(name)) {
    if (!current) return false;
    current = unwrapToCore(current);
    const def = defOf(current);
    const type = def.type;
    if (type === 'object') {
      current = def.shape?.[String(segment)];
    } else if (type === 'array') {
      current = def.element;
    } else if (type === 'tuple') {
      current = def.items?.[Number(segment)];
    } else {
      return false;
    }
  }
  return !!current && !isOptionalOrNullable(current);
};

const fieldFromRule = (
  rule: FormRule,
): string | number | FieldPath | null | undefined =>
  (rule as { field?: string | number | FieldPath | null }).field;

export const useAntdZodResolver = <T = unknown>(schema: z.ZodType<T>) => {
  const resolver = useCallback(
    ({ getFieldsValue }: FormInstance) => ({
      validator: async (rule: FormRule, _value: unknown) => {
        const field = fieldFromRule(rule);
        const result = await schema.safeParseAsync(getFieldsValue());
        const pathMatches = (issue: z.ZodIssue) => {
          const path = issue.path;
          if (field == null) return true;
          if (Array.isArray(field)) {
            return (
              path.length === field.length &&
              path.every((p, i) => String(p) === String(field[i]))
            );
          }

          // Zod array handling
          if (Array.isArray(path) && path.length > 1) {
            return [path.join('.')].includes(field as string);
          }

          return path.includes(field);
        };
        const error =
          !result.success &&
          result.error.issues.filter(pathMatches)[0]?.message;

        return error ? Promise.reject(error) : Promise.resolve();
      },
    }),
    [schema],
  );

  schemaByResolver.set(resolver, schema);

  return resolver as FormRule;
};
