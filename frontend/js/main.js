/**
 * B&M Blueprint L.L.C. - Main Application Controller
 * UI controller managing Theme Switcher, Hero Window Scroll Illusion,
 * Slide-Out Navigation Drawer, Multi-Page Router, and Estimator logic.
 */

import { BlueprintAPI } from './api.js?v=19';

// HTML Escaping Utility
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Application State
const state = {
  theme: localStorage.getItem('bm_theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  currentPage: 'home',
  program: null,
  tutors: [],
  testimonials: [],
  parentTestimonials: []
};

// Custom Alert Utility
window.showCustomAlert = function(title, message, isError = false) {
  if (!DOM.customAlertBackdrop) return;
  
  DOM.customAlertTitle.textContent = title;
  DOM.customAlertMessage.textContent = message;
  
  if (isError) {
    DOM.customAlertTitle.style.color = '#ef4444'; // Red for error
  } else {
    DOM.customAlertTitle.style.color = 'var(--text-primary)';
  }
  
  // Show it by setting display flex, then wait a tick for the CSS transition
  DOM.customAlertBackdrop.style.display = 'flex';
  setTimeout(() => {
    DOM.customAlertBackdrop.classList.add('is-visible');
  }, 10);
};


// Vector SVG Symbol Constants for Theme Toggle
const MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-symbol-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-symbol-icon"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

// DOM Registry
const DOM = {
  themeToggleBtn: document.getElementById('theme-toggle-btn'),
  themeIcon: document.getElementById('theme-icon'),
  themeText: document.getElementById('theme-text'),

  headerThemeToggleBtn: document.getElementById('header-theme-toggle-btn'),
  headerThemeIcon: document.getElementById('header-theme-icon'),
  headerThemeText: document.getElementById('header-theme-text'),

  menuTriggerBtn: document.getElementById('menu-trigger-btn'),
  drawerCloseBtn: document.getElementById('drawer-close-btn'),
  slideDrawer: document.getElementById('slide-drawer'),
  drawerBackdrop: document.getElementById('drawer-backdrop'),
  drawerNavLinks: document.querySelectorAll('.drawer-nav-link'),

  heroWindowBg: document.getElementById('hero-window-bg'),

  pages: document.querySelectorAll('.page-view'),
  navButtons: document.querySelectorAll('[data-page-target]'),

  // Dynamic Content Mounts
  timelineContainer: document.getElementById('timeline-container'),
  tutorsContainer: document.getElementById('tutors-container'),
  testimonialsContainer: document.getElementById('testimonials-container'),
  parentTestimonialsContainer: document.getElementById('parent-testimonials-container'),

  // Hero Section Dynamic Elements
  heroWrapper: document.getElementById('hero-wrapper'),
  heroTaglineText: document.getElementById('hero-tagline-text'),
  heroWindowFrame: document.getElementById('hero-window-frame'),
  heroCenteredBanner: document.getElementById('hero-centered-banner'),
  heroBadgePill: document.getElementById('hero-badge-pill'),
  heroBannerTagline: document.getElementById('hero-banner-tagline'),
  heroBannerSubtitle: document.getElementById('hero-banner-subtitle'),
  heroBannerActions: document.getElementById('hero-banner-actions'),

  // Private Tutoring Calculator
  tutoringHoursInput: document.getElementById('tutoring-hours-input'),
  tutoringSubjectSelect: document.getElementById('tutoring-subject-select'),
  calculatorOutput: document.getElementById('calculator-output'),

  // Contact Form
  contactForm: document.getElementById('contact-form'),
  contactSubmitBtn: document.getElementById('contact-submit-btn'),
  contactReason: document.getElementById('contact-reason'),
  contactSubject: document.getElementById('contact-subject'),
  contactMessage: document.getElementById('contact-message'),
  subjectContainer: document.getElementById('subject-container'),
  messageContainer: document.getElementById('message-container'),

  // Testimonial Form
  testimonialForm: document.getElementById('testimonial-form'),
  testimonialCohort: document.getElementById('testimonial-cohort'),
  testimonialRatingContainer: document.getElementById('testimonial-rating-container'),
  testimonialRating: document.getElementById('testimonial-rating'),
  testimonialMessageContainer: document.getElementById('testimonial-message-container'),
  testimonialMessage: document.getElementById('testimonial-message'),
  testimonialSubmitBtn: document.getElementById('testimonial-submit-btn'),

  // Parent Testimonial Form
  parentTestimonialForm: document.getElementById('parent-testimonial-form'),
  parentTestimonialCohort: document.getElementById('parent-testimonial-cohort'),
  parentTestimonialRatingContainer: document.getElementById('parent-testimonial-rating-container'),
  parentTestimonialRating: document.getElementById('parent-testimonial-rating'),
  parentTestimonialMessageContainer: document.getElementById('parent-testimonial-message-container'),
  parentTestimonialMessage: document.getElementById('parent-testimonial-message'),
  parentTestimonialSubmitBtn: document.getElementById('parent-testimonial-submit-btn'),

  // Custom Alert Modal
  customAlertBackdrop: document.getElementById('custom-alert-backdrop'),
  customAlertTitle: document.getElementById('custom-alert-title'),
  customAlertMessage: document.getElementById('custom-alert-message'),
  customAlertBtn: document.getElementById('custom-alert-btn')
};

/**
 * App Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDrawerMenu();
  initRouter();
  loadAllData();
  initCalculators();
  initForms();
  initScrollAnimations();
  triggerHeroBannerAnimation();
  requestAnimationFrame(() => {
    checkViewportReveals();
  });
});

/**
 * Theme Switcher Logic (Default Light Mode with Dark Mode Toggle)
 */
function initTheme() {
  applyTheme(state.theme);

  const toggleTheme = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('bm_theme', state.theme);
    applyTheme(state.theme);
  };

  if (DOM.themeToggleBtn) DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  if (DOM.headerThemeToggleBtn) DOM.headerThemeToggleBtn.addEventListener('click', toggleTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const iconMarkup = theme === 'light' ? MOON_SVG : SUN_SVG;
  const textLabel = theme === 'light' ? 'Dark Mode' : 'Light Mode';

  if (DOM.themeText) DOM.themeText.textContent = textLabel;
  if (DOM.themeIcon) DOM.themeIcon.innerHTML = iconMarkup;

  if (DOM.headerThemeText) DOM.headerThemeText.textContent = textLabel;
  if (DOM.headerThemeIcon) DOM.headerThemeIcon.innerHTML = iconMarkup;
}

/**
 * Right Slide-Out Navigation Drawer
 */
function initDrawerMenu() {
  const openDrawer = () => {
    DOM.slideDrawer.classList.add('active');
    DOM.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    DOM.slideDrawer.classList.remove('active');
    DOM.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (DOM.menuTriggerBtn) DOM.menuTriggerBtn.addEventListener('click', openDrawer);
  if (DOM.drawerCloseBtn) DOM.drawerCloseBtn.addEventListener('click', closeDrawer);
  if (DOM.drawerBackdrop) DOM.drawerBackdrop.addEventListener('click', closeDrawer);

  DOM.drawerNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeDrawer();
      const targetPage = link.getAttribute('data-page-target');
      if (targetPage) switchPage(targetPage);
    });
  });
}


