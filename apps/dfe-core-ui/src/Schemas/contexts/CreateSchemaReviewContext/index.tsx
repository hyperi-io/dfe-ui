import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { CreateSchemaFormData } from '@/Schemas/components/CreateSchemaForm/CreateSchemaForm.schema';
import { useListSchemasContext } from '@/Schemas/contexts/ListSchemasContext';
import { useCreateSchema } from '@/Schemas/hooks/useCreateSchema';
import { transformFormDataToRequestBody } from '@/Schemas/hooks/useCreateSchema/useCreateSchema.helpers';
import { IconChevronsLeft } from '@repo/dfe-icons';
import { Button, notification } from 'antd';
interface CreateSchemaReviewContextValue {
  isReviewing: boolean;
  setIsReviewing: (isReviewing: boolean) => void;
  drawerTitle: React.ReactNode | string;
  setDrawerTitle: (drawerTitle: React.ReactNode | string) => void;
  reviewValues: CreateSchemaFormData | null;
  setReviewValues: (reviewValues: CreateSchemaFormData | null) => void;
  buttonLabel: string;
  notificationContextHolder: React.ReactNode;
  handleGoBack: () => void;
  handleReview: (values: CreateSchemaFormData) => void;
  handleSubmit: (values: CreateSchemaFormData) => void;
  isCreatingSchema: boolean;
}

export const CreateSchemaReviewContext =
  createContext<CreateSchemaReviewContextValue | null>(null);

export const CreateSchemaReviewProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const [drawerTitle, setDrawerTitle] = useState<React.ReactNode | string>(
    'Add Schema',
  );
  const [reviewValues, setReviewValues] = useState<CreateSchemaFormData | null>(
    null,
  );

  const buttonLabel = isReviewing ? 'Create Schema' : 'Review Schema';

  const [api, notificationContextHolder] = notification.useNotification();

  const { refetch: refetchSchemas, setSelectedSchema } =
    useListSchemasContext();

  const { mutate: createSchema, isPending: isCreatingSchema } = useCreateSchema(
    {
      onSuccess: ({ path, current }) => {
        setSelectedSchema({
          schema_path: path ?? null,
          schema_version: current,
        });
        refetchSchemas();
        api.success({
          title: 'Schema created successfully',
          placement: 'bottomLeft',
        });
      },
    },
  );

  const handleGoBack = useCallback(() => {
    setDrawerTitle('Add Schema');
    setIsReviewing(false);
  }, [setDrawerTitle, setIsReviewing]);

  const handleReview = useCallback(
    (values: CreateSchemaFormData) => {
      setDrawerTitle(
        <div className="flex items-center gap-2">
          <Button
            className="text-tertiary! hover:text-tertiary/70! p-0"
            icon={<IconChevronsLeft />}
            onClick={handleGoBack}
            type="link"
            color="blue"
          >
            Back
          </Button>
          Review Schema
        </div>,
      );
      setIsReviewing(true);
      setReviewValues(values);
    },
    [setDrawerTitle, setIsReviewing, setReviewValues, handleGoBack],
  );

  const handleSubmit = useCallback(
    (values: CreateSchemaFormData) => {
      const { requestBody } = transformFormDataToRequestBody(values);
      createSchema(requestBody);
    },
    [createSchema],
  );

  const value = useMemo(
    () => ({
      isReviewing,
      setIsReviewing,
      drawerTitle,
      setDrawerTitle,
      reviewValues,
      setReviewValues,
      buttonLabel,
      notificationContextHolder,
      handleGoBack,
      handleReview,
      handleSubmit,
      isCreatingSchema,
    }),
    [
      isReviewing,
      setIsReviewing,
      drawerTitle,
      setDrawerTitle,
      reviewValues,
      setReviewValues,
      buttonLabel,
      notificationContextHolder,
      handleGoBack,
      handleReview,
      handleSubmit,
      isCreatingSchema,
    ],
  );

  return (
    <CreateSchemaReviewContext.Provider value={value}>
      {children}
    </CreateSchemaReviewContext.Provider>
  );
};

export const useCreateSchemaReviewContext = () => {
  const context = useContext(CreateSchemaReviewContext);
  if (!context) {
    throw new Error(
      'useCreateSchemaReviewContext must be used within a CreateSchemaReviewProvider',
    );
  }
  return context;
};
