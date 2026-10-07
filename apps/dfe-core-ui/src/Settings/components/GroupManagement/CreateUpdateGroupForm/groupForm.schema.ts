import { DB_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import z from 'zod';

const SOURCE_ID_MAX_LENGTH = 512;

export type GroupSourceLink = {
  source_id: string;
  source_provider: string;
};

/** Whether an edit changes a stored link field, judged as the engine does on the trimmed value it receives. */
export const isSourceLinkFieldChanged = (value: string, stored: string) =>
  value !== stored && value.trim() !== stored;

// The engine counts code points, so an emoji is one character rather than two UTF-16 units.
const codePointLength = (value: string) => Array.from(value).length;

export const createGroupFormSchema = (stored: GroupSourceLink) =>
  z
    .object({
      name: z
        .string()
        .min(1, { message: 'Name is required' })
        .refine((v) => DB_NAME_VALIDATOR.regex.test(v), {
          message: DB_NAME_VALIDATOR.message('Name'),
        }),
      description: z.string(),
      roles: z.array(z.string()).min(1, { message: 'Roles are required' }),
      members: z.array(z.string()).optional(),
      scope: z.enum(['org', 'system']),
      organisation: z.string().optional(),
      source_id: z.string(),
      source_provider: z.string(),
    })
    .superRefine((data, ctx) => {
      if (data.scope === 'org' && !data.organisation?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Organisation is required',
          path: ['organisation'],
        });
      }
      const isSourceIdChanged = isSourceLinkFieldChanged(
        data.source_id,
        stored.source_id,
      );
      const isProviderChanged = isSourceLinkFieldChanged(
        data.source_provider,
        stored.source_provider,
      );
      // The engine keeps a stored link it would now refuse, so only a changed one is held to its rules.
      if (
        isSourceIdChanged &&
        codePointLength(data.source_id.trim()) > SOURCE_ID_MAX_LENGTH
      ) {
        ctx.addIssue({
          code: 'custom',
          message: `Source ID is at most ${SOURCE_ID_MAX_LENGTH} characters`,
          path: ['source_id'],
        });
      }
      const sourceId = isSourceIdChanged
        ? data.source_id.trim()
        : stored.source_id;
      const provider = isProviderChanged
        ? data.source_provider.trim()
        : stored.source_provider;
      if ((isSourceIdChanged || isProviderChanged) && sourceId && !provider) {
        ctx.addIssue({
          code: 'custom',
          message: 'Source provider is required with a source ID',
          path: ['source_provider'],
        });
      }
    });

export type CreateUpdateGroupFormData = z.infer<
  ReturnType<typeof createGroupFormSchema>
>;
