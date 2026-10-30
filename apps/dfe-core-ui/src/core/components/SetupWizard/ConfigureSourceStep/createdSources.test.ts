import { afterEach, describe, expect, it } from 'vitest';
import {
  getCreatedSourceCount,
  rememberCreatedSources,
} from './createdSources';

describe('createdSources', () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it('reads back the count after it was remembered', () => {
    rememberCreatedSources(3);

    expect(getCreatedSourceCount()).toBe(3);
    expect(
      window.sessionStorage.getItem('dfe.setupWizard.createdSourceCount'),
    ).toBe('3');
  });

  it('ignores a stored value that is not a count', () => {
    window.sessionStorage.setItem('dfe.setupWizard.createdSourceCount', 'nope');

    expect(getCreatedSourceCount()).toBeNull();
  });
});
