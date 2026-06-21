import { ContentCard } from '@/core/components/ContentCard';
import { cn } from '@/core/utils/style';
import { Form, FormRule, Input, Select } from 'antd';

export const RuleSettings = ({
  formValidation,
  children,
}: {
  formValidation: FormRule;
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative">
      <ContentCard className="flex w-full gap-x-2 items-center border-b border-foreground/10 dark:border-dark-foreground/10 p-0">
        <div
          className={cn(
            'flex gap-x-2 w-full pl-6 py-4',
            children ? 'pl-0' : 'pr-6',
          )}
        >
          <Form.Item
            name="name"
            label="Name"
            className="m-0! grow text-sm w-full"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input className="w-full" />
          </Form.Item>

          <Form.Item
            label="Severity"
            name="severity"
            className="m-0! grow text-sm w-full"
            layout="vertical"
            rules={[formValidation]}
          >
            <Select
              className="w-full"
              options={[
                { label: 'Low', value: 'low' },
                { label: 'Medium', value: 'medium' },
                { label: 'High', value: 'high' },
                { label: 'Critical', value: 'critical' },
              ]}
            />
          </Form.Item>

          {/* <Form.Item
            label="Source Type"
            name="source_type"
            className="m-0! grow text-sm"
            layout="vertical"
            rules={[formValidation]}
          >
            <Select
              className="w-full"
              options={[
                { label: 'Raw', value: 'raw' },
                { label: 'HyperDX', value: 'hyperdx' },
              ]}
            />
          </Form.Item> */}
        </div>
        {children}
      </ContentCard>
    </div>
  );
};
