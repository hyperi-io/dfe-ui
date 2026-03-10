import { FormInstance, FormRule } from 'antd';
import { useCallback } from 'react';
import z from 'zod';

export const useAntdZodResolver = <T = unknown>(schema: z.ZodType<T>) =>
  useCallback(
    ({ getFieldsValue }: FormInstance) => ({
      validator: async ({
        field,
      }: {
        field: string | number | undefined | null;
      }) => {
        const result = await schema.safeParseAsync(getFieldsValue());
        const error =
          !result.success &&
          result.error.issues.filter((issue) =>
            issue.path.includes(field ?? ''),
          )[0]?.message;

        return error ? Promise.reject(error) : Promise.resolve();
      },
    }),
    [schema],
  ) as FormRule;
