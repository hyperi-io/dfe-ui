import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { TRuleBlock, TRuleBlocks } from './types';

export const ruleBlocksPath = API_CONFIG.ingest.rules;

/** The engine caps a page here, so most deployments read in one round trip. */
const PAGE_SIZE = 1000;

const fetchRuleBlocksPage = (
  options: DfeClientRequestOptions<typeof ruleBlocksPath, 'get'>,
) => apiClient.getWithEtag(ruleBlocksPath, options);

/**
 * Every rule block, each field's in the order it runs, with the ETag a reorder
 * sends back as If-Match.
 *
 * A reorder must name every block of its field, so a list cut short by paging
 * would be refused: the remaining pages are read before anything is returned.
 */
export const fetchRuleBlocks = async (): Promise<TRuleBlocks> => {
  const first = await fetchRuleBlocksPage({
    queryParams: { page_size: PAGE_SIZE },
  });
  const blocks: TRuleBlock[] = [...first.data.items];
  let token = first.data.next_page_token;
  while (token) {
    const next = await fetchRuleBlocksPage({
      queryParams: { page_size: PAGE_SIZE, page_token: token },
    });
    blocks.push(...next.data.items);
    token = next.data.next_page_token;
  }
  return { blocks, etag: first.etag };
};
