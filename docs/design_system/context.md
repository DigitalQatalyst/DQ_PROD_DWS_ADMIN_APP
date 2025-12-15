## Exports
- `PageLayout` - Named export, function component
  - Signature: `export function PageLayout({ title, breadcrumbs, headerVariant = 'default', headerSubtitle, headerBackgroundImage, children, 'data-id'?: string }: PageLayoutProps): JSX.Element`
  - Prop Types: See `PageLayoutProps` interface
- `PageSection` - Named export, function component
  - Signature: `export function PageSection({ children, className = '', 'data-id'?: string }: PageSectionProps): JSX.Element`
  - Prop Types: See `PageSectionProps` interface
- `SectionHeader` - Named export, function component
  - Signature: `export function SectionHeader({ title, description, actions, 'data-id'?: string }: SectionHeaderProps): JSX.Element`
  - Prop Types: See `SectionHeaderProps` interface
- `SectionContent` - Named export, function component
  - Signature: `export function SectionContent({ children, className = '', 'data-id'?: string }: SectionContentProps): JSX.Element`
  - Prop Types: See `SectionContentProps` interface
- `PrimaryButton` - Named export, function component
  - Signature: `export function PrimaryButton({ children, onClick, disabled = false, type = 'button', className = '', 'data-id'?: string }: PrimaryButtonProps): JSX.Element`
  - Prop Types: See `PrimaryButtonProps` interface
- `SecondaryButton` - Named export, function component
  - Signature: `export function SecondaryButton({ children, onClick, disabled = false, type = 'button', className = '', 'data-id'?: string }: SecondaryButtonProps): JSX.Element`
  - Prop Types: See `SecondaryButtonProps` interface
- `Breadcrumbs` - Named export, function component
  - Signature: `export function Breadcrumbs({ items, className = '', 'data-id'?: string }: BreadcrumbsProps): JSX.Element`
  - Prop Types: See `BreadcrumbsProps` interface
- `PageHeader` - Named export, function component
  - Signature: `export function PageHeader({ title, breadcrumbs, variant = 'default', subtitle, backgroundImage, 'data-id'?: string }: PageHeaderProps): JSX.Element`
  - Prop Types: See `PageHeaderProps` interface
- `HomePage` - Named export, function component
  - Signature: `export function HomePage({ header, hero, children, footer, 'data-id'?: string }: HomePageProps): JSX.Element`
  - Prop Types: See `HomePageProps` interface
- `FeaturePage` - Named export, function component
  - Signature: `export function FeaturePage({ header, title, subtitle, description, breadcrumbs, children, footer, variant = 'default', backgroundImage, 'data-id'?: string }: FeaturePageProps): JSX.Element`
  - Prop Types: See `FeaturePageProps` interface
- `DetailPage` - Named export, function component
  - Signature: `export function DetailPage({ header, title, breadcrumbs, children, footer, variant = 'default', subtitle, backgroundImage, 'data-id'?: string }: DetailPageProps): JSX.Element`
  - Prop Types: See `DetailPageProps` interface
- `PublicHeader` - Named export, function component
  - Signature: `export function PublicHeader({ logo, navLinks = [], ctaButton, variant = 'public', 'data-id'?: string }: PublicHeaderProps): JSX.Element`
  - Prop Types: See `PublicHeaderProps` interface
- `PublicFooter` - Named export, function component
  - Signature: `export function PublicFooter({ logo, sections = [], copyright, socialLinks, variant = 'public', 'data-id'?: string }: PublicFooterProps): JSX.Element`
  - Prop Types: See `PublicFooterProps` interface
- `Hero` - Named export, function component
  - Signature: `export function Hero({ title, subtitle, description, actions, image, variant = 'default', backgroundImage, 'data-id'?: string }: HeroProps): JSX.Element`
  - Prop Types: See `HeroProps` interface
- `ContentSection` - Named export, function component
  - Signature: `export function ContentSection({ children, className = '', 'data-id'?: string }: ContentSectionProps): JSX.Element`
  - Prop Types: See `ContentSectionProps` interface
- `PublicLayoutBase` - Named export, function component
  - Signature: `export function PublicLayoutBase({ header, children, footer, 'data-id'?: string }: PublicLayoutBaseProps): JSX.Element`
  - Prop Types: See `PublicLayoutBaseProps` interface
