import { Form } from '@/core/components/Form';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import { Input } from 'antd';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { CreateFieldMapForm } from '.';

// jsdom has no IntersectionObserver; the source and field-map pickers page on one.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.sources.default.get.success(),
  API_CONFIG_MOCKS.fieldMaps.default.get.success(),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateFieldMapForm labels', () => {
  it('labels its own fields when the source form beside it uses the same names', async () => {
    render(
      <>
        {/* The source form's Views tab opens this form over its own fields. */}
        <Form>
          <Form.Item name="source" label="Source Name">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
        </Form>
        <section aria-label="Create New Standard">
          <CreateFieldMapForm
            onFinish={() => undefined}
            isPending={false}
            error={null}
            initialValues={{
              standard: '',
              source: 'shared-probe',
              mappings: [],
            }}
            disabledFields={{ source: true }}
          />
        </section>
      </>,
      { wrapper },
    );

    const fieldMapForm = within(
      screen.getByRole('region', { name: 'Create New Standard' }),
    );
    expect(
      fieldMapForm.getByPlaceholderText('Enter description'),
    ).toHaveAccessibleName('Description');
    expect(
      await fieldMapForm.findByRole('combobox', { name: 'Source' }),
    ).toBeDisabled();
  });
});
