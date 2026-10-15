/** The schemas directory every common header lives in. */
export const COMMON_HEADER_DIR = 'common-header/';

/** A header type's name; a source stores the type with or without the directory. */
export const commonHeaderName = (type: string) =>
  type.startsWith(COMMON_HEADER_DIR)
    ? type.slice(COMMON_HEADER_DIR.length)
    : type;
