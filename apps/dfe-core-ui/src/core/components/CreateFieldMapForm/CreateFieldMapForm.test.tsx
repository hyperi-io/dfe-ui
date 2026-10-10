import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import {
  expectNameRule,
  NAME_RULE_TEST_TIMEOUT_MS,
} from '@/core/utils/test-utils/expectNameRule';
import { FIELD_MAP_STANDARD_VALIDATOR } from '@/core/validationSchemas/utils';
import { render, screen } from '@testing-library/react';
import { describe, test, vi } from 'vitest';
import { CreateFieldMapForm } from '.';

// The pickers read sources and field maps, and the standard rule needs neither.
vi.mock('@/core/components/SourceSelect', () => ({
  SourceSelect: () => null,
}));
vi.mock('@/core/components/FieldMapSelect', () => ({
  FieldMapSelect: () => null,
}));
vi.mock('./MappingBuilder', () => ({ MappingBuilder: () => null }));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('CreateFieldMapForm standard', () => {
  test(
    'takes the standards the engine takes and refuses the ones it refuses',
    { timeout: NAME_RULE_TEST_TIMEOUT_MS },
    async () => {
      render(
        <CreateFieldMapForm
          onFinish={vi.fn()}
          isPending={false}
          error={null}
        />,
        { wrapper },
      );

      await expectNameRule({
        input: screen.getByLabelText(/^Standard Name/),
        message: FIELD_MAP_STANDARD_VALIDATOR.message('Standard'),
        accepts: ['sigma', 'my_standard', 'OCSF'],
        refuses: ['1sigma', 'my-standard'],
      });
    },
  );
});
