'use client';

import { cn } from '@/core/utils/style';
import { IconCheck } from '@repo/dfe-icons';
import { Button } from 'antd';

interface ValidateButtonProps {
  validate: (value: string) => void;
  loading?: boolean;
  failed?: boolean;
  success?: boolean;
  value?: string;
}

/** The verdict is rendered beside the form, so this button carries no message. */
export const ValidateButton = ({
  validate,
  loading,
  failed,
  success,
  value,
}: ValidateButtonProps) => {
  return (
    <Button
      type="default"
      className={cn(success && 'border border-success text-success')}
      onClick={() => validate(value ?? '')}
      loading={loading}
      disabled={loading}
      danger={failed}
    >
      {success ? (
        <div className="flex items-center gap-x-2">
          <IconCheck /> Valid
        </div>
      ) : (
        'Validate'
      )}
    </Button>
  );
};
