import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { IconAlertCircle } from '@repo/dfe-icons';
import { Button } from 'antd';

export const TabLabel = ({
  label,
  validationErrors,
}: {
  label: string | React.ReactNode;
  validationErrors: string[];
}) => {
  return (
    <span
      className={cn('flex gap-2', validationErrors?.length > 0 && 'text-error')}
    >
      {label}
      {validationErrors?.length > 0 && (
        <Tooltip title={validationErrors.join(', ')} destroyOnHidden>
          <Button
            type="text"
            size="small"
            shape="circle"
            icon={<IconAlertCircle />}
            danger
          />
        </Tooltip>
      )}
    </span>
  );
};
