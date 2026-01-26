# Design System - People Hub

## Overview

People Hub utilizes a **Blue Professional** design system optimized for HR management applications. The design emphasizes clarity, professionalism, and ease of use for recruiters, managers, and HR administrators.

---

## Color Palette

### Primary Colors

| Name                   | HSL Value         | Hex (approx) | Usage                             |
| ---------------------- | ----------------- | ------------ | --------------------------------- |
| **Primary**            | 221.2 83.2% 53.3% | #3B82F6      | Main buttons, links, focus states |
| **Primary Foreground** | 210 40% 98%       | #F8FAFC      | Text on primary background        |

### Secondary Colors

| Name                     | HSL Value         | Hex (approx) | Usage                    |
| ------------------------ | ----------------- | ------------ | ------------------------ |
| **Secondary**            | 210 40% 96.1%     | #F1F5F9      | Secondary buttons, cards |
| **Secondary Foreground** | 222.2 47.4% 11.2% | #1E293B      | Text on secondary        |

### Semantic Colors

| Name            | HSL Value     | Usage                               |
| --------------- | ------------- | ----------------------------------- |
| **Destructive** | 0 84.2% 60.2% | Errors, delete actions              |
| **Muted**       | 210 40% 96.1% | Disabled states, subtle backgrounds |
| **Accent**      | 210 40% 96.1% | Highlights, hover states            |

### Background & Surface

| Name           | HSL Value | Usage             |
| -------------- | --------- | ----------------- |
| **Background** | 0 0% 100% | Page background   |
| **Card**       | 0 0% 100% | Card surfaces     |
| **Popover**    | 0 0% 100% | Dropdowns, modals |

### Border & Input

| Name       | HSL Value         | Usage              |
| ---------- | ----------------- | ------------------ |
| **Border** | 214.3 31.8% 91.4% | Borders, dividers  |
| **Input**  | 214.3 31.8% 91.4% | Form input borders |
| **Ring**   | 221.2 83.2% 53.3% | Focus rings        |

---

## Typography

### Font Family

- **Primary Font:** Inter (via `next/font/google`)
- **Fallback:** System Sans-serif

### Font Sizes

| Class       | Size | Usage                        |
| ----------- | ---- | ---------------------------- |
| `text-xs`   | 12px | Labels, captions             |
| `text-sm`   | 14px | Secondary text, descriptions |
| `text-base` | 16px | Body text                    |
| `text-lg`   | 18px | Subheadings                  |
| `text-xl`   | 20px | Section headers              |
| `text-2xl`  | 24px | Card titles                  |
| `text-3xl`  | 30px | Page titles                  |

### Font Weights

- `font-normal` (400) - Body text
- `font-medium` (500) - Labels, emphasis
- `font-semibold` (600) - Subheadings
- `font-bold` (700) - Headlines

---

## Spacing

Based on Tailwind's default spacing scale:

| Name    | Size | Usage                           |
| ------- | ---- | ------------------------------- |
| `gap-2` | 8px  | Tight spacing (inline elements) |
| `gap-4` | 16px | Standard spacing                |
| `gap-6` | 24px | Section spacing                 |
| `p-4`   | 16px | Card padding                    |
| `p-6`   | 24px | Page padding                    |

---

## Border Radius

| Variable       | Value        | Usage          |
| -------------- | ------------ | -------------- |
| `--radius`     | 0.5rem (8px) | Default radius |
| `rounded-lg`   | 8px          | Cards, buttons |
| `rounded-md`   | 6px          | Inputs, badges |
| `rounded-sm`   | 4px          | Small elements |
| `rounded-full` | 9999px       | Avatars, pills |

---

## Components

### Button

Located at: `src/components/ui/button.tsx`

**Variants:**

- `default` - Primary blue background
- `secondary` - Light gray background
- `outline` - Bordered, transparent background
- `ghost` - No background, text only
- `destructive` - Red background for dangerous actions

**Sizes:**

- `sm` - Small (h-9)
- `default` - Standard (h-10)
- `lg` - Large (h-11)
- `icon` - Square icon button

### Card

Located at: `src/components/ui/card.tsx`

**Components:**

- `Card` - Container
- `CardHeader` - Title section
- `CardTitle` - Main heading
- `CardDescription` - Subtitle
- `CardContent` - Body content
- `CardFooter` - Action area

### Input

Located at: `src/components/ui/input.tsx`

Standard input with focus ring animation. Use with `Label` component.

### Badge

