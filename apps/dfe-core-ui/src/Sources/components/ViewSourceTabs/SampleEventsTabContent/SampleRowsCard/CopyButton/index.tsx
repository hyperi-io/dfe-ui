import { IconCheck, IconCopy } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useCallback, useState } from 'react';
import { stringifyValue } from './helpers';

export const CopyButton = ({ value }: { value: unknown }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const text = stringifyValue(value);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <Button
      className="w-full justify-start"
      icon={copied ? <IconCheck /> : <IconCopy />}
      onClick={() => {
        handleCopy();
      }}
      type="text"
      size="small"
    >
      {copied ? 'Copied!' : 'Copy'}
    </Button>
  );
};
