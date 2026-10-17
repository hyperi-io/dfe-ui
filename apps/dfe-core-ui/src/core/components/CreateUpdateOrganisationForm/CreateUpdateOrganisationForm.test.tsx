import { ApiError } from '@/core/config/api/client';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { ORG_NAME_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { server } from './CreateUpdateOrganisationForm.mocks';
import { CreateUpdateOrganisationForm } from './index';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CreateUpdateOrganisationForm', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  test('renders core fields and submits on create without confirm merge gate', async () => {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <CreateUpdateOrganisationForm
        initialValues={{
          name: '',
          display_name: '',
          org_ids: [],
        }}
        onFinish={onFinish}
        buttonLabel="Create"
      />,
      { wrapper },
    );

    await user.type(screen.getByPlaceholderText('Enter name'), 'NewOrg');
    await user.type(
      screen.getByPlaceholderText('Enter display name'),
      'New Org',
    );
    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1);
    });
    expect(onFinish).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'neworg',
        display_name: 'New Org',
      }),
    );
  });

  test(
    'takes the names the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateUpdateOrganisationForm
          initialValues={{ name: '', display_name: '', org_ids: [] }}
          onFinish={vi.fn()}
          buttonLabel="Create"
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByPlaceholderText('Enter name'),
        message: ORG_NAME_VALIDATOR.message('Name'),
        accepts: ['acme-corp.eu', 'a'.repeat(129)],
        refuses: ['-acme', 'acme corp'],
      });
    },
  );
});

describe('CreateUpdateOrganisationForm refusals', () => {
  const heldRefusal = (
    held: {
      hunt: string;
      org: string;
      tenant_ids: string[];
      branch: unknown;
    }[],
  ) =>
    new ApiError(409, 'Conflict', {
      code: 'tenant_id_held',
      message:
        "Org 'newco' cannot take a tenant id a hunt still reads for another org: hunt 'windows' reads acme-1 for org 'oldco' on main. Merge or close that review, or edit the hunt, first",
      context: { held },
    });

  const renderForm = (error: Error, orgIds: string[] = ['acme-1']) =>
    render(
      <CreateUpdateOrganisationForm
        initialValues={{
          name: 'newco',
          display_name: 'New Co',
          org_ids: orgIds,
        }}
        onFinish={vi.fn()}
        error={error}
      />,
      { wrapper },
    );

  const orgIdsField = () => {
    const item = screen
      .getByText('Organisation IDs')
      .closest<HTMLElement>('.ant-form-item');
    if (!item) throw new Error('no Organisation IDs form item');
    return item;
  };

  test('names each hunt still reading the IDs, linked to it', async () => {
    renderForm(
      heldRefusal([
        { hunt: 'windows', org: 'oldco', tenant_ids: ['acme-1'], branch: null },
      ]),
    );

    expect(
      await screen.findByText(
        'Hunts still read these organisation IDs for another organisation',
      ),
    ).toBeInTheDocument();
    const hunt = screen.getByRole('link', { name: 'windows' });
    expect(hunt).toHaveAttribute('href', '/hunts?name=windows');
    expect(hunt.closest('li')).toHaveTextContent(
      'windows reads acme-1 for oldco',
    );
    expect(
      screen.getByText(
        'Use other organisation IDs, or edit those hunts first.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/cannot take a tenant id/),
    ).not.toBeInTheDocument();
  });

  test('says when the IDs come from a review not yet merged', async () => {
    renderForm(
      heldRefusal([
        {
          hunt: 'dns',
          org: 'oldco',
          tenant_ids: ['acme-1', 'acme-2'],
          branch: 'review/org-oldco',
        },
      ]),
      ['acme-1', 'acme-2'],
    );

    const hunt = await screen.findByRole('link', { name: 'dns' });
    expect(hunt.closest('li')).toHaveTextContent(
      'dns reads acme-1, acme-2 for oldco once review branch review/org-oldco merges',
    );
    expect(
      screen.getByText(
        'Use other organisation IDs, or merge or close the review first.',
      ),
    ).toBeInTheDocument();
  });

  test('shows a refused organisation ID on its field in the console words', async () => {
    renderForm(
      new ApiError(422, 'Unprocessable Entity', {
        code: 'validation_error',
        message: '1 validation error(s)',
        errors: [
          {
            field: 'org_ids.1',
            message: "String should match pattern '^[^\\s,]+$'",
            code: 'string_pattern_mismatch',
          },
        ],
      }),
      ['acme-1', 'bad\tid'],
    );

    expect(
      await within(orgIdsField()).findByText(
        'Organisation ID "bad\\tid" may not be blank, hold a comma or a control character such as a tab, or start or end with a space',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText('1 validation error(s)')).not.toBeInTheDocument();
    expect(screen.queryByText(/String should match/)).not.toBeInTheDocument();
  });

  test('keeps a refusal of any other field below the form', async () => {
    renderForm(
      new ApiError(422, 'Unprocessable Entity', {
        code: 'validation_error',
        message: '1 validation error(s)',
        errors: [{ field: 'display_name', message: 'Field required' }],
      }),
    );

    expect(
      await screen.findByText('display_name: Field required'),
    ).toBeInTheDocument();
  });
});
