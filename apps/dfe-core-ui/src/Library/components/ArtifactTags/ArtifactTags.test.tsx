import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { LIBRARY_TOKEN_VALIDATOR } from '@/core/validationSchemas/utils';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, test } from 'vitest';
import { ArtifactTags } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const artifact: TLibraryArtifactDetail = {
  name: 'syslog-parse',
  kind: 'vrl',
  state: 'enabled',
  group: 'network',
  description: 'Parses syslog into the common header',
  labels: {},
  current: 3,
  versions: [1, 2, 3],
  tags: { stable: 2 },
  digest: 'sha256:abc',
};

describe('ArtifactTags tag name', () => {
  test(
    'takes the tags the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<ArtifactTags artifact={artifact} />, { wrapper });

      await expectNameRule({
        input: await screen.findByLabelText(/^Tag$/),
        message: LIBRARY_TOKEN_VALIDATOR.message('Tag name'),
        accepts: ['canary/eu', 'v1.2'],
        refuses: ['-stable', 'sta ble'],
      });
    },
  );
});
