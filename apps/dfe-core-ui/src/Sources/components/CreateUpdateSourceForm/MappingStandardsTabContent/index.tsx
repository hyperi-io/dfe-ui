import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { RbacProtected } from '@/core/components/RbacProtected';
import { FormInstance, FormRule } from 'antd';
import { MappingStandardsForm } from './MappingStandardsForm';

export const MappingStandardsTabContent = ({
  formValidation,
  initialValues,
  form,
}: {
  formValidation: FormRule;
  initialValues?: CreateUpdateSourceFormData;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => (
  <RbacProtected action={RbacProtected.rbacActions.CONFIG_READ}>
    <RbacProtected.Unrestricted>
      <MappingStandardsForm
        formValidation={formValidation}
        form={form}
        initialValues={initialValues}
      />
    </RbacProtected.Unrestricted>
    <RbacProtected.Restricted>
      <RbacProtected.RestrictedRoute />
    </RbacProtected.Restricted>
  </RbacProtected>
);
