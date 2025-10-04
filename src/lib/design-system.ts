/**
 * FirstShift Design System
 * Consistent spacing, colors, and styling across all pages
 */

export const DESIGN_SYSTEM = {
  // Container widths
  container: {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  },

  // Padding - consistent across all pages
  padding: {
    page: "px-4 sm:px-6 lg:px-8 py-6 sm:py-8", // Page container
    section: "mb-6 sm:mb-8", // Between sections
    card: "p-5 sm:p-6", // Inside cards
    cardSm: "p-4 sm:p-5", // Smaller cards
  },

  // Gaps - for grid and flex layouts
  gap: {
    xs: "gap-2",
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6",
    lg: "gap-6 sm:gap-8",
  },

  // Border radius
  radius: {
    sm: "rounded-lg", // 8px
    md: "rounded-xl", // 12px - Default
    lg: "rounded-2xl", // 16px
    xl: "rounded-3xl", // 24px
    full: "rounded-full",
  },

  // Typography
  text: {
    pageTitle: "text-2xl sm:text-3xl lg:text-4xl font-bold",
    sectionTitle: "text-lg sm:text-xl font-bold",
    cardTitle: "text-base sm:text-lg font-semibold",
    body: "text-sm sm:text-base",
    small: "text-xs sm:text-sm",
    muted: "text-muted-foreground",
  },

  // Grid layouts
  grid: {
    stats: "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6",
    cards: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    split: "grid grid-cols-1 lg:grid-cols-2",
  },

  // Common card styles
  card: {
    default: "glass-card border border-border/50 hover:border-primary/30 transition-all",
    interactive: "glass-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer",
    stat: "glass-card p-5 sm:p-6 text-center hover:scale-105 transition-transform",
  },

  // Gradients
  gradients: {
    blue: "from-blue-500 to-indigo-600",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-red-600",
    purple: "from-purple-500 to-pink-600",
    yellow: "from-yellow-500 to-orange-600",
    teal: "from-teal-500 to-cyan-600",
  },

  // Status colors
  status: {
    success: "text-green-600 bg-green-50 border-green-200",
    warning: "text-orange-600 bg-orange-50 border-orange-200",
    error: "text-red-600 bg-red-50 border-red-200",
    info: "text-blue-600 bg-blue-50 border-blue-200",
  },
} as const;

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
