import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExpressionSpan } from '.';

describe('ExpressionSpan', () => {
  it('marks the characters the engine stopped at', () => {
    render(
      <ExpressionSpan
        expression="lower(a) == 'b'"
        span={{ start: 0, end: 5 }}
      />,
    );

    expect(screen.getByLabelText('Refused at: lower')).toHaveTextContent(
      'lower',
    );
  });

  it('marks the end of an expression the engine ran out of', () => {
    const expression = "a == 'b' &&";
    render(
      <ExpressionSpan
        expression={expression}
        span={{ start: expression.length, end: expression.length }}
      />,
    );

    expect(
      screen.getByLabelText('Refused at the end of the expression'),
    ).toBeEmptyDOMElement();
  });

  it('keeps a span past the text inside it', () => {
    render(<ExpressionSpan expression="abc" span={{ start: 2, end: 40 }} />);

    expect(screen.getByLabelText('Refused at: c')).toHaveTextContent('c');
  });
});
