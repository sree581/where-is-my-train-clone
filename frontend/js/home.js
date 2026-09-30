/**
 * Home Page — Where Is My Train Clone
 * Vanilla JS interactions with mock data for standalone demo.
 * Structured so that real API calls can replace mock functions later.
 */

(function () {
  'use strict';

  /* ────────── Mock Data ────────── */
  const MOCK_STATIONS = [
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'BCT', name: 'Mumbai Central' },
    { code: 'MAS', name: 'Chennai Central' },
    { code: 'HWH', name: 'Howrah Junction' },
    { code: 'BLR', name: 'Bengaluru City Junction' },
    { code: 'JP', name: 'Jaipur Junction' },
    { code: 'LKO', name: 'Lucknow Charbagh' },
    { code: 'ADI', name: 'Ahmedabad Junction' },
    { code: 'PUNE', name: 'Pune Junction' },
    { code: 'SBC', name: 'KSR Bengaluru' },
    { code: 'TVC', name: 'Thiruvananthapuram Central' },
    { code: 'GKP', name: 'Gorakhpur Junction' },
    { code: 'BPL', name: 'Bhopal Junction' },
    { code: 'CNB', name: 'Kanpur Central' },
    { code: 'PNBE', name: 'Patna Junction' },
    { code: 'SC', name: 'Secunderabad Junction' },
    { code: 'HYB', name: 'Hyderabad Deccan' },
    { code: 'CBE', name: 'Coimbatore Junction' },
  ];

  const MOCK_TRAINS = [
    { number: '12301', name: 'Rajdhani Express', from: 'NDLS', fromName: 'New Delhi', to: 'HWH', toName: 'Howrah Junction', days: 'Daily' },
    { number: '12951', name: 'Mumbai Rajdhani', from: 'BCT', fromName: 'Mumbai Central', to: 'NDLS', toName: 'New Delhi', days: 'Daily' },
    { number: '12621', name: 'Tamil Nadu Express', from: 'MAS', fromName: 'Chennai Central', to: 'NDLS', toName: 'New Delhi', days: 'Daily' },
    { number: '12657', name: 'Chennai Mail', from: 'BCT', fromName: 'Mumbai Central', to: 'MAS', toName: 'Chennai Central', days: 'Daily' },
    { number: '12259', name: 'Sealdah Duronto', from: 'NDLS', fromName: 'New Delhi', to: 'SDAH', toName: 'Sealdah', days: 'Mon, Wed, Sat' },
    { number: '12625', name: 'Kerala Express', from: 'NDLS', fromName: 'New Delhi', to: 'TVC', toName: 'Thiruvananthapuram', days: 'Daily' },
    { number: '12723', name: 'Telangana Express', from: 'NDLS', fromName: 'New Delhi', to: 'SC', toName: 'Secunderabad', days: 'Daily' },
    { number: '12431', name: 'Trivandrum Rajdhani', from: 'NDLS', fromName: 'New Delhi', to: 'TVC', toName: 'Thiruvananthapuram', days: 'Mon, Wed, Fri' },
  ];

  /* ────────── DOM References ────────── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ────────── Tab Switching ────────── */
  function initTabs() {
    const tabs = $$('.search-tab');
    const forms = $$('.search-form');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        forms.forEach((f) => f.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        const form = $(`#${target}-form`);
        if (form) form.classList.add('active');
        // Hide any open results
        hideAllResults();
      });
    });
  }

  /* ────────── Station Autocomplete ────────── */
  function initAutocomplete() {
    const inputs = $$('.station-autocomplete');
    inputs.forEach((input) => {
      const dropdown = input.parentElement.querySelector('.autocomplete-dropdown');
      if (!dropdown) return;

      input.addEventListener('input', () => {
        const val = input.value.trim().toLowerCase();
        if (val.length < 1) {
          dropdown.classList.remove('visible');
          return;
        }
        const matches = MOCK_STATIONS.filter(
          (s) => s.name.toLowerCase().includes(val) || s.code.toLowerCase().includes(val)
        ).slice(0, 6);

        if (matches.length === 0) {
          dropdown.classList.remove('visible');
          return;
        }

        dropdown.innerHTML = matches
          .map(
            (s) =>
              `<div class="autocomplete-item" data-code="${s.code}" data-name="${s.name}">
                <span class="ac-name">${s.name}</span>
                <span class="ac-code">${s.code}</span>
              </div>`
          )
          .join('');
        dropdown.classList.add('visible');

        dropdown.querySelectorAll('.autocomplete-item').forEach((item) => {
          item.addEventListener('click', () => {
            input.value = `${item.dataset.name} (${item.dataset.code})`;
            input.dataset.stationCode = item.dataset.code;
            dropdown.classList.remove('visible');
          });
        });
      });

      input.addEventListener('blur', () => {
        setTimeout(() => dropdown.classList.remove('visible'), 200);
      });

      input.addEventListener('focus', () => {
        if (input.value.trim().length >= 1) {
          input.dispatchEvent(new Event('input'));
        }
      });
    });
  }

  /* ────────── Swap Stations ────────── */
  function initSwapButton() {
    const swapBtn = $('#swap-stations');
    if (!swapBtn) return;

    swapBtn.addEventListener('click', () => {
      const fromInput = $('#from-station');
      const toInput = $('#to-station');
      if (!fromInput || !toInput) return;

      const tmpVal = fromInput.value;
      const tmpCode = fromInput.dataset.stationCode;
      fromInput.value = toInput.value;
      fromInput.dataset.stationCode = toInput.dataset.stationCode || '';
      toInput.value = tmpVal;
      toInput.dataset.stationCode = tmpCode || '';

      // Animate swap icon
      swapBtn.style.transform = 'rotate(180deg)';
      setTimeout(() => (swapBtn.style.transform = ''), 300);
    });
  }

  /* ────────── Find Trains Search ────────── */
  function initFindTrainsSearch() {
    const searchBtn = $('#find-trains-btn');
    if (!searchBtn) return;

    searchBtn.addEventListener('click', () => {
      const from = $('#from-station');
      const to = $('#to-station');
      const resultsPanel = $('#find-trains-results');

      if (!from.value.trim()) {
        shakeInput(from);
        return;
      }
      if (!to.value.trim()) {
        shakeInput(to);
        return;
      }

      // Mock search
      const fromCode = from.dataset.stationCode || from.value.trim().toUpperCase();
      const toCode = to.dataset.stationCode || to.value.trim().toUpperCase();
      const results = mockSearchTrains(fromCode, toCode);
      renderTrainResults(results, resultsPanel);
    });
  }

  /* ────────── PNR Status Search ────────── */
  function initPNRSearch() {
    const pnrBtn = $('#pnr-search-btn');
    if (!pnrBtn) return;

    pnrBtn.addEventListener('click', () => {
      const pnrInput = $('#pnr-input');
      const resultsPanel = $('#pnr-results');
      const val = pnrInput.value.trim();

      if (!val || val.length < 10) {
        shakeInput(pnrInput);
        return;
      }

      // Mock PNR result
      renderPNRResult(val, resultsPanel);
    });
  }

  /* ────────── Mock Search ────────── */
  function mockSearchTrains(fromCode, toCode) {
    // Return all trains or filter by matching from/to
    return MOCK_TRAINS.filter((t) => {
      const matchFrom = t.from === fromCode || fromCode.length < 3;
      const matchTo = t.to === toCode || toCode.length < 3;
      return matchFrom || matchTo;
    }).slice(0, 5);
  }

  function renderTrainResults(trains, panel) {
    if (!panel) return;
    if (trains.length === 0) {
      panel.innerHTML = '<div class="no-results">No trains found for this route. Try different stations.</div>';
    } else {
      panel.innerHTML = trains
        .map(
          (t) =>
            `<div class="result-card">
              <h4>${t.number} — ${t.name}</h4>
              <div class="route">
                <span>${t.fromName}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                <span>${t.toName}</span>
              </div>
              <p>Runs: ${t.days}</p>
            </div>`
        )
        .join('');
    }
    panel.classList.add('visible');
  }

  function renderPNRResult(pnr, panel) {
    if (!panel) return;
    panel.innerHTML = `
      <div class="result-card">
        <h4>PNR: ${pnr}</h4>
        <p>Train: 12301 — Rajdhani Express</p>
        <div class="route">
          <span>New Delhi</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>Howrah Junction</span>
        </div>
        <p style="margin-top:8px;color:#28A745;font-weight:600;">Status: Confirmed (S4 / 32)</p>
      </div>
    `;
    panel.classList.add('visible');
  }

  /* ────────── Utilities ────────── */
  function shakeInput(el) {
    const wrapper = el.closest('.input-wrapper');
    if (!wrapper) return;
    wrapper.style.borderColor = '#EF5350';
    wrapper.classList.add('shake');
    setTimeout(() => {
      wrapper.style.borderColor = '';
      wrapper.classList.remove('shake');
    }, 600);
  }

  function hideAllResults() {
    $$('.search-results-panel').forEach((p) => p.classList.remove('visible'));
  }

  /* ────────── Mobile Menu ────────── */
  function initMobileMenu() {
    const openBtn = $('#mobile-menu-open');
    const overlay = $('#mobile-nav');
    const closeBtn = $('#mobile-nav-close');

    if (!openBtn || !overlay) return;

    openBtn.addEventListener('click', () => overlay.classList.add('open'));

    if (closeBtn) {
      closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  }

  /* ────────── Floating Bar ────────── */
  function initFloatingBar() {
    const closeBtn = $('#floating-close');
    const bar = $('.floating-bar');
    if (!closeBtn || !bar) return;

    closeBtn.addEventListener('click', () => {
      bar.style.opacity = '0';
      bar.style.transform = 'translateY(20px)';
      setTimeout(() => (bar.style.display = 'none'), 300);
    });
  }

  /* ────────── Keyboard Support ────────── */
  function initKeyboard() {
    // Enter key triggers search on inputs
    const fromInput = $('#from-station');
    const toInput = $('#to-station');
    const pnrInput = $('#pnr-input');

    [fromInput, toInput].forEach((input) => {
      if (!input) return;
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          $('#find-trains-btn')?.click();
        }
      });
    });

    if (pnrInput) {
      pnrInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          $('#pnr-search-btn')?.click();
        }
      });
    }
  }

  /* ────────── Shake Animation (injected dynamically) ────────── */
  function injectShakeKeyframes() {
    if ($('#shake-style')) return;
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
      @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      .shake { animation: shake 0.4s ease; }
      .autocomplete-dropdown { position:absolute; top:100%; left:0; right:0; background:#fff; border:1.5px solid var(--gray-200); border-radius:0 0 var(--radius-md) var(--radius-md); box-shadow:var(--shadow-md); display:none; z-index:50; max-height:220px; overflow-y:auto; }
      .autocomplete-dropdown.visible { display:block; }
      .autocomplete-item { padding:10px 14px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-size:0.88rem; transition:background 0.15s; }
      .autocomplete-item:hover { background:var(--primary-bg); }
      .ac-name { color:var(--gray-700); font-weight:500; }
      .ac-code { color:var(--gray-400); font-size:0.8rem; font-weight:600; }
    `;
    document.head.appendChild(style);
  }

 /* ────────── Coach Position ────────── */
function initCoachPosition() {
  const trainInput = $('#coach-train-input');
  const coachButton = $('#coach-position-btn');

  if (!trainInput || !coachButton) return;

  coachButton.addEventListener('click', () => {
    const value = trainInput.value.trim();

    if (!value) {
      shakeInput(trainInput);
      return;
    }

    const searchValue = value.toLowerCase();

    const train = MOCK_TRAINS.find(
      (t) =>
        t.number === value ||
        t.name.toLowerCase() === searchValue
    );

    if (!train) {
      alert('Train not found. Please enter a valid train number or train name.');
      return;
    }

    const url =
      `coach.html?trainNumber=${encodeURIComponent(train.number)}` +
      `&trainName=${encodeURIComponent(train.name)}`;

    window.location.href = url;
  });
}
  /* ────────── Init ────────── */
    function init() {
    injectShakeKeyframes();
    initTabs();
    initAutocomplete();
    initSwapButton();
    initFindTrainsSearch();
    initPNRSearch();
    initCoachPosition();
    initMobileMenu();
    initFloatingBar();
    initKeyboard();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
