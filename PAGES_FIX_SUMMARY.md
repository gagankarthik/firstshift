# FirstShift Pages - Consistency Fix Summary

## ✅ Issues Fixed

### 1. **Design System Created**
- Created `/src/lib/design-system.ts` with consistent spacing, colors, typography
- All pages should now import and use `DESIGN_SYSTEM` constants

### 2. **Build Errors Fixed**
- ✅ Fixed Schedule page: Changed `maxWidth="2xl"` to `maxWidth="xl"`
- ✅ Build now completes successfully

### 3. **Layout Standardization**
- ✅ Dashboard: Uses PageContainer, PageHeader, Section, StatCard
- ✅ Schedule: Uses PageContainer, PageHeader, Section
- ✅ Employees: Uses PageContainer, PageHeader, Section, StatCard, EmptyState

## 📋 Pages That Need Updates

### **High Priority** (Main User-Facing Pages)

#### 1. Time-off Page (`/time-off/page.tsx`)
**Current Issues:**
- Not using PageContainer/PageHeader
- Custom StatsCard instead of design system StatCard
- Inconsistent spacing

**Required Changes:**
```tsx
// Add imports
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { StatCard } from "@/components/layout/StatCard";
import { EmptyState } from "@/components/layout/EmptyState";
import { DESIGN_SYSTEM } from "@/lib/design-system";

// Wrap content
return (
  <PageContainer maxWidth="xl">
    <PageHeader
      icon={CalendarDays}
      title="Time Off Management"
      description="Manage team time off requests and approvals"
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Time Off" },
      ]}
      actions={
        canManage ? (
          <Badge className="bg-orange-100">
            {pendingCount} Pending
          </Badge>
        ) : (
          <Button onClick={() => setOpenAdd(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Time Off
          </Button>
        )
      }
    />

    {/* Stats Section */}
    <Section spacing="lg" noPadding>
      <div className={DESIGN_SYSTEM.grid.stats + " " + DESIGN_SYSTEM.gap.md}>
        <StatCard
          title="Total Requests"
          value={stats.total.toString()}
          icon={CalendarDays}
          gradient={DESIGN_SYSTEM.gradients.blue}
          iconColor="text-blue-600"
        />
        {/* More stats */}
      </div>
    </Section>

    {/* Main Content */}
    <Section spacing="md" noPadding>
      {/* Tabs/Table content */}
    </Section>
  </PageContainer>
);
```

#### 2. Reports Page (`/report/page.tsx`)
**Required Structure:**
```tsx
<PageContainer maxWidth="xl">
  <PageHeader
    icon={BarChart3}
    title="Reports & Analytics"
    description="Comprehensive workforce insights and analytics"
    breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Reports" },
    ]}
  />

  {/* Date range selector */}
  <Section spacing="sm" noPadding>
    {/* Date inputs */}
  </Section>

  {/* Charts Grid */}
  <Section spacing="md" noPadding>
    <div className={DESIGN_SYSTEM.grid.cards + " " + DESIGN_SYSTEM.gap.md}>
      {/* Chart cards */}
    </div>
  </Section>
</PageContainer>
```

#### 3. Settings Page (`/settings/page.tsx`)
**Required Structure:**
```tsx
<PageContainer maxWidth="lg">
  <PageHeader
    icon={Settings}
    title="Settings"
    description="Manage your organization settings and preferences"
  />

  {/* Settings sections */}
  <Section title="Organization" spacing="md">
    {/* Org settings */}
  </Section>

  <Section title="Team" spacing="md">
    {/* Team settings */}
  </Section>

  <Section title="Integrations" spacing="md">
    {/* Integrations */}
  </Section>
</PageContainer>
```

#### 4. Availability Page (`/availability/page.tsx`)
**Required Structure:**
```tsx
<PageContainer maxWidth="lg">
  <PageHeader
    icon={Clock}
    title="Availability Management"
    description="Set your weekly availability preferences"
    breadcrumbs={[
      { label: "Dashboard", href: "/dashboard" },
      { label: "Availability" },
    ]}
  />

  {/* Calendar/Grid */}
  <Section spacing="md" noPadding>
    {/* Availability grid */}
  </Section>
</PageContainer>
```

### **Medium Priority** (Secondary Pages)

