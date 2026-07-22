import { Card } from 'antd';
import { Fragment } from 'react/jsx-runtime';

export const GitOpsLogsCard = ({
  dataItem,
}: {
  dataItem: unknown & { sha: string };
}) => {
  return (
    <Card size="small">
      <dl className="grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-1 text-xs">
        {Object.entries(dataItem).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd className="ellipsis truncate">{value}</dd>
          </Fragment>
        ))}
      </dl>
    </Card>
  );
};
