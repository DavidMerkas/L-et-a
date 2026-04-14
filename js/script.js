/* ═══════════════════════════════════════════════
   L-et-A — Shared Scripts
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ─── NAVBAR scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ─── HAMBURGER menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
    document.addEventListener('click', (e) => {
      if (navbar && !navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

  // ─── HIDE "Rezerviraj" btn-nav on kontakt.html
  const isKontakt = window.location.pathname.endsWith('kontakt.html');
  if (isKontakt) {
    const rezervirajBtn = document.querySelector('.nav-links .btn-nav');
    if (rezervirajBtn) rezervirajBtn.closest('li').style.display = 'none';
  }

  // ─── FADE-IN on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  function observeFadeUps() {
    document.querySelectorAll('.fade-up:not(.visible)').forEach(el => observer.observe(el));
  }
  observeFadeUps();
  // Re-run after dynamic catalog renders (katalog.html calls this)
  window.observeFadeUps = observeFadeUps;

  // ─── CONTACT FORM submit
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = this.querySelector('.btn-submit');
      const original = btn.textContent;
      btn.textContent = 'Slanje...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = '✓ Upit poslan!';
        btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
        btn.style.boxShadow = '0 4px 0 #047857, 0 8px 24px rgba(16,185,129,0.4)';
        this.reset();
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
          btn.style.boxShadow = '';
          btn.disabled = false;
        }, 3500);
      }, 1200);
    });
  }

  // ─── CATALOG FILTERS (works with both static and JS-rendered cards)
  function initCatalogFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    if (!filterChips.length) return;

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilter(chip.dataset.filter);
      });
    });
  }

  function applyFilter(filter) {
    const cards = document.querySelectorAll('.catalog-card[data-tags]');
    let totalVisible = 0;

    cards.forEach(card => {
      const tags = card.dataset.tags.split(' ');
      const show = filter === 'all' || tags.includes(filter);
      card.style.display = show ? '' : 'none';
      if (show) totalVisible++;
    });

    // Update count bar
    const countEl = document.getElementById('catalogCount');
    if (countEl) {
      const total = cards.length;
      countEl.innerHTML = filter === 'all'
        ? `<strong>${total}</strong> dvoraca`
        : `<strong>${totalVisible}</strong> od ${total} dvoraca`;
    }

    // Show/hide city section headers if they exist
    document.querySelectorAll('.city-section').forEach(section => {
      const visible = section.querySelectorAll('.catalog-card[style=""], .catalog-card:not([style])').length;
      const anyVisible = Array.from(section.querySelectorAll('.catalog-card[data-tags]')).some(c => c.style.display !== 'none');
      const header = section.querySelector('.city-section-header');
      if (header) header.style.display = anyVisible ? '' : 'none';
    });

    // Empty state
    const empty = document.getElementById('catalogEmpty');
    if (empty) empty.style.display = totalVisible === 0 ? '' : 'none';
  }

  window.applyFilter = applyFilter;
  window.initCatalogFilters = initCatalogFilters;
  initCatalogFilters();

  // ─── LIGHTBOX
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg    = document.getElementById('lbImg');
  const lbTitle  = document.getElementById('lbTitle');
  const lbCounter= document.getElementById('lbCounter');
  const lbThumbs = document.getElementById('lbThumbs');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');

  let lbImages = [];
  let lbIndex  = 0;

  function lbOpen(images, title, startIdx) {
    lbImages = images;
    lbIndex  = startIdx || 0;
    if (lbTitle) lbTitle.textContent = title || '';
    lbRender();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbImg.focus();
  }

  function lbClose_fn() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lbRender() {
    lbImg.src = lbImages[lbIndex];
    lbImg.alt = `Slika ${lbIndex + 1}`;
    if (lbCounter) lbCounter.textContent = `${lbIndex + 1} / ${lbImages.length}`;
    if (lbPrev) lbPrev.disabled = lbIndex === 0;
    if (lbNext) lbNext.disabled = lbIndex === lbImages.length - 1;

    // Thumbnails
    if (lbThumbs) {
      lbThumbs.innerHTML = '';
      lbImages.forEach((src, i) => {
        const img = document.createElement('img');
        img.src = src; img.alt = `Thumbnail ${i + 1}`;
        img.className = 'lb-thumb' + (i === lbIndex ? ' active' : '');
        img.addEventListener('click', () => { lbIndex = i; lbRender(); });
        lbThumbs.appendChild(img);
      });
    }
  }

  lbClose.addEventListener('click', lbClose_fn);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lbClose_fn(); });

  lbPrev.addEventListener('click', () => { if (lbIndex > 0) { lbIndex--; lbRender(); } });
  lbNext.addEventListener('click', () => { if (lbIndex < lbImages.length - 1) { lbIndex++; lbRender(); } });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose_fn();
    if (e.key === 'ArrowLeft' && lbIndex > 0) { lbIndex--; lbRender(); }
    if (e.key === 'ArrowRight' && lbIndex < lbImages.length - 1) { lbIndex++; lbRender(); }
  });

  // Touch swipe
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && lbIndex < lbImages.length - 1) { lbIndex++; lbRender(); }
      if (dx > 0 && lbIndex > 0) { lbIndex--; lbRender(); }
    }
  }, { passive: true });

  // Expose for inline catalog script
  window.lbOpen = lbOpen;

  // ─── prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.shape, .star, .hero-badge').forEach(el => {
      el.style.animation = 'none';
    });
  }
});
