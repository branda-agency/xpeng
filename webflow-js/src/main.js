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
const CONFIGURATOR_SLUGS = ['g9', 'g6', 'p7-plus'];

function routePage() {
  const path = window.location.pathname.replace(/^\/|\/$/g, '') || 'home';
  const segments = path.split('/');
  const slug = segments[segments.length - 1];

  if (path === 'home') initHomePage();
  else if (segments.includes('configurator') && CONFIGURATOR_SLUGS.includes(slug)) {
    if (lenis) lenis.destroy();
    initConfiguratorPage(slug);
  }
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

  const { interval, crossfadeDuration, ease } = CONFIG.heroSlider;
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


/* ============================================================
   10b. MODELS CAROUSEL
   ============================================================ */

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
  let isAnimating = false;

  // Initial state
  gsap.set(slides, { xPercent: 100, autoAlpha: 1 });
  gsap.set(slides[0], { xPercent: 0 });
  gsap.set(infos, { autoAlpha: 0, position: 'absolute', left: 0, right: 0 });
  gsap.set(infos[0], { autoAlpha: 1 });
  gsap.set(watermarks, { autoAlpha: 0, y: '0.5em' });
  gsap.set(watermarks[0], { autoAlpha: 1, y: 0 });

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

}

/* ============================================================
   10c. PEEK SLIDER
   ============================================================ */