- `BreadcrumbItem` - Named export, TypeScript interface
  - Type Definition:
    ```
    export interface BreadcrumbItem {
      label: string
      href?: string
      icon?: ComponentType<{ className?: string }>
      current?: boolean
    }
    ```
- Additionally, barrel exports (types) are re-exported via index:
  - `BreadcrumbItem` - Type export from `./PageLayout` (via `export type { BreadcrumbItem } from './PageLayout'`)

## Component Props & Types
```ts
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: ComponentType<{ className?: string }>
  current?: boolean
}
```

```ts
interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  'data-id'?: string
}
```
```ts
export function Breadcrumbs({
  items,
  className = '',
  'data-id': dataId,
}: BreadcrumbsProps): JSX.Element
```

```ts
interface PageLayoutProps {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  headerVariant?: 'default' | 'fullWidthHeader'
  headerSubtitle?: string
  headerBackgroundImage?: string
  children: React.ReactNode
  'data-id'?: string
}
```
```ts
export function PageLayout({
  title,
  breadcrumbs,
  headerVariant = 'default',
  headerSubtitle,
  headerBackgroundImage,
  children,
  'data-id': dataId,
}: PageLayoutProps): JSX.Element
```

```ts
interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  variant?: 'default' | 'fullWidthHeader'
  subtitle?: string
  backgroundImage?: string
  'data-id'?: string
}
```
```ts
export function PageHeader({
  title,
  breadcrumbs,
  variant = 'default',
  subtitle,
  backgroundImage,
  'data-id': dataId,
}: PageHeaderProps): JSX.Element
```

```ts
interface PageSectionProps {
  children: React.ReactNode
  className?: string
  'data-id'?: string
}
```
```ts
export function PageSection({
  children,
  className = '',
  'data-id': dataId,
}: PageSectionProps): JSX.Element
```

```ts
interface SectionHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  'data-id'?: string
}
```
```ts
export function SectionHeader({
  title,
  description,
  actions,
  'data-id': dataId,
}: SectionHeaderProps): JSX.Element
```

```ts
interface SectionContentProps {
  children: React.ReactNode
  className?: string
  'data-id'?: string
}
```
```ts
export function SectionContent({
  children,
  className = '',
  'data-id': dataId,
}: SectionContentProps): JSX.Element
```

```ts
interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'data-id'?: string
}
```
```ts
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  'data-id': dataId,
}: PrimaryButtonProps): JSX.Element
```

```ts
interface SecondaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'data-id'?: string
}
```
```ts
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  'data-id': dataId,
}: SecondaryButtonProps): JSX.Element
```

```ts
interface HomePageProps {
  header?: React.ReactNode
  hero: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  'data-id'?: string
}
```
```ts
export function HomePage({
  header,
  hero,
  children,
  footer,
  'data-id': dataId,
}: HomePageProps): JSX.Element
```

```ts
interface FeaturePageProps {
  header?: React.ReactNode
  title: string
  subtitle?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'gradient'
  backgroundImage?: string
  'data-id'?: string
}
```
```ts
export function FeaturePage({
  header,
  title,
  subtitle,
  description,
  breadcrumbs,
  children,
  footer,
  variant = 'default',
  backgroundImage,
  'data-id': dataId,
}: FeaturePageProps): JSX.Element
```

```ts
interface DetailPageProps {
  header?: React.ReactNode
  title: string
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
  footer?: React.ReactNode
  variant?: 'default' | 'fullWidthHeader'
  subtitle?: string
  backgroundImage?: string
  'data-id'?: string
}
```
```ts
export function DetailPage({
  header,
  title,
  breadcrumbs,
  children,
  footer,
  variant = 'default',
  subtitle,
  backgroundImage,
  'data-id': dataId,
}: DetailPageProps): JSX.Element
```

```ts
interface PublicHeaderProps {
  logo?: React.ReactNode
  navLinks?: NavLink[]
  ctaButton?: React.ReactNode
  variant?: 'public' | 'app'
  'data-id'?: string
}
```
```ts
export function PublicHeader({
  logo,
  navLinks = [],
  ctaButton,
  variant = 'public',
  'data-id': dataId,
}: PublicHeaderProps): JSX.Element
```

