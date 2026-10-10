import { server } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { LIBRARY_TOKEN_VALIDATOR } from '@/core/validationSchemas/utils';
import { TLibraryArtifactDetail } from '@/Library/hooks/useFetchLibraryArtifactDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ArtifactLabels } from '.';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const artifact: TLibraryArtifactDetail = {
  name: 'syslog-parse',
  kind: 'vrl',
  state: 'enabled',
  group: '',
  description: 'Parses syslog into the common header',
  labels: {},
  current: 3,
  versions: [1, 2, 3],
  tags: {},
  digest: 'sha256:abc',
};

const typeLabels = async (value: string) => {
  const user = userEvent.setup({ delay: null });
  const input = await screen.findByLabelText(/^Labels/);
  await user.clear(input);
  await user.paste(value);
};

describe('ArtifactLabels', () => {
  test(
    'group takes the groups the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<ArtifactLabels artifact={artifact} />, { wrapper });

      await expectNameRule({
        input: await screen.findByLabelText(/^Group/),
        message: LIBRARY_TOKEN_VALIDATOR.message('Group'),
        accepts: ['network/edge', ''],
        refuses: ['-network', 'net work'],
      });
    },
  );

  test(
    'labels refuse a key or value the engine would refuse',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(<ArtifactLabels artifact={artifact} />, { wrapper });
      const message = LIBRARY_TOKEN_VALIDATOR.message(
        'Each label key and value',
      );

      await typeLabels('team=Platform Team');
      expect(await screen.findByText(message)).toBeInTheDocument();

      await typeLabels('team=platform');
      await waitFor(() =>
        expect(screen.queryByText(message)).not.toBeInTheDocument(),
      );

      await typeLabels('-team=platform');
      expect(await screen.findByText(message)).toBeInTheDocument();

      await typeLabels('team=');
      expect(await screen.findByText(message)).toBeInTheDocument();

      await typeLabels('team=platform\nregion=eu-west.1');
      await waitFor(() =>
        expect(screen.queryByText(message)).not.toBeInTheDocument(),
      );
    },
  );
});
