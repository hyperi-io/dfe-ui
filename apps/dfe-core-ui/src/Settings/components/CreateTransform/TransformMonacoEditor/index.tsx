'use client';

import { MonacoEditor } from '@/core/components/Editor/MonacoEditor';

export const TransformMonacoEditor = ({
  ...props
}: React.ComponentProps<typeof MonacoEditor>) => {
  return <MonacoEditor {...props} />;
};