const routeMap = {
  'home': '',
  'program': 'our-program',
  'tutors': 'your-tutors',
  'pricing': 'plans-and-pricing',
  'bright-futures': 'bright-futures-info',
  'testimonials': 'testimonials',
  'contact': 'contact-us'
};

const routeMapReverse = Object.fromEntries(
  Object.entries(routeMap).map(([key, value]) => [value, key])
);

/**
 * Multi-Page Navigation Router
 */
function initRouter() {
  // Handle click events
  DOM.navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetPage = btn.getAttribute('data-page-target');
      if (targetPage) {
        e.preventDefault();
        switchPage(targetPage, true);
      }
    });
  });

  // Handle back/forward navigation
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    const pageId = routeMapReverse[hash] || 'home';
    switchPage(pageId, false);
  });

  // Initial load
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && routeMapReverse[initialHash]) {
    switchPage(routeMapReverse[initialHash], false);
  }
}

/**
 * Hero Section Configurations per Page View
 */
const HERO_PAGE_CONFIGS = {
  home: {
    isSubpage: false,
    taglineBoxText: 'Give yourself a real shot at <span>Bright Futures</span>',
    title: 'Tired of generic prep?',
    tabTitle: 'B&M Blueprint L.L.C. | SAT & Academic Tutoring',
    showLearnMore: true
  },
  program: {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Our Program</span>',
    title: 'Our Comprehensive SAT Program',
    tabTitle: 'B&M Blueprint L.L.C. | Our Program',
    showLearnMore: false
  },
  tutors: {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Your Tutors</span>',
    title: 'Meet Your Tutors',
    tabTitle: 'B&M Blueprint L.L.C. | Your Tutors',
    showLearnMore: false
  },
  pricing: {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Plans & Pricing</span>',
    title: 'Program Tuition & Custom Tutoring Rates',
    tabTitle: 'B&M Blueprint L.L.C. | Plans & Pricing',
    showLearnMore: false
  },
  'bright-futures': {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Bright Futures Info</span>',
    title: 'Florida Bright Futures Scholarship',
    tabTitle: 'B&M Blueprint L.L.C. | Bright Futures Info',
    showLearnMore: false
  },
  testimonials: {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Testimonials</span>',
    title: 'Reviews & Testimonials',
    tabTitle: 'B&M Blueprint L.L.C. | Testimonials',
    showLearnMore: false
  },
  contact: {
    isSubpage: true,
    taglineBoxText: 'B&M Blueprint L.L.C. / <span>Contact Us</span>',
    title: 'Get in Touch',
    tabTitle: 'B&M Blueprint L.L.C. | Contact Us',
    showLearnMore: false
  }
};

