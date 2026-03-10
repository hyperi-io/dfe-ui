'use client';

import { cn } from '@/core/utils/style';
import { IconAlertCircle, IconCheck, IconX } from '@hyperi/icons';
import { Button } from 'antd';
import { useState } from 'react';

interface ValidateButtonProps {
  validate: (value: string) => void;
  loading?: boolean;
  validationErrors?: string[];
  error?: string;
  success?: boolean;
  value?: string;
}

export const ValidateButton = ({
  validate,
  loading,
  validationErrors,
  error,
  success,
  value,
}: ValidateButtonProps) => {
  const [showErrors, setShowErrors] = useState(false);
  const hasErrors = !!error || (validationErrors?.length ?? 0) > 0;

  return (
    <div className="relative flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2 ml-auto">
        {hasErrors && (
          <Button
            type="primary"
            shape="circle"
            size="small"
            icon={!showErrors ? <IconAlertCircle /> : <IconX />}
            danger
            onClick={() => setShowErrors(!showErrors)}
          />
        )}
        <Button
          type="default"
          className={cn(success && 'border border-success text-success')}
          onClick={() => validate(value ?? '')}
          loading={loading}
          disabled={loading}
          danger={!!hasErrors}
        >
          {!!success ? (
            <div className="flex items-center gap-x-2">
              <IconCheck /> Valid
            </div>
          ) : (
            'Validate'
          )}
        </Button>
      </div>

      {showErrors && hasErrors && (
        <div className="rounded-sm border-error border bg-background absolute bottom-10 right-0 w-64">
          <div className="p-2 bg-error/10">
            {validationErrors?.map((error) => (
              <p key={error} className="text-error ">
                {error}
              </p>
            ))}
            {error && (
              <p key={error} className="text-error">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
