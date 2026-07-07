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

   MODAL:
     data-modal-group-status="not-active" → Modal overlay wrapper (fixed, covers viewport)
     data-modal-name="example"            → Modal card, value = unique name
     data-modal-status="not-active"       → Active state on cards & triggers
     data-modal-target="example"          → Trigger button, value matches modal name
     data-modal-close                     → Close button (on backdrop + X icon)

   DRAWER (right slide):
     data-drawer-group-status="not-active" → Drawer overlay wrapper (fixed, covers viewport)
     data-drawer-name="specs-rwd-sr"       → Drawer panel, value = unique name
     data-drawer-status="not-active"       → Active state on panels & triggers
     data-drawer-target="specs-rwd-sr"     → Trigger button, value matches drawer name
     data-drawer-close                     → Close button (on backdrop + X icon)

   FIND US (store locator):
     data-find-us                     → Page container (100vw × 100vh)
     data-find-us-map                 → Google Maps render target
     data-find-us-sidebar             → Desktop sidebar panel
     data-find-us-filters             → Desktop filter row wrapper
     data-find-us-filter="region"     → Filter select: region
     data-find-us-filter="type"       → Filter select: type
     data-find-us-store-list          → Desktop store card container (scrollable)
     data-find-us-empty               → Empty state (no results)
     data-find-us-seo                 → Hidden SEO markup container
     data-find-us-mobile-filters      → Mobile filter bar (hidden on desktop)
     data-find-us-drawer              → Mobile bottom drawer
     data-find-us-drawer-body         → Drawer scrollable content
     data-find-us-drawer-close        → Drawer close button

   CONFIG CONFIRM DIALOG:
     data-cfg-confirm="not-active"        → Overlay wrapper (fixed, covers viewport)
     data-cfg-confirm-backdrop            → Dark backdrop (click to cancel)
     data-cfg-confirm-message             → Message text element
     data-cfg-confirm-apply               → "Apply changes" button
     data-cfg-confirm-cancel              → "Cancel" button

   BUTTON HOVER:
     data-btn-hover="green"       → Left-to-right fill wipe on hover

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

function navScrollHandler(nav, direction, velocity, scroll) {
  // Scrolling class — add when past threshold, remove at top
  if (scroll > CONFIG.nav.topThreshold) {
    nav.classList.add('is--scrolling');
  } else {
    nav.classList.remove('is--scrolling');
  }

  if (Math.abs(velocity) < CONFIG.nav.velocityThreshold) return;
  if (nav.getAttribute('data-menu-open') === 'true') return;

  if (scroll <= CONFIG.nav.topThreshold) {
    if (nav._lastDir !== 0) {
      nav._lastDir = 0;
      gsap.to(nav, {
        yPercent: 0,
        duration: CONFIG.nav.hideDuration,
        ease: CONFIG.nav.showEase,
        overwrite: true,
      });
    }
    return;
  }

  if (direction === nav._lastDir) return;
  nav._lastDir = direction;

  gsap.to(nav, {
    yPercent: direction === 1 ? -110 : 0,
    duration: CONFIG.nav.hideDuration,
    ease: direction === 1 ? CONFIG.nav.hideEase : CONFIG.nav.showEase,
    overwrite: true,
  });
}

function initNavScrollBehavior() {
  const nav = document.querySelector('[data-menu-wrap]');
  if (!nav) return;

  nav._lastDir = 0;
  gsap.set(nav, { yPercent: 0 });

  if (lenis) {
    lenis.on('scroll', ({ direction, velocity, scroll }) => {
      navScrollHandler(nav, direction, velocity, scroll);
    });
  } else {
    // Native scroll fallback (mobile — no Lenis)
    let lastY = window.scrollY;
    window.addEventListener('scroll', () => {
      var scrollY = window.scrollY;
      var delta = scrollY - lastY;
      var direction = delta > 0 ? 1 : -1;
      var velocity = Math.abs(delta);
      lastY = scrollY;
      navScrollHandler(nav, direction, velocity, scrollY);
    }, { passive: true });
  }
}


/* ============================================================
   3a. MOBILE NAV DRAWER
   ============================================================ */

function initMobileNav() {
  var nav = document.querySelector('[data-menu-wrap]');
  var toggle = nav && nav.querySelector('[data-menu-toggle]');
  var drawer = nav && nav.querySelector('[data-nav-drawer]');
  if (!nav || !toggle || !drawer) return;

  function openDrawer() {
    nav.setAttribute('data-menu-open', 'true');
    document.body.style.overflow = 'hidden';
    gsap.set(nav, { yPercent: 0 });
    if (lenis) lenis.stop();
  }

  function closeDrawer() {
    nav.setAttribute('data-menu-open', 'false');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    // Collapse all open groups
    drawer.querySelectorAll('[data-nav-drawer-group].is-open').forEach(function(g) {
      g.classList.remove('is-open');
    });
  }

  toggle.addEventListener('click', function() {
    var isOpen = nav.getAttribute('data-menu-open') === 'true';
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  // Expandable groups
  drawer.querySelectorAll('[data-nav-drawer-group]').forEach(function(group) {
    var header = group.querySelector('[data-nav-drawer-toggle]');
    if (!header) return;
    header.addEventListener('click', function() {
      group.classList.toggle('is-open');
    });
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.getAttribute('data-menu-open') === 'true') {
      closeDrawer();
    }
  });

  // Close when clicking a link inside the drawer
  drawer.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      closeDrawer();
    });
  });
}


/* ============================================================
   3b. NAV MEGA MENU — hover panels for model links (BG_R1_046)
   ============================================================ */

function initNavMega() {
  var nav = document.querySelector('[data-menu-wrap]');
  var mega = nav && nav.querySelector('[data-nav-mega]');
  if (!nav || !mega) return;
  var triggers = nav.querySelectorAll('[data-mega-trigger]');
  if (!triggers.length) return;

  var mq = window.matchMedia('(min-width: 992px) and (hover: hover)');
  var closeTimer = null;

  function open(model) {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
    // Already open → instant panel swap, no re-entry animation
    if (nav.hasAttribute('data-mega-open')) {
      nav.classList.add('is--mega-swap');
    } else {
      nav.classList.remove('is--mega-swap');
    }
    nav.setAttribute('data-mega-open', model);
  }

  function close() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
    nav.removeAttribute('data-mega-open');
    nav.classList.remove('is--mega-swap');
  }

  function scheduleClose() {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = setTimeout(close, 260);
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('mouseenter', function() {
      if (mq.matches) open(trigger.getAttribute('data-mega-trigger'));
    });
    trigger.addEventListener('mouseleave', scheduleClose);
  });

  mega.addEventListener('mouseenter', function() {
    if (closeTimer) clearTimeout(closeTimer);
  });
  mega.addEventListener('mouseleave', scheduleClose);

  // Close when the cursor moves to other nav items
  nav.querySelectorAll('.nav__logo, .nav__link:not([data-mega-trigger]), .nav__dropdown, .nav__right').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      if (nav.hasAttribute('data-mega-open')) scheduleClose();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') close();
  });

  window.addEventListener('scroll', function() {
    if (nav.hasAttribute('data-mega-open')) close();
  }, { passive: true });
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

      try {
        SplitText.create(heading, {
          type: typesToSplit.join(', '),
          mask: 'lines',
          autoSplit: true,
          linesClass: 'line',
          wordsClass: 'word',
          charsClass: 'char',
          onSplit(instance) {
            // Override FOUC-prevention CSS — masks control visibility now
            gsap.set(heading, { visibility: 'visible' });

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
      } catch (e) {
        heading.style.visibility = 'visible';
        console.error('SplitText error:', e);
      }
    });

    // Refresh triggers after all splits are created
    ScrollTrigger.refresh();
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
          onComplete: () => gsap.set(children, { clearProps: 'transform' }),
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

    // Set initial state — show first swatch's image, hide the rest
    var activeSwatch = picker.querySelector('[data-color-swatch][data-color-active]') || swatches[0];
    var activeColor = activeSwatch.getAttribute('data-color-swatch');
    activeSwatch.setAttribute('data-color-active', '');
    images.forEach((img) => {
      gsap.set(img, { autoAlpha: img.getAttribute('data-color-image') === activeColor ? 1 : 0 });
    });
    if (nameEl) nameEl.textContent = activeSwatch.getAttribute('title') || activeColor;

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
  var sections = document.querySelectorAll('[data-specs-section]');
  if (!sections.length) return;

  sections.forEach(function(section) {
    var tabs = section.querySelectorAll('[data-specs-tab]');
    var panels = section.querySelectorAll('[data-specs-panel]');
    if (!tabs.length || !panels.length) return;

    function activate(variant) {
      tabs.forEach(function(t) {
        t.classList.toggle('is-active', t.getAttribute('data-specs-tab') === variant);
      });
      panels.forEach(function(panel) {
        if (panel.getAttribute('data-specs-panel') === variant) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
    }

    // Set initial state from active tab (or first tab)
    var activeTab = section.querySelector('[data-specs-tab].is-active') || tabs[0];
    activate(activeTab.getAttribute('data-specs-tab'));

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        activate(tab.getAttribute('data-specs-tab'));
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
   8b. FORM FIELD VALIDATION (BG_R2_002)
   Phone and city accepted any input. Extends the forms' native
   constraint validation (required already works this way) with
   format/length rules and Bulgarian error messages.
   ============================================================ */

function initFieldValidation() {
  function wire(input, pattern, maxLen, message) {
    input.setAttribute('pattern', pattern);
    input.setAttribute('maxlength', String(maxLen));
    input.addEventListener('invalid', function () {
      if (input.validity.patternMismatch) input.setCustomValidity(message);
    });
    input.addEventListener('input', function () { input.setCustomValidity(''); });
  }

  // Phone: optional +, then 6–15 digits with spaces/dashes/parens allowed
  document.querySelectorAll('input[data-name="Телефон"], input[type="tel"]').forEach(function (input) {
    input.setAttribute('inputmode', 'tel');
    wire(
      input,
      '\\+?[\\s\\-\\(\\)]*([0-9][\\s\\-\\(\\)]*){6,15}',
      20,
      'Моля, въведете валиден телефонен номер (6–15 цифри, позволени са +, интервали и тирета).'
    );
  });

  // City: letters only (Cyrillic/Latin), 2–60 chars, spaces and dashes allowed
  document.querySelectorAll('input[data-name="Град"]').forEach(function (input) {
    wire(
      input,
      '[А-Яа-яA-Za-z][А-Яа-яA-Za-z\\s\\-]{1,59}',
      60,
      'Моля, въведете валидно име на град (само букви, мин. 2 знака).'
    );
  });
}


/* ============================================================
   8b. MODAL
   ============================================================ */

function initModal() {
  var group = document.querySelector('[data-modal-group-status]');
  if (!group) return;

  var modals = group.querySelectorAll('[data-modal-name]');
  var triggers = document.querySelectorAll('[data-modal-target]');

  function closeAll() {
    modals.forEach(function(m) { m.setAttribute('data-modal-status', 'not-active'); });
    triggers.forEach(function(t) { t.setAttribute('data-modal-status', 'not-active'); });
    group.setAttribute('data-modal-group-status', 'not-active');
  }

  triggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var name = this.getAttribute('data-modal-target');
      closeAll();
      var modal = group.querySelector('[data-modal-name="' + name + '"]');
      if (modal) modal.setAttribute('data-modal-status', 'active');
      this.setAttribute('data-modal-status', 'active');
      group.setAttribute('data-modal-group-status', 'active');
    });
  });

  group.querySelectorAll('[data-modal-close]').forEach(function(btn) {
    btn.addEventListener('click', closeAll);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAll();
  });
}


/* ============================================================
   8c. DRAWER (right slide)
   ============================================================ */

function initDrawer() {
  var group = document.querySelector('[data-drawer-group-status]');
  if (!group) return;

  var drawers = group.querySelectorAll('[data-drawer-name]');

  function closeAll() {
    drawers.forEach(function(d) { d.setAttribute('data-drawer-status', 'not-active'); });
    document.querySelectorAll('[data-drawer-target]').forEach(function(t) {
      t.setAttribute('data-drawer-status', 'not-active');
    });
    group.setAttribute('data-drawer-group-status', 'not-active');
  }

  // Event delegation — catches dynamically added triggers
  document.addEventListener('click', function(e) {
    var trigger = e.target.closest('[data-drawer-target]');
    if (!trigger) return;
    e.preventDefault();
    var name = trigger.getAttribute('data-drawer-target');
    closeAll();
    var drawer = group.querySelector('[data-drawer-name="' + name + '"]');
    if (drawer) drawer.setAttribute('data-drawer-status', 'active');
    trigger.setAttribute('data-drawer-status', 'active');
    group.setAttribute('data-drawer-group-status', 'active');
  });

  group.querySelectorAll('[data-drawer-close]').forEach(function(btn) {
    btn.addEventListener('click', closeAll);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeAll();
  });
}


/* ============================================================
   9. PAGE ROUTER
   ============================================================ */

const PRODUCT_SLUGS = ['g9', 'g6', 'p7-plus'];
const CONFIGURATOR_SLUGS = ['g9', 'g6', 'p7-plus'];

/* Google Maps API key — replace with your own from Google Cloud Console */
var GOOGLE_MAPS_KEY = 'AIzaSyAanOH24hj8hvGzwqXPHVX8ED_TBbayoi4';

function routePage() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
  const segments = path.split('/');
  const slug = segments[segments.length - 1];

  if (path === 'home') initHomePage();
  else if (path === 'configurator/summary') {
    if (lenis) lenis.destroy();
    initSummaryPage();
  }
  else if (segments.includes('configurator') && CONFIGURATOR_SLUGS.includes(slug)) {
    if (lenis) lenis.destroy();
    initConfiguratorPage(slug);
  }
  else if (path === 'find-us') {
    if (lenis) lenis.destroy();
    initFindUs();
  }
  else if (path === 'test-drive') initTestDrivePage();
  else if (PRODUCT_SLUGS.includes(slug)) initProductPage();
}


