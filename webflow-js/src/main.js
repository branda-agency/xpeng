/* ============================================================
   XPENG Bulgaria — Webflow Custom Code
   Lenis + ScrollTrigger + SplitText + CustomEase
   ============================================================

   GSAP loaded by Webflow native toggle (Site Settings → GSAP).
   Bundled via Vite, hosted on Cloudflare Pages (xpeng-bg.pages.dev).

   ============================================================
   DATA ATTRIBUTES (add in Webflow Designer)
   ============================================================

   ROUTING:
     URL pathname slug used for page routing (automatic, no attributes needed)

   NAV:
     data-menu-wrap               → Nav wrapper for hide/show on scroll
     data-menu-open="false"       → Menu state (JS reads this)
     data-nav-transparent         → Transparent nav (hero pages)
     data-nav-white               → White nav (scrolled state)

   TEXT REVEALS:
     data-split="heading"         → Enables split-text scroll reveal
     data-split-reveal="lines"    → Split type: lines | words | chars

   ELEMENT REVEALS:
     data-reveal-group            → Wrapper; direct children animate in
     data-stagger="100"           → Delay between items in ms
     data-distance="2em"          → Starting Y offset
     data-start="top 80%"         → ScrollTrigger start position

   COLOR PICKER:
     data-color-picker            → Color picker wrapper
     data-color-swatch="white"    → Clickable swatch, value = color key
     data-color-image="white"     → Car image for that color
     data-color-name              → Color name display element
     data-color-active            → Currently active swatch class

   SPECS TABS:
     data-specs-tab="rwd"         → Tab trigger, value = variant key
     data-specs-panel="rwd"       → Panel content for that variant

   FORM CONSENT:
     data-consent-form            → Form requiring consent
     data-consent-checkbox        → Consent checkbox
     data-consent-submit          → Submit button (disabled until checked)

   LENIS CONTROLS:
     data-lenis-stop              → Stops smooth scroll on click
     data-lenis-start             → Resumes smooth scroll on click
     data-lenis-toggle            → Toggles smooth scroll on click

   ============================================================ */

import './styles/motion.css';
import 'lenis/dist/lenis.css';
import Lenis from 'lenis';

const { gsap, ScrollTrigger, SplitText, CustomEase } = window;


/* ============================================================
   1. CONFIGURATION
   ============================================================ */

const CONFIG = {
  duration: 0.6,
  stagger: 0.05,

  lenis: {
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.6,
    smoothTouch: false,
    touchMultiplier: 2,
  },

  textReveal: {
    lines: { duration: 0.9, stagger: 0.08, ease: 'expo.out' },
    words: { duration: 0.7, stagger: 0.06, ease: 'expo.out' },
    chars: { duration: 0.5, stagger: 0.01, ease: 'expo.out' },
  },

  elementReveal: {
    duration: 0.9,
    stagger: 0.1,
    distance: '2em',
    start: 'top 80%',
    ease: 'power4.inOut',
  },

  nav: {
    hideDuration: 0.35,
    hideEase: 'power2.inOut',
    showEase: 'power2.out',
    velocityThreshold: 0.1,
    topThreshold: 50,
  },

  heroSlider: {
    interval: 6000,
    crossfadeDuration: 1,
    ease: 'ease-xpeng',
  },
};

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// Signature easing — smooth, premium, automotive
CustomEase.create('ease-xpeng', '0.65, 0, 0.05, 1');

gsap.defaults({
  ease: 'ease-xpeng',
  duration: CONFIG.duration,
});


/* ============================================================
   2. LENIS SMOOTH SCROLL
   ============================================================ */

let lenis;

function initLenis() {
  lenis = new Lenis(CONFIG.lenis);

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      '[data-lenis-stop], [data-lenis-start], [data-lenis-toggle]'
    );
    if (!target) return;

    if (target.hasAttribute('data-lenis-stop')) {
      lenis.stop();
    } else if (target.hasAttribute('data-lenis-start')) {
      lenis.start();
    } else if (target.hasAttribute('data-lenis-toggle')) {
      lenis.isStopped ? lenis.start() : lenis.stop();
    }
  });
}


