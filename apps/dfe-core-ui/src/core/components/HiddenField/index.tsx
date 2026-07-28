import { IconEye, IconEyeOff } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

export const HiddenField = ({ value }: { value: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div className="flex items-center gap-2 w-full h-full">
      <span className="px-2 py-1 h-full rounded-md shadow-inner bg-foreground/10 dark:bg-dark-foreground/10 text-foreground dark:text-dark-foreground inline-block grow w-full">
        {isVisible ? value : '•'.repeat(value.length)}
      </span>

      <Button
        type="default"
        className="ml-auto"
        size="small"
        icon={isVisible ? <IconEyeOff /> : <IconEye />}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={`${isVisible ? 'Hide' : 'Show'} value`}
      />
    </div>
  );
};
