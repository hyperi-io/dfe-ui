'use client';

import { MainContentCard } from '@/core/components/ContentCard';
import { CreateTransform } from '@/Transforms/components/CreateTransform';

export const TransformsScene = () => {
  return (
    <MainContentCard>
      <CreateTransform />
    </MainContentCard>
  );
};