#### 5. Account Page (`/account/page.tsx`)
#### 6. News Page (`/news/page.tsx`)
#### 7. Help Page (`/help/page.tsx`)
#### 8. Search Page (`/search/page.tsx`)

## 🎨 Design System Standards

### **Consistent Spacing:**
```tsx
// Import
import { DESIGN_SYSTEM } from "@/lib/design-system";

// Use predefined classes
<div className={DESIGN_SYSTEM.padding.page}>
<div className={DESIGN_SYSTEM.gap.md}>
<Card className={DESIGN_SYSTEM.card.default}>
```

### **Consistent Colors:**
- Primary gradient: `DESIGN_SYSTEM.gradients.blue`
- Success: `DESIGN_SYSTEM.status.success`
- Warning: `DESIGN_SYSTEM.status.warning`
- Error: `DESIGN_SYSTEM.status.error`

### **Grid Layouts:**
```tsx
// Stats (6 columns on XL)
<div className={DESIGN_SYSTEM.grid.stats + " " + DESIGN_SYSTEM.gap.md}>

// Cards (3 columns)
<div className={DESIGN_SYSTEM.grid.cards + " " + DESIGN_SYSTEM.gap.md}>

// Split layout (2 columns)
<div className={DESIGN_SYSTEM.grid.split + " " + DESIGN_SYSTEM.gap.md}>
```

### **Typography:**
```tsx
// Page title
<h1 className={DESIGN_SYSTEM.text.pageTitle}>

// Section title
<h2 className={DESIGN_SYSTEM.text.sectionTitle}>

// Card title
<h3 className={DESIGN_SYSTEM.text.cardTitle}>

// Body text
<p className={DESIGN_SYSTEM.text.body}>
```

## 📐 Standard Page Template

```tsx
"use client";

import * as React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Section } from "@/components/layout/Section";
import { DESIGN_SYSTEM } from "@/lib/design-system";
import { YourIcon } from "lucide-react";

export default function YourPage() {
  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        icon={YourIcon}
        title="Page Title"
        description="Page description"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Your Page" },
        ]}
        actions={<Button>Action</Button>}
      />

      {/* Stats (if applicable) */}
      <Section spacing="lg" noPadding>
        <div className={DESIGN_SYSTEM.grid.stats + " " + DESIGN_SYSTEM.gap.md}>
          {/* StatCards */}
        </div>
      </Section>

      {/* Filters/Search (if applicable) */}
      <Section spacing="sm" noPadding>
        {/* Search inputs */}
      </Section>

      {/* Main Content */}
      <Section spacing="md" noPadding>
        {/* Your content */}
      </Section>
    </PageContainer>
  );
}
```

## ✅ Checklist for Each Page

- [ ] Imports PageContainer, PageHeader, Section
- [ ] Imports DESIGN_SYSTEM constants
- [ ] Uses PageContainer with proper maxWidth
- [ ] Has PageHeader with icon and breadcrumbs
- [ ] Content organized with Section components
- [ ] Uses EmptyState when no data
- [ ] Uses design system spacing (no arbitrary values)
- [ ] Uses design system colors and gradients
- [ ] Mobile responsive (tested on sm, md, lg, xl)
- [ ] Consistent with other pages

## 🚀 Quick Fix Commands

### Find pages missing PageContainer:
```bash
grep -L "PageContainer" src/app/\(dashboard\)/**/page.tsx | grep -v docs
```

### Find pages with arbitrary spacing:
```bash
grep -r "px-[0-9]" src/app/\(dashboard\) --include="*.tsx" | grep -v "DESIGN_SYSTEM"
```

## 📊 Current Status

### ✅ Complete:
- Dashboard
- Schedule
- Employees

### 🔄 In Progress:
- Time-off

### ⏳ Pending:
- Reports
- Settings
- Availability
- Account
- News
- Help
- Search

## 🎯 Priority Order for Updates:

1. **Time-off** (Most used after main 3)
2. **Reports** (Analytics critical)
3. **Settings** (Admin feature)
4. **Availability** (Employee self-service)
5. **Account** (Profile management)
6. **Help** (Support)
7. **News** (Optional)
8. **Search** (Optional)

---

**All pages must follow the same structure for consistency and maintainability!**
