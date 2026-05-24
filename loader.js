/**
 * Radek Studio — Dynamic Photo Loader
 */

// ── Pomocná funkce pro opravu cesty k fotkám ────────────────────
function fixSrc(src) {
  if (!src) return '';
  return src.startsWith('/images/') ? '/public' + src : src;
}

// ── Hlavní stránka ───────────────────────────────────────────────
async function loadHomepage() {
  // Hero hlavní stránky
  try {
    const res = await fetch('/_data/hlavni.json');
    const data = await res.json();
    const heroImg = document.getElementById('heroImg');
    if (heroImg && data.hero_image) {
      heroImg.src = fixSrc(data.hero_image);
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }
    const introText = document.getElementById('introText');
    if (introText && data.uvodni_text) {
      introText.textContent = `„${data.uvodni_text}"`;
    }
  } catch (e) { console.log('Hlavní hero error:', e); }

  // Slider — hero fotky kategorií
  const slugs = [
    'kuchynske-linky', 'vestavljene-skrine', 'obyvaci-pokoje',
    'koupelnovy-nabytek', 'detske-pokoje', 'kancelarsky-nabytek',
    'loznice', 'zadveri', 'satniky', 'technicka-mistnost', 'ostatni'
  ];

  for (const slug of slugs) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      if (data.hero && data.hero !== '') {
        const src = fixSrc(data.hero);
        el.onload = () => el.classList.add('loaded');
        el.src = src;
      }
      // Pokud hero není, karta zůstane s neutrálním pozadím
    } catch (e) { /* nechej neutrální pozadí */ }
  }
}

// ── Stránka kategorie ────────────────────────────────────────────
async function loadCategory(slug, fallbackHero) {
  try {
    const res = await fetch(`/_data/${slug}.json`);
    const data = await res.json();

    // Hero fotka
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      const raw = (data.hero && data.hero !== '') ? data.hero : fallbackHero;
      heroImg.src = fixSrc(raw);
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }

    // Galerie
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const photos = (data.fotky && data.fotky.length > 0) ? data.fotky : [];

    // Žádné fotky = prázdná galerie, žádné placeholdery
    photos.forEach((photo, i) => {
      const div = document.createElement('div');
      div.className = 'photo-item reveal';
      div.onclick = () => openLb(i);
      const img = document.createElement('img');
      img.src = fixSrc(photo.src);
      img.alt = photo.alt || '';
      img.loading = 'lazy';
      div.appendChild(img);
      grid.appendChild(div);
    });

    // Reveal observer
    if (window.revealObserver) {
      grid.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
    }

    // Inicializuj lightbox
    initLightboxGlobal();

  } catch (e) {
    console.log('Chyba načítání kategorie:', e);
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.src = fallbackHero;
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }
  }
}

// ── Lightbox ─────────────────────────────────────────────────────
let lbCurrent = 0;
let lbAllImgs = []; // hero + galerie

function initLightboxGlobal() {
  // Sesbírej hero fotku + všechny fotky z galerie
  const heroImg = document.getElementById('heroImg');
  const galleryImgs = Array.from(document.querySelectorAll('.photo-item img'));
  lbAllImgs = heroImg && heroImg.src ? [heroImg, ...galleryImgs] : galleryImgs;
  window._lbImgs = lbAllImgs;
}

function openLb(i) {
  initLightboxGlobal();
  // i === -1 znamená hero fotka
  lbCurrent = i === -1 ? 0 : i + (lbAllImgs[0]?.id === 'heroImg' ? 1 : 0);
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  if (!lb || !lbImg || !lbAllImgs[lbCurrent]) return;
  lbImg.src = lbAllImgs[lbCurrent].src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLb() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  if (!lbAllImgs.length) return;
  lbCurrent = (lbCurrent + dir + lbAllImgs.length) % lbAllImgs.length;
  const lbImg = document.getElementById('lbImg');
  if (lbImg) lbImg.src = lbAllImgs[lbCurrent].src;
}

// Keyboard
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// Click outside
document.addEventListener('click', e => {
  const lb = document.getElementById('lightbox');
  if (lb && e.target === lb) closeLb();
});

// Touch swipe v lightboxu
let lbTouchX = 0;
document.addEventListener('touchstart', e => {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) lbTouchX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', e => {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    const diff = e.changedTouches[0].clientX - lbTouchX;
    if (diff < -50) lbNav(1);
    else if (diff > 50) lbNav(-1);
  }
});

// ── Stránka Realizace — grid kategorií ──────────────────────────
async function loadRealizace() {
  const slugs = [
    'kuchynske-linky', 'vestavljene-skrine', 'obyvaci-pokoje',
    'koupelnovy-nabytek', 'detske-pokoje', 'kancelarsky-nabytek',
    'loznice', 'zadveri', 'satniky', 'technicka-mistnost', 'ostatni'
  ];

  for (const slug of slugs) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      if (data.hero && data.hero !== '') {
        const src = fixSrc(data.hero);
        el.onload = () => el.classList.add('loaded');
        el.src = src;
      }
    } catch (e) { /* nechej neutrální pozadí */ }
  }
}
