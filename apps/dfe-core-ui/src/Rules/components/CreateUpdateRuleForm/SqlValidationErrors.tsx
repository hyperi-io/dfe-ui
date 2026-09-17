import { FormNotification } from '@/core/components/FormNotification';
import { TSqlValidationResponse } from '@/Rules/hooks/useValidateRule/types';

type TSqlValidationError = NonNullable<
  TSqlValidationResponse['errors']
>[number];

/**
 * The engine's verdict on a failed Validate.
 *
 * The suggestion is the half that says what to change, so it renders with the
 * message rather than being dropped.
 */
export const SqlValidationErrors = ({
  errors,
}: {
  errors?: TSqlValidationError[];
}) => {
  if (!errors?.length) return null;

  return (
    <FormNotification
      type="error"
      title="SQL validation failed"
      text={
        <ul className="flex flex-col gap-y-2">
          {errors.map((error, index) => (
            <li key={`${index}-${error.message}`} className="text-sm">
              <span className="block">
                {error.position == null
                  ? error.message
                  : `${error.message} (position ${error.position})`}
              </span>
              {error.suggestion && (
                <span className="block opacity-80">{error.suggestion}</span>
              )}
            </li>
          ))}
        </ul>
      }
    />
  );
};
