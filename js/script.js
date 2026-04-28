/* ═══════════════════════════════════════════════
   L-et-A — Shared Scripts
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  // ─── NAVBAR pri scrollu
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ─── HAMBURGER izbornik
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

  // ─── Sakrij gumb "Kontaktiraj nas" u navbaru na kontakt stranicama
  const path = window.location.pathname;
  const isKontaktPage = path.endsWith('kontakt.html')
                     || path.endsWith('kontakt-zagreb.html')
                     || path.endsWith('kontakt-rijeka.html');
  if (isKontaktPage) {
    const kontaktBtn = document.querySelector('.nav-links .btn-nav');
    if (kontaktBtn) kontaktBtn.closest('li').style.display = 'none';
  }

  // ─── Fade-in elemenata pri scrollanju
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
  // Pokreće se ponovno nakon dinamičkog renderiranja kartica (dvorci-zagreb/rijeka)
  window.observeFadeUps = observeFadeUps;

  // ─── Slanje kontakt forme
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

  // ─── Filteri kataloga (radi i na statičkim i na JS-renderiranim karticama)
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
    // Ako body ima data-city (zasebne stranice), koristi to; inače čitaj hash
    const forcedCity = document.body.dataset.city;
    const hash = (forcedCity || window.location.hash.replace('#', '') || '').toLowerCase();
    const cityActive = (hash === 'zagreb' || hash === 'rijeka') ? hash : null;
    let totalVisible = 0;
    let cityTotal = 0; // Ukupno kartica u trenutno aktivnom gradu

    cards.forEach(card => {
      const citySection = card.closest('.city-section');
      const cardCity    = citySection && citySection.dataset.city;
      const cityHidden  = cityActive && cardCity && cardCity !== cityActive;
      if (cityHidden) {
        card.style.display = 'none';
        return;
      }
      cityTotal++;
      const tags = card.dataset.tags.split(' ');
      const show = filter === 'all' || tags.includes(filter);
      card.style.display = show ? '' : 'none';
      if (show) totalVisible++;
    });

    // Ažuriraj traku s brojem dvoraca
    const countEl = document.getElementById('catalogCount');
    if (countEl) {
      countEl.innerHTML = filter === 'all'
        ? `<strong>${cityTotal}</strong> dvoraca`
        : `<strong>${totalVisible}</strong> od ${cityTotal} dvoraca`;
    }

    // Prikaži / sakrij zaglavlja gradskih sekcija ovisno o vidljivim karticama
    document.querySelectorAll('.city-section').forEach(section => {
      const visible = section.querySelectorAll('.catalog-card[style=""], .catalog-card:not([style])').length;
      const anyVisible = Array.from(section.querySelectorAll('.catalog-card[data-tags]')).some(c => c.style.display !== 'none');
      const header = section.querySelector('.city-section-header');
      if (header) header.style.display = anyVisible ? '' : 'none';
    });

    // Prikaz kad nema rezultata
    const empty = document.getElementById('catalogEmpty');
    if (empty) empty.style.display = totalVisible === 0 ? '' : 'none';
  }

  window.applyFilter = applyFilter;
  window.initCatalogFilters = initCatalogFilters;
  initCatalogFilters();

  // ─── LIGHTBOX (galerija slika preko cijelog ekrana)
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

    // Thumbnail sličice
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

  // Navigacija tipkovnicom
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose_fn();
    if (e.key === 'ArrowLeft' && lbIndex > 0) { lbIndex--; lbRender(); }
    if (e.key === 'ArrowRight' && lbIndex < lbImages.length - 1) { lbIndex++; lbRender(); }
  });

  // Touch swipe za mobitel
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx < 0 && lbIndex < lbImages.length - 1) { lbIndex++; lbRender(); }
      if (dx > 0 && lbIndex > 0) { lbIndex--; lbRender(); }
    }
  }, { passive: true });

  // Izlaz za inline skriptu kataloga
  window.lbOpen = lbOpen;

  // ─── prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.shape, .star, .hero-badge').forEach(el => {
      el.style.animation = 'none';
    });
  }
});
