import { components } from '@repo/dfe-engine-types';

export type TRuleBlock = components['schemas']['RuleBlockResponse'];

/** The header field a block's rows set, and so the list it is ordered in. */
export type TRuleTarget = TRuleBlock['target'];

export type TRuleBlocks = {
  blocks: TRuleBlock[];
  /** The revision a reorder sends as If-Match, null when the engine sent none the browser can read. */
  etag: string | null;
};
