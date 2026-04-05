// ==UserScript==
// @name         Twitter/X Spy Link Remover
// @namespace    https://github.com/psimaker/twitter-x-spy-link-remover
// @version      4.0.0
// @description  Stops Twitter/X from tracking your clicks. Bypasses t.co spy URLs and opens the real link directly — no redirects, no logging. Now also for Twitter Cards.
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

  // Text-based extraction (for normal tweet links + bio links)
  function getRealUrlFromText(anchor) {
    if (anchor.dataset.testid === 'UserUrl') {
      const text = anchor.textContent.trim();
      return text ? (text.startsWith('http') ? text : 'https://' + text) : null;
    }

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

  // React Fiber extraction (for Twitter Cards + fallback)
  // Uses wrappedJSObject to bypass Firefox Xray wrappers
  function getRealUrlFromFiber(anchor) {
    const tweetEl = anchor.closest('[data-testid="tweet"]');
    if (!tweetEl) return null;

    const rawEl = tweetEl.wrappedJSObject || tweetEl;

    const fiberKey = Object.keys(rawEl).find(k => k.startsWith('__reactFiber$'));
    if (!fiberKey) return null;

    let fiber = rawEl[fiberKey];
    const href = anchor.href;

    for (let i = 0; i < 30 && fiber; i++) {
      const urls = fiber.memoizedProps?.tweet?.entities?.urls;
      if (urls && urls.length > 0) {
        for (const u of urls) {
          if (u.url && u.expanded_url && href.includes(
            u.url.replace('https://', '').replace('http://', '')
          )) {
            return u.expanded_url;
          }
        }
        if (urls.length === 1 && urls[0].expanded_url) {
          return urls[0].expanded_url;
        }
        break;
      }
      fiber = fiber.return;
    }
    return null;
  }

  function getRealUrl(anchor) {
    return getRealUrlFromText(anchor) || getRealUrlFromFiber(anchor);
  }

  // Proactively replace t.co hrefs so middle-click and
  // right-click → "Open in new tab" also work
  function processLink(anchor) {
    if (anchor.dataset.spyOriginal) return;
    const realUrl = getRealUrl(anchor);
    if (!realUrl) return;
    anchor.dataset.spyOriginal = anchor.href;
    anchor.href = realUrl;
  }

  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      document.querySelectorAll('a[href*="t.co"]:not([data-spy-original])').forEach(processLink);
    });
  });

  if (document.documentElement) {
    observer.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    });
  }

  // Left-click handler — opens in new tab, blocks Twitter's tracking
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[data-spy-original], a[href*="t.co"]');
    if (!anchor) return;

    const realUrl = anchor.dataset.spyOriginal
      ? anchor.href
      : getRealUrl(anchor);
    if (!realUrl) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    window.open(realUrl, '_blank', 'noopener,noreferrer');
  }, true);

})();
