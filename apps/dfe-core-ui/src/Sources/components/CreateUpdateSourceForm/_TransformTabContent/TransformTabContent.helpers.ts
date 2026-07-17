import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm/sourceForm.schema';

export type AssignTransformOptions = 'none' | 'define_transform';

export const getInitialAssignTransform = (
  transform: CreateUpdateSourceFormData['transform'],
): AssignTransformOptions => {
  if (!transform?.engine) {
    return 'none';
  }
  return 'define_transform';
};