/* ============================================================
   10. PAGE MODULES
   ============================================================ */

function initHomePage() {
  try { initHeroSlider(); } catch (e) { console.error('heroSlider:', e); }
  try { initModelsCarousel(); } catch (e) { console.error('modelsCarousel:', e); }
  try { initPeekSlider(); } catch (e) { console.error('peekSlider:', e); }
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

  const { interval } = CONFIG.heroSlider;
  const isMobile = window.innerWidth <= 991;
  const crossfadeDuration = isMobile ? 0.5 : CONFIG.heroSlider.crossfadeDuration;
  const ease = isMobile ? 'none' : CONFIG.heroSlider.ease;
  let current = 0;
  let progressTween = null;
  let isAnimating = false;
  let peekIndex = -1;

  // Initial state: all slides off-screen right, first slide centered
  gsap.set(slides, { xPercent: 100, autoAlpha: 1 });
  gsap.set(slides[0], { xPercent: 0 });

  function goToSlide(index, direction) {
    if (index === current || isAnimating) return;
    isAnimating = true;

    const prev = current;
    current = index;
    const dir = direction !== undefined ? direction : (index > prev || (prev === slides.length - 1 && index === 0)) ? 1 : -1;

    if (progressTween) progressTween.kill();
    gsap.set(fills, { scaleX: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        peekIndex = -1;
        startProgress();
      },
    });

    // Everything runs together — one fluid motion

    // Slides move (continue from current x position if dragged)
    tl.to(slides[prev], {
      xPercent: dir * -100,
      x: 0,
      duration: crossfadeDuration,
      ease,
    }, 0);

    // Next slide: skip fromTo if already peeking from drag
    if (peekIndex === index) {
      tl.to(slides[current], {
        xPercent: 0,
        x: 0,
        duration: crossfadeDuration,
        ease,
      }, 0);
    } else {
      tl.fromTo(slides[current], {
        xPercent: dir * 100,
      }, {
        xPercent: 0,
        x: 0,
        duration: crossfadeDuration,
        ease,
      }, 0);
    }

    // Content out: fast stagger, runs alongside slide
    tl.to(contentChildren[prev], {
      y: '-1.5em',
      autoAlpha: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.in',
    }, 0);

    // Content in: starts at 40% of slide duration
    tl.fromTo(contentChildren[current], {
      y: '1.5em',
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: 'power2.out',
    }, crossfadeDuration * 0.4);
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
  const COMMIT_THRESHOLD = 80;
  const DRAG_RESISTANCE = 0.4;
  const wrapperWidth = () => wrapper.offsetWidth;

  function snapBack() {
    var tweenTargets = [slides[current]];
    if (peekIndex >= 0) tweenTargets.push(slides[peekIndex]);

    gsap.to(tweenTargets, {
      x: 0,
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        if (peekIndex >= 0 && peekIndex !== current) {
          gsap.set(slides[peekIndex], { xPercent: 100, x: 0 });
        }
        peekIndex = -1;
        if (progressTween) progressTween.resume();
      },
    });
  }

  wrapper.addEventListener('pointerdown', (e) => {
    if (isAnimating) return;
    // Don't capture pointer on interactive elements — let links/buttons work.
    // Bars included: setPointerCapture retargets the click away from them (BG_R1_018)
    if (e.target.closest('a, button, [data-hero-bar]')) return;
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
      snapBack();
    }
  });

  wrapper.addEventListener('pointercancel', () => {
    if (!isDragging) return;
    isDragging = false;
    snapBack();
  });

  // Start autoplay
  startProgress();
}


/* ============================================================
   10b. MODELS CAROUSEL
   ============================================================ */

// 360 viewer CDN — set to Bunny CDN base URL after uploading processed frames
// Folder structure: {ROTATE_CDN}/{model}/{frame}.webp  e.g. .../g6/0.webp
var ROTATE_CDN = 'https://xpeng.b-cdn.net/360';
// Versioned Bunny folders — bump when a model's frame set is replaced (BG_R2_006)
var ROTATE_FOLDERS = { g9: 'g9-v2' };

function initModelsCarousel() {
  const section = document.querySelector('[data-models]');
  if (!section) return;

  const tabs = section.querySelectorAll('[data-models-tab]');
  const slides = section.querySelectorAll('[data-models-slide]');
  const infos = section.querySelectorAll('[data-models-info]');
  const prevBtn = section.querySelector('[data-models-prev]');
  const nextBtn = section.querySelector('[data-models-next]');
  if (slides.length < 2) return;

  const infoChildren = Array.from(infos).map((info) => Array.from(info.children));
  const watermarks = Array.from(slides).map((s) => s.querySelector('.models__watermark'));
  let current = 0;
  tabs.forEach((t, i) => { if (t.classList.contains('is-active')) current = i; });
  let isAnimating = false;
  let onSlideChange = null;

  // Initial state
  gsap.set(slides, { xPercent: 100, autoAlpha: 1 });
  gsap.set(slides[current], { xPercent: 0 });
  gsap.set(infos, { autoAlpha: 0, position: 'absolute', left: 0, right: 0 });
  gsap.set(infos[current], { autoAlpha: 1 });
  gsap.set(watermarks, { autoAlpha: 0, y: '0.5em' });
  gsap.set(watermarks[current], { autoAlpha: 1, y: 0 });

  function updateArrows() {
    if (prevBtn) gsap.to(prevBtn, { autoAlpha: current === 0 ? 0.4 : 1, duration: 0.3 });
    if (nextBtn) gsap.to(nextBtn, { autoAlpha: current === slides.length - 1 ? 0.4 : 1, duration: 0.3 });
  }
  updateArrows();

  function goTo(index, dir) {
    if (index === current || isAnimating) return;
    isAnimating = true;

    const prev = current;
    current = index;
    if (dir === undefined) dir = index > prev ? 1 : -1;
    if (onSlideChange) onSlideChange(current, prev);

    // Update tabs
    tabs.forEach((t) => t.classList.remove('is-active'));
    tabs[current].classList.add('is-active');

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        updateArrows();
      },
    });

    // Slides move
    tl.to(slides[prev], {
      xPercent: dir * -100,
      duration: 0.8,
      ease: 'ease-xpeng',
    }, 0);

    tl.fromTo(slides[current], {
      xPercent: dir * 100,
    }, {
      xPercent: 0,
      duration: 0.8,
      ease: 'ease-xpeng',
    }, 0);

    // Watermark out
    tl.to(watermarks[prev], {
      y: '-0.5em',
      autoAlpha: 0,
      duration: 0.4,
      ease: 'power2.in',
    }, 0);

    // Watermark in
    tl.fromTo(watermarks[current], {
      y: '1.5em',
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, 0.6);

    // Info out
    tl.to(infoChildren[prev], {
      y: '-1em',
      autoAlpha: 0,
      duration: 0.3,
      stagger: 0.04,
      ease: 'power2.in',
    }, 0);

    tl.set(infos[prev], { autoAlpha: 0 }, 0.3);

    // Info in
    tl.set(infos[current], { autoAlpha: 1 }, 0.3);

    tl.fromTo(infoChildren[current], {
      y: '1em',
      autoAlpha: 0,
    }, {
      y: 0,
      autoAlpha: 1,
      duration: 0.4,
      stagger: 0.06,
      ease: 'power2.out',
    }, 0.4);
  }

  // Tab clicks
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => goTo(i));
  });

  // Arrow clicks
  if (prevBtn) prevBtn.addEventListener('click', () => {
    goTo((current - 1 + slides.length) % slides.length, -1);
  });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    goTo((current + 1) % slides.length, 1);
  });

  /* -------------------------------------------------------
     360 Rotate Viewers
     Drag-to-rotate functionality for models with 360 frames.
     Each slide with data-360="{model}" gets a rotate viewer.
     ------------------------------------------------------- */
  if (ROTATE_CDN) {
    var rotateViewers = [];
    var isMobile = 'ontouchstart' in window;

    slides.forEach(function (slide, idx) {
      var model = slide.getAttribute('data-360');
      if (!model) return;

      var frameCount = parseInt(slide.getAttribute('data-360-frames')) || 36;
      var wrap = slide.querySelector('[data-rotate]');
      var frameImg = slide.querySelector('[data-rotate-frame]');
      var cursorEl = slide.querySelector('[data-rotate-cursor]');
      var staticImg = slide.querySelector('.models__car-img');
      if (!wrap || !frameImg) return;

      var frames = new Array(frameCount);
      var loaded = false;
      var loadedCount = 0;
      var frameIndex = 0;
      var dragging = false;
      var lastX = 0;
      var rem = 0;

      function preload() {
        if (loadedCount > 0) return; // already started
        for (var i = 0; i < frameCount; i++) {
          (function (fi) {
            var img = new Image();
            img.src = ROTATE_CDN + '/' + (ROTATE_FOLDERS[model] || model) + '/' + fi + '.webp';
            img.onload = function () {
              loadedCount++;
              if (loadedCount === frameCount) {
                loaded = true;
                frameImg.src = frames[0].src;
                wrap.style.display = 'block';
                if (staticImg) {
                  staticImg.style.visibility = 'hidden';
                  staticImg.style.pointerEvents = 'none';
                }
              }
            };
            frames[fi] = img;
          })(i);
        }
      }

      function setFrame(idx) {
        frameIndex = ((idx % frameCount) + frameCount) % frameCount;
        if (loaded) frameImg.src = frames[frameIndex].src;
      }

      function handleDrag(x) {
        var delta = x - lastX + rem;
        if (Math.abs(delta) >= 10) {
          var steps = delta > 0 ? Math.floor(delta / 10) : Math.ceil(delta / 10);
          setFrame(frameIndex + steps);
          rem = delta % 10;
        } else {
          rem = delta;
        }
        lastX = x;
      }

      // --- Mouse events (desktop) ---
      if (!isMobile) {
        wrap.addEventListener('mouseenter', function () {
          if (cursorEl && loaded) cursorEl.style.opacity = '1';
        });
        wrap.addEventListener('mouseleave', function () {
          if (cursorEl) cursorEl.style.opacity = '0';
          dragging = false;
        });
        wrap.addEventListener('mousedown', function (e) {
          if (!loaded) return;
          dragging = true;
          lastX = e.clientX;
          rem = 0;
        });
        wrap.addEventListener('mouseup', function () { dragging = false; });
        wrap.addEventListener('mousemove', function (e) {
          if (cursorEl) {
            var rect = wrap.getBoundingClientRect();
            cursorEl.style.left = (e.clientX - rect.left) + 'px';
            cursorEl.style.top = (e.clientY - rect.top) + 'px';
          }
          if (!dragging || !loaded) return;
          e.preventDefault();
          handleDrag(e.clientX);
        });
      }

      // --- Touch events (mobile) ---
      wrap.addEventListener('touchstart', function (e) {
        if (!loaded) return;
        dragging = true;
        lastX = e.touches[0].pageX;
        rem = 0;
      }, { passive: true });
      wrap.addEventListener('touchmove', function (e) {
        if (!dragging || !loaded) return;
        handleDrag(e.touches[0].pageX);
      }, { passive: true });
      wrap.addEventListener('touchend', function () { dragging = false; });

      rotateViewers.push({ idx: idx, preload: preload, reset: function () { setFrame(0); } });
    });

    if (rotateViewers.length > 0) {
      // Preload all 360 models when section enters viewport
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          rotateViewers.forEach(function (v) { v.preload(); });
          obs.disconnect();
        }
      }, { threshold: 0.1 });
      obs.observe(section);

      // Reset rotation on slide change
      onSlideChange = function () {
        rotateViewers.forEach(function (v) { v.reset(); });
      };
    }
  }

}

/* ============================================================
   10c. PEEK SLIDER
   ============================================================ */

