import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormInstance, FormRule } from 'antd';
import { MetaSchemaForm } from './MetaSchemaForm';

export const SchemaConfigTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <RbacProtected action={RbacProtected.rbacActions.schema_read}>
        <RbacProtected.Unrestricted>
          <MetaSchemaForm formValidation={formValidation} form={form} />
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted>
          <RbacProtected.RestrictedRoute />
        </RbacProtected.Restricted>
      </RbacProtected>
    </div>
  );
};
