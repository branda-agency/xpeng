# XPENG Bulgaria — Car Configurator Technical Plan

**Date:** 2026-05-19
**Status:** Approved
**Author:** Georgi Tsonev + Claude

---

## Context

XPENG BG needs a car configurator replicating the German store experience (store.xpeng.com/de/configurator). Separate page per model (G9, G6, P7+), same template — only data differs. Split-panel layout: car images left, options right, sticky footer with price. Data managed via Google Sheets for non-technical updates.

---

## Architecture Overview

```
Google Sheet (6 tabs — team edits prices/colors/specs)
    |
    v
Apps Script (free JSON endpoint, 6h cache)
    |
    v
Configurator JS (fetch -> state -> render -> events)
    |
    v
Webflow Page (template cloning — design in Webflow, populate in JS)
```

---

## Key Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Page structure | Separate page per model (`/configurator/g9`) | URL determines model, no modal needed |
| Data source | Google Sheets + Apps Script | Free, familiar UI, no learning curve |
| Interior viewer | Static image (Phase 1), 360 panorama (Phase 2) | Deadline constraint |
| Financing | Full price only, no calculator (Phase 1) | No BG financial partner yet |
| Currency | EUR primary + BGN secondary (fixed rate 1.95583) | BG pegged to EUR |
| "Continue" flow | Summary page + inquiry form + test drive CTA | Phase 2: pre-order ~600 EUR deposit |
| Navigation | No model picker on configurator, URL determines model | Homepage has separate model picker |
| Wheels | Show step if model has options (mirror DE site) | Consistency |
| Delivery time | Google Sheet field, supports fixed text or `+60days` formula | Flexible |
| Image hosting | Webflow Assets (Phase 1) | Simple, URLs in Google Sheet |
| JS architecture | Single file (main.js), template cloning, plain state object | Matches existing patterns |

---

## 1. Webflow Pages

### Configurator Page `/configurator/{model}`

```
section[data-configurator="g9"]
  .configurator                              <- Grid: 50/50 desktop, stack mobile
    .configurator__gallery                   <- Sticky left panel (100vh)
      .configurator__gallery-viewport        <- Relative container
        img[data-cfg-image="0"]              <- 3 stacked images (front/side/rear)
        img[data-cfg-image="1"]
        img[data-cfg-image="2"]
      .configurator__gallery-dots            <- 3 dot indicators
      .configurator__gallery-arrows          <- Prev/next buttons
    .configurator__options                   <- Scrollable right panel
      .configurator__header                  <- Model name + starting price
      section[data-cfg-step="variant"]       <- Variant cards (1 template, JS clones)
      section[data-cfg-step="exterior"]      <- Color swatches (1 template, JS clones)
      section[data-cfg-step="interior"]      <- Interior options (1 template, JS clones)
      section[data-cfg-step="wheels"]        <- Wheel options (hidden if <=1 option)
      section[data-cfg-step="accessories"]   <- Accessory toggles (1 template, JS clones)
  .configurator__footer                      <- Fixed bottom: EUR price + BGN + "Produlzhi"
```

### Summary Page `/configurator/summary`

```
section[data-cfg-summary]
  .summary__hero                             <- Model name + selected car image
  .summary__config                           <- Line items (variant, color, interior, etc.)
  .summary__total                            <- EUR + BGN totals
  .summary__actions
    form[data-consent-form]                  <- Inquiry form (reuses existing consent pattern)
      hidden fields (model, variant, color, total)
      name, email, phone, message
      [data-consent-checkbox] + [data-consent-submit]
    a -> test drive CTA
    a -> edit configuration (back to configurator)
```

### Pages to create: 4 total
- `/configurator/g9`
- `/configurator/g6`
- `/configurator/p7-plus`
- `/configurator/summary`

---

## 2. Google Sheets Schema

**Sheet name:** "XPENG BG Configurator Data"

