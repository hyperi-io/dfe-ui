import {
  isMatchGroup,
  matchDepth,
  operatorTakesValue,
} from '@/core/components/MatchCriteriaInput/WhenMatch/WhenMatch.helpers';
import { TMatchFormNode } from '@/core/components/MatchCriteriaInput/WhenMatch/WhenMatch.types';
import { RULE_HUNT_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { MATCH_NESTING_LIMIT } from '@repo/dfe-engine-types/limits';
import z from 'zod';

type IssueSink = Pick<z.RefinementCtx, 'addIssue'>;

const checkMatchNode = (
  node: TMatchFormNode | null | undefined,
  path: (string | number)[],
  ctx: IssueSink,
) => {
  if (isMatchGroup(node)) {
    const parts = node?.parts ?? [];
    if (parts.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'A group needs at least one condition',
        path: [...path, 'parts'],
      });
    }
    parts.forEach((part, index) =>
      checkMatchNode(part, [...path, 'parts', index], ctx),
    );
    return;
  }
  if (!node?.field?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Field is required',
      path: [...path, 'field'],
    });
  }
  if (!node?.operator) {
    ctx.addIssue({
      code: 'custom',
      message: 'Operator is required',
      path: [...path, 'operator'],
    });
    return;
  }
  if (operatorTakesValue(node.operator) && !node.value?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Value is required',
      path: [...path, 'value'],
    });
  }
};

const requiredName = z.string().min(1, { message: 'Name is required' });

// The engine checks the name on create only, and the gitops store allows names
// the create endpoint refuses, so an existing rule's locked name stays unchecked.
const newName = requiredName.refine(
  (v) => RULE_HUNT_NAME_VALIDATOR.regex.test(v),
  { message: RULE_HUNT_NAME_VALIDATOR.message('Name') },
);

export const buildFormSchema = (nameIsNew: boolean) =>
  z
    .object({
      name: nameIsNew ? newName : requiredName,
      display_name: z.string().optional().nullable(),
      description: z.string().optional().nullable(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      cel_filter: z.string().optional(),
      source_type: z.enum(['raw', 'hyperdx']),
      match: z.custom<TMatchFormNode>().optional().nullable(),
      user_sql: z.string().optional().nullable(),
    })
    .superRefine((data, ctx) => {
      checkMatchNode(data.match, ['match'], ctx);
      if (matchDepth(data.match) > MATCH_NESTING_LIMIT) {
        ctx.addIssue({
          code: 'custom',
          message: `Groups nest at most ${MATCH_NESTING_LIMIT} deep`,
          path: ['match', 'parts'],
        });
      }
    });

export type CreateUpdateRuleFormData = z.infer<
  ReturnType<typeof buildFormSchema>
>;
