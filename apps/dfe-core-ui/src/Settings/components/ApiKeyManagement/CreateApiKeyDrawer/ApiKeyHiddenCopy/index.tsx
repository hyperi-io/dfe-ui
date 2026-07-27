import { IconCopy, IconEye, IconEyeOff } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useMemo, useState } from 'react';

export const ApiKeyHiddenCopy = ({ apiKey }: { apiKey: string }) => {
  const [visible, setVisible] = useState(false);

  const hiddenApiKey = useMemo(() => {
    return apiKey.replace(/./g, '*');
  }, [apiKey]);

  return (
    <pre className="flex justify-between bg-foreground-muted text-background-muted dark:bg-foreground-muted dark:text-background-muted p-2 rounded-md">
      <code>{visible ? apiKey : hiddenApiKey}</code>
      <div className="flex gap-2">
        <Button
          type="default"
          aria-label="Toggle visibility"
          icon={visible ? <IconEyeOff /> : <IconEye />}
          onClick={() => setVisible(!visible)}
          shape="circle"
          size="small"
        />
        <Button
          type="default"
          aria-label="Copy to clipboard"
          icon={<IconCopy />}
          onClick={() => navigator.clipboard.writeText(apiKey)}
          shape="circle"
          size="small"
        />
      </div>
    </pre>
  );
};
