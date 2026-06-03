import { createElement } from 'react';
import { describe, expect, test } from 'vitest';
import { getColumnTitleText } from './SchemaTable.helpers';

const ColumnFilterTitleStub = ({ title }: { title: string }) =>
  createElement('span', null, title);

describe('getColumnTitleText', () => {
  test('returns string and number titles', () => {
    expect(getColumnTitleText('Name')).toBe('Name');
    expect(getColumnTitleText(42)).toBe('42');
  });

  test('returns empty string for nullish and function titles', () => {
    expect(getColumnTitleText(null)).toBe('');
    expect(getColumnTitleText(undefined)).toBe('');
    expect(getColumnTitleText(() => 'ignored')).toBe('');
  });

  test('reads title from element props (filter header pattern)', () => {
    const title = createElement(ColumnFilterTitleStub, { title: 'Index Type' });
    expect(getColumnTitleText(title)).toBe('Index Type');
  });

  test('extracts text from element children', () => {
    const title = createElement('span', null, 'Attribute');
    expect(getColumnTitleText(title)).toBe('Attribute');
  });

  test('joins text from fragment-like child arrays', () => {
    const title = createElement('span', null, ['Part', ' ', 'Two']);
    expect(getColumnTitleText(title)).toBe('Part Two');
  });

  test('returns empty string for empty string title', () => {
    expect(getColumnTitleText('')).toBe('');
  });
});
