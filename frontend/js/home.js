/**
 * Home Page — Where Is My Train Clone
 * Search Train opens train-list.html, PNR Status calls the backend,
 * Coach Position opens coach.html. Station/train lists below are only
 * used for autocomplete and name lookup.
 */

(function () {
  'use strict';

  const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000';

  /* ────────── Autocomplete Data ────────── */
  const MOCK_STATIONS = [
    { code: 'QLN', name: 'Kollam Junction' },
    { code: 'ERS', name: 'Ernakulam Junction' },
    { code: 'ERN', name: 'Ernakulam Town' },
    { code: 'KTYM', name: 'Kottayam' },
    { code: 'ALLP', name: 'Alappuzha' },
    { code: 'TCR', name: 'Thrissur' },
    { code: 'CLT', name: 'Kozhikode' },
    { code: 'KYJ', name: 'Kayamkulam Junction' },
    { code: 'CNGR', name: 'Chengannur' },
    { code: 'AWY', name: 'Aluva' },
    { code: 'SRR', name: 'Shoranur Junction' },
    { code: 'PGT', name: 'Palakkad Junction' },
    { code: 'CAN', name: 'Kannur' },
    { code: 'MAQ', name: 'Mangaluru Central' },
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
        // Keep the URL (index.html#pnr-status) and the shared nav bar in sync with the open tab
        history.replaceState(null, '', target === 'find-trains' ? location.pathname + location.search : `#${target}`);
        window.dispatchEvent(new Event('wimt:navchange'));
        // Hide any open results
        hideAllResults();
      });
    });

    // Allow links like index.html#pnr-status to open a specific tab
    const openTabFromHash = () => {
      const hashTab = $(`.search-tab[data-tab="${location.hash.slice(1)}"]`);
      if (hashTab) hashTab.click();
    };
    openTabFromHash();
    window.addEventListener('hashchange', openTabFromHash);
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

      const fromCode = stationCodeFromInput(from);
      const toCode = stationCodeFromInput(to);

      if (!fromCode) {
        shakeInput(from);
        return;
      }
      if (!toCode) {
        shakeInput(to);
        return;
      }

      window.location.href =
        `train-list.html?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}`;
    });
  }

  // Accepts a picked suggestion, "Name (CODE)", a bare code like "QLN", or a known station name
  function stationCodeFromInput(input) {
    const value = input.value.trim();
    if (!value) return null;
    if (input.dataset.stationCode && value.includes(`(${input.dataset.stationCode})`)) {
      return input.dataset.stationCode;
    }
    const bracket = value.match(/\(([A-Za-z]{2,5})\)\s*$/);
    if (bracket) return bracket[1].toUpperCase();
    const byName = MOCK_STATIONS.find((s) => s.name.toLowerCase() === value.toLowerCase());
    if (byName) return byName.code;
    return /^[A-Za-z]{2,5}$/.test(value) ? value.toUpperCase() : null;
  }

  /* ────────── PNR Status Search ────────── */
  function initPNRSearch() {
    const pnrBtn = $('#pnr-search-btn');
    if (!pnrBtn) return;

    pnrBtn.addEventListener('click', async () => {
      const pnrInput = $('#pnr-input');
      const resultsPanel = $('#pnr-results');
      const val = pnrInput.value.trim();

      if (!/^\d{10}$/.test(val)) {
        shakeInput(pnrInput);
        showPNRMessage(resultsPanel, 'Please enter a valid 10-digit PNR number.');
        return;
      }

      showPNRMessage(resultsPanel, 'Checking PNR status…');
      pnrBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/api/pnr/${val}`);
        const result = await response.json();

        if (!result.success) {
          showPNRMessage(resultsPanel, result.message || 'PNR status not available.');
          return;
        }
        renderPNRResult(val, result.data || {}, resultsPanel);
      } catch (err) {
        console.error('PNR search error:', err);
        showPNRMessage(resultsPanel, 'Unable to reach the server. Please make sure the backend is running on port 5000.');
      } finally {
        pnrBtn.disabled = false;
      }
    });
  }

  function showPNRMessage(panel, message) {
    if (!panel) return;
    panel.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'no-results';
    box.textContent = message;
    panel.appendChild(box);
    panel.classList.add('visible');
  }

  // The API's success payload isn't documented here, so read common field names defensively
  function renderPNRResult(pnr, data, panel) {
    if (!panel) return;
    const pick = (...keys) => keys.map((k) => data[k]).find((v) => v !== undefined && v !== null && v !== '');
    const trainNo = pick('trainNumber', 'trainNo', 'train_number');
    const trainName = pick('trainName', 'train_name');
    const from = pick('boardingPoint', 'sourceStation', 'from', 'source');
    const to = pick('destinationStation', 'reservationUpto', 'to', 'destination');
    const date = pick('dateOfJourney', 'journeyDate', 'doj');
    const chart = pick('chartStatus', 'chartPrepared');
    const passengers = pick('passengerList', 'passengers') || [];

    const passengerRows = (Array.isArray(passengers) ? passengers : [])
      .map((p, i) => {
        const booking = p.bookingStatusDetails || p.bookingStatus || '-';
        const current = p.currentStatusDetails || p.currentStatus || '-';
        return `<p>Passenger ${p.passengerSerialNumber || i + 1}: ${escapeHTML(booking)} → <strong>${escapeHTML(current)}</strong></p>`;
      })
      .join('');

    panel.innerHTML = `
      <div class="result-card">
        <h4>PNR: ${pnr}</h4>
        ${trainNo || trainName ? `<p>Train: ${escapeHTML(trainNo || '')} — ${escapeHTML(trainName || '')}</p>` : ''}
        ${from || to ? `<div class="route"><span>${escapeHTML(from || '-')}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          <span>${escapeHTML(to || '-')}</span></div>` : ''}
        ${date ? `<p>Date of journey: ${escapeHTML(date)}</p>` : ''}
        ${chart !== undefined ? `<p>Chart: ${escapeHTML(chart)}</p>` : ''}
        ${passengerRows || '<p>No passenger details returned.</p>'}
      </div>
    `;
    panel.classList.add('visible');
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

      // Any 5-digit train number goes straight to the coach API; names are looked up locally
      if (/^\d{5}$/.test(value)) {
        window.location.href = `coach.html?train=${encodeURIComponent(value)}`;
        return;
      }

      const searchValue = value.toLowerCase();

      const train = MOCK_TRAINS.find(
        (t) => t.name.toLowerCase() === searchValue
      );

      if (!train) {
        alert('Train not found. Please enter a 5-digit train number or a known train name.');
        return;
      }

      window.location.href =
        `coach.html?train=${encodeURIComponent(train.number)}` +
        `&trainName=${encodeURIComponent(train.name)}`;
    });

    trainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        coachButton.click();
      }
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