function initPeekSlider() {
  const section = document.querySelector('[data-peek-slider]');
  if (!section || window.innerWidth < 1280) return;

  const slides = section.querySelectorAll('[data-peek-slide]');
  const prevBtn = section.querySelector('[data-peek-prev]');
  const nextBtn = section.querySelector('[data-peek-next]');
  if (slides.length < 2) return;

  let current = 0;
  let isAnimating = false;

  function positionSlide(slide, offset, animate) {
    const props = {
      xPercent: offset * 110,
      autoAlpha: offset === 0 ? 1 : 0.4,
      zIndex: offset === 0 ? 2 : 1,
      scale: offset === 0 ? 1 : 0.95,
    };

    if (animate) {
      return gsap.to(slide, {
        ...props,
        duration: 0.8,
        ease: 'ease-xpeng',
      });
    }
    gsap.set(slide, props);
  }

  // Initial layout
  slides.forEach((slide, i) => positionSlide(slide, i - current, false));

  function updateArrows() {
    if (prevBtn) gsap.to(prevBtn, { autoAlpha: current === 0 ? 0.3 : 1, duration: 0.3 });
    if (nextBtn) gsap.to(nextBtn, { autoAlpha: current === slides.length - 1 ? 0.3 : 1, duration: 0.3 });
  }
  updateArrows();

  function goTo(index) {
    if (index === current || isAnimating || index < 0 || index >= slides.length) return;
    isAnimating = true;
    current = index;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating = false;
        updateArrows();
      },
    });

    slides.forEach((slide, i) => {
      tl.to(slide, {
        xPercent: (i - current) * 110,
        autoAlpha: i === current ? 1 : 0.4,
        zIndex: i === current ? 2 : 1,
        scale: i === current ? 1 : 0.95,
        duration: 0.8,
        ease: 'ease-xpeng',
      }, 0);
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Drag / swipe
  const viewport = section.querySelector('.peek-slider__viewport');
  let dragStartX = 0;
  let isDragging = false;
  const COMMIT_THRESHOLD = 80;
  const DRAG_RESISTANCE = 0.35;

  viewport.addEventListener('pointerdown', (e) => {
    if (isAnimating) return;
    dragStartX = e.clientX;
    isDragging = true;
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const delta = (e.clientX - dragStartX) * DRAG_RESISTANCE;
    const deltaPercent = (delta / viewport.offsetWidth) * 100;

    slides.forEach((slide, i) => {
      gsap.set(slide, {
        xPercent: (i - current) * 110 + deltaPercent,
      });
    });
  });

  viewport.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const rawDelta = e.clientX - dragStartX;

    if (Math.abs(rawDelta) > COMMIT_THRESHOLD) {
      if (rawDelta < 0 && current < slides.length - 1) {
        goTo(current + 1);
      } else if (rawDelta > 0 && current > 0) {
        goTo(current - 1);
      } else {
        // Snap back — at boundaries
        snapBack();
      }
    } else {
      snapBack();
    }
  });

  function snapBack() {
    slides.forEach((slide, i) => {
      gsap.to(slide, {
        xPercent: (i - current) * 110,
        duration: 0.4,
        ease: 'power3.out',
      });
    });
  }
}


/* ============================================================
   10d. TABBED CAROUSEL
   ============================================================ */

