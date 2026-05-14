# Decision 001: Model Pages Architecture

**Date:** 2026-05-13
**Status:** Accepted
**Author:** Georgi Tsonev + Claude
**Context:** XPENG Bulgaria website — how to build the G9, G6, and P7 Plus product pages

---

## Problem

We need to build 3 model pages (G9, G6, P7 Plus) that share the same section types but differ in content, section count, and ordering. The architecture must support future models (X9, MONA M03) with minimal effort.

Two viable approaches in Webflow: **CMS Collection template** or **Static pages + Component library**.

---

## Decision

**Static pages with a shared component library.** No CMS collections for model pages.

---

## Context & Research

### What the Figma shows

All 3 models use the same section types in varying quantities and orders:

| Section Type | P7 | G9 | G6 |
|---|---|---|---|
| Hero (stats + CTAs) | 1 | 1 | 1 |
| Fullscreen image + text | 4 | 6 | 6 |
| Feature cards (alternating img/text) | 5 | 3 | 6 |
| Featured spec (heading + large image) | 1 | 2 | 2 |
| Color picker | yes | yes | no |
| Tabbed carousel (4 tabs) | 1 | 1 | 1 |
| Specs table (variant tabs) | yes | yes | no |
| Contact/lead form | 1 | 1 | 1 |
| App promo, subscribe, disclaimer, footer | constant | constant | constant |

Key observation: sections are **interleaved** in different orders per model, not grouped by type.

### How XPENG HQ builds model pages

The global xpeng.com runs **Next.js (React)** with static generation per locale. Model pages are custom-built with shared components — not CMS-driven. Each model page has 12-14 unique sections. Even with 5+ models and 40+ locales, HQ chose components over CMS.

URL pattern: `xpeng.com/{locale}/model/{model-name}`
Assets: `s-cdn.xpeng.com` with Aliyun OSS image optimization.

---

## Options Evaluated

### Option A: CMS Collection Template

One "Models" collection with a shared template page. Content blocks stored in 5 supporting collections (Page Sections, Colors, Spec Variants, Carousel Tabs). Multi-reference fields link them.

**Pros:**
- True one-template-serves-all
- Content editing via CMS panel
- Automatic URL routing
- Can filter/list models elsewhere on the site

**Cons:**
- 30-field limit per collection forces splitting across 5+ collections
- Cannot conditionally render different layouts per Collection List item — need CSS/JS workarounds where every list item contains ALL layout variants with most hidden via `[data-section-type]` selectors
- Section ordering is fixed to one template order — G6 (no color picker, no specs table) can't diverge from G9's layout without hacks
- Multi-reference items all render with the same layout
- Heavier DOM from hidden layout variants
- High complexity: 5 collections, multi-reference chains, conditional visibility rules
- CMS plan required (~$23/mo minimum)

### Option B: Static Pages + Component Library (chosen)

Each model gets its own static page (`/g9`, `/g6`, `/p7-plus`). A library of reusable components with properties and slots ensures visual consistency. Components are dropped onto pages and configured per instance.

**Pros:**
- Maximum design freedom per model page
- No field count limits
- Each page can have unique section order and count
- "Don't want a section? Don't place the component." — no conditional visibility hacks
- Components enforce visual consistency across models
- Clean, minimal DOM — no hidden layout variants
- No CMS plan required
- Better performance
- Lower complexity — easier to maintain and debug

**Cons:**
- Adding a new model = duplicate page + swap content (~30 min)
- No centralized content editing panel (but editor is the designer anyway)
- Can't auto-generate a dynamic model listing page (build it manually or add a small CMS collection later)
- Content changes require Webflow designer access

### Option C: Hybrid (CMS for specs/colors only)

Static pages + components for layout, with small CMS collections for structured data (spec variants, color options). Considered but rejected — adds CMS complexity for data that changes rarely (quarterly at most) and that is simple enough to manage as component props.

---

## Rationale

| Factor | CMS Template | Components |
|---|---|---|
| Model count (now / future) | 3 / 5-6 | 3 / 5-6 |
| Time to add new model | ~45 min (fill 5 collections) | ~30 min (duplicate + swap props) |
| Section ordering | Fixed, identical for all | Free, unique per model |
| Conditional sections | CSS/JS workarounds | Just omit the component |
| Design flexibility | Constrained by template | Full freedom |
| Who edits content | CMS panel or designer | Designer (Georgi) |
| Content update frequency | Quarterly | Quarterly |
| DOM weight | Heavy (hidden variants) | Clean |
| Complexity | High (5 collections + workarounds) | Low (12 components) |

