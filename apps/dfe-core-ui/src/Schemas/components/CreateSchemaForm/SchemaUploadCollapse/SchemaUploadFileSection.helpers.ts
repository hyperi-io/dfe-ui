import { PreloadedSchema } from '@/Schemas/components/CreateSchemaForm/types';
import { v4 as uuidv4 } from 'uuid';

export const transformDataToUploadedSchemaRow = (data: PreloadedSchema) => {
  return data.map((value) => ({
    ...value,
    id: uuidv4(),
    imported: true as const,
  }));
};
