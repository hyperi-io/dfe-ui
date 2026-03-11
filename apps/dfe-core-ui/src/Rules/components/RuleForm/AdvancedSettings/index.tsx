import { ContentCard } from '@/core/components/ContentCard';
import { IconChevronDown, IconChevronUp } from '@dfe/icons';
import { Button, Form, FormRule, Input, Select, Switch } from 'antd';
import { useState } from 'react';

export const AdvancedSettings = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="relative">
      <ContentCard className="flex w-full gap-x-2 items-center border-b border-foreground/10 dark:border-dark-foreground/10">
        <div className="flex gap-x-2 w-full">
          <Form.Item
            name="name"
            label="Name"
            className="m-0! grow text-sm"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input className="w-full" />
          </Form.Item>

          <Form.Item
            label="Severity"
            name="severity"
            className="m-0! grow text-sm"
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

          <Form.Item
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
          </Form.Item>
        </div>

        <Button
          type="text"
          aria-label="Toggle advanced settings"
          onClick={() => setShowAdvanced(!showAdvanced)}
          icon={
            showAdvanced ? (
              <IconChevronUp className="size-4" />
            ) : (
              <IconChevronDown className="size-4" />
            )
          }
          iconPlacement="end"
        >
          Advanced Settings
        </Button>
      </ContentCard>
      {showAdvanced && (
        <ContentCard className="absolute w-full bg-background rounded-md shadow-md z-10 flex gap-x-2">
          <Form.Item
            label="CEL Filter"
            name="cel_filter"
            className="m-0! grow"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input className="w-full" />
          </Form.Item>
          <Form.Item
            label="Hunt Name"
            name="hunt_name"
            className="m-0! grow"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input className="w-full" />
          </Form.Item>
          <Form.Item
            label="Source"
            name="source"
            className="m-0! grow"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input className="w-full" />
          </Form.Item>
          <Form.Item
            label="Cost Window Minutes"
            name="cost_window_minutes"
            className="m-0! grow"
            layout="vertical"
            rules={[formValidation]}
          >
            <Input type="number" className="w-full" />
          </Form.Item>
          <Form.Item
            label="Estimate Cost"
            name="estimate_cost"
            className="m-0!"
            layout="vertical"
            rules={[formValidation]}
          >
            <Switch />
          </Form.Item>
        </ContentCard>
      )}
    </div>
  );
};
