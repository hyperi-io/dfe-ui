/** A CEL expression the editor cannot parse. The span counts UTF-16 code units. */
export type CelCheckError = {
  field: 'cel';
  message: string;
  span: { start: number; end: number };
};

type Token = {
  kind: 'ident' | 'string' | 'number' | 'bool' | 'null' | 'op';
  value: string;
  start: number;
  end: number;
};

const OPERATORS = [
  '==',
  '!=',
  '<=',
  '>=',
  '&&',
  '||',
  '?.',
  '+',
  '-',
  '*',
  '/',
  '%',
  '<',
  '>',
  '!',
  '?',
  ':',
  '.',
  ',',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
];

const failure = (
  message: string,
  start: number,
  end: number,
): CelCheckError => ({
  field: 'cel',
  message,
  span: { start, end },
});

const isQuoteAt = (source: string, index: number) =>
  source.startsWith("'''", index) ||
  source.startsWith('"""', index) ||
  source[index] === "'" ||
  source[index] === '"';

const prefixLength = (source: string, index: number) => {
  const two = source.slice(index, index + 2);
  if (/^(?:rb|br)$/i.test(two) && isQuoteAt(source, index + 2)) return 2;
  if (/^[rRbB]$/.test(source[index] ?? '') && isQuoteAt(source, index + 1)) {
    return 1;
  }
  return 0;
};

const readString = (
  source: string,
  index: number,
): { token: Token } | { error: CelCheckError } => {
  const start = index;
  index += prefixLength(source, index);
  const quote = source.startsWith("'''", index)
    ? "'''"
    : source.startsWith('"""', index)
      ? '"""'
      : source[index];
  if (!quote)
    return { error: failure('Unclosed string', start, source.length) };
  index += quote.length;
  while (index < source.length) {
    if (source.startsWith(quote, index)) {
      const end = index + quote.length;
      return {
        token: {
          kind: 'string',
          value: source.slice(start, end),
          start,
          end,
        },
      };
    }
    index += source[index] === '\\' ? 2 : 1;
  }
  return { error: failure('Unclosed string', start, source.length) };
};

const lex = (
  source: string,
): { tokens: Token[]; error: CelCheckError | null } => {
  const tokens: Token[] = [];
  let index = 0;
  while (index < source.length) {
    const char = source[index] ?? '';
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (source.startsWith('//', index)) {
      const lineEnd = source.indexOf('\n', index);
      index = lineEnd === -1 ? source.length : lineEnd + 1;
      continue;
    }
    if (prefixLength(source, index) > 0 || isQuoteAt(source, index)) {
      const read = readString(source, index);
      if ('error' in read) return { tokens, error: read.error };
      tokens.push(read.token);
      index = read.token.end;
      continue;
    }
    const number =
      /^(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)[uU]?/.exec(
        source.slice(index),
      );
    if (number) {
      const value = number[0];
      tokens.push({
        kind: 'number',
        value,
        start: index,
        end: index + value.length,
      });
      index += value.length;
      continue;
    }
    const ident = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(index));
    if (ident) {
      const value = ident[0];
      const kind =
        value === 'true' || value === 'false'
          ? 'bool'
          : value === 'null'
            ? 'null'
            : value === 'in' || value === 'as'
              ? 'op'
              : 'ident';
      tokens.push({ kind, value, start: index, end: index + value.length });
      index += value.length;
      continue;
    }
    const operator = OPERATORS.find((op) => source.startsWith(op, index));
    if (operator) {
      tokens.push({
        kind: 'op',
        value: operator,
        start: index,
        end: index + operator.length,
      });
      index += operator.length;
      continue;
    }
    return {
      tokens,
      error: failure(`Unexpected '${char}'`, index, index + 1),
    };
  }
  return { tokens, error: null };
};

