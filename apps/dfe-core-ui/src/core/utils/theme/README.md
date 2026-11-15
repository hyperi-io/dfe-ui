# Theme tokens

The console's Ant Design theme reads its colours and type from the tokens here. `CompatibleStyleWrapper` (`apps/dfe-core-ui/src/core/contexts/ClientContext/CompatibleStyleWrapper.tsx`) is the one consumer: it builds the `ConfigProvider` theme for the current colour mode.

| File                   | Exports                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `tokens/colors.ts`     | `colors`: brand, gradient, semantic, neutral, functional and alpha palettes, and `ant` alias tokens |
| `tokens/typography.ts` | `typography`: font families, the font-size scale, weights and line heights                          |
| `themeTokens.ts`       | `defaultAlgorithm` and `darkAlgorithm`, Ant Design's light and dark algorithms                      |
| `index.ts`             | re-exports `colors` and `typography`                                                                |

```typescript
import { colors, typography } from '@/core/utils/theme';

const style = {
  color: colors.brand.tertiary,
  fontFamily: typography.fontFamily.base,
};
```

Take a colour or a size from these tokens rather than writing a hex or a pixel value, so a palette change reaches every component.