### Tab: Models
| model_slug | model_name | starting_price | hero_image |
|---|---|---|---|
| g9 | XPENG G9 | 59600 | URL |

### Tab: Variants
| model_slug | variant_code | variant_name | price | is_default | range_km | power_kw | acceleration | delivery_time | specs_json | sort_order |
|---|---|---|---|---|---|---|---|---|---|---|
| g9 | rwd-sr | RWD Standard Range | 59600 | TRUE | 435 | 230 | 6.4s | Q4 2026 | {...} | 1 |

### Tab: Colors
| model_slug | variant_code | color_code | color_name | color_hex | price | is_default | image_front | image_side | image_rear | sort_order |
|---|---|---|---|---|---|---|---|---|---|---|
| g9 | all | arctic-white | Arctic White | #F5F5F0 | 0 | TRUE | URL | URL | URL | 1 |

### Tab: Interiors
| model_slug | variant_code | interior_code | interior_name | price | is_default | image_thumb | image_full | sort_order |
|---|---|---|---|---|---|---|---|---|

### Tab: Wheels
| model_slug | variant_code | wheel_code | wheel_name | price | is_default | image_thumb | sort_order |
|---|---|---|---|---|---|---|---|

### Tab: Accessories
| model_slug | variant_code | accessory_code | accessory_name | price | description | image | sort_order |
|---|---|---|---|---|---|---|---|

**Key:** `variant_code = "all"` means available for all variants.

---

## 3. Apps Script Endpoint

```
GET https://script.google.com/.../exec?model=g9
```

Returns:
```json
{
  "model": { "model_slug": "g9", "model_name": "XPENG G9", "starting_price": 59600, ... },
  "variants": [ ... ],
  "colors": [ ... ],
  "interiors": [ ... ],
  "wheels": [ ... ],
  "accessories": [ ... ]
}
```

- 6-hour cache per model (CacheService)
- `?refresh=true` busts cache
- ~30 lines of code
- Free, 20k requests/day

---

## 4. JS Architecture

### Router Update
Detect `/configurator/{slug}` paths, call `initConfiguratorPage(slug)`.

### State Management
Plain object + pub/sub notify pattern:
```
state = { selectedVariant, selectedColor, selectedInterior, selectedWheels, selectedAccessories[], galleryIndex }
setState(updates, changeType) -> notify(changeType)
```

### Data Flow
```
fetch JSON -> applyDefaults() -> renderAll() -> bindEvents()
User clicks -> setState() -> handleStateChange()
  -> updatePrice() / updateGallery() / updateVariantUI() / updateColorUI() / etc.
```

### Rendering
Template cloning from Webflow-designed elements. Clone N times from data, populate via `data-cfg-*` attributes, remove original template.

### Price Calculation
```
total = variant.price + color.price + interior.price + wheels.price + SUM(accessories.price)
BGN = total * 1.95583
```

### Gallery
3-image carousel with GSAP crossfade on color change. Dot/arrow navigation. Drag/swipe on mobile.

### Variant Filtering
When variant changes, re-filter options by `variant_code === "all" || variant_code === selected`.

### Delivery Time
Supports fixed text ("Q4 2026") or relative formula ("+60days" -> calculates from today).

---

## 5. motion.css Additions (~50 lines)

- `[data-cfg-image]` -- absolute stacking for gallery
- `[data-cfg-variant-card]` -- border/shadow transition
- `[data-cfg-swatch]` -- scale/shadow transitions
- `[data-cfg-interior-option]`, `[data-cfg-wheel-option]` -- border transitions
- `[data-cfg-accessory-toggle]` -- bg/color transitions
- `[data-cfg-variant-details]` -- max-height collapse
- `[data-cfg-dot]` -- active indicator
- `.configurator__footer` -- will-change: transform
- `[data-cfg-loading]` -- opacity + pointer-events
- `@media (prefers-reduced-motion: reduce)` -- disable all above

