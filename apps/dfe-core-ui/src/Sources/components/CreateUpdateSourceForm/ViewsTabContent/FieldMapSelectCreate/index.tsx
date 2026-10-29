import { CreateFieldMapDrawer } from '@/core/components/CreateFieldMapDrawer';
import { FieldMapSelect, fieldMapPin } from '@/core/components/FieldMapSelect';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { IconPlus } from '@repo/dfe-icons';
import { Button, Select, SelectProps } from 'antd';

const CREATE_LABEL = 'Create Field Map';

interface FieldMapSelectCreateProps extends SelectProps {
  source_name: string;
  /** The view's standard. The picker offers only its maps and a new map takes it. */
  standard?: string;
}
export const FieldMapSelectCreate = ({
  source_name,
  standard,
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
            standard={standard}
            className="w-full"
            placeholder="Select field map"
            onChange={handleChange}
            allowClear
          />

          {standard ? (
            <CreateFieldMapDrawer
              // The drawer's form reads its initial values once, so a new standard needs a new form.
              key={standard}
              title={CREATE_LABEL}
              onSuccess={(fieldMap) => {
                handleChange(fieldMapPin(fieldMap));
              }}
              initialValues={{
                standard,
                source: source_name,
              }}
              disabledFields={{
                standard: true,
                source: !!source_name,
              }}
            />
          ) : (
            <Tooltip destroyOnHidden title="Select a standard first">
              <span className="inline-block">
                <CreateFieldMapDrawer title={CREATE_LABEL} disabled />
              </span>
            </Tooltip>
          )}
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
            {CREATE_LABEL}
          </Button>
        </div>
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