let isPageSwitching = false;


function triggerHeroBannerAnimation() {
  if (!DOM.heroCenteredBanner) return;
  DOM.heroCenteredBanner.classList.remove('hero-banner-animating', 'animate-entrance');
  void DOM.heroCenteredBanner.offsetWidth; // Force reflow
  DOM.heroCenteredBanner.classList.add('hero-banner-animating');
}

function checkViewportReveals() {
  // On the Homepage, the Hero section spans 100vh; elements below the hero should strictly trigger on scroll
  if (state.currentPage === 'home') return;

  const activePage = document.querySelector('.page-view:not(.hidden)');
  if (!activePage) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const elements = activePage.querySelectorAll('.reveal-init:not(.is-revealed), .reveal-stagger-parent:not(.is-revealed)');

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    // If element's top edge is within or above 92% of viewport height and bottom edge is visible above top
    if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
      el.classList.add('is-revealed');
    }
  });
}

function switchPage(pageId, pushState = false) {
  if (pushState && routeMap) {
    const hash = routeMap[pageId];
    if (hash !== undefined) {
      history.pushState(null, '', hash ? '#' + hash : window.location.pathname);
    }
  }

  state.currentPage = pageId;
  isPageSwitching = true;

  // Reset is-revealed on all child elements for target page
  DOM.pages.forEach(page => {
    if (page.id === `page-${pageId}`) {
      page.classList.remove('hidden');
      
      const revealedElements = page.querySelectorAll('.is-revealed');
      revealedElements.forEach(el => el.classList.remove('is-revealed'));

      // Re-trigger CSS animation cleanly on page switch
      page.classList.remove('page-reload-in');
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          page.classList.add('page-reload-in');
        });
      });
    } else {
      page.classList.add('hidden');
      page.classList.remove('page-reload-in');
    }
  });

  // Update Hero Section for Sub-page vs Home
  const heroConfig = HERO_PAGE_CONFIGS[pageId] || HERO_PAGE_CONFIGS.home;
  
  // Update Document Title Dynamically
  document.title = heroConfig.tabTitle;
  
  if (DOM.heroWrapper && DOM.heroWindowFrame && DOM.heroCenteredBanner) {
    if (heroConfig.isSubpage) {
      DOM.heroWrapper.classList.add('is-subpage');
      DOM.heroWindowFrame.classList.add('is-subpage');
      DOM.heroCenteredBanner.classList.add('is-subpage');
    } else {
      DOM.heroWrapper.classList.remove('is-subpage');
      DOM.heroWindowFrame.classList.remove('is-subpage');
      DOM.heroCenteredBanner.classList.remove('is-subpage');
    }

    if (DOM.heroTaglineText) DOM.heroTaglineText.innerHTML = heroConfig.taglineBoxText;
    if (DOM.heroBannerTagline) DOM.heroBannerTagline.textContent = heroConfig.title;

    if (DOM.heroBannerActions) {
      if (heroConfig.showLearnMore) {
        DOM.heroBannerActions.classList.remove('hidden');
      } else {
        DOM.heroBannerActions.classList.add('hidden');
      }
    }

    // Trigger hero banner fade-in scale animation 100% reliably every time
    triggerHeroBannerAnimation();
  }

  // Update Drawer Nav Links Active State
  DOM.drawerNavLinks.forEach(link => {
    if (link.getAttribute('data-page-target') === pageId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Scroll to top cleanly
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Delay lifting the scroll-reveal lock until after CSS transitions (0.45s) complete
  // This prevents IntersectionObserver from prematurely triggering animations on elements
  // that temporarily pass through the viewport while the layout shifts.
  setTimeout(() => {
    isPageSwitching = false;
    checkViewportReveals(); // Trigger reveals after layout physically settles (specifically for Home -> Subpage shrink)
  }, 500);

  // Immediately reveal all elements currently on-screen in the new page
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      checkViewportReveals();
    });
  });
}

