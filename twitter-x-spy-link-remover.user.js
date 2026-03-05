// ==UserScript==
// @name         Twitter/X Spy Link Remover
// @namespace    https://github.com/psimaker/twitter-x-spy-link-remover
// @version      3.0.0
// @description  Stops Twitter/X from tracking your clicks. Bypasses t.co spy URLs and opens the real link directly — no redirects, no logging.
// @author       psimaker
// @license      MIT
// @match        https://twitter.com/*
// @match        https://x.com/*
// @run-at       document-start
// @grant        none
// @homepageURL  https://github.com/psimaker/twitter-x-spy-link-remover
// @supportURL   https://github.com/psimaker/twitter-x-spy-link-remover/issues
// ==/UserScript==

(function () {
  'use strict';

  function getRealUrl(anchor) {
    const text = anchor.textContent.trim();
    if (!text || text.includes('…')) return null;

    // Profile bio URLs (data-testid="UserUrl") → text has no protocol prefix
    if (anchor.dataset.testid === 'UserUrl') {
      return text.startsWith('http') ? text : 'https://' + text;
    }

    // Tweet inline links → full URL is rendered as visible text
    if (text.startsWith('http') && !text.includes('t.co')) {
      return text;
    }

    return null;
  }

  // Use capture phase to intercept before Twitter's own click handlers
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href*="t.co"]');
    if (!anchor) return;

    const realUrl = getRealUrl(anchor);
    if (!realUrl) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    window.open(realUrl, '_blank', 'noopener,noreferrer');
  }, true);

})();
