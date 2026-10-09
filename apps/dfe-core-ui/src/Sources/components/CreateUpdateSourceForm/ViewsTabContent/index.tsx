import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { Form } from '@/core/components/Form';
import { Tooltip } from '@/core/components/Tooltip';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { cn } from '@/core/utils/style';
import { type CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { IconPlus, IconTrash } from '@repo/dfe-icons';
import { Button, FormInstance, FormRule, Input, Select } from 'antd';
import { MAX_VIEWS, STANDARD_OPTIONS } from './constants';
import { FieldMapSelectCreate } from './FieldMapSelectCreate';
export const ViewsTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const { componentHeight } = useSetComponentHeight({ offset: 280 });
  const watchViews = Form.useWatch('views', form);
  const selectedStandards = watchViews?.map((view) => view.standard);

  const standardsOptions = STANDARD_OPTIONS.map((standard) => {
    const isSelected = selectedStandards?.includes(standard.value);
    return {
      label: isSelected ? (
        <Tooltip
          destroyOnHidden
          title="Standard already selected"
          placement="left"
        >
          {standard.label}
        </Tooltip>
      ) : (
        standard.label
      ),
      value: standard.value,
      disabled: isSelected,
    };
  });

  return (
    <Form.List name="views">
      {(fields, { add, remove }) => (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <p className="text-sm text-foreground-muted dark:text-foreground-muted-dark">
              Configure the standards that will be used to create the views -
              Multiple standards can be selected but no duplicates are allowed
            </p>
            {fields.length >= MAX_VIEWS ? (
              <Tooltip
                destroyOnHidden
                title={`Maximum of ${MAX_VIEWS} views (one per standard)`}
              >
                <span className="ml-auto inline-block">
                  <Button htmlType="button" icon={<IconPlus />} disabled>
                    Add View
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                htmlType="button"
                className="ml-auto"
                icon={<IconPlus />}
                onClick={() => add({ standard: '' })}
              >
                Add View
              </Button>
            )}
          </div>
          <CustomScrollbar height={componentHeight}>
            <ul className="flex flex-col gap-2">
              {fields.map(({ key, name, ...restField }) => (
                <li
                  className={cn(
                    'border border-foreground/10 dark:border-foreground/10 rounded-md p-4 ',
                    'relative grid grid-cols-2 gap-2 w-full',
                  )}
                  key={key}
                >
                  <Button
                    className="absolute top-2 right-2 z-1"
                    icon={<IconTrash />}
                    size="small"
                    shape="circle"
                    type="text"
                    htmlType="button"
                    onClick={() => remove(name)}
                  />
                  <Form.Item
                    {...restField}
                    className="col-span-2"
                    name={[name, 'standard']}
                    label="Standard"
                    rules={[formValidation]}
                  >
                    <Select
                      options={standardsOptions}
                      placeholder="Select standard"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'field_map']}
                    label="Field Map"
                    rules={[formValidation]}
                  >
                    <FieldMapSelectCreate
                      source_name={form.getFieldValue('source')}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'taxonomy']}
                    label="Taxonomy"
                  >
                    <Input placeholder="Enter taxonomy" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'category']}
                    label="Category"
                  >
                    <Input placeholder="Enter category" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'service']}
                    label="Service"
                  >
                    <Input placeholder="Enter service" />
                  </Form.Item>

                  <Form.List name={[name, 'custom_mappings']}>
                    {(fields, { add, remove }) => (
                      <div className="col-span-2 flex flex-col gap-2">
                        <div className="flex items-center gap-2 justify-between">
                          <p className="text-sm text-foreground-muted dark:text-foreground-muted-dark w-full">
                            Add custom mappings to the view
                          </p>
                          <Button
                            htmlType="button"
                            icon={<IconPlus />}
                            onClick={() => add({ key: '', value: '' })}
                          >
                            Add Custom Mapping
                          </Button>
                        </div>

                        {fields.map(({ key, name, ...restField }) => (
                          <div
                            className="grid grid-cols-[1fr_1fr_auto] items-center gap-2 w-full mt-2"
                            key={key}
                          >
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              label="Key"
                              layout="horizontal"
                              rules={[formValidation]}
                            >
                              <Input placeholder="Enter key" />
                            </Form.Item>
                            <Form.Item
                              {...restField}
                              name={[name, 'value']}
                              label="Value"
                              layout="horizontal"
                              rules={[formValidation]}
                            >
                              <Input placeholder="Enter value" />
                            </Form.Item>
                            <Button
                              htmlType="button"
                              shape="circle"
                              icon={<IconTrash />}
                              onClick={() => remove(name)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.List>
                </li>
              ))}
            </ul>
          </CustomScrollbar>
        </div>
      )}
    </Form.List>
  );
};
