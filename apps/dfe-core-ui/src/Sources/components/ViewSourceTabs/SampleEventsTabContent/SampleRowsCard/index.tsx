import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { JsonViewer, JsonViewerProvider } from '@repo/dfe-json-viewer-cn';
import { Card } from 'antd';
import { RecursiveRendererActionMenu } from './RecursiveRendererActionMenu';

// Row keys and the column's own top level open; anything deeper is one click away.
const INITIAL_DEPTH = 0;

export const SampleRowsCard = ({
  row,
}: {
  row: TSampleRowsResponse['rows'][number];
}) => {
  return (
    <Card size="small">
      <JsonViewerProvider action={RecursiveRendererActionMenu}>
        <JsonViewer
          data={row}
          initialDepth={INITIAL_DEPTH}
          className="text-xs"
          rootName={row._uuid as string}
        />
      </JsonViewerProvider>
    </Card>
  );
};
