import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { FieldMapSelect } from '@/core/components/FieldMapSelect';
import { RbacProtected } from '@/core/components/RbacProtected';
import { cn } from '@/core/utils/style';
import { IconPlus } from '@repo/dfe-icons';
import { Button, Select, SelectProps } from 'antd';

interface FieldMapSelectCreateProps extends SelectProps {
  source_name: string;
}
export const FieldMapSelectCreate = ({
  source_name,
  onChange,
  ...props
}: FieldMapSelectCreateProps) => {
  const handleChange = (value: string) => {
    onChange?.(value);
  };

  return (
    <RbacProtected action={RbacProtected.rbacActions.fieldmap_read}>
      <RbacProtected.Unrestricted>
        <div className="flex gap-x-2">
          <FieldMapSelect
            {...props}
            placeholder="Select field map"
            onChange={handleChange}
            allowClear
          />

          <CreateFieldMapDrawer
            title="Create New Standard"
            className={{ trigger: 'mt-auto' }}
            onSuccess={({ standard, source }) => {
              handleChange(`${standard}:${source}`);
            }}
            initialValues={{
              standard: '',
              source: source_name,
            }}
            disabledFields={{
              source: !!source_name,
            }}
          />
        </div>
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <div className="flex gap-x-2">
          <Select placeholder="Select mapping standards" disabled />
          <Button
            type="default"
            htmlType="button"
            disabled
            className={cn('border border-tertiary text-tertiary')}
            icon={<IconPlus className="text-tertiary" />}
          >
            Create New Standard
          </Button>
        </div>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
