import { devLogger } from '@dfe/dev-logger';

interface PrettifyJSONProps {
  value: string;
  onError?: (error: Error) => void;
  component?: string;
}

/**
 * Prettify a JSON string
 *
 * @param value - The JSON string to prettify
 * @param onError - The function to call if an error occurs
 * @param component - The component name - used for logging
 * @returns The prettified JSON string
 */

export const prettifyJSON = ({
  value,
  onError,
  component,
}: PrettifyJSONProps) => {
  try {
    const prettifiedDataRecords: Record<string, unknown>[] = JSON.parse(
      value,
    ) as Record<string, unknown>[];
    return JSON.stringify(prettifiedDataRecords, null, 2);
  } catch (error) {
    const label = component ? `prettifyJSON [${component}]` : 'prettifyJSON';
    devLogger({
      level: 'error',
      label,
      message: (error as Error).message,
    });

    onError?.(error as Error);
  }
};
