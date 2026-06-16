import { AceEditor } from '@/core/components/AceEditor';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Alert } from 'antd';

export const GeneratedDdlTabContent = ({
  source_name,
  source_version,
  create_table,
}: {
  source_name: string;
  source_version: string;
  create_table?: string;
}) => {
  const { componentHeight } = useSetComponentHeight({
    offset: 280,
  });

  if (!create_table)
    return (
      <Alert
        title={
          <div className="flex items-center gap-2">
            <IconInfoCircle /> No DDL generated for source:
            <span className="font-medium">{source_name}</span>
          </div>
        }
        type="warning"
      />
    );

  return (
    <AceEditor
      name={`${source_name}-${source_version}`}
      value={create_table}
      mode="sql"
      height={`${componentHeight}px`}
      readOnly={true}
    />
  );
};
