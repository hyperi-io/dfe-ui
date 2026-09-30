import { TSampleRowsResponse } from '@/Sources/hooks/useFetchSampleRows/types';
import { Card } from 'antd';
import { RecursiveRowRenderer } from './RecursiveRowRenderer';

export const SampleRowsCard = ({
  row,
}: {
  row: TSampleRowsResponse['rows'][number];
}) => {
  return (
    <Card size="small">
      <RecursiveRowRenderer row={row} />
    </Card>
  );
};
