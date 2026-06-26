import { SampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { Card } from 'antd';

export const SampleRowsCard = ({
  row,
}: {
  row: SampleRowsResponse['rows'][number];
}) => {
  return (
    <Card size="small">
      <pre className="font-mono text-sm">{JSON.stringify(row, null, 2)}</pre>
    </Card>
  );
};