---

## 6. Image Pipeline

### Naming: `{model}-{color-code}-{angle}.webp`

### Specs
| Type | Dimensions | Format | Max |
|---|---|---|---|
| Exterior (x3) | 1600x900 | WebP | 150 KB |
| Interior thumb | 400x300 | WebP | 50 KB |
| Interior full | 1600x900 | WebP | 150 KB |
| Wheel/Accessory | 400x400 | WebP | 50 KB |

### Count: ~22 per model, ~66 total for 3 models
### Hosting: Webflow Assets. URLs in Google Sheet.
### Preloading: Default color only on page load.

---

## 7. Summary Page Data Passing

- **sessionStorage** -- full state (names, prices, images) for instant render
- **URL params** -- codes for shareability: `?model=g9&variant=rwd-sr&color=arctic-white&...`
- If sessionStorage empty (shared link) -> re-fetch from API
- "Edit" links back with URL params
- Hidden form fields carry config codes for Webflow form submission

---

## 8. Responsive

| Breakpoint | Layout |
|---|---|
| Desktop (992px+) | 50/50 grid, left sticky gallery |
| Tablet (768-991px) | 45/55 grid |
| Mobile (<768px) | Stacked: gallery top (60vw), options below, full-width sticky footer |

---

## 9. Files Modified

| File | Changes |
|---|---|
| `webflow-js/src/main.js` | +450-500 lines (configurator + summary) |
| `webflow-js/src/styles/motion.css` | +50 lines (transitions) |
| `CLAUDE.md` | Add configurator data attributes |

---

## 10. Implementation Steps

### Phase A: Data Layer (Days 1-2)
1. Create Google Sheet with 6 tabs + headers
2. Populate G9 data
3. Write + deploy Apps Script endpoint
4. Test endpoint

### Phase B: Webflow Pages (Days 2-3)
5. Build configurator page (layout, templates, data attributes)
6. Build summary page
7. Duplicate for G6 + P7+

### Phase C: Core JS (Days 3-5)
8. Router update
9. Data fetching + loading state
10. State management
11. Template rendering (5 render functions)
12. Event binding
13. Price calculation + footer
14. Gallery carousel
15. Variant filtering
16. Delivery time
17. Expandable specs
18. Conditional wheel step

### Phase D: Summary + Polish (Days 5-6)
19. Navigate to summary
20. Summary rendering
21. URL param restoration
22. Form hidden fields
23. motion.css transitions
24. Reduced motion support

### Phase E: Data Population (Days 6-7)
25. Source + process images
26. Upload to Webflow Assets
27. Populate G6 + P7+ data
28. Verify all 3 configurators

### Phase F: Testing + Deploy (Days 7-8)
29. Cross-browser + mobile
30. Price accuracy
31. Summary flow E2E
32. Build + push + publish

---

## Verification Checklist

- [ ] `/configurator/g9` loads, defaults selected, images show
- [ ] Variant click updates price, filters options
- [ ] Color swatch click crossfades gallery
- [ ] Interior option swaps image
- [ ] Accessory toggle updates price
- [ ] "Produlzhi" -> summary with full config
- [ ] "Edit" -> back to configurator with selections
- [ ] Form submission includes config data
- [ ] Mobile: stacked layout, swipe gallery, sticky footer
- [ ] Reduced motion: no animations, all visible
- [ ] Slow network: loading state, graceful error
- [ ] Sheet price change -> reflected on site (after cache)

---

## Phase 2 Upgrades (Post June 10)

- [ ] Interior 360 panorama viewer (drag-to-rotate)
- [ ] Financing calculator (when BG financial partner secured)
- [ ] Pre-order with ~600 EUR deposit (Stripe, pending lawyer approval)
- [ ] GitHub Action to cache JSON as static files on Cloudflare
- [ ] Admin UI for Google Sheets (or Notion/Airtable migration)
