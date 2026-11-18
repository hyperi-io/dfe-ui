import { cn } from '@repo/dfe-shared-ui';
import { clampSpan } from './CelExpression.helpers';
import { TSpan } from './types';

export const ExpressionSpan = ({
  expression,
  span,
}: {
  expression: string;
  span: TSpan;
}) => {
  const { start, end } = clampSpan(expression, span);
  const at = expression.slice(start, end);
  const atEnd = !at && start === expression.length;
  return (
    <p
      data-testid="when-error-span"
      className={cn(
        'm-0 rounded-md border px-2 py-1 font-mono text-sm whitespace-pre-wrap break-all',
        'border-error/30 bg-error/5 dark:border-dark-error/40',
      )}
    >
      {expression.slice(0, start)}
      <mark
        aria-label={
          at
            ? `Refused at: ${at}`
            : atEnd
              ? 'Refused at the end of the expression'
              : 'Refused here'
        }
        className={cn(
          'bg-error/15 text-error rounded-xs',
          'underline decoration-wavy decoration-error underline-offset-4',
          // An empty span still needs a mark a reader can see.
          !at && 'mx-0.5 inline-block h-4 w-1.5 bg-error/60 align-text-bottom',
        )}
      >
        {at}
      </mark>
      {expression.slice(end)}
    </p>
  );
};
