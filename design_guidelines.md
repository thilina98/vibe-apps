# Vibecoded Apps Marketplace - Design Guidelines

## Design Approach: Reference-Based (Marketplace Discovery)

**Primary References:** Product Hunt (discovery patterns), Dribbble (visual showcase), App Store (app presentation)

**Design Philosophy:** Create a vibrant, modern marketplace that celebrates creativity and makes discovery delightful. The interface should feel energetic and inspire builders while maintaining professional clarity.

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- **Primary:** 262 80% 50% (vibrant purple - represents creativity and AI innovation)
- **Background:** 0 0% 100% (pure white)
- **Surface:** 240 5% 96% (soft gray for cards)
- **Text Primary:** 220 13% 18% (deep charcoal)
- **Text Secondary:** 220 9% 46% (medium gray)
- **Border:** 220 13% 91% (subtle dividers)
- **Success/Launch:** 142 76% 36% (vivid green for CTA)

**Dark Mode:**
- **Primary:** 262 70% 60% (lighter purple for dark backgrounds)
- **Background:** 222 47% 11% (rich dark blue-gray)
- **Surface:** 217 33% 17% (elevated surface)
- **Text Primary:** 210 40% 98% (near white)
- **Text Secondary:** 215 20% 65% (muted light gray)
- **Border:** 217 33% 24% (subtle borders)
- **Success/Launch:** 142 70% 45% (adjusted green)

**Tool Badge Colors** (apply to both modes with adjusted brightness):
- Replit Agent: 262 80% 50%
- Bolt.new: 45 100% 51%
- v0: 0 0% 15%
- Cursor: 200 100% 45%
- Claude: 33 82% 55%
- ChatGPT: 171 65% 45%
- Lovable: 340 75% 55%
- Windsurf: 195 80% 48%

### B. Typography

**Font Families:**
- **Primary (UI/Body):** Inter (400, 500, 600, 700)
- **Display (Headlines):** Plus Jakarta Sans (600, 700, 800)
- **Mono (Code/Tags):** JetBrains Mono (400, 500)

**Type Scale:**
- Hero/Display: text-5xl md:text-6xl lg:text-7xl font-bold
- Page Title: text-3xl md:text-4xl font-bold
- Section Header: text-2xl md:text-3xl font-semibold
- Card Title: text-xl font-semibold
- Body: text-base leading-relaxed
- Small/Meta: text-sm text-secondary
- Tiny/Tags: text-xs font-medium

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (gaps, padding): 2, 4
- Component spacing: 6, 8
- Section spacing: 12, 16, 20, 24

**Grid Systems:**
- **App Cards:** grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Container:** max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- **Detail Layout:** 2-column (lg:grid-cols-3, main content 2/3, sidebar 1/3)

### D. Component Library

**Navigation:**
- Sticky header with backdrop blur (backdrop-blur-xl bg-background/80)
- Logo + search bar (prominent, centered) + Submit App CTA button
- Mobile: hamburger menu, full-screen overlay

**App Cards:**
- Aspect ratio 16:9 preview image with hover lift (hover:-translate-y-1 transition-transform)
- Gradient overlay on image bottom for text contrast
- Tool badges as small pills overlaid on top-right of image
- Short description (2 lines, truncate with ellipsis)
- Launch button: full-width, primary color, with external link icon
- Card background: surface color with subtle border, rounded-2xl
- Hover state: shadow-xl transition

**Detail Page Hero:**
- Full-width preview image section (max-h-96 object-cover)
- Gradient overlay at bottom
- Floating info card overlapping image bottom (contains app name, creator, tools)
- Launch button: large, prominent, success green with animation

**Key Learnings Card:**
- Distinct visual treatment: border-l-4 border-primary bg-surface/50
- "💡 Key Learnings" header with icon
- Markdown rendering with syntax highlighting (use Prism.js via CDN)
- Max-width for readability (max-w-3xl)

