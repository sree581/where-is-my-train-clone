/**
 * Shared navigation bar — added to the top of every page.
 * Include css/nav.css in <head> and this script before </body>.
 *
 * If the current page is about one train (?train=12626), the Live Status
 * and Coach Position links keep that train, so you can jump between them.
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const train = params.get('train') || params.get('trainNumber');
  const trainQuery = train ? `?train=${encodeURIComponent(train)}` : '';

  const LINKS = [
    { id: 'home', label: 'Home', icon: '🏠', href: 'index.html' },
    { id: 'trains', label: 'Find Trains', icon: '🔍', href: 'train-list.html' },
    { id: 'status', label: 'Live Status', icon: '📍', href: `tracking.html${trainQuery}` },
    { id: 'coach', label: 'Coach Position', icon: '🚃', href: `coach.html${trainQuery}` },
    { id: 'pnr', label: 'PNR Status', icon: '🎫', href: 'index.html#pnr-status' },
    { id: 'help', label: 'Help', icon: '❓', href: 'helpdesk.html' }
  ];

  // Which link belongs to the page we are on
  function activeId() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const byPage = {
      'train-list.html': 'trains',
      'tracking.html': 'status',
      'index-legacy.html': 'status',
      'coach.html': 'coach',
      'helpdesk.html': 'help'
    };
    if (byPage[page]) return byPage[page];
    return window.location.hash === '#pnr-status' ? 'pnr' : 'home';
  }

  function render() {
    const current = activeId();
    const nav = document.createElement('nav');
    nav.className = 'wimt-nav';
    nav.setAttribute('aria-label', 'Main navigation');
    nav.innerHTML = `
      <div class="wimt-nav-inner">
        <a class="wimt-nav-brand" href="index.html">🚆 <span>Where Is My Train</span></a>
        <ul class="wimt-nav-links">
          ${LINKS.map((link) => `
            <li>
              <a href="${link.href}" data-nav="${link.id}"
                 class="${link.id === current ? 'active' : ''}"
                 ${link.id === current ? 'aria-current="page"' : ''}>
                <span class="wimt-nav-icon" aria-hidden="true">${link.icon}</span>${link.label}
              </a>
            </li>`).join('')}
        </ul>
      </div>
    `;
    document.body.insertAdjacentElement('afterbegin', nav);
  }

  // Keep Home / PNR highlighting right when the Home page's tabs change the hash
  function updateActive() {
    const current = activeId();
    document.querySelectorAll('.wimt-nav-links a').forEach((a) => {
      const isActive = a.dataset.nav === current;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
  window.addEventListener('hashchange', updateActive);
  window.addEventListener('wimt:navchange', updateActive); // sent by js/home.js when a tab is switched
})();
