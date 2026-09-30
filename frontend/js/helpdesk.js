/**
 * Help & Support Page — Where Is My Train Clone
 * Vanilla JS for search filtering, topic answers, the feedback form
 * (POST /api/feedback), mobile menu and floating bar.
 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  /* ────────── Help Topic Search / Filter ────────── */
  function initTopicSearch() {
    const input = $('#help-search-input');
    const cards = $$('.help-topic-card');
    const noMsg = $('#no-topics-msg');
    if (!input || !cards.length) return;

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
        const desc = (card.querySelector('.topic-desc')?.textContent || '').toLowerCase();
        const match = !query || title.includes(query) || desc.includes(query);
        card.style.display = match ? '' : 'none';
        if (match) visibleCount++;
      });

      if (noMsg) {
        noMsg.classList.toggle('visible', visibleCount === 0 && query.length > 0);
      }
    });
  }

  /* ────────── Help Topic Answers ────────── */
  const TOPIC_ANSWERS = {
    'Train Running Status': `
      <p>Open <a href="tracking.html">Track Live Status</a>, enter the 5-digit train number (for example <strong>12626</strong>) and press <strong>Track Train</strong>.</p>
      <p>You will see the current status, source and destination, delay and the full station-by-station schedule.</p>
      <p>If live running data is not available, the page shows the saved timetable from our database (or sample data) and says so clearly at the top.</p>`,
    'PNR Status': `
      <p>On the <a href="index.html#pnr-status">Home page → PNR Status</a> tab, enter your 10-digit PNR number and press <strong>Search</strong>.</p>
      <p>Common booking status codes:</p>
      <ul>
        <li><strong>CNF</strong> – Confirmed berth/seat</li>
        <li><strong>RAC</strong> – Reservation Against Cancellation (you can board and share a berth)</li>
        <li><strong>WL / GNWL / PQWL / RLWL</strong> – Waiting list; the number goes down as tickets are cancelled</li>
      </ul>
      <p>"PNR not yet generated" or "Flushed PNR" means the number is wrong or the journey is too old.</p>`,
    'Train Schedule': `
      <p>To see which trains run between two stations, use <a href="index.html">Search Train</a> on the Home page or open the <a href="train-list.html">Train List</a>. You can type a station name or its code (for example <strong>QLN</strong> for Kollam Jn).</p>
      <p>Click <strong>Live Status</strong> on any train to see all of its stops with arrival and departure times.</p>`,
    'Platform & Station Info': `
      <p>Platform numbers are listed for each stop in the schedule on the <a href="tracking.html">Live Status</a> page.</p>
      <p>Use <a href="coach.html">Coach Position</a> to see the order of coaches (engine, general, sleeper, AC…) so you know where to stand on the platform. Click any coach to see its seat and berth layout.</p>
      <p>Platforms can change at short notice, so always confirm on the station display boards.</p>`,
    'Account & Profile': `
      <p>You don't need an account to use Where Is My Train, and we don't ask for any personal details.</p>
      <p>Searches are logged anonymously so that we can improve the service. PNR numbers are masked before they are stored.</p>`,
    'App & Website Issues': `
      <p>If a page says it can't reach the server, the backend may be offline. Wait a moment and refresh the page.</p>
      <p>If something still looks wrong, please <a href="#" data-open-feedback>send us feedback</a> and describe what happened, including the train number or stations you searched for.</p>`
  };

  /* ────────── Modal (topic answers + feedback form) ────────── */
  function openModal(title, bodyHTML) {
    const modal = $('#helpdesk-modal');
    if (!modal) return;
    $('#helpdesk-modal-title').textContent = title;
    $('#helpdesk-modal-body').innerHTML = bodyHTML;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.hd-modal-close')?.focus();

    const feedbackLink = modal.querySelector('[data-open-feedback]');
    if (feedbackLink) {
      feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        openFeedbackForm();
      });
    }
  }

  function closeModal() {
    const modal = $('#helpdesk-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function initModal() {
    const modal = $('#helpdesk-modal');
    if (!modal) return;
    modal.querySelector('.hd-modal-close')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ────────── Help Topic Card Click ────────── */
  function initTopicCards() {
    $$('.help-topic-card').forEach((card) => {
      const open = () => {
        const title = card.querySelector('h3')?.textContent || 'Topic';
        openModal(title, TOPIC_ANSWERS[title] || '<p>Help for this topic is not available yet.</p>');
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  }

  /* ────────── Feedback Form (saved to MongoDB via POST /api/feedback) ────────── */
  function openFeedbackForm() {
    openModal('Give Feedback', `
      <form id="feedback-form" class="hd-form" novalidate>
        <label for="fb-name">Name <span class="hd-optional">(optional)</span></label>
        <input id="fb-name" name="name" type="text" maxlength="100" autocomplete="name">

        <label for="fb-email">Email <span class="hd-optional">(optional, if you'd like a reply)</span></label>
        <input id="fb-email" name="email" type="email" maxlength="200" autocomplete="email">

        <label for="fb-category">Category</label>
        <select id="fb-category" name="category">
          <option>General</option>
          <option>Bug Report</option>
          <option>Feature Request</option>
          <option>Data Issue</option>
        </select>

        <label for="fb-message">Message</label>
        <textarea id="fb-message" name="message" rows="5" maxlength="2000" required></textarea>

        <p class="hd-form-status" id="fb-status" role="status"></p>
        <button type="submit" class="hd-submit" id="fb-submit">Send Feedback</button>
      </form>
    `);

    const form = $('#feedback-form');
    form.addEventListener('submit', submitFeedback);
    $('#fb-message').focus();
  }

  async function submitFeedback(e) {
    e.preventDefault();
    const form = e.target;
    const status = $('#fb-status');
    const submit = $('#fb-submit');
    const data = Object.fromEntries(new FormData(form));

    const setStatus = (text, ok) => {
      status.textContent = text;
      status.className = 'hd-form-status ' + (ok ? 'ok' : 'error');
    };

    if (data.message.trim().length < 5) {
      setStatus('Please write a message of at least 5 characters.', false);
      return;
    }
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setStatus('Please enter a valid email address.', false);
      return;
    }

    submit.disabled = true;
    setStatus('Sending…', true);

    try {
      const apiBase = window.APP_CONFIG?.API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus(result.message || 'Could not send feedback.', false);
        submit.disabled = false;
        return;
      }

      form.reset();
      setStatus(result.message, true);
      setTimeout(closeModal, 1500);
      showToast('Thank you for your feedback!');
    } catch (err) {
      console.error('Feedback error:', err);
      setStatus('Unable to reach the server. Please try again later.', false);
    } finally {
      submit.disabled = false;
    }
  }

  /* ────────── Contact Support ────────── */
  function initContactActions() {
    const contactLink = $('#contact-support-link');
    if (contactLink) {
      contactLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'mailto:support@whereismytrain.in?subject=Support Request';
      });
    }

    const feedbackLink = $('#give-feedback-link');
    if (feedbackLink) {
      feedbackLink.addEventListener('click', (e) => {
        e.preventDefault();
        openFeedbackForm();
      });
    }
  }

  /* ────────── Social Icons ────────── */
  function initSocialIcons() {
    $$('.social-icon-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.getAttribute('aria-label') || 'Social media';
        showToast(`Opening ${platform} — link coming soon.`);
      });
    });
  }

  /* ────────── Mobile Menu (reused pattern from home) ────────── */
  function initMobileMenu() {
    const openBtn = $('#mobile-menu-open');
    const overlay = $('#mobile-nav');
    const closeBtn = $('#mobile-nav-close');
    if (!openBtn || !overlay) return;

    openBtn.addEventListener('click', () => overlay.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => overlay.classList.remove('open'));
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

    const mapBtn = $('#live-map-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', () => {
        showToast('Live Train Map — feature coming soon.');
      });
    }
  }

  /* ────────── Toast Notification ────────── */
  function showToast(message) {
    let toast = $('#helpdesk-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'helpdesk-toast';
      toast.style.cssText =
        'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);' +
        'background:#343A40;color:#fff;padding:10px 22px;border-radius:8px;font-size:0.85rem;' +
        'font-family:inherit;z-index:300;opacity:0;transition:all 0.3s ease;pointer-events:none;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);white-space:nowrap;max-width:90vw;text-align:center;';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2500);
  }

  /* ────────── Init ────────── */
  function init() {
    initTopicSearch();
    initModal();
    initTopicCards();
    initContactActions();
    initSocialIcons();
    initMobileMenu();
    initFloatingBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