function initPeekSlider() {
  const section = document.querySelector('[data-peek-slider]');
  if (!section) return;

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
    ],
    accessories: [
      { variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Електрически теглич', price: 1260, description: 'Електрически прибиращ се теглич с максимално теглително тегло 1500 кг.', image: '', sort_order: 1 },
    ],
  },
  g6: {
    model: { model_slug: 'g6', model_name: 'XPENG G6', starting_price: 43600 },
    variants: [
      { variant_code: 'rwd-sr', variant_name: 'RWD Standard Range', price: 43600, is_default: true, range_km: 435, power_kw: 218, acceleration: '6.7s', delivery_time: 'Q4 2026', sort_order: 1 },
      { variant_code: 'rwd-lr', variant_name: 'RWD Long Range', price: 47600, is_default: false, range_km: 570, power_kw: 218, acceleration: '6.7s', delivery_time: 'Q4 2026', sort_order: 2 },
      { variant_code: 'awd', variant_name: 'AWD Performance', price: 51600, is_default: false, range_km: 460, power_kw: 358, acceleration: '3.9s', delivery_time: 'Q1 2027', sort_order: 3 },
    ],
    colors: [
      { variant_code: 'all', color_code: 'arctic-white', color_name: 'Arctic White', color_hex: '#F0EDE8', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', color_code: 'silver-frost', color_name: 'Silver Frost', color_hex: '#B8B8B8', price: 800, is_default: false, sort_order: 2 },
      { variant_code: 'all', color_code: 'graphite-gray', color_name: 'Graphite Gray', color_hex: '#707070', price: 800, is_default: false, sort_order: 3 },
      { variant_code: 'all', color_code: 'midnight-black', color_name: 'Midnight Black', color_hex: '#2D2D2D', price: 800, is_default: false, sort_order: 4 },
      { variant_code: 'all', color_code: 'fiery-orange', color_name: 'Fiery Orange', color_hex: '#C75B12', price: 800, is_default: false, sort_order: 5 },
    ],
    interiors: [
      { variant_code: 'all', interior_code: 'black', interior_name: 'Black Leatherette', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', interior_code: 'gray', interior_name: 'Gray Leatherette', price: 0, is_default: false, sort_order: 2 },
    ],
    wheels: [{ variant_code: 'all', wheel_code: '20-standard', wheel_name: '20" Standard', price: 0, is_default: true, sort_order: 1 }],
    accessories: [{ variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Електрически теглич', price: 1160, description: 'Електрически прибиращ се теглич.', image: '', sort_order: 1 }],
  },
  'p7-plus': {
    model: { model_slug: 'p7-plus', model_name: 'XPENG P7+', starting_price: 46600 },
    variants: [
      { variant_code: 'rwd-sr', variant_name: 'RWD Standard Range', price: 46600, is_default: true, range_km: 502, power_kw: 235, acceleration: '6.4s', delivery_time: 'Q4 2026', sort_order: 1 },
      { variant_code: 'rwd-lr', variant_name: 'RWD Long Range', price: 49600, is_default: false, range_km: 710, power_kw: 235, acceleration: '6.4s', delivery_time: 'Q4 2026', sort_order: 2 },
      { variant_code: 'awd', variant_name: 'AWD Performance', price: 53600, is_default: false, range_km: 610, power_kw: 430, acceleration: '3.6s', delivery_time: 'Q1 2027', sort_order: 3 },
    ],
    colors: [
      { variant_code: 'all', color_code: 'arctic-white', color_name: 'Arctic White', color_hex: '#F0EDE8', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', color_code: 'silver-frost', color_name: 'Silver Frost', color_hex: '#B8B8B8', price: 800, is_default: false, sort_order: 2 },
      { variant_code: 'all', color_code: 'graphite-gray', color_name: 'Graphite Gray', color_hex: '#707070', price: 800, is_default: false, sort_order: 3 },
      { variant_code: 'all', color_code: 'midnight-black', color_name: 'Midnight Black', color_hex: '#2D2D2D', price: 800, is_default: false, sort_order: 4 },
    ],
    interiors: [
      { variant_code: 'all', interior_code: 'black', interior_name: 'Black Nappa', price: 0, is_default: true, sort_order: 1 },
      { variant_code: 'all', interior_code: 'white', interior_name: 'White Nappa', price: 0, is_default: false, sort_order: 2 },
    ],
    wheels: [{ variant_code: 'all', wheel_code: '19-aero', wheel_name: '19" Aero', price: 0, is_default: true, sort_order: 1 }],
    accessories: [{ variant_code: 'all', accessory_code: 'tow-hitch', accessory_name: 'Електрически теглич', price: 1190, description: 'Електрически прибиращ се теглич.', image: '', sort_order: 1 }],
  },
};

const EUR_TO_BGN = 1.95583;

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
  return items
    .filter((o) => o.variant_code === 'all' || o.variant_code === variantCode)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
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

  // State
  const state = {
    data: null,
    selectedVariant: null,
    selectedColor: null,
    selectedInterior: null,
    selectedWheels: null,
    selectedAccessories: [],
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
  state.selectedWheels = wheels.find((w) => w.is_default) || wheels[0];

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
  if (priceEl) priceEl.textContent = 'от ' + formatPrice(data.model.starting_price) + ' EUR';
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
    if (specs) {
      var specParts = [];
      if (variant.energy_consumption) specParts.push(variant.energy_consumption);
      specParts.push('CO2: 0 g/km');
      specs.innerHTML = specParts.join('; ');
    }

    const price = card.querySelector('[data-cfg-variant-price]');
    if (price) price.textContent = formatPrice(variant.price) + ' EUR';

    // Expandable details
    const details = card.querySelector('[data-cfg-variant-details]');
    const expandBtn = card.querySelector('[data-cfg-variant-expand]');
    if (details && expandBtn) {
      var detailRows = [
        ['Обхват', variant.range_km + ' km'],
        ['Мощност', variant.power_kw + ' kW'],
        ['Ускорение 0-100', variant.acceleration],
        ['Макс. скорост', variant.top_speed + ' km/h'],
        ['Батерия', variant.battery_kwh + ' kWh ' + (variant.battery_type || '')],
        ['DC зареждане', variant.dc_charge_power_kw + ' kW — ' + (variant.dc_charge_time || '')],
        ['AC зареждане', variant.ac_charge_time || ''],
        ['Задвижване', variant.drivetrain || ''],
        ['Окачване', variant.suspension || ''],
      ];
      details.innerHTML = detailRows
        .filter(function(r) { return r[1] && r[1] !== 'undefined' && r[1] !== 'undefined km/h'; })
        .map(function(r) { return '<div class="configurator__detail-row"><span class="configurator__detail-label">' + r[0] + '</span><span class="configurator__detail-value">' + r[1] + '</span></div>'; })
        .join('');

      expandBtn.textContent = 'Повече';
      expandBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = card.hasAttribute('data-cfg-expanded');
        if (isOpen) {
          card.removeAttribute('data-cfg-expanded');
          expandBtn.textContent = 'Повече';
        } else {
          card.setAttribute('data-cfg-expanded', '');
          expandBtn.textContent = 'По-малко';
        }
      });
    }

    if (variant.variant_code === state.selectedVariant?.variant_code) {
      card.setAttribute('data-cfg-active', '');
    }

    card.addEventListener('click', function(e) {
      if (e.target.closest('[data-cfg-variant-expand]')) return;
      const prevVariant = state.selectedVariant?.variant_code;
      setState({ selectedVariant: variant }, 'variant');

      // Re-filter options if variant changed
      if (prevVariant !== variant.variant_code) {
        const colors = getOptionsForVariant(data.colors, variant.variant_code);
        const curColor = colors.find((c) => c.color_code === state.selectedColor?.color_code);
        setState({ selectedColor: curColor || colors.find((c) => c.is_default) || colors[0] }, 'color');

        const interiors = getOptionsForVariant(data.interiors, variant.variant_code);
        const curInt = interiors.find((i) => i.interior_code === state.selectedInterior?.interior_code);
        setState({ selectedInterior: curInt || interiors.find((i) => i.is_default) || interiors[0] }, 'interior');

        const wheels = getOptionsForVariant(data.wheels, variant.variant_code);
        const curWhl = wheels.find((w) => w.wheel_code === state.selectedWheels?.wheel_code);
        setState({ selectedWheels: curWhl || wheels.find((w) => w.is_default) || wheels[0] }, 'wheels');

        renderColors(root, state, data, setState);
        renderInteriors(root, state, data, setState);
        renderWheels(root, state, data, setState);
      }
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
    if (dot) dot.style.backgroundColor = color.color_hex;

    const name = el.querySelector('[data-cfg-swatch-name]');
    if (name) name.textContent = color.color_name;

    const price = el.querySelector('[data-cfg-swatch-price]');
    if (price) price.textContent = color.price > 0 ? '+' + formatPrice(color.price) + ' EUR' : '';

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

  const wheels = getOptionsForVariant(data.wheels, state.selectedVariant?.variant_code);

  // Hide step if only 1 or 0 options
  if (step && wheels.length <= 1) {
    step.style.display = 'none';
    return;
  } else if (step) {
    step.style.display = '';
  }

  container.innerHTML = '';

  wheels.forEach((wheel) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-wheel-option', wheel.wheel_code);

    const thumb = el.querySelector('.configurator__wheel-thumb');
    if (thumb && wheel.image_thumb) thumb.src = wheel.image_thumb;

    const name = el.querySelector('[data-cfg-wheel-name]');
    if (name) name.textContent = wheel.wheel_name;

    const price = el.querySelector('[data-cfg-wheel-price]');
    if (price) price.textContent = wheel.price > 0 ? '+' + formatPrice(wheel.price) + ' EUR' : '';

    if (wheel.wheel_code === state.selectedWheels?.wheel_code) {
      el.setAttribute('data-cfg-active', '');
    }

    el.addEventListener('click', () => {
      setState({ selectedWheels: wheel }, 'wheels');
    });

    container.appendChild(el);
  });
}

function renderAccessories(root, state, data, setState) {
  const container = root.querySelector('[data-cfg-accessories]');
  if (!container) return;
  const template = container.querySelector('[data-cfg-accessory]') || container.lastElementChild;
  if (!template) return;

  const accessories = getOptionsForVariant(data.accessories, state.selectedVariant?.variant_code);
  container.innerHTML = '';

  accessories.forEach((acc) => {
    const el = template.cloneNode(true);
    el.setAttribute('data-cfg-accessory', acc.accessory_code);

    const img = el.querySelector('.configurator__accessory-img');
    if (img && acc.image) img.src = acc.image;

    const name = el.querySelector('[data-cfg-accessory-name]');
    if (name) name.textContent = acc.accessory_name;

    const price = el.querySelector('[data-cfg-accessory-price]');
    if (price) price.textContent = formatPrice(acc.price) + ' EUR';

    const desc = el.querySelector('[data-cfg-accessory-desc]');
    if (desc) desc.textContent = acc.description || '';

    const toggle = el.querySelector('[data-cfg-accessory-toggle]');
    const isActive = state.selectedAccessories.includes(acc.accessory_code);
    if (toggle) {
      toggle.textContent = isActive ? 'Премахни' : 'Добави';
      if (isActive) el.setAttribute('data-cfg-active', '');
    }

    if (toggle) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const list = [...state.selectedAccessories];
        const idx = list.indexOf(acc.accessory_code);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(acc.accessory_code);
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

  if (changeType === 'color' || changeType === 'variant' || changeType === 'init') {
    updateGallery(root, state, changeType === 'variant');
  }

  if (changeType === 'interior' || changeType === 'init') {
    updateInteriorPreview(root, state);
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
  if (eurEl) eurEl.textContent = formatPrice(totalEur) + ' EUR';
  if (bgnEl) bgnEl.textContent = formatPrice(totalBgn) + ' лв.';
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

function updateGallery(root, state, forceTransition) {
  const images = root.querySelectorAll('.configurator__gallery-img');
  const color = state.selectedColor;
  if (!color || !images.length) return;

  // Single image mode: use image_front for the first gallery image
  const url = color.image_front || '';
  const mainImg = images[0];

  if (url && mainImg) {
    const currentSrc = mainImg.getAttribute('src') || '';
    if (currentSrc !== url) {
      gsap.set(mainImg, { autoAlpha: 0 });
      mainImg.onload = function() { gsap.to(mainImg, { autoAlpha: 1, duration: 0.3 }); };
      mainImg.onerror = function() { gsap.set(mainImg, { autoAlpha: 0 }); };
      mainImg.src = url;
    } else if (forceTransition) {
      // Same image but variant changed — pulse to show feedback
      gsap.fromTo(mainImg, { autoAlpha: 0.5 }, { autoAlpha: 1, duration: 0.4 });
    } else {
      gsap.set(mainImg, { autoAlpha: 1 });
    }
  }

  // Hide remaining gallery images (no multi-angle for now)
  for (var i = 1; i < images.length; i++) {
    gsap.set(images[i], { autoAlpha: 0 });
  }
}


function updateInteriorPreview(root, state) {
  const img = root.querySelector('.configurator__interior-img');
  if (!img) return;
  var url = state.selectedInterior?.image_full || state.selectedInterior?.image_thumb || '';
  if (!url) {
    gsap.set(img, { autoAlpha: 0 });
    return;
  }
  var currentSrc = img.getAttribute('src') || '';
  if (currentSrc !== url) {
    gsap.set(img, { autoAlpha: 0 });
    img.onload = function() { gsap.to(img, { autoAlpha: 1, duration: 0.3 }); };
    img.onerror = function() { gsap.set(img, { autoAlpha: 0 }); };
    img.src = url;
  } else {
    gsap.set(img, { autoAlpha: 1 });
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


function initProductPage() {
  try { initColorPicker(); } catch (e) { console.error('colorPicker:', e); }
  try { initSpecsTabs(); } catch (e) { console.error('specsTabs:', e); }
  try { initTabbedCarousel(); } catch (e) { console.error('tabbedCarousel:', e); }
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
