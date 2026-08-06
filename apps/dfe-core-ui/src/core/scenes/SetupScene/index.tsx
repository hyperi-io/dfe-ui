'use client';

import { SetupWizard } from '@/core/components/SetupWizard';
import { cn } from '@/core/utils/style';
import './Setup.css';

export const SetupScene = () => {
  return (
    <main
      className={cn(
        'h-screen w-full flex flex-col items-center justify-center',
        'bg-tertiary bg-linear-to-r from-tertiary via-secondary to-brand-primary bg-size-[200%_200%]',
      )}
      style={{
        animation: 'gradient 20s ease infinite',
      }}
    >
      <SetupWizard />
    </main>
  );
};
