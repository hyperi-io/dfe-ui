import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';
import { FormRule, Radio, type FormInstance } from 'antd';
import { useState } from 'react';
import { TransformForm } from './TransformForm';
import {
  AssignTransformOptions,
  getInitialAssignTransform,
} from './TransformTabContent.helpers';

export const TransformTabContent = ({
  formValidation,
  form,
}: {
  formValidation: FormRule;
  form: FormInstance<CreateUpdateSourceFormData>;
}) => {
  const initialTransform = form.getFieldValue('transform');
  const [assignTransform, setAssignTransform] =
    useState<AssignTransformOptions>(() =>
      getInitialAssignTransform(initialTransform),
    );
  return (
    <div className="flex flex-col gap-2">
      <Radio.Group
        value={assignTransform}
        onChange={(e) => {
          setAssignTransform(e.target.value as AssignTransformOptions);
        }}
      >
        <Radio value="none">No Transform</Radio>
        <Radio value="define_transform">Define Transform</Radio>
      </Radio.Group>

      {assignTransform === 'define_transform' && (
        <TransformForm formValidation={formValidation} />
      )}
    </div>
  );
};
