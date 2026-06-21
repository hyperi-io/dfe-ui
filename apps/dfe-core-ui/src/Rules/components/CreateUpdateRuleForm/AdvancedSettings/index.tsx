import { ContentCard } from '@/core/components/ContentCard';
import { IconChevronDown, IconChevronUp } from '@repo/dfe-icons';
import { Button, Form, FormRule, Input, Switch } from 'antd';
import { useState } from 'react';

export const AdvancedSettings = ({
  formValidation,
}: {
  formValidation: FormRule;
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <>
      <Button
        type="text"
        className="mr-6"
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
      {showAdvanced && (
        <ContentCard className="absolute w-full bg-background rounded-md shadow-md z-10 flex gap-x-2 -bottom-25 left">
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
    </>
  );
};
