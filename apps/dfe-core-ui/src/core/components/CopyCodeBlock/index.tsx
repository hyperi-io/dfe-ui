import { cn } from '@/core/utils/style';
import { IconCopy } from '@repo/dfe-icons';
import { Button } from 'antd';

// A hyphen is a line-break point in plain text, so each token is its own inline-block and lines break only at whitespace.
const tokensOf = (code: string) => code.split(/(\s+)/).filter(Boolean);

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
        'flex items-start justify-between gap-2 bg-foreground-muted text-background-muted dark:bg-foreground-muted dark:text-background-muted p-2 rounded-md',
        className,
      )}
    >
      <code className="min-w-0 whitespace-pre-wrap">
        {tokensOf(code).map((part, index) =>
          part.trim() === '' ? (
            part
          ) : (
            <span key={index} className="inline-block max-w-full wrap-anywhere">
              {part}
            </span>
          ),
        )}
      </code>
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