**The deciding factors:**

1. **Scale doesn't justify CMS.** 3-6 model pages is not 500 blog posts. CMS overhead doesn't pay off at this scale.

2. **Each model IS structurally different.** G6 has no color picker, no specs table, but 6 feature cards. P7 has a smart tech section unique to it. CMS forces sameness; components embrace difference.

3. **The editor is the designer.** There's no separate content team. Georgi works directly in the Webflow designer. A CMS panel adds indirection without benefit.

4. **HQ validates this approach.** XPENG's own engineering team chose custom components over CMS for model pages, even at 10x the scale.

5. **Future-proof enough.** When a new model launches (1-2/year), duplicating a page and swapping content takes 30 minutes. The component library ensures it looks consistent automatically.

---

## Component Library

### Section Components (to build)

| Component | Props | Slots | Used on |
|---|---|---|---|
| `Hero` | model_name, tagline, hero_image, stat_1_value, stat_1_label, stat_2_value, stat_2_label, stat_3_value, stat_3_label | — | Every model |
| `FullscreenSection` | heading, body, bg_image | — | Every model (4-6x) |
| `FeatureCard` | heading, body, image, image_side (left/right) | — | Every model (2-6x) |
| `FeaturedSpec` | heading, body, image | — | Every model (1-2x) |
| `ColorPicker` | heading, subheading | Color swatches + car images | G9, P7 |
| `TabbedCarousel` | — | Tab items (label + body + image) | Every model |
| `SpecsTable` | heading | Variant tabs + spec rows | G9, P7 |
| `ContactForm` | model_name, car_image | — | Every model |
| `AppPromo` | (constant) | — | Every model |
| `Disclaimer` | — | Rich text content | Every model |

### Global Components (already built)

| Component | Status |
|---|---|
| `Footer` | Done (2026-05-13) |
| `Subscribe` | Done (2026-05-13) |
| `Nav` | To build |

### Building a new model page

1. Create static page, set `data-page` attribute
2. Drop `Nav` (global)
3. Drop `Hero` → fill 9 props
4. Drop N x `FullscreenSection` → fill heading, body, bg_image each
5. Drop `ColorPicker` if model has colors (skip for G6)
6. Drop N x `FeatureCard` → fill heading, body, image, alternate image_side
7. Drop N x `FeaturedSpec` → fill heading, body, image
8. Drop `TabbedCarousel` → fill 4 tabs in slot
9. Drop `SpecsTable` if model has specs (skip for G6)
10. Drop `ContactForm` → set model_name + car_image
11. Drop `AppPromo` (global)
12. Drop `Subscribe` (global)
13. Drop `Disclaimer` → fill slot with model-specific text
14. Drop `Footer` (global)

Estimated time per model: **30 minutes**.

---

## Where CMS WILL be used

Reserve Webflow CMS for content types that genuinely benefit from it:

| Content type | Why CMS fits |
|---|---|
| News / Blog | High volume, uniform structure, editors post frequently |
| Dealer locations | Structured data, may be listed/filtered on a map page |
| FAQ items | Grows over time, shown in multiple places |
| Test drive submissions | Form data collection |

These are high-volume or frequently-updated collections with uniform structure — the sweet spot for CMS.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Need dynamic model listing page | Medium | Build a simple static grid linking to each model page, or add a tiny "Models" CMS collection later (name, slug, thumbnail, tagline — 5 fields) purely for listing |
| HQ requires CMS for content approval workflows | Low | BAI has full design freedom per project brief. No HQ CMS integration required. |
| Many more models added rapidly | Low | XPENG's EU lineup grows ~1 model/year. At 10+ models, revisit this decision. |
| Non-technical editor needs to update specs | Low | Currently one-person team (Georgi). If a content editor joins, extract specs into a small CMS collection at that point. |

---

## References

- Figma design: https://www.figma.com/design/tSjabH2H19RbVkUT3TNSNn/Xpeng---Website?node-id=28-6884
- XPENG global site: xpeng.com (Next.js, component-based architecture)
- Webflow Components docs: https://help.webflow.com/hc/en-us/articles/33961303934611
- Webflow Slots docs: https://help.webflow.com/hc/en-us/articles/33961195339923
- Webflow CMS Collection Pages: https://webflow.com/webflow-way/cms/collection-pages
