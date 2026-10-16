import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { JsonView } from '@repo/dfe-json-viewer-cn';
import { Card } from 'antd';

// Row keys and the column's own top level open; anything deeper is one click away.
const INITIAL_DEPTH = 0;

export const SampleRowsCard = ({
  row,
}: {
  row: TSampleRowsResponse['rows'][number];
}) => {
  return (
    <Card size="small">
      <JsonView
        data={row}
        initialDepth={INITIAL_DEPTH}
        className="text-xs"
        rootName={row._uuid as string}
      />
    </Card>
  );
};
