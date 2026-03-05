// ==UserScript==
// @name         Twitter/X Spy Link Remover
// @namespace    https://github.com/psimaker/twitter-x-spy-link-remover
// @version      3.1.0
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
    // Bio-Links (data-testid="UserUrl") → kein Protokoll im Text
    if (anchor.dataset.testid === 'UserUrl') {
      const text = anchor.textContent.trim();
      return text ? (text.startsWith('http') ? text : 'https://' + text) : null;
    }

    // Tweet-Links: URL aus dem DOM zusammenbauen,
    // dabei den reinen "…"-Span überspringen
    let url = '';
    anchor.childNodes.forEach(node => {
      const t = node.textContent;
      if (t && t.trim() !== '…') url += t;
    });
    url = url.trim();

    if (url.startsWith('http') && !url.includes('t.co')) {
      return url;
    }

    return null;
  }

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
