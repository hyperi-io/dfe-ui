import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { APP_FILENAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { LinkArtifactDrawer } from './LinkArtifactDrawer';

vi.mock('@/core/hooks/library/useFetchLibraryArtifacts', () => ({
  useFetchLibraryArtifacts: () => ({ data: [] }),
}));
vi.mock('@/core/hooks/apps/files/useLinkAppFile', () => ({
  useLinkAppFile: () => ({
    data: undefined,
    mutate: vi.fn(),
    isPending: false,
    error: null,
    reset: vi.fn(),
  }),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const openDrawer = async () => {
  render(
    <LinkArtifactDrawer
      service="dfe-transform-vrl"
      instance="windows-audit"
      setName="programs"
      suffixes={['.vrl', '.json']}
    />,
    { wrapper },
  );
  await userEvent.click(
    await screen.findByRole('button', { name: /Link from library/ }),
  );
};

describe('LinkArtifactDrawer filename', () => {
  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      await openDrawer();

      await expectNameRule({
        input: await screen.findByLabelText(/^Filename/),
        message: APP_FILENAME_VALIDATOR.message('Filename'),
        accepts: ['my-file.v1.vrl', '1.json'],
        refuses: ['-a.vrl', 'a b.vrl', 'a..vrl'],
      });
    },
  );

  test('refuses a name that ends in no extension the app reads', async () => {
    await openDrawer();
    const input = await screen.findByLabelText(/^Filename/);

    await userEvent.click(input);
    await userEvent.paste('program.txt');

    expect(
      await screen.findByText('Filename needs an extension this app reads'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(APP_FILENAME_VALIDATOR.message('Filename')),
    ).not.toBeInTheDocument();
  });
});
