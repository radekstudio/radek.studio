/**
 * Radek Studio — Dynamic Photo Loader v4
 */

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

  const slugs = ['kuchynske-linky','vestavljene-skrine','obyvaci-pokoje','koupelnovy-nabytek','detske-pokoje','kancelarsky-nabytek','loznice','zadveri','satniky','technicka-mistnost','ostatni'];
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

    // Hero
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      const raw = (data.hero && data.hero !== '') ? data.hero : fallbackHero;
      const src = fixSrc(raw);
      heroImg.src = src;
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }

    // Galerie
    const photos = (data.fotky && data.fotky.length > 0) ? data.fotky : [];
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    photos.forEach((photo, i) => {
      const div = document.createElement('div');
      div.className = 'photo-item';
      div.style.cssText = 'aspect-ratio:4/3;overflow:hidden;cursor:pointer;background:#f0efed;';

      const img = document.createElement('img');
      img.src = fixSrc(photo.src);
      img.alt = photo.alt || '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity 0.5s ease;';
      img.onload = () => { img.style.opacity = '1'; };
      img.onerror = () => { div.style.display = 'none'; };

      div.appendChild(img);
      grid.appendChild(div);
      // index +1 protože 0 je hero
      div.onclick = () => openLb(i + 1);
    });

    // Observer
    if (window.revealObserver) {
      grid.querySelectorAll('.photo-item').forEach(el => window.revealObserver.observe(el));
    }

    // Hero klikací
    const heroPhoto = document.querySelector('.hero-photo');
    if (heroPhoto) {
      heroPhoto.style.cursor = 'pointer';
      heroPhoto.onclick = () => openLb(0);
    }

    setTimeout(() => initLb(), 200);

  } catch (e) {
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.src = fallbackHero;
      heroImg.onload = () => setTimeout(() => heroImg.classList.add('visible'), 100);
    }
  }
}

// ── Lightbox ─────────────────────────────────────────────────────
let lbIdx = 0;
let lbSrcs = [];

function initLb() {
  lbSrcs = [];
  // 0 = hero
  const heroImg = document.getElementById('heroImg');
  if (heroImg && heroImg.src && heroImg.src !== window.location.href) {
    lbSrcs.push(heroImg.src);
  }
  // 1+ = galerie
  document.querySelectorAll('.photo-item img').forEach(img => {
    if (img.src && img.src !== window.location.href) lbSrcs.push(img.src);
  });
}

function openLb(i) {
  initLb();
  if (!lbSrcs.length) return;
  lbIdx = Math.max(0, Math.min(i, lbSrcs.length - 1));
  renderLb();
  const lb = document.getElementById('lightbox');
  if (lb) { lb.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function renderLb() {
  const lbImg = document.getElementById('lbImg');
  if (!lbImg || !lbSrcs[lbIdx]) return;

  // Detekce portrait/landscape — nastav aspect ratio
  const tmp = new Image();
  tmp.onload = () => {
    const portrait = tmp.naturalHeight > tmp.naturalWidth;
    if (portrait) {
      // 9:16 — na výšku
      lbImg.style.maxHeight = '88vh';
      lbImg.style.maxWidth = '49.5vh'; // 88vh * 9/16
      lbImg.style.width = 'auto';
      lbImg.style.height = '88vh';
    } else {
      // 16:9 — na šířku
      lbImg.style.maxWidth = '88vw';
      lbImg.style.maxHeight = '49.5vw'; // 88vw * 9/16
      lbImg.style.width = '88vw';
      lbImg.style.height = 'auto';
    }
  };
  tmp.src = lbSrcs[lbIdx];
  lbImg.src = lbSrcs[lbIdx];
}

function closeLb() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lbNav(dir) {
  if (!lbSrcs.length) return;
  lbIdx = (lbIdx + dir + lbSrcs.length) % lbSrcs.length;
  renderLb();
}

// Keyboard
document.addEventListener('keydown', e => {
  const lb = document.getElementById('lightbox');
  if (!lb || !lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') lbNav(-1);
  if (e.key === 'ArrowRight') lbNav(1);
});

// Click outside
document.addEventListener('click', e => {
  const lb = document.getElementById('lightbox');
  if (lb && e.target === lb) closeLb();
});

// Touch swipe
let lbTX = 0;
document.addEventListener('touchstart', e => {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) lbTX = e.touches[0].clientX;
}, { passive: true });
document.addEventListener('touchend', e => {
  const lb = document.getElementById('lightbox');
  if (lb && lb.classList.contains('open')) {
    const d = e.changedTouches[0].clientX - lbTX;
    if (Math.abs(d) > 50) lbNav(d < 0 ? 1 : -1);
  }
});

// ── Realizace grid ───────────────────────────────────────────────
async function loadRealizace() {
  const slugs = ['kuchynske-linky','vestavljene-skrine','obyvaci-pokoje','koupelnovy-nabytek','detske-pokoje','kancelarsky-nabytek','loznice','zadveri','satniky','technicka-mistnost','ostatni'];
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
