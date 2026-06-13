// Jednoduchý cookie banner — informuje o použití nezbytných cookies
// a uloží souhlas do localStorage, aby se banner znovu nezobrazoval.
(function () {
  var STORAGE_KEY = 'radekstudio-cookie-consent';

  function alreadyDecided() {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return true; // pokud localStorage není dostupné, banner nezobrazujeme
    }
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    var el = document.getElementById('cookieBanner');
    if (el) el.classList.remove('visible');
  }

  function createBanner() {
    var el = document.createElement('div');
    el.className = 'cookie-banner';
    el.id = 'cookieBanner';

    var prefix = window.location.pathname.includes('/realizace/') ? '../' : '';

    el.innerHTML =
      '<p>Tento web používá pouze nezbytné soubory cookies pro zajištění základní funkčnosti. ' +
      'Více informací najdete v sekci <a href="' + prefix + 'cookies.html">Cookies</a>.</p>' +
      '<div class="cookie-actions">' +
      '<button class="primary" id="cookieAccept">Rozumím</button>' +
      '</div>';

    document.body.appendChild(el);

    document.getElementById('cookieAccept').addEventListener('click', function () {
      setConsent('accepted');
    });

    // Zobrazit s malým zpožděním pro plynulý nástup animace
    setTimeout(function () { el.classList.add('visible'); }, 600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!alreadyDecided()) {
      createBanner();
    }
  });
})();
