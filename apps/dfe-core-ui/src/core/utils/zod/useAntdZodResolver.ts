import { FormInstance, FormRule } from 'antd';
import { useCallback } from 'react';
import z from 'zod';

export const useAntdZodResolver = <T = unknown>(schema: z.ZodType<T>) =>
  useCallback(
    ({ getFieldsValue }: FormInstance) => ({
      validator: async (rule: FormRule, _value: unknown) => {
        const field = (
          rule as { field?: string | number | (string | number)[] | null }
        ).field;
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
  ) as FormRule;