class Parser {
  private index = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly source: string,
  ) {}

  parse() {
    this.parseExpr();
    const extra = this.peek();
    if (extra) {
      throw new CheckFailure(
        `Unexpected '${extra.value}'`,
        extra.start,
        extra.end,
      );
    }
  }

  private parseExpr() {
    this.parseOr();
    if (!this.eat('?')) return;
    this.parseExpr();
    this.expect(':');
    this.parseExpr();
  }

  private parseOr() {
    this.parseAnd();
    while (this.eat('||')) this.parseAnd();
  }

  private parseAnd() {
    this.parseRel();
    while (this.eat('&&')) this.parseRel();
  }

  private parseRel() {
    this.parseAdd();
    while (this.eat('==', '!=', '<', '<=', '>', '>=', 'in')) this.parseAdd();
  }

  private parseAdd() {
    this.parseMul();
    while (this.eat('+', '-')) this.parseMul();
  }

  private parseMul() {
    this.parseUnary();
    while (this.eat('*', '/', '%')) this.parseUnary();
  }

  private parseUnary() {
    while (this.eat('!', '-')) {
      /* prefix */
    }
    this.parseMember();
  }

  private parseMember() {
    this.parsePrimary();
    for (;;) {
      if (this.eat('.', '?.')) {
        this.expectIdent();
        continue;
      }
      if (this.eat('[')) {
        this.parseExpr();
        this.expect(']');
        continue;
      }
      if (this.eat('(')) {
        if (!this.eat(')')) {
          this.parseExpr();
          while (this.eat(',')) this.parseExpr();
          this.expect(')');
        }
        continue;
      }
      if (this.eat('as')) {
        this.expectIdent();
        continue;
      }
      return;
    }
  }

  private parsePrimary() {
    if (this.eatKind('ident', 'string', 'number', 'bool', 'null')) return;
    if (this.eat('(')) {
      this.parseExpr();
      this.expect(')');
      return;
    }
    if (this.eat('[')) {
      if (!this.eat(']')) {
        this.parseExpr();
        while (this.eat(',')) {
          if (this.peek()?.value === ']') break;
          this.parseExpr();
        }
        this.expect(']');
      }
      return;
    }
    if (this.eat('{')) {
      if (!this.eat('}')) {
        this.parseMapEntry();
        while (this.eat(',')) {
          if (this.peek()?.value === '}') break;
          this.parseMapEntry();
        }
        this.expect('}');
      }
      return;
    }
    const token = this.peek();
    if (!token) {
      throw new CheckFailure(
        'Expected an expression',
        this.source.length,
        this.source.length,
      );
    }
    throw new CheckFailure('Expected an expression', token.start, token.end);
  }

  private parseMapEntry() {
    if (!this.eatKind('ident', 'string')) {
      const token = this.peek();
      throw new CheckFailure(
        'Expected a map key',
        token?.start ?? this.source.length,
        token?.end ?? this.source.length,
      );
    }
    this.expect(':');
    this.parseExpr();
  }

  private expectIdent() {
    if (this.eatKind('ident')) return;
    const token = this.peek();
    throw new CheckFailure(
      'Expected a name',
      token?.start ?? this.source.length,
      token?.end ?? this.source.length,
    );
  }

  private expect(value: string) {
    if (this.eat(value)) return;
    const token = this.peek();
    throw new CheckFailure(
      `Expected '${value}'`,
      token?.start ?? this.source.length,
      token?.end ?? this.source.length,
    );
  }

  private eat(...values: string[]) {
    const token = this.peek();
    if (!token || token.kind !== 'op' || !values.includes(token.value)) {
      return false;
    }
    this.index += 1;
    return true;
  }

  private eatKind(...kinds: Token['kind'][]) {
    const token = this.peek();
    if (!token || !kinds.includes(token.kind)) return false;
    this.index += 1;
    return true;
  }

  private peek() {
    return this.tokens[this.index];
  }
}

class CheckFailure extends Error {
  constructor(
    message: string,
    readonly start: number,
    readonly end: number,
  ) {
    super(message);
  }
}

/** The first syntax error in a CEL expression, or nothing when it parses. */
export const checkCel = (source: string): CelCheckError | null => {
  const { tokens, error } = lex(source);
  if (error) return error;
  if (tokens.length === 0) return null;
  try {
    new Parser(tokens, source).parse();
    return null;
  } catch (caught) {
    if (caught instanceof CheckFailure) {
      return failure(caught.message, caught.start, caught.end);
    }
    throw caught;
  }
};

/** The editor row and column of a source offset. */
export const celErrorPosition = (source: string, offset: number) => {
  let row = 0;
  let column = 0;
  const end = Math.min(Math.max(offset, 0), source.length);
  for (let index = 0; index < end; index += 1) {
    if (source[index] === '\n') {
      row += 1;
      column = 0;
    } else {
      column += 1;
    }
  }
  return { row, column };
};
