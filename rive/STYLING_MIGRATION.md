# Styling Migration Guide: Dark/Light Mode Support

This document provides a complete mapping of old custom color classes to new standard Tailwind classes that support both light and dark modes.

## Color Mapping Reference

### Background Colors

| Old Class | New Class (Light/Dark) | Purpose |
|-----------|----------------------|---------|
| `bg-base-100` | `bg-white dark:bg-zinc-900` | Main background |
| `bg-base-200` | `bg-gray-50 dark:bg-zinc-800` | Surface/secondary background |
| `bg-base-300` | `bg-gray-100 dark:bg-zinc-700` | Cards/panels/elevated surfaces |

### Text Colors

| Old Class | New Class (Light/Dark) | Purpose |
|-----------|----------------------|---------|
| `text-base-content` | `text-zinc-900 dark:text-white` | Primary text |
| `text-muted` | `text-gray-500 dark:text-gray-400` | Secondary/muted text |

### Border Colors

| Old Class | New Class (Light/Dark) | Purpose |
|-----------|----------------------|---------|
| `border-base-300` | `border-gray-200 dark:border-zinc-700` | Standard borders |
| `border-base-200` | `border-gray-100 dark:border-zinc-800` | Subtle borders |

### Primary Brand Color

| Old Class | New Class (Light/Dark) | Purpose |
|-----------|----------------------|---------|
| `bg-primary` | `bg-[#ff4b8c] dark:bg-[#ff6fa1]` | Primary brand color (pink) |
| `text-primary` | `text-[#ff4b8c] dark:text-[#ff6fa1]` | Primary text color |
| `border-primary` | `border-[#ff4b8c] dark:border-[#ff6fa1]` | Primary border color |

**Note:** The primary color is slightly lighter in dark mode (`#ff6fa1`) for better contrast and visibility.

## Migration Examples

### Example 1: Background Container

**Before:**
```tsx
<View className="bg-base-100">
```

**After:**
```tsx
<View className="bg-white dark:bg-zinc-900">
```

### Example 2: Card Component

**Before:**
```tsx
<View className="bg-base-300 rounded-xl p-4 border border-base-300">
  <Text className="text-base-content font-bold">Title</Text>
  <Text className="text-muted">Subtitle</Text>
</View>
```

**After:**
```tsx
<View className="bg-gray-100 dark:bg-zinc-700 rounded-xl p-4 border border-gray-200 dark:border-zinc-700">
  <Text className="text-zinc-900 dark:text-white font-bold">Title</Text>
  <Text className="text-gray-500 dark:text-gray-400">Subtitle</Text>
</View>
```

### Example 3: Primary Button

**Before:**
```tsx
<TouchableOpacity className="bg-primary">
  <Text className="text-primary-content">Button</Text>
</TouchableOpacity>
```

**After:**
```tsx
<TouchableOpacity className="bg-[#ff4b8c] dark:bg-[#ff6fa1]">
  <Text className="text-white">Button</Text>
</TouchableOpacity>
```

### Example 4: Header Component

**Before:**
```tsx
<View className="bg-base-200 px-4 border-b border-base-300">
  <Text className="text-2xl font-bold text-base-content">Title</Text>
  <Text className="text-muted">Subtitle</Text>
</View>
```

**After:**
```tsx
<View className="bg-gray-50 dark:bg-zinc-800 px-4 border-b border-gray-200 dark:border-zinc-700">
  <Text className="text-2xl font-bold text-zinc-900 dark:text-white">Title</Text>
  <Text className="text-gray-500 dark:text-gray-400">Subtitle</Text>
</View>
```

## Find & Replace Patterns

Use these patterns for bulk replacement (be careful with context):

### Backgrounds
- `bg-base-100` → `bg-white dark:bg-zinc-900`
- `bg-base-200` → `bg-gray-50 dark:bg-zinc-800`
- `bg-base-300` → `bg-gray-100 dark:bg-zinc-700`

### Text
- `text-base-content` → `text-zinc-900 dark:text-white`
- `text-muted` → `text-gray-500 dark:text-gray-400`

### Borders
- `border-base-300` → `border-gray-200 dark:border-zinc-700`
- `border-base-200` → `border-gray-100 dark:border-zinc-800`

### Primary Color
- `bg-primary` → `bg-[#ff4b8c] dark:bg-[#ff6fa1]`
- `text-primary` → `text-[#ff4b8c] dark:text-[#ff6fa1]`
- `border-primary` → `border-[#ff4b8c] dark:border-[#ff6fa1]`

## Semantic Colors (Keep As-Is)

These colors work well in both modes and don't need changes:
- `success` - Green (#22c55e)
- `error` - Red (#ef4444)
- `warning` - Yellow (#facc15)
- `info` - Blue (#38bdf8)

## Testing Checklist

After migrating components, test:

- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] Text has sufficient contrast (WCAG AA minimum)
- [ ] Primary brand color is visible in both modes
- [ ] Borders are visible but not harsh
- [ ] Interactive elements (buttons, links) are clearly distinguishable

## System Preference Detection

The app automatically detects the system's light/dark mode preference using:
- `darkMode: 'media'` in `tailwind.config.js`
- React Native's `useColorScheme` hook (handled automatically by NativeWind)

No manual theme switching needed - the app follows the device's system preference.

## Migration Strategy

1. **Start with common components** (Header, Buttons, Cards)
2. **Test each component** in both light and dark modes
3. **Use find/replace carefully** - always verify context
4. **Update one screen at a time** for easier testing
5. **Keep old classes as fallback** during transition if needed

## Color Rationale

### Light Mode
- **Backgrounds:** White and light grays for clean, minimal aesthetic
- **Text:** Dark zinc-900 for high contrast and readability
- **Surfaces:** Subtle gray-50/100 for depth without harshness

### Dark Mode
- **Backgrounds:** Deep zinc-900 for true dark mode (not pure black)
- **Text:** White for maximum contrast
- **Surfaces:** Zinc-800/700 for subtle elevation and depth

### Primary Color
- **Light mode:** `#ff4b8c` - Vibrant pink for energy and fitness
- **Dark mode:** `#ff6fa1` - Slightly lighter for better visibility on dark backgrounds

## Additional Notes

- All `dark:` variants are automatically applied when the system is in dark mode
- No JavaScript theme switching needed - purely CSS-based
- NativeWind v4 handles the system preference detection automatically
- The `dark:` prefix works with all Tailwind utilities (bg, text, border, etc.)