```ts
interface NavLink {
  label: string
  href: string
  active?: boolean
}
```
```ts
// NavLink used by PublicHeader
```

```ts
interface PublicFooterProps {
  logo?: React.ReactNode
  sections?: FooterSection[]
  copyright?: string
  socialLinks?: React.ReactNode
  variant?: 'public' | 'app'
  'data-id'?: string
}
```
```ts
export function PublicFooter({
  logo,
  sections = [],
  copyright,
  socialLinks,
  variant = 'public',
  'data-id': dataId,
}: PublicFooterProps): JSX.Element
```

```ts
interface FooterSection {
  title: string
  links: FooterLink[]
}
interface FooterLink {
  label: string
  href: string
}
```
```ts
// FooterSection / FooterLink definitions used by PublicFooter
```

```ts
interface HeroProps {
  title: string
  subtitle?: string
  description?: string
  actions?: React.ReactNode
  image?: string
  variant?: 'default' | 'centered' | 'split' | 'gradient'
  backgroundImage?: string
  'data-id'?: string
}
```
```ts
export function Hero({
  title,
  subtitle,
  description,
  actions,
  image,
  variant = 'default',
  backgroundImage,
  'data-id': dataId,
}: HeroProps): JSX.Element
```

```ts
interface ContentSectionProps {
  children: React.ReactNode
  className?: string
  'data-id'?: string
}
```
```ts
export function ContentSection({
  children,
  className = '',
  'data-id': dataId,
}: ContentSectionProps): JSX.Element
```

```ts
interface PublicLayoutBaseProps {
  header?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  'data-id'?: string
}
```
```ts
export function PublicLayoutBase({
  header,
  children,
  footer,
  'data-id': dataId,
}: PublicLayoutBaseProps): JSX.Element
```

## Import Patterns
For named exports:
```ts
import { PageLayout, PageSection, SectionHeader, SectionContent, PrimaryButton, SecondaryButton, Breadcrumbs, PageHeader } from './src/PageLayout'
import type { BreadcrumbItem } from './src/PageLayout'
```

For default exports:
- Not applicable (no default exports in these files)

For mixed exports:
```ts
import DefaultComponent, { namedExport, type NamedType } from './component-file'
```

- Exact file paths:
  - Named UI components: './src/PageLayout'
  - Public-facing layout components: './src/PublicPageLayout'
  - Barrel exports (types) via index: './src/index' (as shown in src/index.tsx)
- Type-only imports (when beneficial):
```ts
import type { BreadcrumbItem } from './src/PageLayout'
```

## Usage Requirements
- No special React context providers are required. These components are self-contained and styled via a design system driven by utility classes.
- Styling relies on a utility-based approach; ensure your project applies the same utility system to render correctly.
- Icons are used across components via props such as an optional `icon` on BreadcrumbItem entries.
- Props support merging via `className`; base styling is applied by the components, and additional visual tweaks can be achieved by passing `className` to relevant components (e.g., PageLayout, SectionContent, PrimaryButton, SecondaryButton).
- The components expose data-id attributes to aid automated testing and DOM querying and should be preserved if tests rely on them.
- Public page layout components (PublicHeader, PublicFooter, Hero, ContentSection, PublicLayoutBase) are intended for marketing/public pages, while PageLayout + PageHeader + PageSection family is oriented toward application-like layouts with internal sections.
- For dynamic behavior, some components rely on internal state (e.g., Breadcrumbs color adaptation, mobile menu toggling in PublicHeader, tab-like sections in Section headers). External state management is not required but can be wired by providing standard React props and event handlers.

## Component Behavior
- Breadcrumbs
  - Renders as a horizontal trail with a chevron divider between items.
  - The first item shows a Home icon; current item is rendered as non-clickable text with a heavier color.
  - If a custom color className is applied (e.g., text-white), default text colors and hover states adapt accordingly.
- PageHeader
  - Default variant renders a standard contained header with optional breadcrumbs and title.
  - fullWidthHeader variant renders a full-width gradient header with optional background image. If backgroundImage is provided, it is rendered as a subtle background layer.
  - Breadcrumbs are shown above the title when provided.