function initTabbedCarousel() {
  const sections = document.querySelectorAll('[data-tabbed-carousel]');
  if (!sections.length) return;

  sections.forEach((section) => {
    const images = section.querySelectorAll('[data-tabbed-image]');
    const tabLinks = section.querySelectorAll('.tabbed-carousel__tab');
    if (!images.length || !tabLinks.length) return;

    // Stack images and show only the first
    gsap.set(images, { autoAlpha: 0 });
    gsap.set(images[0], { autoAlpha: 1 });

    let currentImage = 0;

    tabLinks.forEach((tab, i) => {
      tab.addEventListener('click', () => {
        if (i === currentImage) return;
        gsap.to(images[currentImage], { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' });
        gsap.to(images[i], { autoAlpha: 1, duration: 0.5, ease: 'power2.inOut' });
        currentImage = i;
      });
    });
  });
}


/* ============================================================
   10e. CONFIGURATOR
   ============================================================ */

const CONFIGURATOR_API = 'https://script.google.com/macros/s/AKfycbxDzXiIHLDm4I2sTaWMIBKK-zhQRjwtSuroX1BhnfdyRuua5GHDFDC4VUFAUQzMkdC6cA/exec';

// Accessories hidden from UI but kept in Sheet data (remove from list to re-enable)
const HIDDEN_ACCESSORIES = [];

// Mock data for development (G9)
const MOCK_DATA = {
  g9: {
    model: { model_slug: 'g9', model_name: 'XPENG G9', starting_price: 59600 },
    variants: [
      { variant_code: 'rwd-sr', variant_name: 'RWD Standard Range', price: 59600, is_default: true, range_km: 435, power_kw: 230, acceleration: '6.4s', delivery_time: 'Q4 2026', sort_order: 1 },
      { variant_code: 'rwd-lr', variant_name: 'RWD Long Range', price: 63600, is_default: false, range_km: 570, power_kw: 230, acceleration: '6.4s', delivery_time: 'Q4 2026', sort_order: 2 },
      { variant_code: 'awd', variant_name: 'AWD Performance', price: 71600, is_default: false, range_km: 460, power_kw: 405, acceleration: '3.9s', delivery_time: 'Q1 2027', sort_order: 3 },
    ],
    colors: [
      { variant_code: 'all', color_code: 'arctic-white', color_name: 'Arctic White', color_hex: '#F0EDE8', price: 0, is_default: true, image_front: '', image_side: '', image_rear: '', sort_order: 1 },
      { variant_code: 'all', color_code: 'silver-frost', color_name: 'Silver Frost', color_hex: '#B8B8B8', price: 1000, is_default: false, image_front: '', image_side: '', image_rear: '', sort_order: 2 },
      { variant_code: 'all', color_code: 'midnight-black', color_name: 'Midnight Black', color_hex: '#2D2D2D', price: 1000, is_default: false, image_front: '', image_side: '', image_rear: '', sort_order: 3 },
      { variant_code: 'all', color_code: 'graphite-gray', color_name: 'Graphite Gray', color_hex: '#707070', price: 1500, is_default: false, image_front: '', image_side: '', image_rear: '', sort_order: 4 },
    ],
    interiors: [
      { variant_code: 'all', interior_code: 'black', interior_name: 'Meteorite Black', price: 0, is_default: true, image_thumb: '', image_full: '', sort_order: 1 },
      { variant_code: 'all', interior_code: 'coffee', interior_name: 'Coffee Brown', price: 0, is_default: false, image_thumb: '', image_full: '', sort_order: 2 },
    ],
    wheels: [
      { variant_code: 'all', wheel_code: '20-standard', wheel_name: '20" Standard', price: 0, is_default: true, image_thumb: '', sort_order: 1 },
      { variant_code: 'awd', wheel_code: '21-black-edition', wheel_name: '21" Black Edition', price: 1290, is_default: false, requires_accessory: 'black-edition', image_thumb: '', sort_order: 2 },
    ],
    accessories: [
      { variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Електрически теглич', price: 1260, description: 'Електрически прибиращ се теглич с максимално теглително тегло 1500 кг.', image: '', sort_order: 1 },
      { variant_code: 'awd', accessory_code: 'black-edition', accessory_name: 'Black Edition', price: 1490, description: 'Ярък черен цвят | Оранжеви спирачни апарати | Ярки черни ъгли на стъклата | Ярки черни странични панели | Ярки черни елементи на интелигентните камери | Ярка черна лайсна на предпазната решетка | Ярко черно лого', image: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a2a4fdc77e7d58cc663fc2a_Black%20Edition.avif', sort_order: 3 },
    ],
  },
  g6: {
    model: { model_slug: 'g6', model_name: 'XPENG G6', starting_price: 43600 },
    variants: [
      { variant_code: 'rwd-sr', variant_name: 'RWD Standard Range', price: 43600, is_default: true, range_km: 455, power_kw: 185, acceleration: '6.9s', top_speed: 200, battery_kwh: 67.8, battery_type: 'LFP', dc_charge_power_kw: 382, dc_charge_time: '10-80% in 12 min', energy_consumption: '16.6 kWh/100km', drivetrain: 'RWD', delivery_time: 'Q4 2026', sort_order: 1 },
      { variant_code: 'rwd-lr', variant_name: 'RWD Long Range', price: 47600, is_default: false, range_km: 525, power_kw: 218, acceleration: '6.7s', top_speed: 200, battery_kwh: 80, battery_type: 'LFP', dc_charge_power_kw: 451, dc_charge_time: '10-80% in 12 min', energy_consumption: '17.5 kWh/100km', drivetrain: 'RWD', delivery_time: 'Q4 2026', sort_order: 2 },
      { variant_code: 'awd', variant_name: 'AWD Performance', price: 51600, is_default: false, range_km: 510, power_kw: 358, acceleration: '4.1s', top_speed: 200, battery_kwh: 80, battery_type: 'LFP', dc_charge_power_kw: 451, dc_charge_time: '10-80% in 12 min', energy_consumption: '18.4 kWh/100km', drivetrain: 'AWD', delivery_time: 'Q1 2027', sort_order: 3 },
    ],
    colors: [
      { variant_code: 'all', color_code: 'arctic-white', color_name: 'Arctic White', color_hex: '#F0EDE8', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', color_code: 'silver-frost', color_name: 'Silver Frost', color_hex: '#B8B8B8', price: 800, is_default: false, sort_order: 2 },
      { variant_code: 'all', color_code: 'graphite-gray', color_name: 'Graphite Gray', color_hex: '#707070', price: 800, is_default: false, sort_order: 3 },
    ],
    interiors: [
      { variant_code: 'all', interior_code: 'dark-gray', interior_name: 'Dark Gray', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', interior_code: 'light-gray', interior_name: 'Light Gray', price: 0, is_default: false, sort_order: 2 },
    ],
    wheels: [
      { variant_code: 'all', wheel_code: '20-sport', wheel_name: '20" Sport', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'awd', wheel_code: '20-black-edition', wheel_name: '20" Black Edition', price: 0, is_default: false, requires_accessory: 'black-edition', sort_order: 2 },
    ],
    accessories: [
      { variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Electric Retractable Towbar', price: 1190, description: '1,500 kg braked / 750 kg unbraked, 75 kg tongue weight', image: '', sort_order: 1 },
      { variant_code: 'awd', accessory_code: 'black-edition', accessory_name: 'Black Edition', price: 1490, description: 'Черен цвят | Черни спирачни апарати | Предно лого с опушено черен ефект | Декоративни елементи с опушено черен ефект на интелигентните камери | Опушено черен ефект на елементите по предната броня | Надписи „XPENG" и „G6" отзад с опушен черен ефект', image: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a2a5349e94f6efe2f62584e_Black%20edition.avif', sort_order: 2 },
    ],
  },
  'p7-plus': {
    model: { model_slug: 'p7-plus', model_name: 'XPENG P7+', starting_price: 46600 },
    variants: [
      { variant_code: 'rwd-sr', variant_name: 'RWD Standard Range', price: 46600, is_default: true, range_km: 455, power_kw: 180, acceleration: '6.9s', top_speed: 200, battery_kwh: 61.7, battery_type: 'LFP', dc_charge_power_kw: 350, dc_charge_time: '20-80% in 10 min', energy_consumption: '15.2 kWh/100km', drivetrain: 'RWD', delivery_time: 'Q4 2026', sort_order: 1 },
      { variant_code: 'rwd-lr', variant_name: 'RWD Long Range', price: 49600, is_default: false, range_km: 530, power_kw: 230, acceleration: '6.2s', top_speed: 200, battery_kwh: 74.9, battery_type: 'LFP', dc_charge_power_kw: 446, dc_charge_time: '20-80% in 10 min', energy_consumption: '16.4 kWh/100km', drivetrain: 'RWD', delivery_time: 'Q4 2026', sort_order: 2 },
      { variant_code: 'awd', variant_name: 'AWD Performance', price: 53600, is_default: false, range_km: 500, power_kw: 370, acceleration: '4.3s', top_speed: 200, battery_kwh: 74.9, battery_type: 'LFP', dc_charge_power_kw: 446, dc_charge_time: '20-80% in 10 min', energy_consumption: '17.4 kWh/100km', drivetrain: 'AWD', delivery_time: 'Q1 2027', sort_order: 3 },
    ],
    colors: [
      { variant_code: 'all', color_code: 'arctic-white', color_name: 'Arctic White', color_hex: '#F0EDE8', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', color_code: 'silver-frost', color_name: 'Silver Frost', color_hex: '#B8B8B8', price: 800, is_default: false, sort_order: 2 },
      { variant_code: 'all', color_code: 'graphite-gray', color_name: 'Graphite Gray', color_hex: '#707070', price: 800, is_default: false, sort_order: 3 },
    ],
    interiors: [
      { variant_code: 'rwd-sr', interior_code: 'dark-gray', interior_name: 'Dark Gray', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'rwd-sr', interior_code: 'light-gray', interior_name: 'Light Gray', price: 0, is_default: false, sort_order: 2 },
      { variant_code: 'rwd-lr', interior_code: 'dark-gray', interior_name: 'Dark Gray', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'rwd-lr', interior_code: 'light-gray', interior_name: 'Light Gray', price: 0, is_default: false, sort_order: 2 },
      { variant_code: 'awd', interior_code: 'dark-gray', interior_name: 'Dark Gray', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'awd', interior_code: 'light-gray', interior_name: 'Light Gray', price: 0, is_default: false, sort_order: 2 },
    ],
    wheels: [
      { variant_code: 'rwd-sr', wheel_code: '19-aero', wheel_name: '19" Aero', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'rwd-lr', wheel_code: '20-sport', wheel_name: '20" Sport', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'awd', wheel_code: '20-sport', wheel_name: '20" Sport', price: 0, is_default: true, sort_order: 1 },
    ],
    accessories: [{ variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Electric Retractable Towbar', price: 1190, description: '1,500 kg braked / 750 kg unbraked, 75 kg tongue weight', image: '', sort_order: 1 }],
  },
};

const EUR_TO_BGN = 1.95583;

/* ----------------------------------------------------------------
   PRICE VISIBILITY TOGGLE
   ----------------------------------------------------------------
   Set to false to hide ALL prices across the configurator and
   summary pages. The configurator still works — users can select
   variants, colors, interiors, wheels, accessories — but no prices
   are displayed anywhere.

   Data in the Google Sheet is NOT affected — prices remain stored,
   they're just not rendered in the UI.

   TO RE-ENABLE PRICES:
   1. Set SHOW_PRICES = true
   2. npm run build
   3. git add + commit + push (Cloudflare auto-deploys)
   4. Publish Webflow site

   Search "SHOW_PRICES" to find all guarded locations.
   ---------------------------------------------------------------- */
var SHOW_PRICES = true;

function formatPrice(num) {
  return num.toLocaleString('de-DE');
}

function resolveDeliveryTime(raw) {
  if (!raw) return '';
  if (raw.startsWith('+')) {
    const days = parseInt(raw.replace('+', '').replace('days', ''), 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    const quarter = Math.ceil((date.getMonth() + 1) / 3);
    return 'Q' + quarter + ' ' + date.getFullYear();
  }
  return raw;
}

function getOptionsForVariant(items, variantCode) {
  var specific = items.filter(function(o) { return o.variant_code === variantCode; });
  var general = items.filter(function(o) { return o.variant_code === 'all'; });

  // Variant-specific rows override 'all' rows with the same code
  var specificCodes = {};
  specific.forEach(function(o) {
    var key = o.color_code || o.interior_code || o.wheel_code || o.accessory_code || '';
    if (key) specificCodes[key] = true;
  });

  var merged = specific.concat(general.filter(function(o) {
    var key = o.color_code || o.interior_code || o.wheel_code || o.accessory_code || '';
    return !specificCodes[key];
  }));

  return merged.sort(function(a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
}

async function fetchModelData(modelSlug) {
  // Use mock data for now; swap to API fetch when ready
  if (CONFIGURATOR_API) {
    const res = await fetch(CONFIGURATOR_API + '?model=' + modelSlug);
    return res.json();
  }
  return MOCK_DATA[modelSlug] || null;
}

function initConfiguratorPage(modelSlug) {
  const root = document.querySelector('[data-configurator]');
  if (!root) return;

  root.setAttribute('data-cfg-loading', '');

  // State
  const state = {
    data: null,
    selectedVariant: null,
    selectedColor: null,
    selectedInterior: null,
    selectedWheels: null,
    selectedAccessories: [],
    galleryMode: 'exterior',
  };

  const listeners = [];
  function subscribe(fn) { listeners.push(fn); }
  function notify(changeType) { listeners.forEach((fn) => fn(changeType, state)); }
  function setState(updates, changeType) {
    Object.assign(state, updates);
    notify(changeType);
  }

  // Boot
  fetchModelData(modelSlug).then((data) => {
    if (!data) {
      root.removeAttribute('data-cfg-loading');
      return;
    }

    state.data = data;
    applyDefaults(state, data);
    renderAll(root, state, data, setState);
    bindContinueBtn(root, state);
    bindAccordions(root);
    subscribe((changeType) => handleStateChange(root, state, changeType));
    root.removeAttribute('data-cfg-loading');
    notify('init');
  }).catch((e) => {
    console.error('Configurator load error:', e);
    root.removeAttribute('data-cfg-loading');
  });
}

function applyDefaults(state, data) {
  state.selectedVariant = data.variants.find((v) => v.is_default) || data.variants[0];

  const colors = getOptionsForVariant(data.colors, state.selectedVariant.variant_code);
  state.selectedColor = colors.find((c) => c.is_default) || colors[0];

  const interiors = getOptionsForVariant(data.interiors, state.selectedVariant.variant_code);
  state.selectedInterior = interiors.find((i) => i.is_default) || interiors[0];

  const wheels = getOptionsForVariant(data.wheels, state.selectedVariant.variant_code);
  state.selectedWheels = wheels.find((w) => w.is_default) || null;

  state.selectedAccessories = [];
}

function calculateTotal(state) {
  const base = state.selectedVariant?.price || 0;
  const color = state.selectedColor?.price || 0;
  const interior = state.selectedInterior?.price || 0;
  const wheels = state.selectedWheels?.price || 0;
  const acc = state.selectedAccessories.reduce((sum, code) => {
    const item = state.data.accessories.find((a) => a.accessory_code === code);
    return sum + (item?.price || 0);
  }, 0);
  const totalEur = base + color + interior + wheels + acc;
  return { totalEur, totalBgn: Math.round(totalEur * EUR_TO_BGN) };
}

// ---- Rendering ----

function renderAll(root, state, data, setState) {
  renderHeader(root, data);
  renderVariants(root, state, data, setState);
  renderColors(root, state, data, setState);
  renderInteriors(root, state, data, setState);
  renderWheels(root, state, data, setState);
  renderAccessories(root, state, data, setState);
}

function renderHeader(root, data) {
  const nameEl = root.querySelector('[data-cfg-model-name]');
  const priceEl = root.querySelector('[data-cfg-starting-price]');
  if (nameEl) nameEl.textContent = data.model.model_name;
  if (priceEl) priceEl.textContent = SHOW_PRICES ? 'от ' + formatPrice(data.model.starting_price) + ' EUR' : '';
}

function renderVariants(root, state, data, setState) {
  const container = root.querySelector('[data-cfg-cards]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-variant-card]');
  if (!template) return;

  container.innerHTML = '';

  data.variants.forEach((variant) => {
    const card = template.cloneNode(true);
    card.setAttribute('data-cfg-variant-card', variant.variant_code);

    const name = card.querySelector('[data-cfg-variant-name]');
    if (name) name.textContent = variant.variant_name;

    const delivery = card.querySelector('[data-cfg-variant-delivery]');
    if (delivery) delivery.textContent = resolveDeliveryTime(variant.delivery_time);

    const specs = card.querySelector('[data-cfg-variant-specs]');
    if (specs && variant.energy_consumption) {
      specs.textContent = 'Разход на енергия ' + variant.energy_consumption.replace('km', 'км') + ', CO₂ емисии: 0 г/км, CO₂ клас: A (Комбинирани стойности съгласно WLTP.)';
    }

    const price = card.querySelector('[data-cfg-variant-price]');
    if (price) price.textContent = SHOW_PRICES ? formatPrice(variant.price) + ' EUR' : '';

    // "Show more" opens drawer with full specs
    const expandBtn = card.querySelector('[data-cfg-variant-expand]');
    if (expandBtn) {
      expandBtn.textContent = 'Виж още';
      expandBtn.setAttribute('data-drawer-target', 'specs-' + variant.variant_code);
    }

    if (variant.variant_code === state.selectedVariant?.variant_code) {
      card.setAttribute('data-cfg-active', '');
    }

    card.addEventListener('click', function(e) {
      if (e.target.closest('[data-cfg-variant-expand]')) return;
      var prevVariant = state.selectedVariant?.variant_code;
      if (prevVariant === variant.variant_code) return;

      // Check if current selections survive the variant switch
      var newColors = getOptionsForVariant(data.colors, variant.variant_code);
      var newInteriors = getOptionsForVariant(data.interiors, variant.variant_code);
      var newWheels = getOptionsForVariant(data.wheels, variant.variant_code);

      var colorSurvives = newColors.some(function(c) { return c.color_code === state.selectedColor?.color_code; });
      var interiorSurvives = newInteriors.some(function(i) { return i.interior_code === state.selectedInterior?.interior_code; });
      var wheelSurvives = newWheels.some(function(w) { return w.wheel_code === state.selectedWheels?.wheel_code; });

      // Skip confirmation if the category either survives or has only one option (no user choice lost)
      var colorNeedsConfirm = !colorSurvives && newColors.length > 1;
      var interiorNeedsConfirm = !interiorSurvives && newInteriors.length > 1;
      var wheelNeedsConfirm = !wheelSurvives && newWheels.length > 1;
      var selectionsChange = colorNeedsConfirm || interiorNeedsConfirm || wheelNeedsConfirm;

      function applyVariantChange() {
        state.selectedVariant = variant;

        state.selectedColor = (colorSurvives && newColors.find(function(c) { return c.color_code === state.selectedColor?.color_code; }))
          || newColors.find(function(c) { return c.is_default; }) || newColors[0];

        state.selectedInterior = (interiorSurvives && newInteriors.find(function(i) { return i.interior_code === state.selectedInterior?.interior_code; }))
          || newInteriors.find(function(i) { return i.is_default; }) || newInteriors[0];

        var newDefault = newWheels.find(function(w) { return w.is_default; }) || null;
        if (wheelSurvives && state.selectedWheels) {
          var carried = newWheels.find(function(w) { return w.wheel_code === state.selectedWheels.wheel_code; });
          // Only carry over if the wheel is default in the new variant
          state.selectedWheels = (carried && carried.is_default) ? carried : newDefault;
        } else {
          state.selectedWheels = newDefault;
        }

        // Clear accessories that don't exist in the new variant
        var newAccessories = getOptionsForVariant(data.accessories, variant.variant_code)
          .filter(function(a) { return !HIDDEN_ACCESSORIES.includes(a.accessory_code); });
        var newAccCodes = newAccessories.map(function(a) { return a.accessory_code; });
        state.selectedAccessories = state.selectedAccessories.filter(function(code) {
          return newAccCodes.includes(code);
        });

        renderColors(root, state, data, setState);
        renderInteriors(root, state, data, setState);
        renderWheels(root, state, data, setState);
        renderAccessories(root, state, data, setState);

        state.galleryMode = 'exterior';
        updateGallery(root, state);
        updatePrice(root, state);
        updateActiveStates(root, state);
      }

      // Confirmation dialog temporarily disabled
      applyVariantChange();
    });

    container.appendChild(card);
  });
}

function renderColors(root, state, data, setState) {
  const container = root.querySelector('[data-cfg-swatches]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-swatch]') || container.lastElementChild;
  if (!template) return;

  const colors = getOptionsForVariant(data.colors, state.selectedVariant?.variant_code);
  container.innerHTML = '';

  colors.forEach((color) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-swatch', color.color_code);

    const dot = el.querySelector('[data-cfg-swatch-dot]') || el.querySelector('.configurator__swatch-dot');
    if (dot) {
      if (color.swatch_image) {
        dot.style.backgroundImage = 'url(' + color.swatch_image + ')';
        dot.style.backgroundSize = 'cover';
        dot.style.backgroundPosition = 'center';
      } else {
        dot.style.backgroundColor = color.color_hex;
      }
    }

    const name = el.querySelector('[data-cfg-swatch-name]');
    if (name) name.textContent = color.color_name;

    const price = el.querySelector('[data-cfg-swatch-price]');
    if (price) price.textContent = SHOW_PRICES && color.price > 0 ? '+' + formatPrice(color.price) + ' EUR' : '';

    if (color.color_code === state.selectedColor?.color_code) {
      el.setAttribute('data-color-active', '');
    } else {
      el.removeAttribute('data-color-active');
    }

    el.addEventListener('click', () => {
      setState({ selectedColor: color }, 'color');
    });

    container.appendChild(el);
  });
}

function renderInteriors(root, state, data, setState) {
  const container = root.querySelector('[data-cfg-interior-options]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-interior-option]') || container.lastElementChild;
  if (!template) return;

  const interiors = getOptionsForVariant(data.interiors, state.selectedVariant?.variant_code);
  container.innerHTML = '';

  interiors.forEach((interior) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-interior-option', interior.interior_code);

    const thumb = el.querySelector('.configurator__interior-thumb');
    if (thumb && interior.image_thumb) thumb.src = interior.image_thumb;

    const name = el.querySelector('[data-cfg-interior-name]');
    if (name) name.textContent = interior.interior_name;

    if (interior.interior_code === state.selectedInterior?.interior_code) {
      el.setAttribute('data-cfg-active', '');
    }

    el.addEventListener('click', () => {
      setState({ selectedInterior: interior }, 'interior');
    });

    container.appendChild(el);
  });
}

function renderWheels(root, state, data, setState) {
  const step = root.querySelector('[data-cfg-step="wheels"]');
  const container = root.querySelector('[data-cfg-wheel-options]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-wheel-option]') || container.lastElementChild;
  if (!template) return;

  var allWheels = getOptionsForVariant(data.wheels, state.selectedVariant?.variant_code);
  var hasBlackEdition = state.selectedAccessories.includes('black-edition');
  const wheels = hasBlackEdition
    ? allWheels.filter(function(w) { return /black-edition/.test(w.wheel_code); })
    : allWheels.filter(function(w) { return !/black-edition/.test(w.wheel_code); });

  // Hide step if no options; show and auto-select if only one
  if (step && wheels.length === 0) {
    step.style.display = 'none';
    return;
  } else if (step) {
    step.style.display = '';
  }

  // Clean template: strip any stale active state before cloning
  template.removeAttribute('data-cfg-active');

  container.innerHTML = '';

  wheels.forEach((wheel) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-wheel-option', wheel.wheel_code);
    el.removeAttribute('data-cfg-active');

    const thumb = el.querySelector('.configurator__wheel-thumb');
    if (thumb && wheel.image_thumb) {
      thumb.src = wheel.image_thumb;
      thumb.style.objectFit = 'contain';
    }

    const name = el.querySelector('[data-cfg-wheel-name]');
    if (name) name.textContent = wheel.wheel_name;

    const price = el.querySelector('[data-cfg-wheel-price]');
    if (price) price.textContent = SHOW_PRICES && wheel.price > 0 ? '+' + formatPrice(wheel.price) + ' EUR' : '';

    if (wheel.wheel_code === state.selectedWheels?.wheel_code) {
      el.setAttribute('data-cfg-active', '');
    }

    el.addEventListener('click', () => {
      if (state.selectedWheels?.wheel_code === wheel.wheel_code) {
        // Don't deselect wheels tied to an active accessory package
        if (/black-edition/.test(wheel.wheel_code) && state.selectedAccessories.includes('black-edition')) return;
        if (!wheel.is_default) setState({ selectedWheels: null }, 'wheels');
      } else {
        setState({ selectedWheels: wheel }, 'wheels');
      }
    });

    container.appendChild(el);
  });
}

function renderAccessories(root, state, data, setState) {
  // Rename section title to "Optional"
  var accStep = root.querySelector('[data-cfg-step="accessories"]');
  if (accStep) {
    var stepTitle = accStep.querySelector('.configurator__step-title');
    if (stepTitle) {
      // Preserve accordion icon if present
      var icon = stepTitle.querySelector('.configurator__accordion-icon');
      stepTitle.textContent = 'Опционално оборудване';
      if (icon) stepTitle.appendChild(icon);
    }
  }

  const container = root.querySelector('[data-cfg-accessories]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-accessory]') || container.lastElementChild;
  if (!template) return;

  const accessories = getOptionsForVariant(data.accessories, state.selectedVariant?.variant_code)
    .filter((acc) => !HIDDEN_ACCESSORIES.includes(acc.accessory_code));
  container.innerHTML = '';

  accessories.forEach((acc) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-accessory', acc.accessory_code);

    const img = el.querySelector('.configurator__accessory-img');
    if (img && acc.image) img.src = acc.image;

    const name = el.querySelector('[data-cfg-accessory-name]');
    if (name) name.textContent = acc.accessory_name;

    const price = el.querySelector('[data-cfg-accessory-price]');
    if (price) price.textContent = SHOW_PRICES ? formatPrice(acc.price) + ' EUR' : '';

    // Render description as bullet list
    const desc = el.querySelector('[data-cfg-accessory-desc]');
    if (desc) {
      if (acc.description) {
        var bullets = acc.description.split('|').filter(function(line) { return line.trim(); });
        if (bullets.length > 1) {
          desc.innerHTML = '<ul class="configurator__accessory-bullets">' +
            bullets.map(function(b) { return '<li>' + b.trim() + '</li>'; }).join('') +
            '</ul>';
        } else {
          desc.textContent = acc.description;
        }
      } else {
        desc.textContent = '';
      }
    }

    const toggle = el.querySelector('[data-cfg-accessory-toggle]');
    const isActive = state.selectedAccessories.includes(acc.accessory_code);
    if (toggle) {
      toggle.textContent = isActive ? 'Премахни' : 'Добави';
      if (isActive) el.setAttribute('data-cfg-active', '');
    }

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault(); // anchor href="#" would scroll page to top (BG_R2_005)
        e.stopPropagation();
        const list = [...state.selectedAccessories];
        const idx = list.indexOf(acc.accessory_code);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(acc.accessory_code);

        // Black Edition: auto-select/revert wheels when toggled
        if (acc.accessory_code === 'black-edition') {
          var bAllWheels = getOptionsForVariant(data.wheels, state.selectedVariant?.variant_code);
          if (list.includes('black-edition')) {
            var beWheel = bAllWheels.find(function(w) { return /black-edition/.test(w.wheel_code); });
            setState({ selectedAccessories: list, selectedWheels: beWheel || state.selectedWheels }, 'accessories');
          } else {
            var stdWheel = bAllWheels.find(function(w) { return w.is_default; });
            setState({ selectedAccessories: list, selectedWheels: stdWheel || null }, 'accessories');
          }
          renderWheels(root, state, data, setState);
          state.galleryMode = 'exterior';
          updateGallery(root, state);
          return;
        }

        setState({ selectedAccessories: list }, 'accessories');
      });
    }

    container.appendChild(el);
  });
}

// ---- State change handler ----

function handleStateChange(root, state, changeType) {
  updatePrice(root, state);
  updateActiveStates(root, state);

  if (changeType === 'color' || changeType === 'variant' || changeType === 'wheels') {
    state.galleryMode = 'exterior';
    updateGallery(root, state);
  }

  if (changeType === 'interior') {
    state.galleryMode = 'interior';
    updateGallery(root, state);
  }

  if (changeType === 'init') {
    state.galleryMode = 'exterior';
    updateGallery(root, state);
  }

  if (changeType === 'accessories') {
    updateAccessoryToggles(root, state);
  }
}

function bindAccordions(root) {
  var steps = root.querySelectorAll('[data-cfg-step]');
  steps.forEach(function(step) {
    var title = step.querySelector('.configurator__step-title');
    if (!title) return;

    // Add toggle icon
    var icon = document.createElement('span');
    icon.className = 'configurator__accordion-icon';
    title.appendChild(icon);
    title.style.cursor = 'pointer';

    // All sections start open (no data-cfg-closed attribute)

    title.addEventListener('click', function() {
      var isClosed = step.hasAttribute('data-cfg-closed');
      if (isClosed) {
        step.removeAttribute('data-cfg-closed');
      } else {
        step.setAttribute('data-cfg-closed', '');
      }
    });
  });
}

function updatePrice(root, state) {
  const { totalEur, totalBgn } = calculateTotal(state);
  const eurEl = root.querySelector('[data-cfg-total-eur]');
  const bgnEl = root.querySelector('[data-cfg-total-bgn]');
  if (eurEl) eurEl.textContent = SHOW_PRICES ? formatPrice(totalEur) + ' EUR' : '';
  if (bgnEl) bgnEl.textContent = SHOW_PRICES ? formatPrice(totalBgn) + ' лв.' : '';
}

function updateActiveStates(root, state) {
  // Variant cards
  root.querySelectorAll('[data-cfg-variant-card]').forEach((card) => {
    const code = card.getAttribute('data-cfg-variant-card');
    if (code === state.selectedVariant?.variant_code) card.setAttribute('data-cfg-active', '');
    else card.removeAttribute('data-cfg-active');
  });

  // Color swatches
  root.querySelectorAll('[data-cfg-swatch]').forEach((sw) => {
    const code = sw.getAttribute('data-cfg-swatch');
    if (code === state.selectedColor?.color_code) sw.setAttribute('data-color-active', '');
    else sw.removeAttribute('data-color-active');
  });

  // Interior options
  root.querySelectorAll('[data-cfg-interior-option]').forEach((opt) => {
    const code = opt.getAttribute('data-cfg-interior-option');
    if (code === state.selectedInterior?.interior_code) opt.setAttribute('data-cfg-active', '');
    else opt.removeAttribute('data-cfg-active');
  });

  // Wheel options
  root.querySelectorAll('[data-cfg-wheel-option]').forEach((opt) => {
    const code = opt.getAttribute('data-cfg-wheel-option');
    if (code === state.selectedWheels?.wheel_code) opt.setAttribute('data-cfg-active', '');
    else opt.removeAttribute('data-cfg-active');
  });
}

// ---- Configuration confirm dialog ----

function showConfigConfirm(root, onApply) {
  var dialog = document.querySelector('[data-cfg-confirm]');
  if (!dialog) { onApply(); return; } // No dialog in DOM — apply immediately

  dialog.setAttribute('data-cfg-confirm', 'active');

  var applyBtn = dialog.querySelector('[data-cfg-confirm-apply]');
  var cancelBtn = dialog.querySelector('[data-cfg-confirm-cancel]');
  var backdrop = dialog.querySelector('[data-cfg-confirm-backdrop]');

  function close(e) {
    if (e && e.preventDefault) e.preventDefault(); // anchor href="#" (BG_R2_005)
    dialog.setAttribute('data-cfg-confirm', 'not-active');
    cleanup();
  }

  function apply(e) {
    if (e && e.preventDefault) e.preventDefault(); // anchor href="#" (BG_R2_005)
    close();
    onApply();
  }

  function onEscape(e) {
    if (e.key === 'Escape') close();
  }

  function cleanup() {
    if (applyBtn) applyBtn.removeEventListener('click', apply);
    if (cancelBtn) cancelBtn.removeEventListener('click', close);
    if (backdrop) backdrop.removeEventListener('click', close);
    document.removeEventListener('keydown', onEscape);
  }

  if (applyBtn) applyBtn.addEventListener('click', apply);
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  document.addEventListener('keydown', onEscape);
}

function updateGallery(root, state) {
  var mainImg = root.querySelector('.configurator__gallery-img');
  if (!mainImg) return;

  var url = '';
  if (state.galleryMode === 'interior') {
    // Show interior panorama
    var interior = state.selectedInterior;
    url = (interior && (interior.image_full || interior.image_thumb)) || '';
  } else {
    // Black Edition selected — show dedicated gallery image (separate from accessory thumbnail)
    var beGallery = {
      g9: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a3bdbe168c02486c7b836f3_g9-black-edition-MAIN.avif',
      g6: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a3bdbe785f5872a728efd2d_g6-black-edition-main.avif'
    };
    if (state.selectedAccessories.includes('black-edition') && state.data) {
      var slug = state.data.model.model_slug;
      if (beGallery[slug]) url = beGallery[slug];
    }
    // Normal: show exterior car render — pick alternate wheel image if larger wheels selected
    if (!url) {
      var color = state.selectedColor;
      var wCode = (state.selectedWheels && state.selectedWheels.wheel_code) || '';
      var isLargeWheel = /2[01]/.test(wCode);
      if (isLargeWheel && color && color.image_front_21) {
        url = color.image_front_21;
      } else {
        url = (color && color.image_front) || '';
      }
    }
  }

  if (!url) return;

  var currentSrc = mainImg.getAttribute('src') || '';
  if (currentSrc !== url) {
    gsap.to(mainImg, {
      autoAlpha: 0,
      duration: 0.15,
      onComplete: function() {
        mainImg.onload = function() { gsap.to(mainImg, { autoAlpha: 1, duration: 0.3 }); };
        mainImg.onerror = function() { gsap.set(mainImg, { autoAlpha: 0 }); };
        mainImg.src = url;
      }
    });
  } else {
    gsap.set(mainImg, { autoAlpha: 1 });
  }
}



function updateAccessoryToggles(root, state) {
  root.querySelectorAll('[data-cfg-accessory]').forEach((el) => {
    const code = el.getAttribute('data-cfg-accessory');
    const isActive = state.selectedAccessories.includes(code);
    const toggle = el.querySelector('[data-cfg-accessory-toggle]');
    if (toggle) toggle.textContent = isActive ? 'Премахни' : 'Добави';
    if (isActive) el.setAttribute('data-cfg-active', '');
    else el.removeAttribute('data-cfg-active');
  });
}

// ---- Summary navigation ----

function bindContinueBtn(root, state) {
  const btn = root.querySelector('[data-cfg-continue]');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      model: state.data.model.model_slug,
      variant: state.selectedVariant?.variant_code || '',
      color: state.selectedColor?.color_code || '',
      interior: state.selectedInterior?.interior_code || '',
      wheels: state.selectedWheels?.wheel_code || '',
      accessories: state.selectedAccessories.join(','),
    });

    sessionStorage.setItem('xpeng-cfg', JSON.stringify({
      model: state.data.model,
      selectedVariant: state.selectedVariant,
      selectedColor: state.selectedColor,
      selectedInterior: state.selectedInterior,
      selectedWheels: state.selectedWheels,
      selectedAccessories: state.data.accessories.filter((a) =>
        state.selectedAccessories.includes(a.accessory_code)
      ),
      totals: calculateTotal(state),
    }));

    window.location.href = '/configurator/summary?' + params.toString();
  });
}


// ---- Summary page ----

function initSummaryPage() {
  var root = document.querySelector('[data-cfg-summary]');
  if (!root) return;

  var stored = sessionStorage.getItem('xpeng-cfg');
  var config = null;

  if (stored) {
    try { config = JSON.parse(stored); } catch (e) { /* fall through */ }
  }

  if (config) {
    renderSummary(root, config);
  } else {
    // Reconstruct from URL params + API
    var params = new URLSearchParams(window.location.search);
    var modelSlug = params.get('model');
    if (!modelSlug) return;

    fetchModelData(modelSlug).then(function(data) {
      if (!data) return;
      config = reconstructConfig(data, params);
      sessionStorage.setItem('xpeng-cfg', JSON.stringify(config));
      renderSummary(root, config);
    });
  }
}

function reconstructConfig(data, params) {
  var variantCode = params.get('variant');
  var colorCode = params.get('color');
  var interiorCode = params.get('interior');
  var wheelCode = params.get('wheels');
  var accCodes = (params.get('accessories') || '').split(',').filter(Boolean);

  var variant = data.variants.find(function(v) { return v.variant_code === variantCode; }) || data.variants[0];
  var colors = getOptionsForVariant(data.colors, variant.variant_code);
  var interiors = getOptionsForVariant(data.interiors, variant.variant_code);
  var wheels = getOptionsForVariant(data.wheels, variant.variant_code);

  var color = colors.find(function(c) { return c.color_code === colorCode; }) || colors[0];
  var interior = interiors.find(function(i) { return i.interior_code === interiorCode; }) || interiors[0];
  var selectedWheels = wheels.find(function(w) { return w.wheel_code === wheelCode; }) || wheels[0];
  var accessories = data.accessories.filter(function(a) { return accCodes.includes(a.accessory_code); });

  var totalEur = (variant.price || 0) + (color.price || 0) + (interior.price || 0) + (selectedWheels.price || 0);
  accessories.forEach(function(a) { totalEur += a.price || 0; });

  return {
    model: data.model,
    selectedVariant: variant,
    selectedColor: color,
    selectedInterior: interior,
    selectedWheels: selectedWheels,
    selectedAccessories: accessories,
    totals: { totalEur: totalEur, totalBgn: Math.round(totalEur * EUR_TO_BGN) }
  };
}

function renderSummary(root, config) {
  // Heading
  var heading = root.querySelector('[data-summary-heading]');
  if (heading) heading.textContent = 'Вашият ' + (config.model.model_name || '');

  // Car image — Black Edition hero or color-based render
  var carImg = root.querySelector('[data-summary-car-image]');
  if (carImg) {
    var beGallery = {
      g9: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a3bdbe168c02486c7b836f3_g9-black-edition-MAIN.avif',
      g6: 'https://cdn.prod.website-files.com/6a041f81e8910a5a1669594c/6a3bdbe785f5872a728efd2d_g6-black-edition-main.avif'
    };
    var hasBlackEdition = config.selectedAccessories.some(function(a) { return a.accessory_code === 'black-edition'; });
    var slug = config.model.model_slug;
    var url = '';
    if (hasBlackEdition && beGallery[slug]) {
      url = beGallery[slug];
    } else if (config.selectedColor) {
      var wCode = (config.selectedWheels && config.selectedWheels.wheel_code) || '';
      var isLargeWheel = /2[01]/.test(wCode);
      url = (isLargeWheel && config.selectedColor.image_front_21) || config.selectedColor.image_front || '';
    }
    if (url) carImg.src = url;
  }

  // Variant line item
  setLineItem(root, 'variant', config.selectedVariant.variant_name, SHOW_PRICES ? formatPrice(config.selectedVariant.price) + ' EUR' : '');

  // Color line item + swatch
  var colorPrice = SHOW_PRICES && config.selectedColor.price > 0 ? '+' + formatPrice(config.selectedColor.price) + ' EUR' : '';
  setLineItem(root, 'color', config.selectedColor.color_name, colorPrice);
  var swatch = root.querySelector('[data-summary-color-swatch]');
  if (swatch) {
    if (config.selectedColor.swatch_image) {
      swatch.style.backgroundImage = 'url(' + config.selectedColor.swatch_image + ')';
      swatch.style.backgroundSize = 'cover';
      swatch.style.backgroundPosition = 'center';
    } else {
      swatch.style.backgroundColor = config.selectedColor.color_hex;
    }
  }

  // Interior line item
  var interiorPrice = SHOW_PRICES && config.selectedInterior.price > 0 ? '+' + formatPrice(config.selectedInterior.price) + ' EUR' : '';
  setLineItem(root, 'interior', config.selectedInterior.interior_name, interiorPrice);
  setLineThumb(root, 'interior', config.selectedInterior.image_thumb);

  // Wheels line item — hide row when no wheels selected
  var wheelsItem = root.querySelector('[data-summary-item="wheels"]');
  if (config.selectedWheels) {
    if (wheelsItem) wheelsItem.style.display = '';
    var wheelsPrice = SHOW_PRICES && config.selectedWheels.price > 0 ? '+' + formatPrice(config.selectedWheels.price) + ' EUR' : '';
    setLineItem(root, 'wheels', config.selectedWheels.wheel_name, wheelsPrice);
    setLineThumb(root, 'wheels', config.selectedWheels.image_thumb);
  } else {
    if (wheelsItem) wheelsItem.style.display = 'none';
  }

  // Accessories — clone template for each selected accessory
  var accTemplate = root.querySelector('[data-summary-item="accessory"]');
  if (accTemplate) {
    var accContainer = accTemplate.parentElement;
    if (config.selectedAccessories.length === 0) {
      accTemplate.style.display = 'none';
    } else {
      accTemplate.style.display = 'none';
      config.selectedAccessories.forEach(function(acc) {
        var el = accTemplate.cloneNode(true);
        el.style.display = '';
        var label = el.querySelector('[data-summary-item-label]');
        if (label) label.textContent = acc.accessory_name;
        var price = el.querySelector('[data-summary-item-price]');
        if (price) price.textContent = SHOW_PRICES ? '+' + formatPrice(acc.price) + ' EUR' : '';
        var thumb = el.querySelector('.summary__item-thumb') || el.querySelector('[data-summary-item-thumb]') || el.querySelector('img');
        if (thumb && acc.image) thumb.src = acc.image;
        accContainer.appendChild(el);
      });
    }
  }

  // Totals
  var totalEur = root.querySelector('[data-summary-total-eur]');
  if (totalEur) totalEur.textContent = SHOW_PRICES ? formatPrice(config.totals.totalEur) + ' EUR' : '';
  var totalBgn = root.querySelector('[data-summary-total-bgn]');
  if (totalBgn) totalBgn.textContent = SHOW_PRICES ? formatPrice(config.totals.totalBgn) + ' лв.' : '';

  // Test drive link
  var tdLink = root.querySelector('[data-summary-test-drive]');
  if (tdLink) tdLink.href = '/test-drive?model=' + (config.model.model_slug || '');

  // Pre-order button — disabled until Stripe is set up
  var preorderBtn = root.querySelector('[data-summary-preorder]');
  if (preorderBtn) {
    preorderBtn.disabled = true;
    preorderBtn.style.opacity = '0.5';
    preorderBtn.style.cursor = 'not-allowed';
  }

  // Fade in
  root.classList.add('is-loaded');
}

function setLineItem(root, type, label, price) {
  var item = root.querySelector('[data-summary-item="' + type + '"]');
  if (!item) return;
  var labelEl = item.querySelector('[data-summary-item-label]');
  if (labelEl) labelEl.textContent = label;
  var priceEl = item.querySelector('[data-summary-item-price]');
  if (priceEl) priceEl.textContent = price;
}

function setLineThumb(root, type, src) {
  if (!src) return;
  var item = root.querySelector('[data-summary-item="' + type + '"]');
  if (!item) return;
  var thumb = item.querySelector('.summary__item-thumb') || item.querySelector('[data-summary-item-thumb]') || item.querySelector('img');
  if (thumb) thumb.src = src;
}

// ---- Test drive page ----

function initTestDrivePage() {
  var root = document.querySelector('[data-test-drive]');
  if (!root) return;

  // Map configurator slugs to Webflow radio values
  var slugToValue = { 'g9': 'G9', 'g6': 'G6', 'p7-plus': 'P7+' };
  var radios = root.querySelectorAll('input[name="Choose-a-model"]');

  function selectModel(slug) {
    var value = slugToValue[slug];
    if (!value) return;
    radios.forEach(function(radio) {
      var radioVisual = radio.parentElement.querySelector('.w-radio-input');
      if (radio.value === value) {
        radio.checked = true;
        if (radioVisual) radioVisual.classList.add('w--redirected-checked');
      } else {
        radio.checked = false;
        if (radioVisual) radioVisual.classList.remove('w--redirected-checked');
      }
    });
  }

  // Pre-select from URL param or default to G9
  var params = new URLSearchParams(window.location.search);
  var preselected = params.get('model');
  if (preselected && slugToValue[preselected]) {
    selectModel(preselected);
  } else {
    selectModel('g9');
  }
}

// ---- Product page ----

function initProductPage() {
  try { initColorPicker(); } catch (e) { console.error('colorPicker:', e); }
  try { initSpecsTabs(); } catch (e) { console.error('specsTabs:', e); }
  try { initTabbedCarousel(); } catch (e) { console.error('tabbedCarousel:', e); }
}


/* ============================================================
   10f. CATEGORY SLIDERS (mobile only)
   ============================================================ */

function initCategorySliders() {
  if (window.innerWidth >= 768) return;

  var all = Array.from(document.querySelectorAll('[data-slider-category]'));
  if (all.length < 2) return;

  // Group consecutive sections with the same category
  var groups = [];
  var i = 0;
  while (i < all.length) {
    var cat = all[i].getAttribute('data-slider-category');
    var group = [all[i]];
    var j = i + 1;
    while (j < all.length && all[j].getAttribute('data-slider-category') === cat) {
      group.push(all[j]);
      j++;
    }
    if (group.length >= 2) groups.push(group);
    i = j;
  }

  groups.forEach(buildCategorySlider);
}

function buildCategorySlider(sections) {
  // Create wrapper
  var wrapper = document.createElement('div');
  wrapper.className = 'cat-slider';

  // Create track
  var track = document.createElement('div');
  track.className = 'cat-slider__track';
  wrapper.appendChild(track);

  // Insert wrapper before first section
  sections[0].parentNode.insertBefore(wrapper, sections[0]);

  // Move sections into track as slides
  sections.forEach(function(section) {
    section.classList.add('cat-slider__slide');
    track.appendChild(section);
  });

  // Create dots
  var dots = document.createElement('div');
  dots.className = 'cat-slider__dots';
  sections.forEach(function(_, i) {
    var dot = document.createElement('div');
    dot.className = 'cat-slider__dot';
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', function() { goTo(i); });
    dots.appendChild(dot);
  });
  wrapper.appendChild(dots);

  // Slider state
  var current = 0;

  function goTo(index) {
    if (index < 0 || index >= sections.length) index = current;
    current = index;
    track.style.transform = 'translateX(' + (-current * 100) + '%)';
    var allDots = dots.querySelectorAll('.cat-slider__dot');
    allDots.forEach(function(d, i) {
      d.classList.toggle('is-active', i === current);
    });
  }

  // Touch / swipe with drag follow + velocity
  var startX = 0;
  var moveX = 0;
  var lastX = 0;
  var lastTime = 0;
  var velocityX = 0;
  var dragging = false;
  var locked = false; // true once we commit to horizontal

  wrapper.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    moveX = startX;
    lastX = startX;
    lastTime = Date.now();
    velocityX = 0;
    dragging = true;
    locked = false;
    track.style.transition = 'none';
  }, { passive: true });

  wrapper.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    var x = e.touches[0].clientX;
    var deltaFromStart = x - startX;

    // Lock to horizontal once we move >8px horizontally
    if (!locked && Math.abs(deltaFromStart) > 8) {
      locked = true;
    }

    if (!locked) return;

    // Prevent vertical scroll while swiping horizontally
    e.preventDefault();

    // Track velocity
    var now = Date.now();
    var dt = now - lastTime;
    if (dt > 0) velocityX = (x - lastX) / dt;
    lastX = x;
    lastTime = now;
    moveX = x;

    // Rubber-band at edges
    var pct = deltaFromStart / wrapper.offsetWidth * 100;
    if ((current === 0 && pct > 0) || (current === sections.length - 1 && pct < 0)) {
      pct *= 0.3;
    }
    track.style.transform = 'translateX(' + (-current * 100 + pct) + '%)';
  }, { passive: false });

  wrapper.addEventListener('touchend', function() {
    if (!dragging) return;
    dragging = false;
    track.style.transition = '';
    var delta = moveX - startX;

    // Velocity flick (>0.3 px/ms) or distance (>25% of width)
    var flick = Math.abs(velocityX) > 0.3;
    var far = Math.abs(delta) > wrapper.offsetWidth * 0.25;

    if (flick || far) {
      var dir = (velocityX !== 0) ? (velocityX < 0 ? 1 : -1) : (delta < 0 ? 1 : -1);
      goTo(current + dir);
    } else {
      goTo(current);
    }
  });
}