let revealObserver;

/**
 * Scroll Reveal Animations via IntersectionObserver
 */
function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  revealObserver = new IntersectionObserver((entries) => {
    if (isPageSwitching) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, observerOptions);

  refreshScrollAnimations();
}

/**
 * Refresh observer for dynamically added elements and trigger immediate viewport reveal check
 */
function refreshScrollAnimations() {
  if (revealObserver) {
    const targets = document.querySelectorAll('.reveal-init:not(.is-revealed), .reveal-stagger-parent:not(.is-revealed)');
    targets.forEach(el => revealObserver.observe(el));
  }
  checkViewportReveals();
}

/**
 * Load Application Data
 */
async function loadAllData() {
  try {
    const [progRes, tutorRes, testRes, parentTestRes] = await Promise.all([
      BlueprintAPI.getProgramDetails(),
      BlueprintAPI.getCoFounders(),
      BlueprintAPI.getTestimonials(),
      BlueprintAPI.getParentTestimonials()
    ]);

    if (progRes.success) {
      state.program = progRes.data;
      renderProgramTimeline(state.program);
    }
    if (tutorRes.success) {
      state.tutors = tutorRes.data;
      renderTutors(state.tutors);
    }
    if (testRes.success) {
      state.testimonials = testRes.data;
      renderTestimonials(state.testimonials, DOM.testimonialsContainer);
    }
    if (parentTestRes && parentTestRes.success) {
      state.parentTestimonials = parentTestRes.data;
      renderTestimonials(state.parentTestimonials, DOM.parentTestimonialsContainer);
    }
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

/**
 * Render 4-Week Program Timeline Breakdown
 */
function renderProgramTimeline(program) {
  if (!DOM.timelineContainer) return;

  DOM.timelineContainer.innerHTML = program.weeks.map(w => `
    <article class="timeline-card reveal-card">
      <span class="timeline-week-tag">Week ${escapeHTML(w.weekNumber)}</span>
      <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.75rem">${escapeHTML(w.title)}</h3>
      <p style="color:var(--text-secondary); font-size:0.95rem; margin-bottom:1rem">${escapeHTML(w.description)}</p>
      <ul style="list-style:none; display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1rem">
        ${w.groupSessions.map(s => `
          <li style="font-size:0.9rem; font-weight:600; color:var(--color-blueprint); display:flex; align-items:center; gap:0.4rem">
            <span>•</span> <span>${escapeHTML(s.type)}</span>
          </li>
        `).join('')}
        ${w.flexSession ? `
          <li style="font-size:0.9rem; font-weight:600; color:var(--color-gold-dark); display:flex; align-items:center; gap:0.4rem">
            <span>•</span> <span>${escapeHTML(w.flexSession)}</span>
          </li>
        ` : ''}
      </ul>
    </article>
  `).join('');

  refreshScrollAnimations();
}

/**
 * Render Co-Founders & Tutors (Jonah Blay & Kasey Mick)
 */
function renderTutors(tutors) {
  const tutorsContainer = document.getElementById('tutors-container');
  const tutorsExpandedContainer = document.getElementById('tutors-expanded-container');

  // Simple Preview Cards for Homepage
  if (tutorsContainer) {
    tutorsContainer.innerHTML = tutors.map(t => `
      <article class="tutor-card reveal-card interactive-card" id="tutor-preview-${escapeHTML(t.id)}">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; height:100%; justify-content:space-between;">
          <div style="display:flex; flex-direction:column; align-items:center; text-align:center; width:100%;">
            <div class="tutor-avatar-photo-wrapper">
              <img src="assets/${escapeHTML(t.photoFile)}?v=14" alt="${escapeHTML(t.name)}" class="tutor-avatar-photo-img" onerror="this.onerror=null; this.parentElement.outerHTML='<div class=\\'tutor-avatar-placeholder\\'>${escapeHTML(t.avatarPlaceholder)}</div>';">
            </div>
            <h3 class="tutor-name" style="margin-bottom:0.25rem">${escapeHTML(t.name)}</h3>
            <div class="tutor-credentials" style="margin-bottom:0.75rem">${escapeHTML(t.role)}</div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-primary); margin-top:0.25rem">${escapeHTML(t.university)}</div>
            <div style="font-size:0.9rem; color:var(--color-blueprint); font-weight:600; margin-top:0.25rem">${escapeHTML(t.majors)}</div>
            <div style="font-size:0.85rem; color:var(--color-gold-dark); font-weight:600; margin-top:0.25rem">${escapeHTML(t.honors)}</div>
          </div>
          ${t.schoolLogoFile ? `
            <div class="tutor-preview-logo-box">
              <img src="assets/${escapeHTML(t.schoolLogoFile)}?v=14" alt="${escapeHTML(t.university)} Logo" class="tutor-preview-logo-img">
            </div>
          ` : ''}
        </div>
      </article>
    `).join('');
  }

  // Expanded Cards for Co-Founders Page View
  if (tutorsExpandedContainer) {
    tutorsExpandedContainer.innerHTML = tutors.map(t => `
      <article class="tutor-card-expanded reveal-card" id="tutor-expanded-${escapeHTML(t.id)}">
        
        <!-- 1. TOP HEADER ROW: Name & Title on Top Left, School Logo Icon on Top Right -->
        <div class="tutor-card-header-row">
          <div class="tutor-card-header-left">
            <h3 class="tutor-name" style="font-size:1.75rem">${escapeHTML(t.name)}</h3>
            <div class="tutor-credentials" style="font-size:1.05rem; margin-bottom:0">${escapeHTML(t.role)}</div>
          </div>
          ${t.schoolLogoFile ? `
            <div class="tutor-school-logo-top-right">
              <img src="assets/${escapeHTML(t.schoolLogoFile)}?v=14" alt="${escapeHTML(t.university)} Logo" class="tutor-school-logo-img">
            </div>
          ` : ''}
        </div>

        <!-- 2. MIDDLE ROW: Portrait Photo on Left, Bio Description on Right (Flush with top of photo) -->
        <div class="tutor-card-middle-row">
          <div class="tutor-card-photo-wrapper">
            <div class="tutor-photo-placeholder interactive-portrait" style="margin-bottom:0">
              <img src="assets/${escapeHTML(t.photoFile)}?v=14" alt="${escapeHTML(t.name)}" class="tutor-photo-img" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div style="display:none; flex-direction:column; align-items:center; justify-content:center; height:100%">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:0.5rem"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>Professional Portrait</span>
                <span style="font-size:0.8rem; opacity:0.8; font-family:var(--font-mono)">[${escapeHTML(t.photoFile)}]</span>
              </div>
            </div>
          </div>

          <div class="tutor-card-info-right">
            <p class="tutor-bio-paragraph">${escapeHTML(t.bio)}</p>
          </div>
        </div>

        <!-- Single-Line High School SAT Info below both photo and description -->
        <div class="tutor-sat-single-line">
          <span>High School SAT:</span>
          <span class="tutor-sat-score-highlight">${escapeHTML(t.highSchoolScore)}</span>
        </div>

        <!-- 3. BOTTOM ROW: Focus & University Info Block (Bottom Center) -->
        <div class="tutor-card-bottom-row">
          <div class="tutor-focus-univ-block interactive-card">
            <div style="font-weight:800; color:var(--color-blueprint); font-size:0.95rem; white-space:pre-line;">${escapeHTML(t.focusArea)}</div>
            <div style="font-weight:700; font-size:1rem; color:var(--text-primary); margin-top:0.35rem">${escapeHTML(t.university)}</div>
            <div style="font-size:0.9rem; color:var(--text-primary); font-weight:600; margin-top:0.25rem">${escapeHTML(t.majors)}</div>
            <div style="font-size:0.85rem; color:var(--color-gold-dark); font-weight:600; margin-top:0.2rem">${escapeHTML(t.honors)}</div>
          </div>
        </div>

      </article>
    `).join('');
  }

  refreshScrollAnimations();
}

/**
 * Render Testimonials (Levi P., Tristan P., Katie N., etc.)
 */
function renderTestimonials(testimonials, container) {
  if (!container) return;

  container.innerHTML = testimonials.map(t => {
    const ratingNum = Math.min(5, Math.max(1, Number(t.rating) || 5));
    const stars = '★'.repeat(ratingNum) + '☆'.repeat(5 - ratingNum);

    return `
      <article class="testimonial-card reveal-card interactive-card">
        <div style="color:var(--color-gold); font-size:1.2rem; margin-bottom:0.5rem">${stars}</div>
        <p class="testimonial-text">"${escapeHTML(t.reviewText)}"</p>
        <div class="testimonial-author">— ${escapeHTML(t.studentName)}</div>
        <div style="font-size:0.8rem; color:var(--text-muted)">${escapeHTML(t.scoreImprovement)}</div>
      </article>
    `;
  }).join('');

  refreshScrollAnimations();
}

/**
 * Initialize Tutoring Calculators
 */
function initCalculators() {
  if (!DOM.tutoringHoursInput || !DOM.tutoringSubjectSelect) return;

  const updateCost = async () => {
    const hours = Number(DOM.tutoringHoursInput.value) || 1;
    const subject = DOM.tutoringSubjectSelect.value;
    const res = await BlueprintAPI.calculateTutoringCost({ hours, subjectType: subject });
    if (res.success) {
      if (res.data.customInquiryRequired) {
        DOM.calculatorOutput.innerHTML = `<span style="font-size:1.1rem; color:var(--color-blueprint)">Custom AP/Academic Rate — Please Submit Inquiry</span>`;
      } else {
        DOM.calculatorOutput.innerHTML = `<span style="font-size:2rem; font-weight:800; color:var(--color-blueprint)">$${res.data.total}</span> <span style="color:var(--text-muted); font-size:0.9rem">($75/hr x ${hours} hrs)</span>`;
      }
    }
  };

  DOM.tutoringHoursInput.addEventListener('input', updateCost);
  DOM.tutoringSubjectSelect.addEventListener('change', updateCost);
  updateCost();
}

/**
 * Initialize Form Submission Handlers
 */
function initForms() {
  // Custom Alert Dismissal
  if (DOM.customAlertBtn) {
    DOM.customAlertBtn.addEventListener('click', () => {
      DOM.customAlertBackdrop.classList.remove('is-visible');
      setTimeout(() => {
        DOM.customAlertBackdrop.style.display = 'none';
      }, 300); // Wait for CSS transition (0.3s)
    });
  }

  // Contact Inquiry Form
  if (DOM.contactForm) {
    const validateContactForm = () => {
      const name = DOM.contactForm.elements['name'].value.trim();
      const email = DOM.contactForm.elements['email'].value.trim();
      const reason = DOM.contactReason.value;
      const subject = DOM.contactSubject.value;
      const message = DOM.contactMessage.value.trim();
      const consent = document.getElementById('contact-consent').checked;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let isValid = name !== '' && emailRegex.test(email) && reason !== '' && consent;
      
      if (reason === 'Comprehensive SAT Program') {
        isValid = isValid && subject !== '' && message !== '';
      } else if (reason === 'Private SAT Tutoring' || reason === 'Private Academic Tutoring') {
        isValid = isValid && message !== '';
      } else {
        isValid = false;
      }
      
      if (isValid) {
        DOM.contactSubmitBtn.disabled = false;
        DOM.contactSubmitBtn.classList.add('is-ready');
      } else {
        DOM.contactSubmitBtn.disabled = true;
        DOM.contactSubmitBtn.classList.remove('is-ready');
      }
    };

    DOM.contactForm.addEventListener('input', validateContactForm);
    DOM.contactForm.addEventListener('change', validateContactForm);

    DOM.contactReason.addEventListener('change', (e) => {
      const reason = e.target.value;
      if (reason === 'Comprehensive SAT Program') {
        DOM.subjectContainer.classList.add('is-active');
        if (DOM.contactSubject.value === '') {
          DOM.messageContainer.classList.remove('is-active');
        } else {
          DOM.messageContainer.classList.add('is-active');
        }
      } else if (reason === 'Private SAT Tutoring' || reason === 'Private Academic Tutoring') {
        DOM.subjectContainer.classList.remove('is-active');
        DOM.contactSubject.value = ''; // clear subject
        DOM.messageContainer.classList.add('is-active');
      }
      validateContactForm();
    });

    DOM.contactSubject.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        DOM.messageContainer.classList.add('is-active');
      }
      validateContactForm();
    });

    DOM.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(DOM.contactForm);

      DOM.contactSubmitBtn.disabled = true;
      DOM.contactSubmitBtn.textContent = 'Sending Inquiry...';

      try {
        const reason = formData.get('reason');
        const subject = formData.get('subject');
        const userMessage = formData.get('message');
        
        let constructedMessage = '';
        if (reason === 'Comprehensive SAT Program') {
          constructedMessage = `${reason} — ${subject} — ${userMessage}`;
        } else {
          constructedMessage = `${reason} — ${userMessage}`;
        }

        const payload = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: '',
          service: '',
          message: constructedMessage
        };
        const res = await BlueprintAPI.submitInquiry(payload);
        if (res.success) {
          DOM.contactForm.reset();
          DOM.subjectContainer.classList.remove('is-active');
          DOM.messageContainer.classList.remove('is-active');
          validateContactForm();
          
          setTimeout(() => {
            window.showCustomAlert('Inquiry Sent', res.data.message || 'Your inquiry has been successfully sent to Jonah and Kasey.');
          }, 450);
        }
      } catch (err) {
        window.showCustomAlert('Error', err.message || 'Error submitting inquiry.', true);
        DOM.contactSubmitBtn.disabled = false; // Re-enable if error
      } finally {
        DOM.contactSubmitBtn.textContent = 'Send Inquiry';
      }
    });
  }

  // Add Testimonial Form
  if (DOM.testimonialForm) {
    const validateTestimonialForm = () => {
      const name = DOM.testimonialForm.elements['studentName'].value.trim();
      const cohort = DOM.testimonialCohort.value;
      const rating = DOM.testimonialRating.value;
      const reviewText = DOM.testimonialMessage.value.trim();
      const consent = document.getElementById('testimonial-consent').checked;
      
      let isValid = name !== '' && cohort !== '' && consent;
      
      if (cohort !== '') {
        isValid = isValid && rating !== '';
      } else {
        isValid = false;
      }
      
      if (rating !== '') {
        isValid = isValid && reviewText !== '';
      } else {
        isValid = false;
      }
      
      if (isValid) {
        DOM.testimonialSubmitBtn.disabled = false;
        DOM.testimonialSubmitBtn.classList.add('is-ready');
      } else {
        DOM.testimonialSubmitBtn.disabled = true;
        DOM.testimonialSubmitBtn.classList.remove('is-ready');
      }
    };

    DOM.testimonialForm.addEventListener('input', validateTestimonialForm);
    DOM.testimonialForm.addEventListener('change', validateTestimonialForm);

    DOM.testimonialCohort.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        DOM.testimonialRatingContainer.classList.add('is-active');
      }
      validateTestimonialForm();
    });

    DOM.testimonialRating.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        DOM.testimonialMessageContainer.classList.add('is-active');
      }
      validateTestimonialForm();
    });

    DOM.testimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(DOM.testimonialForm);

      DOM.testimonialSubmitBtn.disabled = true;
      DOM.testimonialSubmitBtn.textContent = 'Submitting...';

      const newReview = {
        reviewerType: 'Student',
        studentName: formData.get('studentName'),
        scoreImprovement: formData.get('scoreImprovement') || 'SAT Student',
        rating: Number(formData.get('rating')) || 5,
        reviewText: formData.get('reviewText')
      };

      try {
        const res = await BlueprintAPI.addTestimonial(newReview);
        if (res.success) {
          DOM.testimonialForm.reset();
          DOM.testimonialRatingContainer.classList.remove('is-active');
          DOM.testimonialMessageContainer.classList.remove('is-active');
          validateTestimonialForm();
          setTimeout(() => {
            window.showCustomAlert('Thank You!', 'Your review has been submitted for approval.');
          }, 450);
        }
      } catch (err) {
        window.showCustomAlert('Error', err.message || 'Error submitting review.', true);
      } finally {
        DOM.testimonialSubmitBtn.textContent = 'Submit Review';
      }
    });
  }

  // Add Parent Testimonial Form
  if (DOM.parentTestimonialForm) {
    const validateParentTestimonialForm = () => {
      const name = DOM.parentTestimonialForm.elements['parentName'].value.trim();
      const cohort = DOM.parentTestimonialCohort.value;
      const rating = DOM.parentTestimonialRating.value;
      const reviewText = DOM.parentTestimonialMessage.value.trim();
      const consent = document.getElementById('parent-testimonial-consent').checked;
      
      let isValid = name !== '' && cohort !== '' && consent;
      
      if (cohort !== '') {
        isValid = isValid && rating !== '';
      } else {
        isValid = false;
      }
      
      if (rating !== '') {
        isValid = isValid && reviewText !== '';
      } else {
        isValid = false;
      }
      
      if (isValid) {
        DOM.parentTestimonialSubmitBtn.disabled = false;
        DOM.parentTestimonialSubmitBtn.classList.add('is-ready');
      } else {
        DOM.parentTestimonialSubmitBtn.disabled = true;
        DOM.parentTestimonialSubmitBtn.classList.remove('is-ready');
      }
    };

    DOM.parentTestimonialForm.addEventListener('input', validateParentTestimonialForm);
    DOM.parentTestimonialForm.addEventListener('change', validateParentTestimonialForm);

    DOM.parentTestimonialCohort.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        DOM.parentTestimonialRatingContainer.classList.add('is-active');
      }
      validateParentTestimonialForm();
    });

    DOM.parentTestimonialRating.addEventListener('change', (e) => {
      if (e.target.value !== '') {
        DOM.parentTestimonialMessageContainer.classList.add('is-active');
      }
      validateParentTestimonialForm();
    });

    DOM.parentTestimonialForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(DOM.parentTestimonialForm);

      DOM.parentTestimonialSubmitBtn.disabled = true;
      DOM.parentTestimonialSubmitBtn.textContent = 'Submitting...';

      const newReview = {
        reviewerType: 'Parent',
        studentName: formData.get('parentName'),
        scoreImprovement: formData.get('childCohort') || 'Parent',
        rating: Number(formData.get('parentRating')) || 5,
        reviewText: formData.get('parentReviewText')
      };

      try {
        const res = await BlueprintAPI.addTestimonial(newReview);
        if (res.success) {
          DOM.parentTestimonialForm.reset();
          DOM.parentTestimonialRatingContainer.classList.remove('is-active');
          DOM.parentTestimonialMessageContainer.classList.remove('is-active');
          validateParentTestimonialForm();
          setTimeout(() => {
            window.showCustomAlert('Thank You!', 'Your parent review has been submitted for approval.');
          }, 450);
        }
      } catch (err) {
        window.showCustomAlert('Error', err.message || 'Error submitting review.', true);
      } finally {
        DOM.parentTestimonialSubmitBtn.textContent = 'Submit Review';
      }
    });
  }
}
