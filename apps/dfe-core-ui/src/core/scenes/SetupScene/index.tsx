'use client';

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
      <div className="bg-background rounded-lg p-4 shadow-lg text-foreground min-w-96 flex flex-col items-center gap-4">
        Setup
      </div>
    </main>
  );
};