- PageLayout
  - Wraps content in a main area with two variants:
    - Default: standard contained layout with a header (PageHeader) and a structured content region.
    - fullWidthHeader: header rendered above content, with optional background image; content uses a wide container.
  - HeaderSubtitle and headerBackgroundImage customize the top area when using the default header.
- Sections (PageSection, SectionHeader, SectionContent)
  - PageSection provides a white card with border, subtle shadow, and rounded corners.
  - SectionHeader renders the section title, optional description, and optional actions (aligned to the right).
  - SectionContent provides padding around the section’s inner content with an easy override via className (e.g., p-0).
- Buttons (PrimaryButton, SecondaryButton)
  - PrimaryButton: blue-filled button with white text; hover/focus states defined; supports icons via children.
  - SecondaryButton: white button with gray border; subtle hover/focus states; supports icons via children.
- Public Page Layouts
  - Hero supports multiple variants: default, centered, split, gradient.
  - PublicHeader and PublicFooter implement typical marketing-site patterns with responsive behavior (mobile menu, bottom CTA, multi-column footers).
  - HomePage, FeaturePage, DetailPage provide convenient composition wrappers for common page layouts, including optional breadcrumbs, titles, and footers.
  - ContentSection is a reusable container with consistent max-width and padding.
- Public Layout Base
  - PublicLayoutBase is a generic wrapper for pages composed with an optional header, content, and footer.

## Layout Patterns
- Page Structure
  - Global layout uses a centered content container with max-width, consistent horizontal padding, and vertical rhythm between sections.
  - Public pages emphasize full-bleed header areas, hero sections, and multi-column footers, with responsive breakpoints guiding when content stacks vs. aligns side-by-side.
- Public Pages
  - Breakpoints align with standard responsive patterns: mobile, tablet, desktop, and large desktop.
  - PublicHeader uses a sticky top bar with a mobile menu accessible at small breakpoints; desktop navigation is visible at md+.
- Container & Max-Width
  - ContentSection provides a centered container with maxWidth options: sm | md | lg | xl | 2xl | full; default is xl.
- Typography & Color
  - Public pages follow a design system with color usage for backgrounds, text, borders, and accents consistent across components.
  - Hero typography scales adapt at key breakpoints, with emphasis on the main title.
- Responsiveness
  - Layouts adapt from single-column to multi-column across breakpoints; images and text reflow to maintain readability and balance.
  - Navigation and hero content reflow gracefully on smaller viewports.

## Styling & Theming
- Base styling relies on a design-system of utility-like classes embedded in component markup.
- ClassName merging is supported in several components; providing a `className` prop appends to the base classes.
- Data-id attributes are exposed on many components to support automated testing and DOM queries.
- Color usage follows a cohesive palette for neutrals, blues for primary actions, and semantic colors for status-like visuals.

## Code Examples

### Example 1: Basic Usage
```tsx
// Show the absolute minimum required to use the component
import { PageLayout, PageSection, SectionHeader, SectionContent, Breadcrumbs, PageHeader } from './src/PageLayout'
import type { BreadcrumbItem } from './src/PageLayout'

function App() {
  return (
    <PageLayout
      title="Dashboard"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', current: true }
      ]}
    >
      <PageSection data-id="overview-section">
        <SectionHeader title="Overview" />
        <SectionContent>
          <div className="text-sm text-gray-700">
            This is the minimal page demonstrating the PageLayout composition.
          </div>
        </SectionContent>
      </PageSection>
    </PageLayout>
  )
}
```

### Example 2: Common Use Case
```tsx
// Show typical real-world usage with header subtitle and background
import { PageLayout, PageSection, SectionHeader, SectionContent, PrimaryButton } from './src/PageLayout'

function App() {
  return (
    <PageLayout
      title="Projects"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Projects', current: true }
      ]}
      headerSubtitle="Overview of current initiatives"
      headerBackgroundImage="https://images.example.com/photo.jpg"
    >
      <PageSection>
        <SectionHeader title="Active Projects" />
        <SectionContent>
          <ul className="space-y-2">
            <li className="text-sm text-gray-700">Project A — In Progress</li>
            <li className="text-sm text-gray-700">Project B — Planning</li>
            <li className="text-sm text-gray-700">Project C — On Hold</li>
          </ul>
          <div className="mt-4">
            <PrimaryButton>New Project</PrimaryButton>
          </div>
        </SectionContent>
      </PageSection>
    </PageLayout>
  )
}
```

