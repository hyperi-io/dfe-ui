import { brand, neutral, alpha } from './tokens/colors';
import { spacing } from './tokens/spacing';
import { typography } from './tokens/typography';

export interface Theme {
  colors: {
    brand: typeof brand;
    neutral: typeof neutral;
    alpha: typeof alpha;
  };
  spacing: {
    space: typeof spacing;
  };
  typography: {
    fontWeight: typeof typography.fontWeight;
    fontSize: typeof typography.fontSize;
  };
}