/* ============================================================
   3. NAV SCROLL BEHAVIOR
   ============================================================ */

function initNavScrollBehavior() {
  const nav = document.querySelector('[data-menu-wrap]');
  if (!nav || !lenis) return;

  let lastDirection = 0;

  gsap.set(nav, { yPercent: 0 });

  lenis.on('scroll', ({ direction, velocity, scroll }) => {
    if (Math.abs(velocity) < CONFIG.nav.velocityThreshold) return;
    if (nav.getAttribute('data-menu-open') === 'true') return;

    if (scroll <= CONFIG.nav.topThreshold) {
      if (lastDirection !== 0) {
        lastDirection = 0;
        gsap.to(nav, {
          yPercent: 0,
          duration: CONFIG.nav.hideDuration,
          ease: CONFIG.nav.showEase,
          overwrite: true,
        });
      }
      return;
    }

    if (direction === lastDirection) return;
    lastDirection = direction;

    gsap.to(nav, {
      yPercent: direction === 1 ? -110 : 0,
      duration: CONFIG.nav.hideDuration,
      ease: direction === 1 ? CONFIG.nav.hideEase : CONFIG.nav.showEase,
      overwrite: true,
    });
  });
}


/* ============================================================
   4. TEXT REVEALS
   ============================================================ */

function initTextReveals() {
  const headings = document.querySelectorAll('[data-split="heading"]');
  if (!headings.length) return;

  document.fonts.ready.then(() => {
    headings.forEach((heading) => {
      const type = heading.dataset.splitReveal || 'lines';
      const typesToSplit =
        type === 'lines'
          ? ['lines']
          : type === 'words'
            ? ['lines', 'words']
            : ['lines', 'words', 'chars'];
      const config = CONFIG.textReveal[type];

      SplitText.create(heading, {
        type: typesToSplit.join(', '),
        mask: 'lines',
        autoSplit: true,
        linesClass: 'line',
        wordsClass: 'word',
        charsClass: 'char',
        onSplit(instance) {
          return gsap.from(instance[type], {
            yPercent: 110,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease,
            scrollTrigger: {
              trigger: heading,
              start: 'clamp(top 80%)',
              once: true,
            },
          });
        },
      });
    });
  });
}


/* ============================================================
   5. ELEMENT REVEALS
   ============================================================ */

function initElementReveals() {
  const groups = document.querySelectorAll('[data-reveal-group]');
  if (!groups.length) return;

  const defaults = CONFIG.elementReveal;

  groups.forEach((group) => {
    const staggerMs = parseFloat(group.getAttribute('data-stagger'));
    const stagger = isNaN(staggerMs) ? defaults.stagger : staggerMs / 1000;
    const distance = group.getAttribute('data-distance') || defaults.distance;
    const start = group.getAttribute('data-start') || defaults.start;

    const children = Array.from(group.children);
    if (!children.length) return;

    gsap.set(children, { y: distance, autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: group,
      start: start,
      once: true,
      onEnter: () => {
        gsap.to(children, {
          y: 0,
          autoAlpha: 1,
          duration: defaults.duration,
          ease: defaults.ease,
          stagger: stagger,
          onComplete: () => gsap.set(children, { clearProps: 'all' }),
        });
      },
    });
  });
}


/* ============================================================
   6. COLOR PICKER
   ============================================================ */

function initColorPicker() {
  const pickers = document.querySelectorAll('[data-color-picker]');
  if (!pickers.length) return;

  pickers.forEach((picker) => {
    const swatches = picker.querySelectorAll('[data-color-swatch]');
    const images = picker.querySelectorAll('[data-color-image]');
    const nameEl = picker.querySelector('[data-color-name]');

    swatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        const color = swatch.getAttribute('data-color-swatch');

        // Update active state
        swatches.forEach((s) => s.removeAttribute('data-color-active'));
        swatch.setAttribute('data-color-active', '');

        // Swap images
        images.forEach((img) => {
          const isMatch = img.getAttribute('data-color-image') === color;
          gsap.to(img, {
            autoAlpha: isMatch ? 1 : 0,
            duration: 0.3,
          });
        });

        // Update name
        if (nameEl) {
          nameEl.textContent = swatch.getAttribute('title') || color;
        }
      });
    });
  });
}


