/**
 * Radek Studio — Dynamic Photo Loader
 * Načítá fotky z JSON souborů generovaných Decap CMS
 */

const FALLBACK = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80';

// ── Hlavní stránka — hero fotka + slider kategorie ──────────────
async function loadHomepage() {
  // Hero hlavní stránky
  try {
    const res = await fetch('/_data/hlavni.json');
    const data = await res.json();
    const heroImg = document.getElementById('heroImg');
    if (heroImg && data.hero_image) {
      heroImg.src = data.hero_image;
    }
    const introText = document.getElementById('introText');
    if (introText && data.uvodni_text) {
      introText.textContent = `„${data.uvodni_text}"`;
    }
  } catch (e) { console.log('Hlavní hero: používám placeholder'); }

  // Hero fotky pro slider kategorií
  const categoryMap = {
    'kuchynske-linky':    { el: document.getElementById('cat-kuchynske-linky'),    fallback: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
    'vestavljene-skrine': { el: document.getElementById('cat-vestavljene-skrine'), fallback: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80' },
    'obyvaci-pokoje':     { el: document.getElementById('cat-obyvaci-pokoje'),     fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
    'koupelnovy-nabytek': { el: document.getElementById('cat-koupelnovy-nabytek'), fallback: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80' },
    'detske-pokoje':      { el: document.getElementById('cat-detske-pokoje'),      fallback: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80' },
    'kancelarsky-nabytek':{ el: document.getElementById('cat-kancelarsky-nabytek'),fallback: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
    'loznice':            { el: document.getElementById('cat-loznice'),             fallback: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80' },
    'zadveri':            { el: document.getElementById('cat-zadveri'),             fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
    'satniky':            { el: document.getElementById('cat-satniky'),             fallback: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80' },
    'technicka-mistnost': { el: document.getElementById('cat-technicka-mistnost'), fallback: 'https://images.unsplash.com/photo-1581783898377-1c85bf938427?w=800&q=80' },
    'ostatni':            { el: document.getElementById('cat-ostatni'),             fallback: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80' },
  };

  for (const [slug, { el, fallback }] of Object.entries(categoryMap)) {
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      if (data.hero) el.src = data.hero;
      else el.src = fallback;
    } catch (e) {
      el.src = fallback;
    }
  }
}

// ── Stránka kategorie — hero + galerie ──────────────────────────
async function loadCategory(slug, fallbackHero) {
  try {
    const res = await fetch(`/_data/${slug}.json`);
    const data = await res.json();

    // Hero fotka
    const heroImg = document.getElementById('heroImg');
    if (heroImg) {
      heroImg.src = (data.hero && data.hero !== '') ? data.hero : fallbackHero;
    }

    // Galerie
    const grid = document.getElementById('photoGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const photos = (data.fotky && data.fotky.length > 0) ? data.fotky : [];

    if (photos.length === 0) {
      // Žádné fotky — zobraz 9 placeholderů
      for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.className = 'photo-placeholder reveal';
        grid.appendChild(div);
      }
    } else {
      photos.forEach((photo, i) => {
        const div = document.createElement('div');
        div.className = 'photo-item reveal';
        div.onclick = () => openLb(i);
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = photo.alt || '';
        img.loading = 'lazy';
        div.appendChild(img);
        grid.appendChild(div);
      });
    }

    // Reinit reveal observer pro nové elementy
    if (window.revealObserver) {
      grid.querySelectorAll('.reveal').forEach(el => window.revealObserver.observe(el));
    }

    // Reinit lightbox
    if (window.initLightbox) window.initLightbox();

  } catch (e) {
    console.log('Chyba načítání kategorie:', e);
    const heroImg = document.getElementById('heroImg');
    if (heroImg) heroImg.src = fallbackHero;
  }
}

// ── Stránka Realizace — grid kategorií ──────────────────────────
async function loadRealizace() {
  const categoryMap = {
    'kuchynske-linky':    { fallback: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80' },
    'vestavljene-skrine': { fallback: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80' },
    'obyvaci-pokoje':     { fallback: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80' },
    'koupelnovy-nabytek': { fallback: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80' },
    'detske-pokoje':      { fallback: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&q=80' },
    'kancelarsky-nabytek':{ fallback: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' },
    'loznice':            { fallback: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80' },
    'zadveri':            { fallback: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80' },
    'satniky':            { fallback: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&q=80' },
    'technicka-mistnost': { fallback: 'https://images.unsplash.com/photo-1581783898377-1c85bf938427?w=800&q=80' },
    'ostatni':            { fallback: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80' },
  };

  for (const [slug, { fallback }] of Object.entries(categoryMap)) {
    const el = document.getElementById(`cat-${slug}`);
    if (!el) continue;
    try {
      const res = await fetch(`/_data/${slug}.json`);
      const data = await res.json();
      el.src = (data.hero && data.hero !== '') ? data.hero : fallback;
    } catch (e) {
      el.src = fallback;
    }
  }
}
