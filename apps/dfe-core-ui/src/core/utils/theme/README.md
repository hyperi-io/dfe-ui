# Theme System Documentation

## Overview

This theme system provides a comprehensive and consistent design language across the application. It is built on top of Ant Design's theme capabilities while providing additional structure and organization for maintainability and scalability.

## Directory Structure

```
theme/
├── tokens/           # Design tokens (colors, spacing, typography)
│   ├── colors.ts    # Color palette and semantic colors
│   ├── spacing.ts   # Spacing scale and layout
│   └── typography.ts # Typography system
├── components/       # Component-specific tokens
│   ├── table.ts     # Table component tokens
│   └── card.ts      # Card component tokens
└── index.ts         # Main theme export
```

## Usage

### Basic Usage

```typescript
import { ConfigProvider } from 'antd';
import { theme } from './theme';

const App = () => (
  <ConfigProvider theme={theme}>
    <YourApp />
  </ConfigProvider>
);
```

### Using Theme Tokens in Components

```typescript
import { colors, spacing, typography } from './theme';

// In styled-components
const StyledComponent = styled.div`
  color: ${colors.colorPrimary};
  padding: ${spacing.md}px;
  font-size: ${typography.fontSizes.lg}px;
`;

// In inline styles
const style = {
  backgroundColor: colors.colorBgContainer,
  margin: spacing.lg,
};
```

### Component-Specific Theme Override

```typescript
<ConfigProvider
  theme={{
    components: {
      Table: {
        headerBg: '#f6f8fa',
      }
    }
  }}
>
  <Table />
</ConfigProvider>
```

## Theme Tokens

### Colors

- `colorPrimary`: Primary brand color
- `colorSuccess`: Success state color
- `colorWarning`: Warning state color
- `colorError`: Error state color
- `colorText`: Primary text color
- `colorBgContainer`: Background color for containers

### Spacing

- `spacing.xs`: Extra small spacing (8px)
- `spacing.sm`: Small spacing (12px)
- `spacing.md`: Medium spacing (16px)
- `spacing.lg`: Large spacing (24px)
- `spacing.xl`: Extra large spacing (32px)

### Typography

- `fontSizes.sm`: Small text (14px)
- `fontSizes.base`: Base text (16px)
- `fontSizes.lg`: Large text (18px)
- `fontWeights.regular`: Regular weight (400)
- `fontWeights.medium`: Medium weight (500)
- `fontWeights.semibold`: Semi-bold weight (600)

## Component Tokens

### Table

- `headerBg`: Table header background
- `headerColor`: Table header text color
- `borderColor`: Table border color
- `rowHoverBg`: Row hover background color

### Card

- `borderRadius`: Card border radius
- `boxShadow`: Card box shadow
- `headerPadding`: Card header padding
- `bodyPadding`: Card body padding

## Best Practices

1. **Use Token References**

   ```typescript
   // ❌ Bad
   const style = { color: '#1677ff' };

   // ✅ Good
   const style = { color: colors.colorPrimary };
   ```

2. **Maintain Consistency**
   - Always use the predefined tokens instead of hardcoding values
   - If a new token is needed, add it to the appropriate token file
   - Keep component-specific tokens in their respective files

3. **Theme Variants**
   - Use the provided theme variants (dark, compact) when needed
   - Create new variants by extending the base theme

4. **Performance**
   - Avoid dynamic theme generation
   - Use memoization when computing derived values from theme tokens

## Contributing

1. **Adding New Tokens**
   - Add new tokens to the appropriate token file
   - Document the new tokens in this README
   - Update the TypeScript types if necessary

2. **Component Tokens**
   - Create a new file in the components directory
   - Follow the existing pattern for token organization
   - Include all relevant component states and variants

3. **Testing**
   - Test new tokens across different themes
   - Verify responsive behavior
   - Check accessibility contrast ratios for colors

## Migration Guide

When migrating from the old theme system:

1. Replace direct color values with token references
2. Update component styles to use spacing tokens
3. Standardize typography using the typography system
4. Remove any inline styles that bypass the theme system

## Resources

- [Ant Design Theme Documentation](https://ant.design/docs/react/customize-theme)
- [Design Tokens Specification](https://design-tokens.github.io/community-group/format/)
- [Color System Guidelines](https://material.io/design/color/the-color-system.html)
