import { ContentCard } from '@/core/components/ContentCard';
import { cn } from '@/core/utils/style';
import { Form, FormRule, Input, Select } from 'antd';
import { DisabledFields } from '..';

export const RuleSettings = ({
  formValidation,
  children,
  className,
  disabledFields,
}: {
  formValidation: FormRule;
  children?: React.ReactNode;
  className?: string;
  disabledFields?: DisabledFields;
}) => {
  return (
    <div className="relative">
      <ContentCard
        className={cn(
          'flex items-center w-full p-0 border-b gap-x-2 border-foreground/10 dark:border-dark-foreground/10',
          className,
        )}
      >
        <div
          className={cn('flex gap-x-2 w-full pl-6 py-4', !children && 'pr-6')}
        >
          <Form.Item
            name="name"
            label="Name"
            className="m-0! grow text-sm w-full"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input disabled={disabledFields?.name} className="w-full" />
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
        </div>
        {children}
      </ContentCard>
    </div>
  );
};
