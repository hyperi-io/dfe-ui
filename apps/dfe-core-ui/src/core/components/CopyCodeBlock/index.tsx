import { cn } from '@/core/utils/style';
import { IconCopy } from '@repo/dfe-icons';
import { Button } from 'antd';

export const CopyCodeBlock = ({
  code,
  className,
}: {
  code: string;
  className?: string;
}) => {
  return (
    <pre
      className={cn(
        'flex justify-between bg-foreground-muted text-background-muted dark:bg-foreground-muted dark:text-background-muted p-2 rounded-md',
        className,
      )}
    >
      <code>{code}</code>
      <div className="flex gap-2">
        <Button
          type="default"
          aria-label="Copy to clipboard"
          icon={<IconCopy />}
          onClick={() => navigator.clipboard.writeText(code)}
          shape="circle"
          size="small"
        />
      </div>
    </pre>
  );
};