/* ============================================================
   7. SPECS TABS
   ============================================================ */

function initSpecsTabs() {
  const tabs = document.querySelectorAll('[data-specs-tab]');
  const panels = document.querySelectorAll('[data-specs-panel]');
  if (!tabs.length || !panels.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const variant = tab.getAttribute('data-specs-tab');

      // Update active tab
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      // Show matching panel
      panels.forEach((panel) => {
        const isMatch = panel.getAttribute('data-specs-panel') === variant;
        gsap.to(panel, {
          autoAlpha: isMatch ? 1 : 0,
          duration: 0.3,
          display: isMatch ? 'block' : 'none',
        });
      });
    });
  });
}


/* ============================================================
   8. FORM CONSENT BLOCKING
   ============================================================ */

function initFormConsent() {
  const forms = document.querySelectorAll('[data-consent-form]');
  if (!forms.length) return;

  forms.forEach((form) => {
    const checkbox = form.querySelector('[data-consent-checkbox]');
    const submit = form.querySelector('[data-consent-submit]');
    if (!checkbox || !submit) return;

    // Disable submit initially
    submit.disabled = true;
    submit.style.opacity = '0.5';
    submit.style.pointerEvents = 'none';

    checkbox.addEventListener('change', () => {
      const isChecked = checkbox.checked;
      submit.disabled = !isChecked;
      submit.style.opacity = isChecked ? '1' : '0.5';
      submit.style.pointerEvents = isChecked ? 'auto' : 'none';
    });
  });
}


/* ============================================================
   9. PAGE ROUTER
   ============================================================ */

const PRODUCT_SLUGS = ['g9', 'g6', 'p7-plus'];

function routePage() {
  const slug = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';

  if (slug === 'home') initHomePage();
  else if (PRODUCT_SLUGS.includes(slug)) initProductPage();
}


/* ============================================================
   10. PAGE MODULES
   ============================================================ */

function initHomePage() {
  initHeroSlider();
}


/* ============================================================
   10a. HERO SLIDER
   ============================================================ */

