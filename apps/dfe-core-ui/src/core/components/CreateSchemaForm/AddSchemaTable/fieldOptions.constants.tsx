import { Tooltip } from '@/core/components/Tooltip';
import type { TSchemaVocabularyChOverride } from '@/core/hooks/useFetchSchemaVocabulary/types';
import { IconInfoCircle } from '@repo/dfe-icons';

/** The values a user typed for an override type's parameters, by parameter name. */
export type TransformFunctionParams = Record<
  string,
  number | string | undefined
>;

const LabelWithHintTooltip = ({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) => {
  return (
    <span className="flex items-center justify-between">
      {label}
      {hint && (
        <Tooltip destroyOnHidden title={hint}>
          <IconInfoCircle />
        </Tooltip>
      )}
    </span>
  );
};

/** The override types that refine `primitive`, as a Select reads them. */
export const overrideSelectOptions = (
  overrides: TSchemaVocabularyChOverride[],
  primitive: string,
) =>
  overrides
    .filter((option) => option.primitive === primitive)
    .map((option) => ({
      label: (
        <LabelWithHintTooltip
          label={option.label}
          hint={[`Base type: ${primitive}`, option.hint]
            .filter(Boolean)
            .join('. ')}
        />
      ),
      value: option.value,
    }));

export const TYPE_OPTIONS = [
  {
    label: (
      <p>
        Model
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Major)
        </span>
      </p>
    ),
    value: 'model',
  },
  {
    label: (
      <p>
        Addition
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Minor)
        </span>
      </p>
    ),
    value: 'addition',
  },
  {
    label: (
      <p>
        Revision
        <span className="ml-2 text-foreground/40 dark:text-dark-foreground/40">
          (Patch)
        </span>
      </p>
    ),
    value: 'revision',
  },
];
