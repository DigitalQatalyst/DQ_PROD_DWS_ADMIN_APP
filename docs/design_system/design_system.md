# Page Layout Design System
## Overview
This design system defines the visual and interaction patterns for the Page Layout component library. It ensures consistency across all implementations and provides clear specifications for developers and designers.
---
## Typography
### Font Family
- **Primary**: System font stack (uses browser/OS defaults)
- **Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
### Type Scale
#### Page Title (H1)
- **Size**: 30px (text-3xl)
- **Weight**: 700 (font-bold)
- **Color**: Gray 900 (#111827)
- **Line Height**: 1.2
- **Spacing Below**: 8px (mb-2)
- **Usage**: Main page heading, appears once per page
#### Section Header (H2)
- **Size**: 18px (text-lg)
- **Weight**: 700 (font-bold)
- **Color**: Gray 900 (#111827)
- **Line Height**: 1.75
- **Spacing Below**: 4px (mb-1)
- **Usage**: Section titles within page sections
#### Subsection Title (H3) - Inside a Section
- **Size**: 18px (text-lg)
- **Weight**: 500 (font-medium)
- **Color**: Gray 900 (#111827)
- **Spacing Below**: 16px (mb-4)
- **Usage**: Titles for subsections within a main section (e.g., "Content Lifecycle", "Assigned Reviewer", "Actions" within Review & Comments module)
#### Section Description
- **Size**: 14px (text-sm)
- **Weight**: 400 (regular)
- **Color**: Gray 600 (#4B5563)
- **Line Height**: 1.625 (leading-relaxed)
- **Usage**: Supporting text below section headers
#### Body Text Inside Sections
- **Size**: 14px (text-sm)
- **Weight**: 400 (regular)
- **Color**: Gray 600 (#4B5563) - use `text-gray-600`
- **Line Height**: 1.5
- **Usage**: Descriptive text, status messages, and content within subsections (not for titles/headers)
#### Breadcrumbs
- **Size**: 14px (text-sm)
- **Weight**: 400 (regular) for links, 500 (font-medium) for current page
- **Color**: Gray 600 (#4B5563) for links, Gray 900 (#111827) for current
- **Hover Color**: Gray 800 (#1F2937)
- **Usage**: Navigation trail below page title
#### Body Text
- **Size**: 14px (text-sm)
- **Weight**: 400 (regular)
- **Color**: Gray 700 (#374151)
- **Line Height**: 1.5
#### Button Text
- **Size**: 14px (text-sm)
- **Weight**: 500 (font-medium)
- **Line Height**: 1.5
---
## Color Palette
### Neutral Colors
- **Gray 50**: #F9FAFB (backgrounds)
- **Gray 100**: #F3F4F6 (subtle backgrounds)
- **Gray 200**: #E5E7EB (borders, dividers)
- **Gray 300**: #D1D5DB (borders, disabled states)
- **Gray 400**: #9CA3AF (icons, placeholders)
- **Gray 500**: #6B7280 (secondary text)
- **Gray 600**: #4B5563 (body text, descriptions)
- **Gray 700**: #374151 (primary text)
- **Gray 800**: #1F2937 (hover states)
- **Gray 900**: #111827 (headings, emphasis)
### Primary Colors (Blue)
- **Blue 50**: #EFF6FF (backgrounds)
- **Blue 500**: #3B82F6 (focus rings)
- **Blue 600**: #2563EB (primary buttons, links)
- **Blue 700**: #1D4ED8 (button hover)
### Semantic Colors
#### Success (Green)
- **Green 50**: #F0FDF4
- **Green 200**: #BBF7D0
- **Green 600**: #16A34A
- **Green 700**: #15803D
- **Green 800**: #166534
#### Warning (Yellow)
- **Yellow 50**: #FEFCE8
- **Yellow 200**: #FEF08A
- **Yellow 600**: #CA8A04
- **Yellow 700**: #A16207
- **Yellow 800**: #854D0E
#### Error (Red)
- **Red 50**: #FEF2F2
- **Red 200**: #FECACA
- **Red 600**: #DC2626
- **Red 800**: #991B1B
#### Info (Blue)
- **Blue 50**: #EFF6FF
- **Blue 200**: #BFDBFE
- **Blue 600**: #2563EB
- **Blue 700**: #1D4ED8
- **Blue 800**: #1E40AF
---
## Spacing System
### Base Unit: 4px (0.25rem)
### Spacing Scale
- **0**: 0px
- **1**: 4px (0.25rem)
- **2**: 8px (0.5rem)
- **3**: 12px (0.75rem)
- **4**: 16px (1rem)
- **5**: 20px (1.25rem)
- **6**: 24px (1.5rem)
- **8**: 32px (2rem)
- **10**: 40px (2.5rem)
- **12**: 48px (3rem)
### Component Spacing
#### Page Layout
- **Padding**: 16px mobile (p-4), 24px desktop (lg:p-6)
- **Background**: Gray 50 (#F9FAFB)
- **Content Max Width**: None (full width)
#### Page Header
- **Padding Bottom**: 16px (pb-4)
- **Margin Bottom**: 24px (mb-6)
- **Title Margin Bottom**: 8px (mb-2)
#### Page Section
- **Background**: White (#FFFFFF)
- **Border**: 1px solid Gray 200 (#E5E7EB)
- **Border Radius**: 8px (rounded-lg)
- **Shadow**: 0 1px 2px rgba(0, 0, 0, 0.05) (shadow-sm)
- **Margin Between Sections**: 24px (space-y-6)
#### Section Header
- **Padding**: 24px all sides (p-6)
- **Border Bottom**: 1px solid Gray 200 (#E5E7EB)
- **Title Margin Bottom**: 4px (mb-1)
- **Action Button Margin Left**: 24px (ml-6)
- **Action Button Gap**: 12px (gap-3)
#### Section Content
- **Padding**: 24px all sides (p-6)
- **Padding Override**: Use className="p-0" to remove padding
#### Breadcrumbs
- **Gap Between Items**: 8px (gap-2)
- **Icon Size**: 12px (w-3 h-3) for chevrons, 16px (w-4 h-4) for home icon
- **Icon Margin**: 4px (mr-1) after home icon
---
## Components
### Buttons
#### Primary Button
- **Background**: Blue 600 (#2563EB)
- **Text Color**: White (#FFFFFF)
- **Padding**: 8px horizontal (px-4), 8px vertical (py-2)
- **Border**: None (border-transparent)
- **Border Radius**: 6px (rounded-md)
- **Font Size**: 14px (text-sm)
- **Font Weight**: 500 (font-medium)
- **Transition**: colors 150ms ease
**States:**
- **Hover**: Blue 700 (#1D4ED8)
- **Focus**: 2px Blue 500 ring with 2px offset (focus:ring-2 focus:ring-offset-2 focus:ring-blue-500)
- **Disabled**: 50% opacity, cursor not-allowed
**With Icon:**
- Icon size: 16px (w-4 h-4)
- Icon margin: 8px right (mr-2)
#### Secondary Button
- **Background**: White (#FFFFFF)
- **Text Color**: Gray 700 (#374151)
- **Padding**: 8px horizontal (px-4), 8px vertical (py-2)
- **Border**: 1px solid Gray 300 (#D1D5DB)
- **Border Radius**: 6px (rounded-md)
- **Font Size**: 14px (text-sm)
- **Font Weight**: 500 (font-medium)
- **Transition**: colors 150ms ease
**States:**
- **Hover**: Gray 50 background (#F9FAFB)
- **Focus**: 2px Blue 500 ring with 2px offset
- **Disabled**: 50% opacity, cursor not-allowed
**With Icon:**
- Icon size: 16px (w-4 h-4)
- Icon margin: 8px right (mr-2)
### Page Section Card
- **Background**: White (#FFFFFF)
- **Border**: 1px solid Gray 200 (#E5E7EB)
- **Border Radius**: 8px (rounded-lg)
- **Shadow**: 0 1px 2px rgba(0, 0, 0, 0.05)
- **Overflow**: hidden (to maintain border radius with child elements)
### Breadcrumbs
- **Container**: Flex row with 8px gap
- **Alignment**: Vertical center (items-center)
- **White Space**: No wrap (prevents breaking to multiple lines)
**Breadcrumb Item (Link):**
- **Color**: Gray 600 (#4B5563)
- **Hover Color**: Gray 800 (#1F2937)
- **Font Size**: 14px (text-sm)
- **Transition**: colors 150ms ease
**Breadcrumb Item (Current):**
- **Color**: Gray 900 (#111827)
- **Font Weight**: 500 (font-medium)
**Divider:**
- **Icon**: ChevronRight
- **Size**: 12px (w-3 h-3)
- **Color**: Gray 400 (#9CA3AF)
**Home Icon:**
- **Size**: 16px (w-4 h-4)
- **Color**: Gray 400 (#9CA3AF)
- **Margin Right**: 4px (mr-1)
- **Usage**: Only on first breadcrumb item
### Tables
#### Table Headers
- **Font Size**: 14px (text-sm)
- **Font Weight**: 500 (font-medium)
- **Color**: Gray 700 (#374151)
- **Text Transform**: None (do not capitalize) - use title case when needed (e.g., "Date & Time" not "DATE & TIME")
- **Padding**: 24px horizontal (px-6), 12px vertical (py-3)
- **Background**: Gray 50 (#F9FAFB)
- **Border**: Bottom border 1px Gray 200
#### Table Cells
- **Font Size**: 14px (text-sm)
- **Font Weight**: 400 (regular)
- **Color**: Gray 700 (#374151)
- **Padding**: 24px horizontal (px-6), 12px vertical (py-3)
#### Table Row Spacing
- **Border**: 1px solid Gray 200 between rows (divide-y divide-gray-200)
---
## Layout Patterns
### Page Structure
---
## Public Page Layouts
### Overview
Public page layouts are designed for marketing and informational pages without side navigation. These layouts use full-width containers with centered content and different breakpoint considerations.
### Page Types
#### HomePage
- **Purpose**: Landing page with hero section and multiple content sections
- **Components**: Header, Hero, ContentSections, Footer
- **Max Width**: Varies by section (controlled by ContentSection maxWidth prop)
- **Typical Use**: Main landing page, product homepage
#### FeaturePage
- **Purpose**: Feature showcase with centered hero and alternating content sections
- **Components**: Header, Centered Hero, ContentSections, Footer
- **Max Width**: Varies by section
- **Typical Use**: Feature pages, product pages, service pages
#### DetailPage
- **Purpose**: Long-form content with focused reading experience
- **Components**: Header, Title section, Prose content, Footer
- **Max Width**: Default lg (1024px), configurable
- **Typical Use**: Blog posts, documentation, about pages, legal pages
### Components
#### PublicHeader
- **Position**: Sticky top (sticky top-0)
- **Height**: 64px (h-16)
- **Background**: White with 95% opacity + backdrop blur
- **Border**: Bottom border 1px Gray 200
- **Z-index**: 50 (appears above page content)
- **Responsive**: Mobile menu at md breakpoint (768px)
**Structure:**
- Logo (left)
- Navigation links (center, hidden on mobile)
- CTA button (right, hidden on mobile)
- Mobile menu toggle (visible on mobile only)
**Mobile Menu:**
- Full-width dropdown below header
- Vertical navigation links
- CTA button at bottom
- Border top 1px Gray 200
#### PublicFooter
- **Background**: White
- **Border**: Top border 1px Gray 200
- **Padding**: 48px vertical (py-12)
- **Grid**: 2-4-6 columns responsive (2 on mobile, 4 on tablet, 6 on desktop)
**Structure:**
- Logo section (spans 2 columns)
- Footer sections (1 column each)
- Bottom section with copyright and social links
- Separator border between main and bottom section
#### Hero
Three variants available:
**Default Variant:**
- Left-aligned content
- Full-width image below content (optional)
- Max width 768px for text content (max-w-3xl)
- Padding: 64px vertical mobile (py-16), 96px desktop (lg:py-24)
**Centered Variant:**
- Center-aligned content
- Max width 896px (max-w-4xl)
- Image below content (optional)
- Same vertical padding as default
**Split Variant:**
- Two-column grid on desktop (lg:grid-cols-2)
- Content on left, image on right
- Equal column widths
- 48px gap between columns (gap-12)
- Same vertical padding
**Typography:**
- Subtitle: 14px, semibold, Blue 600, uppercase, tracking-wide
- Title: 36px mobile (text-4xl), 48px tablet (sm:text-5xl), 60px desktop (lg:text-6xl)
- Description: 18px (text-lg), Gray 600, relaxed line height
- Title margin bottom: 24px (mb-6)
- Description margin bottom: 32px (mb-8)
#### ContentSection
- **Purpose**: Reusable section container with consistent spacing
- **Padding**: 64px vertical mobile (py-16), 96px desktop (lg:py-24)
- **Max Width Options**: sm (672px), md (896px), lg (1024px), xl (1152px), 2xl (1280px), full
- **Default Max Width**: xl (1152px)
- **Container**: Centered with horizontal padding
### Breakpoints
Public pages use standard Tailwind breakpoints without sidebar considerations:
- **Mobile**: < 640px (default)
- **Tablet**: ≥ 640px (sm:)
- **Desktop**: ≥ 768px (md:)
- **Large Desktop**: ≥ 1024px (lg:)
- **Extra Large**: ≥ 1280px (xl:)
### Container System
**Container Class:**
- `container mx-auto`: Centers container and sets max-width based on breakpoint
- Horizontal padding: 16px mobile (px-4), 24px tablet (sm:px-6), 32px desktop (lg:px-8)
**Max Width System:**
- Controlled via maxWidth prop on ContentSection and DetailPage
- Options: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- Applied with mx-auto for centering
### Typography Scale (Public Pages)
#### Hero Title
- **Mobile**: 36px (text-4xl)
- **Tablet**: 48px (sm:text-5xl)
- **Desktop**: 60px (lg:text-6xl)
- **Weight**: 700 (font-bold)
- **Color**: Gray 900
- **Line Height**: 1.1
- **Spacing Below**: 24px (mb-6)
#### Section Title (H2)
- **Mobile**: 30px (text-3xl)
- **Tablet**: 36px (sm:text-4xl)
- **Weight**: 700 (font-bold)
- **Color**: Gray 900
- **Spacing Below**: 16px (mb-4)
#### Subsection Title (H3)
- **Mobile**: 24px (text-2xl)
- **Tablet**: 30px (sm:text-3xl)
- **Weight**: 700 (font-bold)
- **Color**: Gray 900
- **Spacing Below**: 16px (mb-4)
#### Body Text (Large)
- **Size**: 18px (text-lg)
- **Weight**: 400 (regular)
- **Color**: Gray 600
- **Line Height**: 1.75 (leading-relaxed)
#### Subtitle/Eyebrow
- **Size**: 14px (text-sm)
- **Weight**: 600 (font-semibold)
- **Color**: Blue 600
- **Transform**: Uppercase
- **Letter Spacing**: Wide (tracking-wide)
- **Spacing Below**: 16px (mb-4)
### Color Usage (Public Pages)
**Backgrounds:**
- White (#FFFFFF): Default page background, cards
- Gray 50 (#F9FAFB): Alternate sections
- Blue 600 (#2563EB): CTA sections, accents
**Text:**
- Gray 900 (#111827): Headings, primary text
- Gray 700 (#374151): Body text
- Gray 600 (#4B5563): Secondary text, descriptions
- Blue 600 (#2563EB): Accents, eyebrows, links
**Borders:**
- Gray 200 (#E5E7EB): Section dividers, cards
- Gray 300 (#D1D5DB): Input borders
### Spacing Patterns
**Section Spacing:**
- Vertical padding: 64px mobile (py-16), 96px desktop (lg:py-24)
- Between elements in section: 32px (space-y-8) or 64px (mb-16) for major divisions
**Content Spacing:**
- Heading to description: 16px (mb-4)
- Description to action: 32px (mb-8)
- Between content blocks: 32px (space-y-8)
**Grid Gaps:**
- Default: 32px (gap-8)
- Large sections: 48px (gap-12)
- Small items: 16px (gap-4)
### Responsive Behavior
**Header:**
- Desktop: Horizontal navigation with logo left, links center, CTA right
- Mobile: Logo left, hamburger right, navigation in dropdown
**Hero:**
- Split variant: Stacks on mobile (single column), side-by-side on lg (1024px+)
- Image: Full width on mobile, constrained on desktop
**Content Sections:**
- Grid columns: 1 on mobile, 2 on md (768px), 3 on lg (1024px)
- Text alignment: Left on mobile, can be centered on desktop
- Images: Full width on mobile, side-by-side with text on desktop
**Footer:**
- Grid: 2 columns mobile, 4 tablet (md), 6 desktop (lg)
- Logo section spans 2 columns
- Bottom section: Stacks on mobile, horizontal on md (768px)
### Best Practices
**Layout:**
1. Use container class for all major sections
2. Apply consistent vertical padding (py-16 lg:py-24)
3. Center content with max-width constraints
4. Maintain visual hierarchy with spacing
**Typography:**
1. Use Hero component for main page titles
2. Maintain consistent heading hierarchy (H1 → H2 → H3)
3. Use text-lg for important body copy
4. Keep line lengths readable (max-w-2xl to max-w-4xl for prose)
**Sections:**
1. Alternate background colors (white / gray-50) for visual separation
2. Use ContentSection for consistent spacing
3. Group related content within sections
4. Add visual breaks with borders or background changes
**Images:**
1. Use aspect-ratio utilities for consistent sizing
2. Add rounded corners (rounded-lg) and shadows (shadow-2xl for hero images)
3. Optimize for responsive display
4. Use placeholder backgrounds during development
**Navigation:**
1. Keep header sticky for easy access
2. Highlight active page in navigation
3. Provide clear CTAs in header
4. Include mobile menu for small screens
### Component Props
**HomePage:**