Located at: `src/components/ui/badge.tsx`

**Variants:**

- `default` - Primary color
- `secondary` - Muted color
- `outline` - Bordered
- `destructive` - Red/error

### Avatar

Located at: `src/components/ui/avatar.tsx`

**Components:**

- `Avatar` - Container
- `AvatarImage` - User photo
- `AvatarFallback` - Initials fallback

### Dialog/Sheet

- `Dialog` - Centered modal
- `Sheet` - Side panel (used for mobile sidebar)

### Table

Located at: `src/components/ui/table.tsx`

Full-featured table with header, body, row components.

---

## Layout Components

### AppSidebar

Located at: `src/components/layout/app-sidebar.tsx`

**Features:**

- Collapsible navigation
- User menu with dropdown
- Active state highlighting
- Mobile-responsive (converts to sheet)

**Navigation Items:**

- Dashboard
- Personas
- Vacantes
- Feedback
- Configuración

### AppHeader

Located at: `src/components/layout/app-header.tsx`

**Features:**

- Sidebar toggle button
- Search bar (desktop)
- Notifications dropdown

---

## Status Colors

### Pipeline Stages

| Stage        | Background       | Text               |
| ------------ | ---------------- | ------------------ |
| Applied      | `bg-gray-100`    | `text-gray-800`    |
| Screening    | `bg-blue-100`    | `text-blue-800`    |
| Interviewing | `bg-yellow-100`  | `text-yellow-800`  |
| Finalist     | `bg-purple-100`  | `text-purple-800`  |
| Offer        | `bg-green-100`   | `text-green-800`   |
| Hired        | `bg-emerald-100` | `text-emerald-800` |
| Rejected     | `bg-red-100`     | `text-red-800`     |

### Position Status

| Status  | Background      | Text              |
| ------- | --------------- | ----------------- |
| Open    | `bg-green-100`  | `text-green-800`  |
| On Hold | `bg-yellow-100` | `text-yellow-800` |
| Closed  | `bg-gray-100`   | `text-gray-800`   |

### Priority

| Priority | Background      | Text              |
| -------- | --------------- | ----------------- |
| Urgent   | `bg-red-100`    | `text-red-800`    |
| High     | `bg-orange-100` | `text-orange-800` |
| Medium   | `bg-blue-100`   | `text-blue-800`   |
| Low      | `bg-gray-100`   | `text-gray-800`   |

---

## Icons

Using **Lucide React** icon library.

Common icons used:

- `Users` - People/Personas
- `Briefcase` - Positions/Vacantes
- `LayoutDashboard` - Dashboard
- `MessageSquare` - Feedback
- `Settings` - Configuration
- `Search` - Search
- `Plus` - Add new
- `Filter` - Filters
- `Bell` - Notifications

---

## Responsive Breakpoints

Following Tailwind's default breakpoints:

| Breakpoint | Width  | Usage         |
| ---------- | ------ | ------------- |
| `sm`       | 640px  | Small tablets |
| `md`       | 768px  | Tablets       |
| `lg`       | 1024px | Laptops       |
| `xl`       | 1280px | Desktops      |
| `2xl`      | 1400px | Large screens |

---

## Dark Mode

The design system supports dark mode via the `.dark` class on the `<html>` element.

Dark mode uses inverted values:

- Dark backgrounds (`222.2 84% 4.9%`)
- Light text (`210 40% 98%`)
- Adjusted accent colors for contrast

To enable: Add `class="dark"` to the `<html>` element.

---

## Utility Classes

### cn() Function

Located at: `src/lib/utils.ts`

Combines `clsx` and `tailwind-merge` for conditional class merging:

```tsx
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class')} />;
```

---

## File Structure

```
src/
├── app/
│   ├── globals.css          # Global styles, CSS variables
│   └── layout.tsx           # Root layout with font
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── layout/              # Layout components
│       ├── app-sidebar.tsx
│       └── app-header.tsx
└── lib/
    └── utils.ts             # cn() utility
```

---

## Usage Guidelines

1. **Consistency:** Always use design tokens (CSS variables) instead of hardcoded colors
2. **Accessibility:** Ensure sufficient color contrast (WCAG AA minimum)
3. **Responsiveness:** Test all layouts at all breakpoints
4. **Components:** Prefer shadcn/ui components over custom implementations
5. **Icons:** Use Lucide icons for consistency

---

_Document generated for: People Hub MVP_
_Last updated: Fase 3 - Frontend Setup_
