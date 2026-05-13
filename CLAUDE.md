# XPENG Bulgaria

## About
Official website for XPENG's exclusive Bulgarian distributor BAI (Bulgarian Automotive Industry EAD). Automotive EV brand — premium, tech-forward, AI mobility positioning. Phase 1 deadline: June 10, 2026.

## Platform
Webflow + Cloudflare Pages + Vite

## Live URLs
- **Webflow staging:** `https://xpengg.webflow.io/`
- **Cloudflare CDN:** `https://xpeng-bg.pages.dev/`
- **Production:** `xpeng.com/bg` (HQ manages DNS, reverse proxy to Webflow)

## Brand Values
| Value | Definition |
|-------|-----------|
| Intelligence | AI company that builds cars, not a car company adding AI |
| Premium without elitism | Premium quality at competitive price, no pretension |
| Proof over promise | Lead with demonstrable specs, not abstract claims |
| Smart lifestyle | Cars that think, evolve via OTA, integrate with your life |

## Brand Essence
Tech-forward premium EV. "The most intelligent alternative to traditional premium brands." Rational, demonstrable, not myth-driven. More Tesla competitor than luxury brand.

## Tone of Voice
- Direct, confident, factual
- Lead with numbers and proof points (800V, 20 min charging, 5-star Euro NCAP)
- Words to use: intelligent, premium, evolving, proven, European-tested
- Words to avoid: cheap, affordable, budget, Chinese (as qualifier), luxury

## Visual System

### Colors
**Primary accent:** `#000000` (black — XPENG brand is monochrome)
**Accent hover:** `#333333`
**Background primary:** `#FFFFFF`
**Background dark:** `#0A0A0A` (hero sections, dark modules)
**Text primary:** `#1A1A1A`
**Text on dark:** `#FFFFFF`
**Text secondary:** `#666666`

### Typography
**Primary font:** System font stack (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif)
**Heading font:** Inter (fallback for Basis Grotesque Pro until HQ provides Cyrillic license)

### Motion
- Smooth, premium, automotive feel
- Scroll-triggered reveals with mask animations
- Nav hides on scroll down, shows on scroll up
- Color picker: instant swap, no transition delay
- Support `prefers-reduced-motion`

---

## Tech Stack

### Architecture: Three-Layer System
```
Webflow (Design + GSAP)  →  GitHub (Code)  →  Cloudflare Pages (CDN)
       ↓                         ↓                      ↓
  Layout, styles,           main.js +            Auto-deploys on
  classes, CMS,             motion.css            git push to main
  GSAP + plugins            (Vite build)              (~60s)
```

### GSAP Setup
- **Loaded by:** Webflow native (Site Settings → GSAP toggle)
- **Plugins enabled:** ScrollTrigger, SplitText, CustomEase
- **Access in code:** `const { gsap, ScrollTrigger, SplitText, CustomEase } = window;`

### IDs & Config
- **Webflow subdomain:** `xpengg.webflow.io`
- **GitHub repo:** `branda-agency/xpeng`
- **Cloudflare Pages:** `xpeng-bg.pages.dev`
- **Cloudflare account:** Eyas.team@gmail.com

### Vite Project (`webflow-js/`)
- **Entry:** `src/main.js` → **Output:** `dist/main.js` (UMD) + `dist/motion.css`
- **Dev server:** HTTPS at `https://localhost:3000`
- **Dependencies:** Lenis (smooth scroll)

### Webflow Custom Code
**Head:**
```html
<link rel="stylesheet" href="https://xpeng-bg.pages.dev/motion.css">
```
**Footer:**
```html
<script src="https://xpeng-bg.pages.dev/main.js"></script>
```

### Local Dev (swap in Webflow custom code for testing)
**Head:**
```html
<script type="module" src="https://localhost:3000/@vite/client"></script>
```
**Footer:**
```html
<script type="module" src="https://localhost:3000/src/main.js"></script>
```

### Deploy Workflow
1. Edit `webflow-js/src/main.js` or `motion.css`
2. Test locally (swap to `https://localhost:3000` script tags)
3. `npm run build` → `git add` → `git commit` → `git push`
4. Cloudflare auto-deploys (~60s)
5. Swap Webflow back to production tags, publish site

### Key Rules
- Main styles live in Webflow editor (not CSS files)
- motion.css is ONLY for animations/transitions, not layout
- Use `data-` attributes for JS targeting, not class names
- Each `init*()` function guards on element existence
- All sizing in em, never px (except stroke-weight, box-shadow, media queries)

## Figma Design
- **File:** https://www.figma.com/design/tSjabH2H19RbVkUT3TNSNn/Xpeng---Website?node-id=27-6846
- **Pages:** Home, P7, G9, G6, About/Brand (desktop + mobile)
- **Layout:** 1920px desktop, 1320px content area (300px padding), 750px mobile
- **Shared components:** Nav (56px), Footer (437px), Contact form, Newsletter, Disclaimer, 4 button variants

## Pages
| Page | Slug | data-page | Status |
|------|------|-----------|--------|
| Home | / | home | TODO |
| G9 | /g9 | g9 | TODO |
| G6 | /g6 | g6 | TODO |
| P7 Plus | /p7-plus | p7-plus | TODO |
| Privacy Policy | /privacy | privacy | TODO |
| Cookie Policy | /cookies | cookies | TODO |
| 404 | /404 | 404 | TODO |
| Test Drive Success | /test-drive-success | success | TODO |

## Project Structure
```
xpeng/
├── CLAUDE.md                    # This file
├── .claude/commands/            # Project-scoped skills
├── assets/
│   ├── logos/
│   ├── fonts/
│   ├── colors/
│   ├── images/
│   └── icons/
├── webflow-js/
│   ├── src/
│   │   ├── main.js              # All interactions
│   │   └── styles/
│   │       └── motion.css       # Transitions, keyframes only
│   ├── dist/                    # Production build
│   ├── vite.config.js
│   └── package.json
├── global.css                   # Scaling system + reset (pasted in Webflow head)
├── index.html                   # Legacy lead capture (Vercel/Supabase — will be replaced)
├── privacy.html                 # Legacy privacy policy
└── brief-xpeng-bulgaria.md     # Project brief for roadmap generator
```
