import { SampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { Card } from 'antd';
import { RecursiveRowRenderer } from './RecursiveRowRenderer';

export const SampleRowsCard = ({
  row,
}: {
  row: SampleRowsResponse['rows'][number];
}) => {
  return (
    <Card size="small">
      <RecursiveRowRenderer row={row} />
    </Card>
  );
};