### Example 3: With Event Handlers
```tsx
// Demonstrate callback props and event handling
import { PageLayout, PageHeader, SectionHeader, SectionContent, PrimaryButton } from './src/PageLayout'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <PageLayout
      title="Catalog"
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Catalog', current: true }]}
    >
      <PageHeader title="Catalog" />
      <SectionHeader
        title="Actions"
        actions={
          <PrimaryButton onClick={() => setCount((c) => c + 1)}>
            Increment
          </PrimaryButton>
        }
      />
      <SectionContent>
        <div className="text-sm text-gray-700">Items viewed: {count}</div>
      </SectionContent>
    </PageLayout>
  )
}
```

### Example 4: Advanced Public Page Layout Composition
```tsx
// Show composite public page layout using PublicHeader, Hero, ContentSection, PublicFooter
import { HomePage, ContentSection } from './src/PublicPageLayout'
import { PublicHeader, PublicFooter } from './src/PublicPageLayout'
import { Hero } from './src/PublicPageLayout'
import { ContentSection as CPContent } from './src/PublicPageLayout'

function App() {
  const header = (
    <PublicHeader
      logo={<div className="text-xl font-bold text-gray-900">Brand</div>}
      navLinks={[
        { label: 'Home', href: '#', active: true },
        { label: 'Docs', href: '#' },
        { label: 'Pricing', href: '#' },
      ]}
      ctaButton={<button className="bg-blue-600 text-white px-4 py-2 rounded">Get Started</button>}
      variant="public"
    />
  )

  const footer = (
    <PublicFooter
      logo={<div className="text-xl font-bold text-gray-900">Brand</div>}
      sections={[
        { title: 'Product', links: [{ label: 'Features', href: '#' }] },
        { title: 'Company', links: [{ label: 'About', href: '#' }] },
        { title: 'Resources', links: [{ label: 'Docs', href: '#' }] },
        { title: 'Legal', links: [{ label: 'Privacy', href: '#' }] },
      ]}
      copyright="© 2025 Brand. All rights reserved."
      socialLinks={
        <>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Twitter</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GitHub</a>
          <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">LinkedIn</a>
        </>
      }
      variant="public"
    />
  )

  return (
    <HomePage header={header} footer={footer} hero={
      <Hero
        variant="gradient"
        subtitle="Welcome to the future"
        title="Build Amazing Products Faster"
        description="The complete platform for modern teams to build, ship, and scale applications with confidence."
        backgroundImage="https://images.example.com/hero.jpg"
        actions={
          <>
            <button className="bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition shadow-lg">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition">
              View Demo
            </button>
          </>
        }
      />
    }>
      <ContentSection>
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
            Everything you need to succeed
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Powerful features designed to help your team collaborate and ship faster.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: null, title: 'Lightning Fast', description: 'Optimized performance that scales with your needs.' },
            { icon: null, title: 'Secure by Default', description: 'Enterprise-grade security built into every layer.' },
            { icon: null, title: 'Team Collaboration', description: 'Work together seamlessly with powerful tools.' },
          ].map((f, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="w-10 h-10 mb-3 rounded-full bg-indigo-100" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-700">{f.description}</p>
            </div>
          ))}
        </div>
      </ContentSection>
      <ContentSection className="bg-white py-12">
        <div className="text-center">
          <p className="text-sm font-semibold text-indigo-600 mb-3 uppercase tracking-wide">
            Trusted by teams worldwide
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8">
            Join thousands of happy customers
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">10K+</div>
              <p className="text-sm text-gray-700">Active Users</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">99.9%</div>
              <p className="text-sm text-gray-700">Uptime</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-indigo-600 mb-2">4.9/5</div>
              <p className="text-sm text-gray-700">Customer Rating</p>
            </div>
          </div>
        </div>
      </ContentSection>
    </HomePage>
  )
}
```

