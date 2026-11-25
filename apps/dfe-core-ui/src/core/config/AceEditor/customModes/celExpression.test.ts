import ace from '@/core/config/AceEditor/init';
import { describe, expect, test } from 'vitest';
import './celExpression';

const tokensOf = (source: string) => {
  const session = ace.createEditSession(source, 'ace/mode/cel');
  return session
    .getTokens(0)
    .filter((token: { value: string }) => token.value.trim() !== '')
    .map((token: { type: string; value: string }) => [token.type, token.value]);
};

describe('CEL expression highlighting', () => {
  test('colors a field comparison, a call, and a comment', () => {
    expect(
      tokensOf(
        "data_stream.dataset == 'okta.system' && lower(host) != true // kept",
      ),
    ).toEqual([
      ['identifier', 'data_stream'],
      ['keyword.operator', '.'],
      ['identifier', 'dataset'],
      ['keyword.operator', '=='],
      ['string', "'okta.system'"],
      ['keyword.operator', '&&'],
      ['support.function', 'lower'],
      ['paren.lparen', '('],
      ['identifier', 'host'],
      ['paren.rparen', ')'],
      ['keyword.operator', '!='],
      ['constant.language.boolean', 'true'],
      ['comment', '// kept'],
    ]);
  });

  test('colors numbers, null, and membership', () => {
    expect(tokensOf("count >= 3 && status in ['ok', null]")).toEqual([
      ['identifier', 'count'],
      ['keyword.operator', '>='],
      ['constant.numeric', '3'],
      ['keyword.operator', '&&'],
      ['identifier', 'status'],
      ['keyword', 'in'],
      ['paren.lparen', '['],
      ['string', "'ok'"],
      ['punctuation.operator', ','],
      ['constant.language', 'null'],
      ['paren.rparen', ']'],
    ]);
  });
});