**Tool Badges:**
- Pill shape: px-3 py-1 rounded-full
- Tool-specific background colors (semi-transparent: bg-[color]/10)
- Tool-specific text colors
- Small icon (16x16) + tool name
- Use Heroicons for generic icons via CDN

**Category Badges:**
- Outlined style: border-2 px-4 py-1 rounded-lg
- Neutral colors: border-border text-secondary
- Icon + category name

**Filters Panel:**
- Sticky sidebar (desktop) or collapsible drawer (mobile)
- Checkbox groups for tools and categories
- Radio buttons for sorting
- Clear filters button
- Active filter count indicator

**Search Bar:**
- Prominent in header: min-w-[320px] on desktop
- Search icon left, clear button right
- Live results dropdown with highlighted matches
- Recent searches (if implementing)

**Launch Button:**
- Primary: bg-success text-white px-8 py-3 rounded-lg font-semibold
- Icon: external link (Heroicons arrow-top-right-on-square)
- Hover: scale-105 shadow-lg transition
- Active state: scale-95

**Pagination:**
- Centered below grid
- Previous/Next with page numbers
- Current page: primary color, others: border-border
- Disabled state: opacity-50

### E. Imagery & Assets

**Hero Section:**
- Full-width banner showcasing featured apps mosaic or abstract AI visualization
- Height: min-h-[500px] md:min-h-[600px]
- Overlay gradient for text contrast

**App Preview Images:**
- Required aspect ratio: 16:9
- Fallback: gradient background with app name
- Lazy loading for performance
- CDN optimization

**Icons:**
- Use Heroicons (outline style) via CDN
- Tool logos: reference actual brand assets or use placeholder with tool name
- Size: 20x20 (small), 24x24 (medium), 32x32 (large)

### F. Interaction Patterns

**Hover States:**
- Cards: lift + shadow increase
- Buttons: scale + shadow
- Links: color shift to primary

**Loading States:**
- Skeleton screens for cards (shimmer effect)
- Spinner for search results
- Progressive image loading with blur-up

**Empty States:**
- Centered illustration (use SVG placeholder or undraw.co)
- Helpful message + CTA to submit first app
- Search no results: suggest clearing filters

**Form Validation:**
- Inline errors below fields (text-red-600)
- Success state: green checkmark
- Character counters for limited fields
- Required field indicators (*)

---

## Page-Specific Guidelines

### Homepage
- Hero: gradient background (from primary to purple-800) with abstract shapes, headline "Discover Amazing AI-Built Apps", search bar front and center
- Featured section: 3-card horizontal scroll showcasing recent/popular apps
- Main grid: all apps with filters sidebar (desktop) or top filters (mobile)
- Footer: newsletter signup, social links, about, submit app CTA

### Submit App Page
- Clean form layout: max-w-3xl centered
- Step indicator for sections (optional: multi-step form)
- Image upload: drag-drop zone with preview
- Markdown preview for descriptions and key learnings (split view: edit/preview tabs)
- Submit button: prominent success color

### App Detail Page
- Hero image with gradient overlay
- Info card: app name, creator, tools, category, launch count
- Large Launch App button above fold
- Description section: max-w-prose for readability
- Key Learnings: dedicated card with distinct styling
- Sidebar: creator info, stats, related apps

---

## Responsive Breakpoints

- Mobile: < 768px (stack everything, full-width cards)
- Tablet: 768px - 1024px (2-column grid)
- Desktop: > 1024px (3-column grid, sidebar filters)

---

## Accessibility & Performance

- Maintain WCAG AA contrast ratios
- Focus indicators: ring-2 ring-primary ring-offset-2
- Keyboard navigation for all interactive elements
- Alt text for all images
- Loading states prevent layout shift
- Optimize images: WebP format, lazy loading

This design creates a vibrant, modern marketplace that celebrates creativity while maintaining professional usability. The purple primary color represents AI innovation, while the green launch button creates clear visual hierarchy for the primary action.