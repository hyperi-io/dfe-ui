import { TSpan } from './types';

/** The span the engine names, clamped to the text as it stands. */
export const clampSpan = (text: string, span: TSpan) => {
  const start = Math.min(Math.max(span.start, 0), text.length);
  const end = Math.min(Math.max(span.end, start), text.length);
  return { start, end };
};
