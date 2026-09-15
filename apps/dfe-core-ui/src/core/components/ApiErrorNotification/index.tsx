import { FormNotification } from '@/core/components/FormNotification';
import {
  getApiErrorFieldMessages,
  getApiErrorResponseBody,
} from '@/core/config/api/client';

interface ApiErrorNotificationProps {
  error: unknown;
  fallback?: string;
  className?: string;
}

/**
 * The engine's refusal on a failed submit: the summary and the fields behind it.
 *
 * The summary is often a count rather than the complaint, so a dialog that
 * renders `message` alone never tells the user which field was refused.
 */
export const ApiErrorNotification = ({
  error,
  fallback = 'An unexpected error occurred',
  className,
}: ApiErrorNotificationProps) => {
  if (error == null) return null;

  const summary =
    getApiErrorResponseBody(error)?.message ||
    (error instanceof Error ? error.message : '') ||
    fallback;
  const details = getApiErrorFieldMessages(error);

  return (
    <FormNotification
      className={className}
      type="error"
      title={details.length > 0 ? summary : undefined}
      text={
        details.length > 0 ? (
          <ul className="list-disc pl-4">
            {details.map((line, index) => (
              <li key={`${index}-${line}`} className="text-sm">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          summary
        )
      }
    />
  );
};
