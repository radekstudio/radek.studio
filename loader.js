/**
 * Radek Studio — Dynamic Photo Loader v3
 */

// ── Oprava cesty ────────────────────────────────────────────────
function fixSrc(src) {
  if (!src) return '';
  return src.startsWith('/images/') ? '/public' + src : src;
}

// ── Hlavní stránka ───────────────────────────────────────────────
async function loadHomepage() {
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
  } catch (e) {}

  // Slider kategorie
  const slugs = [
    'kuchynske-linky','vestavljene-skrine','obyvaci-pokoje',
    'koupelnovy-nabytek','detske-pokoje','kancelarsky-nabytek',
    'loznice','zadveri','satniky','technicka-mistnost','ostatni'
  ];
  for (const slug of slugs) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      if (data.hero && data.hero !== '') {
        el.onload = () => el.classList.add('loaded');
        el.src = fixSrc(data.hero);
      }
    } catch (e) {}
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

    // Galerie — sesbírej src předem, pak render
    const photos = (data.fotky && data.fotky.length > 0) ? data.fotky : [];
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    photos.forEach((photo, i) => {
      const div = document.createElement('div');
      div.className = 'photo-item';
      const img = document.createElement('img');
      img.src = fixSrc(photo.src);
      img.alt = photo.alt || '';
      img.loading = 'lazy';
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.6s ease';
      // Fade in po načtení — žádné blikání
      img.onload = () => { img.style.opacity = '1'; };
      img.onerror = () => { div.style.display = 'none'; };
      div.appendChild(img);
      grid.appendChild(div);
      // Klik na galerii — otevře lightbox od indexu 1 (0 je hero)
      div.onclick = () => openLb(i + 1);
    });

    // Observer pro galerii
    if (window.revealObserver) {
      grid.querySelectorAll('.photo-item').forEach(el => window.revealObserver.observe(el));
    }

    // Inicializuj lightbox po renderování galerie
    setTimeout(() => initLightboxGlobal(), 100);

  } catch (e) {
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.src = fallbackHero;
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }
  }
}

// ── Lightbox ─────────────────────────────────────────────────────
let lbCurrent = 0;
// lbSrcs = pole URL stringů (hero jako první, pak galerie)
let lbSrcs = [];

function initLightboxGlobal() {
  const heroImg = document.getElementById('heroImg');
  const galleryImgs = Array.from(document.querySelectorAll('.photo-item img'));

  lbSrcs = [];
  // Index 0 = hero fotka
  if (heroImg && heroImg.src && !heroImg.src.endsWith('/')) {
    lbSrcs.push(heroImg.src);
  }
  // Index 1+ = galerie
  galleryImgs.forEach(img => {
    if (img.src && !img.src.endsWith('/')) lbSrcs.push(img.src);
  });
}

function openLb(i) {
  initLightboxGlobal();
  if (!lbSrcs.length) return;
  lbCurrent = Math.max(0, Math.min(i, lbSrcs.length - 1));
  showLbImg();
  const lb = document.getElementById('lightbox');
  if (lb) {
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function showLbImg() {
  const lbImg = document.getElementById('lbImg');
  if (!lbImg || !lbSrcs[lbCurrent]) return;

  // Detekce portrait/landscape pomocí Image objektu
  const tmpImg = new Image();
  tmpImg.onload = () => {
    const isPortrait = tmpImg.naturalHeight > tmpImg.naturalWidth;
    lbImg.style.maxWidth = isPortrait ? '56vh' : '90vw';
    lbImg.style.maxHeight = isPortrait ? '90vh' : '56.25vw';
    lbImg.style.width = 'auto';
    lbImg.style.height = 'auto';
  };
  tmpImg.src = lbSrcs[lbCurrent];
  lbImg.src = lbSrcs[lbCurrent];
}

function closeLb() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  if (!lbSrcs.length) return;
  lbCurrent = (lbCurrent + dir + lbSrcs.length) % lbSrcs.length;
  showLbImg();
}

// Hero foto klikací — otevře lightbox od indexu 0
document.addEventListener('DOMContentLoaded', () => {
  const heroPhoto = document.querySelector('.hero-photo');
  if (heroPhoto) {
    heroPhoto.style.cursor = 'pointer';
    heroPhoto.addEventListener('click', () => openLb(0));
  }
});

// Keyboard
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// Click outside lightbox
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
    if (Math.abs(diff) > 50) lbNav(diff < 0 ? 1 : -1);
  }
});

// ── Stránka Realizace ────────────────────────────────────────────
async function loadRealizace() {
  const slugs = [
    'kuchynske-linky','vestavljene-skrine','obyvaci-pokoje',
    'koupelnovy-nabytek','detske-pokoje','kancelarsky-nabytek',
    'loznice','zadveri','satniky','technicka-mistnost','ostatni'
  ];
  for (const slug of slugs) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      if (data.hero && data.hero !== '') {
        el.onload = () => el.classList.add('loaded');
        el.src = fixSrc(data.hero);
      }
    } catch (e) {}
  }
}
