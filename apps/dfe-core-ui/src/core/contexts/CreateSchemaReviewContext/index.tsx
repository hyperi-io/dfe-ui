import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { CreateSchemaFormData } from '@/core/validationSchemas/CreateSchemaForm/CreateSchemaForm.schema';
import { IconChevronsLeft } from '@repo/dfe-icons';
import { Button } from 'antd';

interface FormErrorMessage {
  message: string;
  errors: { message: string }[];
}
interface CreateSchemaReviewContextValue {
  isReviewing: boolean;
  drawerTitle: React.ReactNode | string;
  reviewValues: CreateSchemaFormData | null;
  buttonLabel: string;
  handleGoBack: () => void;
  handleReview: (values: CreateSchemaFormData) => void;
  handleReset: () => void;
  formErrorMessage: FormErrorMessage | null;
  setFormErrorMessage: (formErrorMessage: FormErrorMessage | null) => void;
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

  const [formErrorMessage, setFormErrorMessage] =
    useState<FormErrorMessage | null>(null);

  const buttonLabel = isReviewing ? 'Create Schema' : 'Review Schema';

  const handleReset = useCallback(() => {
    setDrawerTitle('Add Schema');
    setIsReviewing(false);
    setReviewValues(null);
    setFormErrorMessage(null);
  }, [setDrawerTitle, setIsReviewing, setReviewValues, setFormErrorMessage]);

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

  const value = useMemo(
    () => ({
      isReviewing,
      drawerTitle,
      reviewValues,
      buttonLabel,
      handleGoBack,
      handleReview,
      handleReset,
      formErrorMessage,
      setFormErrorMessage,
    }),
    [
      isReviewing,
      drawerTitle,
      reviewValues,
      buttonLabel,
      handleGoBack,
      handleReview,
      handleReset,
      formErrorMessage,
      setFormErrorMessage,
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