function initHeroSlider() {
  const wrapper = document.querySelector('[data-hero-slider]');
  if (!wrapper) return;

  const slides = wrapper.querySelectorAll('[data-hero-slide]');
  const bars = wrapper.querySelectorAll('[data-hero-bar]');
  if (slides.length < 2) return;

  const fills = Array.from(bars).map((bar) => bar.querySelector('.hero-slider__bar-fill'));
  const contents = Array.from(slides).map((s) => s.querySelector('.hero-slider__content'));
  const contentChildren = contents.map((c) => c ? Array.from(c.children) : []);

  const { interval, crossfadeDuration, ease } = CONFIG.heroSlider;
  let current = 0;
  let progressTween = null;
  let isAnimating = false;

  // Initial state: all slides off-screen right, first slide centered
  gsap.set(slides, { xPercent: 100, autoAlpha: 1 });
  gsap.set(slides[0], { xPercent: 0 });

  function goToSlide(index, direction) {
    if (index === current || isAnimating) return;
    isAnimating = true;

    const prev = current;
    current = index;
    // Auto-detect direction: positive = next (left), negative = prev (right)
    const dir = direction !== undefined ? direction : (index > prev || (prev === slides.length - 1 && index === 0)) ? 1 : -1;

    if (progressTween) progressTween.kill();
    gsap.set(fills, { scaleX: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        startProgress();
      },
    });

    // 1. Content out: stagger children up and fade
    tl.to(contentChildren[prev], {
      y: '-1.5em',
      autoAlpha: 0,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.in',
    });

    // 2. Slide bg: prev exits from current position (no snap), next enters
    tl.to(slides[prev], {
      xPercent: dir * -100,
      x: 0,
      duration: crossfadeDuration,
      ease,
    }, 0.3);

    tl.fromTo(slides[current], {
      xPercent: dir * 100,
    }, {
      xPercent: 0,
      x: 0,
      duration: crossfadeDuration,
      ease,
    }, 0.3);

    // 3. Content in: stagger children from bottom
    tl.fromTo(contentChildren[current], {
      y: '1.5em',
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power2.out',
    }, 0.3 + crossfadeDuration * 0.5);
  }

  function nextSlide() {
    goToSlide((current + 1) % slides.length, 1);
  }

  function prevSlide() {
    goToSlide((current - 1 + slides.length) % slides.length, -1);
  }

  function startProgress() {
    if (progressTween) progressTween.kill();
    gsap.set(fills, { scaleX: 0 });

    progressTween = gsap.to(fills[current], {
      scaleX: 1,
      duration: interval / 1000,
      ease: 'none',
      onComplete: nextSlide,
    });
  }

  // Click on progress bars to jump
  bars.forEach((bar, i) => {
    bar.addEventListener('click', () => goToSlide(i));
  });

  // Drag / swipe to switch slides
  let dragStartX = 0;
  let isDragging = false;
  let peekIndex = -1;
  const COMMIT_THRESHOLD = 80;
  const DRAG_RESISTANCE = 0.4;
  const wrapperWidth = () => wrapper.offsetWidth;

  wrapper.addEventListener('pointerdown', (e) => {
    if (isAnimating) return;
    dragStartX = e.clientX;
    isDragging = true;
    peekIndex = -1;
    wrapper.setPointerCapture(e.pointerId);
    if (progressTween) progressTween.pause();
  });

  wrapper.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const rawDelta = e.clientX - dragStartX;
    const delta = rawDelta * DRAG_RESISTANCE;
    const dir = rawDelta < 0 ? 1 : -1;
    const nextIdx = dir === 1
      ? (current + 1) % slides.length
      : (current - 1 + slides.length) % slides.length;

    // Position peek slide adjacent to current
    if (peekIndex !== nextIdx) {
      // Hide old peek if direction changed
      if (peekIndex >= 0 && peekIndex !== nextIdx) {
        gsap.set(slides[peekIndex], { xPercent: dir === 1 ? 100 : -100, x: 0 });
      }
      peekIndex = nextIdx;
      gsap.set(slides[peekIndex], { xPercent: dir === 1 ? 100 : -100, x: 0 });
    }

    gsap.set(slides[current], { x: delta });
    gsap.set(slides[peekIndex], { x: delta });
  });

  wrapper.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const rawDelta = e.clientX - dragStartX;

    if (Math.abs(rawDelta) > COMMIT_THRESHOLD) {
      if (rawDelta < 0) nextSlide();
      else prevSlide();
    } else {
      // Rubber-band both slides back
      const tweenTargets = [slides[current]];
      if (peekIndex >= 0) tweenTargets.push(slides[peekIndex]);

      gsap.to(tweenTargets, {
        x: 0,
        duration: 0.4,
        ease: 'power3.out',
        onComplete: () => {
          // Reset peek slide off-screen
          if (peekIndex >= 0 && peekIndex !== current) {
            gsap.set(slides[peekIndex], { xPercent: 100, x: 0 });
          }
          peekIndex = -1;
          if (progressTween) progressTween.resume();
        },
      });
    }
  });

  // Start autoplay
  startProgress();
}

function initProductPage() {
  initColorPicker();
  initSpecsTabs();
}


/* ============================================================
   11. INIT
   ============================================================ */

function init() {
  const mm = gsap.matchMedia();

  // Functional components — run regardless of motion preference
  initFormConsent();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    initLenis();
    initNavScrollBehavior();
    initTextReveals();
    initElementReveals();
    routePage();
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    initLenis();
    routePage();

    gsap.set('[data-split="heading"]', { visibility: 'visible' });
    gsap.set('[data-reveal-group] > *', { autoAlpha: 1, y: 0 });
  });
}

document.addEventListener('DOMContentLoaded', init);
