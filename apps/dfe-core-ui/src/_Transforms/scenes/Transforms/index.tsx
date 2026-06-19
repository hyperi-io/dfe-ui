'use client';

import { CreateTransform } from '@/_Transforms/components/CreateTransform';
import { MainContentCard } from '@/core/components/ContentCard';

export const TransformsScene = () => {
  return (
    <MainContentCard>
      <CreateTransform />
    </MainContentCard>
  );
};
