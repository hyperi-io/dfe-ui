import ace from '@/core/config/AceEditor/init';
import { describe, expect, test } from 'vitest';
import './celExpression';
import { checkCel } from './checkCel';

describe('checkCel', () => {
  test('accepts the expressions the editor is for', () => {
    expect(checkCel("data_stream.dataset == 'okta.system'")).toBeNull();
    expect(
      checkCel("lower(data_stream.dataset) == 'okta.system' && true"),
    ).toBeNull();
    expect(checkCel("count >= 3 && status in ['ok', null]")).toBeNull();
    expect(checkCel('')).toBeNull();
    expect(checkCel('// note only')).toBeNull();
  });

  test('names the span where a string, a call, or the expression was left open', () => {
    expect(checkCel("'okta")).toEqual({
      field: 'cel',
      message: 'Unclosed string',
      span: { start: 0, end: 5 },
    });
    expect(checkCel('lower(host')).toEqual({
      field: 'cel',
      message: "Expected ')'",
      span: { start: 10, end: 10 },
    });
    expect(checkCel('data_stream.dataset ==')).toEqual({
      field: 'cel',
      message: 'Expected an expression',
      span: { start: 22, end: 22 },
    });
  });
});

describe('CEL mode checking', () => {
  test('marks the broken call in the editor', () => {
    const session = ace.createEditSession('lower(host', 'ace/mode/cel');

    expect(session.getAnnotations()).toEqual([
      {
        row: 0,
        column: 10,
        text: "Expected ')'",
        type: 'error',
      },
    ]);
  });

  test('clears the mark once the expression parses', () => {
    const session = ace.createEditSession('lower(host', 'ace/mode/cel');
    session.setValue('lower(host)');

    expect(session.getAnnotations()).toEqual([]);
  });
});
