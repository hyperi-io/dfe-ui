import { Form } from '@/core/components/Form';
import { cn } from '@/core/utils/style';
import { CreateUpdateSourceFormData } from '@/Sources/components/CreateUpdateSourceForm';
import { TRuleError } from '@/Sources/utils/ingestErrors';
import { FormInstance, FormRule, Input } from 'antd';
import type { TextAreaRef } from 'antd/es/input/TextArea';
import { useEffect, useRef } from 'react';

const EXAMPLE = "data_stream.dataset == 'okta.system'";

type TSpan = NonNullable<TRuleError['span']>;

/** The span the engine names, clamped to the text as it stands. */
const clampSpan = (text: string, span: TSpan) => {
  const start = Math.min(Math.max(span.start, 0), text.length);
  const end = Math.min(Math.max(span.end, start), text.length);
  return { start, end };
};

/**
 * The expression with the part the engine stopped at underlined.
 *
 * Spans count UTF-16 code units, which is how a JavaScript string indexes, so
 * they slice the text directly.
 */
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

/**
 * The receiver match as one CEL Fast expression.
 *
 * The engine checks it against the receiver's own profile at save. A refusal
 * comes back with the span it stopped at, which is selected in the box and
 * underlined beneath it until the expression is edited.
 */
export const WhenExpression = ({
  form,
  formValidation,
  ruleErrors = [],
}: {
  form: FormInstance<CreateUpdateSourceFormData>;
  formValidation: FormRule;
  ruleErrors?: TRuleError[];
}) => {
  const textAreaRef = useRef<TextAreaRef>(null);
  const expression = (Form.useWatch('when', form) as string | undefined) ?? '';
  const refusals = ruleErrors.filter((error) => error.field === 'when');
  const firstSpan = refusals.find((error) => error.span)?.span;
  // The errors are re-derived on every render, so the effects key on their values.
  const spanStart = firstSpan?.start;
  const spanEnd = firstSpan?.end;
  const refusalText = refusals.map((error) => error.message).join(' ');

  // As a field error, so the box is marked invalid until the next edit re-checks it.
  useEffect(() => {
    if (!refusalText) return;
    form.setFields([{ name: 'when', errors: [refusalText] }]);
  }, [form, refusalText]);

  useEffect(() => {
    const element = textAreaRef.current?.resizableTextArea?.textArea;
    if (!element || spanStart === undefined || spanEnd === undefined) return;
    const { start, end } = clampSpan(element.value, {
      start: spanStart,
      end: spanEnd,
    });
    element.focus();
    element.setSelectionRange(start, end);
  }, [spanStart, spanEnd]);

  return (
    <div className="flex flex-col gap-2">
      <Form.Item
        name="when"
        label="Expression"
        rules={[formValidation]}
        required
        extra={
          <>
            A CEL Fast condition each record is tested with, checked when you
            save. For example <code className="font-mono">{EXAMPLE}</code>
          </>
        }
      >
        <Input.TextArea
          ref={textAreaRef}
          className="font-mono"
          spellCheck={false}
          autoSize={{ minRows: 2, maxRows: 8 }}
          placeholder={EXAMPLE}
        />
      </Form.Item>
      {refusals
        .filter((error) => error.span)
        .map((error, index) => (
          <ExpressionSpan
            key={`${index}-${error.message}`}
            expression={expression}
            span={error.span as TSpan}
          />
        ))}
    </div>
  );
};