/* ============================================================
   10g. FIND US (Store Locator)
   ============================================================

   Full-screen Google Maps page with sidebar store list (desktop)
   and bottom drawers (mobile). 1:1 clone of xpeng.com/find-us.

   Data attributes: see header block.
   Docs: docs/find-us-spec.md
   ============================================================ */

/* --- Placeholder store data (replace with real BAI locations) --- */
var FIND_US_STORES = [
  {
    id: 'bai-sofia',
    name: 'XPENG Sofia — BAI Automotive',
    address: 'бул. Цариградско шосе 100, 1784 София',
    city: 'София',
    lat: 42.6605,
    lng: 23.3953,
    phone: '+359 2 123 4567',
    email: 'info@xpeng.bg',
    coverImage: '',
    services: [
      {
        type: 'experience',
        label: 'Шоурум',
        status: 'open',
        phone: '+359 2 123 4567',
        email: 'showroom@xpeng.bg',
        link: '',
        hours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-16:00',
          sunday: ''
        }
      },
      {
        type: 'service',
        label: 'Сервиз',
        status: 'coming_soon',
        phone: '',
        email: '',
        link: '',
        hours: {}
      }
    ]
  },
  {
    id: 'bai-plovdiv',
    name: 'XPENG Plovdiv — BAI Automotive',
    address: 'бул. Марица 100, 4000 Пловдив',
    city: 'Пловдив',
    lat: 42.1354,
    lng: 24.7453,
    phone: '+359 32 123 456',
    email: 'plovdiv@xpeng.bg',
    coverImage: '',
    services: [
      {
        type: 'experience',
        label: 'Шоурум',
        status: 'open',
        phone: '+359 32 123 456',
        email: 'plovdiv@xpeng.bg',
        link: '',
        hours: {
          monday: '09:00-18:00',
          tuesday: '09:00-18:00',
          wednesday: '09:00-18:00',
          thursday: '09:00-18:00',
          friday: '09:00-18:00',
          saturday: '10:00-14:00',
          sunday: ''
        }
      }
    ]
  }
];

