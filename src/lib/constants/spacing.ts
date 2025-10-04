/**
 * Professional B2B SaaS Spacing System
 * Consistent spacing, padding, and gap values across the application
 */

export const SPACING = {
  // Container padding
  container: {
    sm: "px-4 py-4",
    md: "px-6 py-6",
    lg: "px-8 py-8",
    xl: "px-8 py-8",
  },

  // Page sections
  section: {
    sm: "mb-6",
    md: "mb-8",
    lg: "mb-10",
    xl: "mb-12",
  },

  // Card padding
  card: {
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  },

  // Gaps for flex/grid
  gap: {
    xs: "gap-2",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  },

  // Stack spacing (vertical)
  stack: {
    xs: "space-y-2",
    sm: "space-y-3 sm:space-y-4",
    md: "space-y-4 sm:space-y-6",
    lg: "space-y-6 sm:space-y-8",
  },

  // Inline spacing (horizontal)
  inline: {
    xs: "space-x-2",
    sm: "space-x-3 sm:space-x-4",
    md: "space-x-4 sm:space-x-6",
  },
} as const;

/**
 * Professional border radius system
 */
export const RADIUS = {
  sm: "rounded-lg", // 8px
  md: "rounded-xl", // 12px
  lg: "rounded-2xl", // 16px
  xl: "rounded-3xl", // 24px
  full: "rounded-full",
} as const;

/**
 * Maximum widths for content
 */
export const MAX_WIDTH = {
  sm: "max-w-3xl", // ~768px
  md: "max-w-5xl", // ~1024px
  lg: "max-w-7xl", // ~1280px
  xl: "max-w-[1400px]",
  "2xl": "max-w-[1600px]",
  full: "max-w-full",
} as const;

/**
 * Grid columns for different screen sizes
 */
export const GRID_COLS = {
  auto: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  stats: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6",
  split: "grid-cols-1 lg:grid-cols-2",
  sidebar: "grid-cols-1 lg:grid-cols-[280px_1fr]",
} as const;
