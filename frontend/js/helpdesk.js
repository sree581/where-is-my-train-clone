/**
 * Help & Support Page — Where Is My Train Clone
 * Vanilla JS for search filtering, card interactions, mobile menu, floating bar.
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

  /* ────────── Help Topic Card Click ────────── */
  function initTopicCards() {
    $$('.help-topic-card').forEach((card) => {
      card.addEventListener('click', () => {
        const title = card.querySelector('h3')?.textContent || 'Topic';
        showToast(`Opening "${title}" — feature coming soon.`);
      });
    });
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
        showToast('Thank you! Feedback form coming soon.');
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
