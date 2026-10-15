import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { FieldMapSelect, fieldMapPin } from '@/core/components/FieldMapSelect';
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
        {/* The create button sits under the picker so the picker keeps the full column width its neighbours have. */}
        <div className="flex flex-col items-start gap-2">
          <FieldMapSelect
            {...props}
            className="w-full"
            placeholder="Select field map"
            onChange={handleChange}
            allowClear
          />

          <CreateFieldMapDrawer
            title="Create New Standard"
            onSuccess={(fieldMap) => {
              handleChange(fieldMapPin(fieldMap));
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
        <div className="flex flex-col items-start gap-2">
          <Select
            className="w-full"
            placeholder="Select mapping standards"
            disabled
          />
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
