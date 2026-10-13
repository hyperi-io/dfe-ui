import { getApiErrorFields } from '@/core/config/api/client';
import { type FormInstance } from 'antd';
import { useEffect } from 'react';

/** Shows each field the engine refused in `error` on that field of `form`; the field's own rules replace it once the user edits it. */
export const useApiFieldErrors = ({
  error,
  form,
}: {
  error: unknown;
  form: FormInstance;
}) => {
  useEffect(() => {
    const fields = getApiErrorFields(error);
    if (fields.length > 0) {
      form.setFields(fields);
    }
  }, [error, form]);
};