var FIND_US_SERVICE_TYPES = [
  { value: 'experience', label: 'Шоурум' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'service', label: 'Сервиз' }
];

var FIND_US_DEFAULT_CENTER = { lat: 42.6977, lng: 23.3219 }; // Sofia
var FIND_US_DEFAULT_ZOOM = 8;

/* --- Marker icon URLs (upload these SVGs to Webflow CDN) --- */
var MARKER_SMALL = 'https://a-cdn.xpeng.com//website/_next/static/media/marker-green-small.357bb4af.svg';
var MARKER_DEFAULT = 'https://a-cdn.xpeng.com//website/_next/static/media/marker-green.f58abdfa.svg';
var MARKER_ACTIVE = 'https://a-cdn.xpeng.com//website/_next/static/media/marker-green-active.44ac9244.svg';
var STORE_COVER_FALLBACK = 'https://a-cdn.xpeng.com/www/public/static/img/store-cover.53b1ff54.jpg';


function initFindUs() {
  var container = document.querySelector('[data-find-us]');
  if (!container) return;

  /* --- Refs --- */
  var mapEl = container.querySelector('[data-find-us-map]');
  var sidebar = container.querySelector('[data-find-us-sidebar]');
  var filterRow = container.querySelector('[data-find-us-filters]');
  var storeListEl = container.querySelector('[data-find-us-store-list]');
  var emptyEl = container.querySelector('[data-find-us-empty]');
  var seoEl = container.querySelector('[data-find-us-seo]');
  var mobileFilters = container.querySelector('[data-find-us-mobile-filters]');
  var drawer = container.querySelector('[data-find-us-drawer]');
  var drawerBody = drawer ? drawer.querySelector('[data-find-us-drawer-body]') : null;
  var drawerClose = drawer ? drawer.querySelector('[data-find-us-drawer-close]') : null;

  /* --- State --- */
  var map = null;
  var markers = [];
  var infoWindow = null;
  var activeIndex = -1;
  var filteredStores = FIND_US_STORES.slice();
  var currentRegion = '';
  var currentType = '';
  var isMobile = window.innerWidth <= 960;
  var drawerMode = 'list'; // 'list' | 'detail' | 'filter-region' | 'filter-type'
  var drawerHeight = 'mid';
  var locationCoords = null;

  /* --- Lock body scroll --- */
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';

  /* --- Build desktop filters --- */
  buildDesktopFilters();

  /* --- Load Google Maps --- */
  loadGoogleMapsAPI(function() {
    map = initMap(mapEl);
    infoWindow = new google.maps.InfoWindow();
    renderMarkers();
    renderStoreList();
    renderSeoMarkup();
    initGeolocation();
    initMobileUI();
  });


  /* ============================================
     Google Maps Loader
     ============================================ */

  function loadGoogleMapsAPI(cb) {
    if (window.google && window.google.maps) { cb(); return; }
    if (!GOOGLE_MAPS_KEY) {
      console.warn('[Find Us] No Google Maps API key set. Set GOOGLE_MAPS_KEY in main.js.');
      if (mapEl) mapEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#f0f0f0;font-family:sans-serif;color:#666;padding:2em;text-align:center"><div><p style="font-size:1.25em;margin-bottom:0.5em">Google Maps API key required</p><p style="font-size:0.875em">Set <code>GOOGLE_MAPS_KEY</code> in main.js to enable the map.</p></div></div>';
      /* Still render the sidebar / store list even without map */
      renderStoreList();
      renderSeoMarkup();
      initMobileUI();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=' + GOOGLE_MAPS_KEY + '&v=weekly&language=bg&libraries=geometry,places';
    script.async = true;
    script.defer = true;
    script.onload = function() {
      var poll = setInterval(function() {
        if (window.google && window.google.maps) { clearInterval(poll); cb(); }
      }, 50);
    };
    script.onerror = function() {
      console.error('[Find Us] Failed to load Google Maps API');
    };
    document.head.appendChild(script);
  }


  /* ============================================
     Map Initialization
     ============================================ */

  function initMap(el) {
    if (!el) return null;
    var gmap = new google.maps.Map(el, {
      zoom: FIND_US_DEFAULT_ZOOM,
      center: FIND_US_DEFAULT_CENTER,
      mapTypeControl: false,
      fullscreenControl: false,
      zoomControl: !isMobile,
      streetViewControl: false,
      keyboardShortcuts: false,
      gestureHandling: 'greedy',
      panControl: true
    });

    gmap.addListener('click', function() {
      closeInfoWindow();
      setActiveMarker(-1);
    });

    gmap.addListener('zoom_changed', function() {
      updateMarkerIcons();
    });

    return gmap;
  }


  /* ============================================
     Markers
     ============================================ */

  function renderMarkers() {
    clearMarkers();
    filteredStores.forEach(function(store, i) {
      var marker = new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map: map,
        icon: getMarkerIcon(i),
        title: store.name
      });
      marker.addListener('click', function() {
        onMarkerClick(i);
      });
      markers.push(marker);
    });
  }

  function clearMarkers() {
    markers.forEach(function(m) { m.setMap(null); });
    markers = [];
  }

  function getMarkerIcon(index) {
    var zoom = map ? map.getZoom() : FIND_US_DEFAULT_ZOOM;
    if (index === activeIndex) {
      return { url: zoom < 10 ? MARKER_SMALL : MARKER_ACTIVE, scaledSize: zoom < 10 ? new google.maps.Size(31, 31) : new google.maps.Size(74, 75) };
    }
    return { url: zoom < 10 ? MARKER_SMALL : MARKER_DEFAULT, scaledSize: zoom < 10 ? new google.maps.Size(31, 31) : new google.maps.Size(44, 44) };
  }

  function updateMarkerIcons() {
    markers.forEach(function(m, i) {
      m.setIcon(getMarkerIcon(i));
    });
  }

  function setActiveMarker(index) {
    activeIndex = index;
    if (map) updateMarkerIcons();
  }

  function onMarkerClick(index) {
    setActiveMarker(index);
    var store = filteredStores[index];
    if (!store) return;

    if (isMobile) {
      openDrawerDetail(store, index);
    } else {
      openInfoWindow(store, index);
    }
    panToStore(store);
  }


  /* ============================================
     Pan & Zoom
     ============================================ */

  function panToStore(store) {
    if (!map) return;
    var offset = isMobile
      ? { lat: store.lat, lng: store.lng }
      : { lat: store.lat + 0.08, lng: store.lng - 0.1 };
    map.panTo(offset);
    map.setZoom(11);
  }


  /* ============================================
     Info Window (Desktop)
     ============================================ */

  function openInfoWindow(store, index) {
    if (!infoWindow || !map) return;
    infoWindow.setContent(buildInfoWindowHTML(store));
    infoWindow.setPosition({ lat: store.lat, lng: store.lng });
    infoWindow.open(map, markers[index]);
  }

  function closeInfoWindow() {
    if (infoWindow) infoWindow.close();
  }

  function buildInfoWindowHTML(store) {
    var svc = store.services[0] || {};
    var img = store.coverImage || (svc.storePic || STORE_COVER_FALLBACK);
    var pills = store.services.map(function(s) {
      var cls = s.status === 'open' ? 'find-us-iw__pill is-active' : 'find-us-iw__pill is-coming-soon';
      var suffix = s.status !== 'open' ? ' (Очаквайте скоро)' : '';
      return '<span class="' + cls + '">' + s.label + suffix + '</span>';
    }).join('');

    var email = svc.email ? '<div class="find-us-iw__contact"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> ' + svc.email + '</div>' : '';
    var phone = svc.phone ? '<div class="find-us-iw__contact"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ' + svc.phone + '</div>' : '';

    var buttons = '';
    var hasExperience = store.services.some(function(s) { return s.type === 'experience' && s.status === 'open'; });
    if (hasExperience) {
      buttons += '<button class="find-us-iw__btn" onclick="window.open(\'/test-drive\',\'_blank\')">ТЕСТ ДРАЙВ</button>';
    }

    return '<div class="find-us-iw">' +
      '<div class="find-us-iw__img"><img src="' + img + '" alt="' + store.name + '"></div>' +
      '<div class="find-us-iw__body">' +
        '<div class="find-us-iw__name">' + store.name + '</div>' +
        '<div class="find-us-iw__address">' + store.address + '</div>' +
        '<div class="find-us-iw__pills">' + pills + '</div>' +
        email + phone +
        (buttons ? '<div class="find-us-iw__buttons">' + buttons + '</div>' : '') +
      '</div>' +
    '</div>';
  }


  /* ============================================
     Desktop Filters
     ============================================ */

  function buildDesktopFilters() {
    if (!filterRow) return;
    var cities = getUniqueCities();

    /* Create selects dynamically (Webflow doesn't allow <select> outside forms) */
    var selectStyle = 'flex:1;padding:0.5em 0.75em;border:1px solid #d4d4d4;border-radius:0.25em;font-size:0.875em;color:#1a1a1a;background:#fff;cursor:pointer;font-family:inherit;-webkit-appearance:none;appearance:none;';
    var regionSelect = document.createElement('select');
    regionSelect.className = 'find-us__filter';
    regionSelect.style.cssText = selectStyle;
    regionSelect.setAttribute('data-find-us-filter', 'region');
    regionSelect.innerHTML = '<option value="">Всички региони</option>';
    cities.forEach(function(c) {
      regionSelect.innerHTML += '<option value="' + c + '">' + c + '</option>';
    });
    regionSelect.addEventListener('change', function() {
      currentRegion = this.value;
      applyFilters();
    });
    filterRow.appendChild(regionSelect);

    var typeSelect = document.createElement('select');
    typeSelect.className = 'find-us__filter';
    typeSelect.style.cssText = selectStyle;
    typeSelect.setAttribute('data-find-us-filter', 'type');
    typeSelect.innerHTML = '<option value="">Всички типове</option>';
    FIND_US_SERVICE_TYPES.forEach(function(t) {
      typeSelect.innerHTML += '<option value="' + t.value + '">' + t.label + '</option>';
    });
    typeSelect.addEventListener('change', function() {
      currentType = this.value;
      applyFilters();
    });
    filterRow.appendChild(typeSelect);
  }

  function getUniqueCities() {
    var seen = {};
    var cities = [];
    FIND_US_STORES.forEach(function(s) {
      if (s.city && !seen[s.city]) {
        seen[s.city] = true;
        cities.push(s.city);
      }
    });
    return cities.sort();
  }

  function applyFilters() {
    filteredStores = FIND_US_STORES.filter(function(store) {
      var matchRegion = !currentRegion || store.city === currentRegion;
      var matchType = !currentType || store.services.some(function(s) { return s.type === currentType; });
      return matchRegion && matchType;
    });

    closeInfoWindow();
    setActiveMarker(-1);
    if (map) { renderMarkers(); }
    renderStoreList();

    if (filteredStores.length && map) {
      var bounds = new google.maps.LatLngBounds();
      filteredStores.forEach(function(s) { bounds.extend({ lat: s.lat, lng: s.lng }); });
      map.fitBounds(bounds);
      if (filteredStores.length === 1) map.setZoom(13);
    }

    if (isMobile) openDrawerList();
  }


  /* ============================================
     Store List (Desktop Sidebar)
     ============================================ */

  function renderStoreList() {
    if (!storeListEl) return;
    if (!filteredStores.length) {
      storeListEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = '';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    storeListEl.innerHTML = filteredStores.map(function(store, i) {
      return buildStoreCardHTML(store, i);
    }).join('');

    /* Bind click events */
    Array.from(storeListEl.querySelectorAll('[data-store-index]')).forEach(function(card) {
      var idx = parseInt(card.getAttribute('data-store-index'), 10);

      /* Card click → pan map */
      card.addEventListener('click', function(e) {
        if (e.target.closest('.find-us__service-pill') || e.target.closest('.find-us__hours-toggle') || e.target.closest('a')) return;
        setActiveMarker(idx);
        var store = filteredStores[idx];
        if (store && map) {
          panToStore(store);
          openInfoWindow(store, idx);
        }
      });

      /* Service pill clicks */
      Array.from(card.querySelectorAll('.find-us__service-pill')).forEach(function(pill) {
        pill.addEventListener('click', function(e) {
          e.stopPropagation();
          var svcIdx = parseInt(this.getAttribute('data-svc-index'), 10);
          toggleServiceDetail(card, filteredStores[idx], svcIdx);
        });
      });

      /* Hours toggle */
      var toggle = card.querySelector('.find-us__hours-toggle');
      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          var week = card.querySelector('.find-us__hours-week');
          var today = card.querySelector('.find-us__hours-today');
          if (!week) return;
          var isOpen = week.style.display !== 'none';
          week.style.display = isOpen ? 'none' : '';
          if (today) today.style.display = isOpen ? '' : 'none';
          this.querySelector('.find-us__toggle-text').textContent = isOpen ? 'Повече информация' : 'По-малко';
          var arrow = this.querySelector('.find-us__toggle-arrow');
          if (arrow) arrow.classList.toggle('is-expanded', !isOpen);
        });
      }
    });
  }

  function buildStoreCardHTML(store, index) {
    var svc0 = store.services[0] || {};

    /* Service pills */
    var pills = store.services.map(function(s, si) {
      var cls = 'find-us__service-pill';
      if (si === 0) cls += ' is-active';
      if (s.status !== 'open') cls += ' is-coming-soon';
      var suffix = s.status !== 'open' ? ' (Очаквайте скоро)' : '';
      return '<li class="' + cls + '" data-svc-index="' + si + '">' + s.label + suffix + '</li>';
    }).join('');

    /* Contact for first service */
    var contact = buildServiceDetailHTML(svc0);

    /* Test drive button */
    var hasExperience = store.services.some(function(s) { return s.type === 'experience' && s.status === 'open'; });
    var tdBtn = hasExperience
      ? '<a href="/test-drive" class="find-us__cta-button">Тест Драйв</a>'
      : '';

    return '<div class="find-us__store-card" data-store-index="' + index + '">' +
      '<div class="find-us__store-name">' + store.name + '</div>' +
      '<div class="find-us__store-address">' + store.address + '</div>' +
      '<div class="find-us__service-list"><ol>' + pills + '</ol></div>' +
      '<div class="find-us__service-detail">' + contact + '</div>' +
      tdBtn +
    '</div>';
  }

  function buildServiceDetailHTML(svc) {
    if (!svc || !svc.email && !svc.phone) return '';
    var html = '';

    if (svc.email) {
      html += '<div class="find-us__store-email">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> ' +
        svc.email +
      '</div>';
    }

    if (svc.phone) {
      html += '<a href="tel:' + svc.phone.replace(/\s/g, '') + '" class="find-us__store-phone">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ' +
        svc.phone +
      '</a>';
    }

    /* Opening hours */
    var hours = buildHoursHTML(svc.hours);
    if (hours) html += hours;

    return html;
  }

  function toggleServiceDetail(card, store, svcIndex) {
    /* Update active pill */
    Array.from(card.querySelectorAll('.find-us__service-pill')).forEach(function(p, i) {
      p.classList.toggle('is-active', i === svcIndex);
    });
    /* Re-render detail */
    var detailEl = card.querySelector('.find-us__service-detail');
    if (detailEl && store.services[svcIndex]) {
      detailEl.innerHTML = buildServiceDetailHTML(store.services[svcIndex]);
      /* Re-bind hours toggle */
      var toggle = detailEl.querySelector('.find-us__hours-toggle');
      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.stopPropagation();
          var week = detailEl.querySelector('.find-us__hours-week');
          var today = detailEl.querySelector('.find-us__hours-today');
          if (!week) return;
          var isOpen = week.style.display !== 'none';
          week.style.display = isOpen ? 'none' : '';
          if (today) today.style.display = isOpen ? '' : 'none';
          this.querySelector('.find-us__toggle-text').textContent = isOpen ? 'Повече информация' : 'По-малко';
          var arrow = this.querySelector('.find-us__toggle-arrow');
          if (arrow) arrow.classList.toggle('is-expanded', !isOpen);
        });
      }
    }
  }


  /* ============================================
     Opening Hours
     ============================================ */

  function buildHoursHTML(hours) {
    if (!hours) return '';
    var DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
    var DAY_LABELS = { monday:'Понеделник', tuesday:'Вторник', wednesday:'Сряда', thursday:'Четвъртък', friday:'Петък', saturday:'Събота', sunday:'Неделя' };
    var jsDay = new Date().getDay(); // 0=Sun
    var todayKey = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'][jsDay];

    var hasAny = DAYS.some(function(d) { return hours[d]; });
    if (!hasAny) return '';

    var todayVal = hours[todayKey] || '';

    /* Today row */
    var todayHTML = todayVal
      ? '<div class="find-us__hours-today"><span class="find-us__hours-day">' + DAY_LABELS[todayKey] + '</span><span class="find-us__hours-time">' + todayVal + '</span></div>'
      : '';

    /* Full week */
    var weekRows = DAYS.map(function(d) {
      if (!hours[d]) return '';
      return '<div class="find-us__hours-day-row"><span class="find-us__hours-day">' + DAY_LABELS[d] + '</span><span class="find-us__hours-time">' + hours[d] + '</span></div>';
    }).join('');

    return '<div class="find-us__hours">' +
      '<div class="find-us__hours-title">Работно време</div>' +
      todayHTML +
      '<div class="find-us__hours-week" style="display:none">' + weekRows + '</div>' +
      '<div class="find-us__hours-toggle">' +
        '<span class="find-us__toggle-text">Повече информация</span>' +
        '<svg class="find-us__toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>' +
      '</div>' +
    '</div>';
  }


  /* ============================================
     Mobile UI
     ============================================ */

  function initMobileUI() {
    if (!isMobile) return;
    if (!drawer || !drawerBody) return;

    /* Hide desktop sidebar */
    if (sidebar) sidebar.style.display = 'none';

    /* Show mobile filters */
    if (mobileFilters) {
      mobileFilters.style.display = '';
      buildMobileFilters();
    }

    /* Show drawer with store list */
    openDrawerList();

    /* Close button */
    if (drawerClose) {
      drawerClose.addEventListener('click', function() {
        closeDrawer();
      });
    }

    /* Drag to resize */
    initDrawerDrag();
  }

  function buildMobileFilters() {
    if (!mobileFilters) return;
    var tabs = mobileFilters.querySelectorAll('[data-find-us-mobile-tab]');
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var filter = this.getAttribute('data-find-us-mobile-tab');
        if (filter === 'region') openDrawerFilterRegion();
        else if (filter === 'type') openDrawerFilterType();
      });
    });
  }

  function openDrawerList() {
    if (!drawer || !drawerBody) return;
    drawerMode = 'list';
    drawer.classList.add('is-open');
    setDrawerHeight('mid');

    if (!filteredStores.length) {
      drawerBody.innerHTML = '<div class="find-us-mobile__empty"><p>Няма намерени обекти в този район.</p></div>';
      return;
    }

    drawerBody.innerHTML = filteredStores.map(function(store, i) {
      return buildMobileStoreCardHTML(store, i);
    }).join('');

    /* Bind card clicks */
    Array.from(drawerBody.querySelectorAll('[data-store-index]')).forEach(function(card) {
      var idx = parseInt(card.getAttribute('data-store-index'), 10);
      card.addEventListener('click', function() {
        var store = filteredStores[idx];
        if (!store) return;
        setActiveMarker(idx);
        panToStore(store);
        openDrawerDetail(store, idx);
      });
    });
  }

  function buildMobileStoreCardHTML(store, index) {
    var pills = store.services.map(function(s) {
      var cls = 'find-us-mobile__pill';
      if (s.status !== 'open') cls += ' is-coming-soon';
      var suffix = s.status !== 'open' ? ' (Очаквайте скоро)' : '';
      return '<span class="' + cls + '">' + s.label + suffix + '</span>';
    }).join('');

    return '<div class="find-us-mobile__store-card" data-store-index="' + index + '">' +
      '<div class="find-us-mobile__store-name">' + store.name + '</div>' +
      '<div class="find-us-mobile__store-address">' + store.address + '</div>' +
      '<div class="find-us-mobile__pills">' + pills + '</div>' +
    '</div>';
  }

  function openDrawerDetail(store, index) {
    if (!drawer || !drawerBody) return;
    drawerMode = 'detail';
    setDrawerHeight('mid');
    drawer.classList.add('is-open');

    var svc = store.services[0] || {};
    var img = store.coverImage || STORE_COVER_FALLBACK;

    var pills = store.services.map(function(s, si) {
      var cls = 'find-us-mobile__pill';
      if (si === 0) cls += ' is-active';
      if (s.status !== 'open') cls += ' is-coming-soon';
      var suffix = s.status !== 'open' ? ' (Очаквайте скоро)' : '';
      return '<span class="' + cls + '" data-svc-index="' + si + '">' + s.label + suffix + '</span>';
    }).join('');

    var contact = buildServiceDetailHTML(svc);

    var hasExperience = store.services.some(function(s) { return s.type === 'experience' && s.status === 'open'; });
    var buttons = '';
    if (hasExperience) {
      buttons = '<div class="find-us-mobile__buttons"><a href="/test-drive" class="find-us-mobile__cta-btn">Тест Драйв</a></div>';
    }

    drawerBody.innerHTML =
      '<div class="find-us-mobile__detail">' +
        '<div class="find-us-mobile__detail-name">' + store.name + '</div>' +
        '<div class="find-us-mobile__detail-address">' + store.address + '</div>' +
        '<div class="find-us-mobile__detail-img"><img src="' + img + '" alt="' + store.name + '"></div>' +
        '<div class="find-us-mobile__detail-pills">' + pills + '</div>' +
        '<div class="find-us-mobile__detail-contact">' + contact + '</div>' +
        buttons +
      '</div>';

    /* Bind pill clicks */
    Array.from(drawerBody.querySelectorAll('[data-svc-index]')).forEach(function(pill) {
      pill.addEventListener('click', function() {
        var svcIdx = parseInt(this.getAttribute('data-svc-index'), 10);
        var s = store.services[svcIdx];
        if (!s) return;
        Array.from(drawerBody.querySelectorAll('[data-svc-index]')).forEach(function(p, i) {
          p.classList.toggle('is-active', i === svcIdx);
        });
        var contactEl = drawerBody.querySelector('.find-us-mobile__detail-contact');
        if (contactEl) contactEl.innerHTML = buildServiceDetailHTML(s);
      });
    });
  }

  function openDrawerFilterRegion() {
    if (!drawer || !drawerBody) return;
    drawerMode = 'filter-region';
    drawer.classList.add('is-open');
    setDrawerHeight('mid');

    var cities = getUniqueCities();
    var items = '<div class="find-us-mobile__filter-option" data-value="">Всички</div>';
    cities.forEach(function(c) {
      items += '<div class="find-us-mobile__filter-option" data-value="' + c + '">' + c + '</div>';
    });
    drawerBody.innerHTML = '<div class="find-us-mobile__filter-list">' + items + '</div>';

    Array.from(drawerBody.querySelectorAll('[data-value]')).forEach(function(opt) {
      opt.addEventListener('click', function() {
        currentRegion = this.getAttribute('data-value');
        applyFilters();
        /* Update tab label */
        var tab = mobileFilters ? mobileFilters.querySelector('[data-find-us-mobile-tab="region"]') : null;
        if (tab) tab.textContent = currentRegion || 'Регион';
      });
    });
  }

  function openDrawerFilterType() {
    if (!drawer || !drawerBody) return;
    drawerMode = 'filter-type';
    drawer.classList.add('is-open');
    setDrawerHeight('mid');

    var items = '<div class="find-us-mobile__filter-option" data-value="">Всички</div>';
    FIND_US_SERVICE_TYPES.forEach(function(t) {
      items += '<div class="find-us-mobile__filter-option" data-value="' + t.value + '">' + t.label + '</div>';
    });
    drawerBody.innerHTML = '<div class="find-us-mobile__filter-list">' + items + '</div>';

    Array.from(drawerBody.querySelectorAll('[data-value]')).forEach(function(opt) {
      opt.addEventListener('click', function() {
        currentType = this.getAttribute('data-value');
        applyFilters();
        var tab = mobileFilters ? mobileFilters.querySelector('[data-find-us-mobile-tab="type"]') : null;
        if (tab) tab.textContent = currentType ? FIND_US_SERVICE_TYPES.find(function(t) { return t.value === currentType; }).label : 'Тип';
      });
    });
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawerMode = 'list';
  }

  function setDrawerHeight(h) {
    drawerHeight = h;
    if (!drawer) return;
    var heights = { min: '30vh', mid: '50vh', max: '80vh' };
    var content = drawer.querySelector('.find-us-drawer__content');
    if (content) content.style.height = heights[h] || '50vh';
  }

  function initDrawerDrag() {
    var handle = drawer ? drawer.querySelector('[data-find-us-drawer-handle]') : null;
    if (!handle) return;
    var startY = 0;
    var startHeight = 'mid';

    handle.addEventListener('touchstart', function(e) {
      startY = e.touches[0].clientY;
      startHeight = drawerHeight;
    }, { passive: true });

    handle.addEventListener('touchmove', function(e) {
      var dy = startY - e.touches[0].clientY;
      if (Math.abs(dy) < 50) return;
      if (dy > 0) { // drag up
        if (startHeight === 'min') setDrawerHeight('mid');
        else if (startHeight === 'mid') setDrawerHeight('max');
      } else { // drag down
        if (startHeight === 'max') setDrawerHeight('mid');
        else if (startHeight === 'mid') setDrawerHeight('min');
      }
      startY = e.touches[0].clientY;
      startHeight = drawerHeight;
    }, { passive: true });
  }


  /* ============================================
     Geolocation
     ============================================ */

  function initGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        if (!pos || !pos.coords) return;
        locationCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (map) {
          map.panTo(locationCoords);
          map.setZoom(10);
        }
      },
      function() { /* denied or error — use default center */ }
    );
  }


  /* ============================================
     SEO Markup (hidden Schema.org)
     ============================================ */

  function renderSeoMarkup() {
    if (!seoEl) return;
    var DAYS_EN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var DAYS_KEY = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    seoEl.innerHTML = FIND_US_STORES.map(function(store) {
      var hoursMarkup = '';
      if (store.services[0] && store.services[0].hours) {
        var h = store.services[0].hours;
        hoursMarkup = DAYS_KEY.map(function(d, i) {
          if (!h[d]) return '';
          return '<div itemprop="openingHoursSpecification" itemscope itemtype="https://schema.org/OpeningHoursSpecification">' +
            '<meta itemprop="dayOfWeek" content="https://schema.org/' + DAYS_EN[i] + '">' +
            '<span>' + h[d] + '</span>' +
          '</div>';
        }).join('');
      }

      return '<div itemscope itemtype="https://schema.org/LocalBusiness">' +
        '<h3 itemprop="name">' + store.name + '</h3>' +
        '<div itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">' +
          '<span itemprop="streetAddress">' + store.address + '</span>' +
        '</div>' +
        '<span itemprop="email">' + store.email + '</span>' +
        '<span itemprop="telephone">' + store.phone + '</span>' +
        hoursMarkup +
        '<div itemprop="geo" itemscope itemtype="https://schema.org/GeoCoordinates">' +
          '<meta itemprop="latitude" content="' + store.lat + '">' +
          '<meta itemprop="longitude" content="' + store.lng + '">' +
        '</div>' +
      '</div>';
    }).join('');
  }
}


/* ============================================================
   11. INIT
   ============================================================ */

function init() {
  const mm = gsap.matchMedia();
  const isDesktop = window.innerWidth > 991;

  // Functional components — run regardless of motion preference
  initFormConsent();
  initFieldValidation();
  initModal();
  initDrawer();
  initMobileNav();
  initNavMega();
  initCategorySliders();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    if (isDesktop) initLenis();
    initNavScrollBehavior();
    initTextReveals();
    initElementReveals();
    routePage();
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    if (isDesktop) initLenis();
    routePage();

    gsap.set('[data-split="heading"]', { visibility: 'visible' });
    gsap.set('[data-reveal-group] > *', { autoAlpha: 1, y: 0 });
  });
}

document.addEventListener('DOMContentLoaded', init);
