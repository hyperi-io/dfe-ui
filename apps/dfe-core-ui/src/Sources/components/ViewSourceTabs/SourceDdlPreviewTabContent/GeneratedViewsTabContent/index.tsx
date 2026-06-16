import { AceEditor } from '@/core/components/AceEditor';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Alert } from 'antd';

export const GeneratedViewsTabContent = ({
  source_name,
  source_version,
  views,
}: {
  source_name: string;
  source_version: string;
  views?: Record<string, string>;
}) => {
  const hasViews = Object.keys(views ?? {}).length > 0;
  if (!hasViews)
    return (
      <Alert
        title={
          <div className="flex items-center gap-2">
            <IconInfoCircle /> No views generated for source:
            <span className="font-medium">{source_name}</span>
          </div>
        }
        type="warning"
      />
    );

  return (
    <div className="flex flex-col gap-y-4">
      {Object.entries(views ?? {}).map(([key, value]) => (
        <div className="flex flex-col gap-y-2" key={key}>
          <h3>{key}</h3>
          <AceEditor
            name={`${source_name}-${source_version}-${key}`}
            value={value}
            mode="sql"
            height="200px"
            readOnly={true}
          />
        </div>
      ))}
    </div>
  );
};