### Example 5: Public Header & Footer Usage
```tsx
// Show a minimal public header/footer integration with a hero
import { PublicHeader, PublicFooter, Hero, ContentSection } from './src/PublicPageLayout'
import { PublicLayoutBase } from './src/PublicPageLayout'

function App() {
  return (
    <PublicLayoutBase
      header={
        <PublicHeader
          logo={<div className="text-xl font-bold text-gray-900">Logo</div>}
          navLinks={[{ label: 'Home', href: '#', active: true }, { label: 'Docs', href: '#' }]}
          ctaButton={<button className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</button>}
          variant="public"
        />
      }
      footer={
        <PublicFooter
          logo={<div className="text-xl font-bold text-gray-900">Logo</div>}
          sections={[
            { title: 'Docs', links: [{ label: 'Getting Started', href: '#' }] },
            { title: 'Support', links: [{ label: 'Contact', href: '#' }] },
          ]}
          copyright="© 2025 Company. All rights reserved."
          variant="public"
        />
      }
    >
      <Hero title="Public Page Hero" subtitle="Subheading" description="Intro text for the public page." variant="default" />
      <ContentSection>
        <p className="text-gray-700">Body content goes here.</p>
      </ContentSection>
    </PublicLayoutBase>
  )
}
```

## Public Page Layouts (Overview)
- Public page layouts are designed for marketing and informational pages without side navigation. These layouts use full-bleed header areas with centered content and responsive hero sections.
- Key public components include PublicHeader, PublicFooter, Hero, ContentSection, and PublicLayoutBase, which together enable rapid assembly of landing pages and documentation sites.

## Import Patterns (Public Page Layouts)
For named exports:
```ts
import { PageLayout, PageSection, SectionHeader, SectionContent, PrimaryButton, SecondaryButton, Breadcrumbs, PageHeader } from './src/PageLayout'
import type { BreadcrumbItem } from './src/PageLayout'
```

For default exports:
- Not applicable (no default exports)

For mixed exports:
```ts
import DefaultComponent, { namedExport, type NamedType } from './component-file'
```

- Exact file paths:
  - Named UI components: './src/PageLayout'
  - Public-facing layout components: './src/PublicPageLayout'
  - Barrel exports (types) via index: './src/index' (as shown in src/index.tsx)
- Type-only imports (when beneficial):
```ts
import type { BreadcrumbItem } from './src/PageLayout'
```

## Usage Requirements
- No special React context providers are required. These components are self-contained.
- Styling relies on a design-system of utilities; ensure your project uses a consistent utility approach to render correctly.
- Icons are used by various components via props to render visual cues.
- Data-id attributes are exposed on many components to support automated testing and DOM queries.

## Component Behavior
- Breadcrumbs adapt colors based on container color cues. The first breadcrumb renders a Home icon. Current item renders as non-clickable text with a heavier emphasis.
- PageHeader supports two variants:
  - Default: contained header with optional breadcrumbs and title.
  - Full-width header: gradient full-bleed header with optional background image; breadcrumbs appear above the title when provided.
- PageLayout supports:
  - Default: contained layout with an optional header and a structured content region.
  - fullWidthHeader: header renders above content with optional background image; content uses a wide container.
- PageSection, SectionHeader, SectionContent provide consistent card-like sections with responsive padding and borders.
- PrimaryButton and SecondaryButton provide consistent, accessible button styles with focus rings and hover states.
- Public page components (PublicHeader, PublicFooter, Hero, ContentSection, PublicLayoutBase) support marketing-site patterns, including responsive navigation, multi-column footers, and flexible hero variants.

## Layout Patterns
- Page Structure uses centered containers with consistent horizontal padding and vertical rhythm between sections.
- Public Pages emphasize full-bleed headers, hero sections, and multi-column footers with responsive stacking.
- ContentSection offers a reusable container with configurable max-width and padding.

## Styling & Theming
- Styling is implemented via a design-system of utility-like classes embedded in component markup.
- ClassName merging allows users to extend or override base styles.
- Data-id attributes facilitate automated testing.
- Color usage follows a cohesive palette for neutrals, blues for primary actions, and semantic colors for status-like visuals.

## Code Examples (Additional Context)
Refer to the code blocks above for practical usage patterns across basic, common, and public-page scenarios.