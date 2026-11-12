// ==UserScript==
// @name         Twitter/X Spy Link Remover
// @namespace    https://github.com/psimaker/twitter-x-spy-link-remover
// @version      4.1.0
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

  // How far to walk up the React tree when looking for a link's data
  const FIBER_DEPTH = 100;

  // Links that could not be resolved, with the href they had at the time.
  // The page scan skips them; they are retried when the user interacts.
  const unresolved = new WeakMap();

  const isTco = anchor => anchor.hostname === 't.co';

  // Accept only absolute http(s) URLs that do not lead back to t.co
  function validUrl(value) {
    if (typeof value !== 'string') return null;
    let url;
    try {
      url = new URL(value);
    } catch {
      return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.hostname === 't.co' ? null : url.href;
  }

  // X keeps a URL entity for every shortened link:
  //   classic client: { url: <t.co>, expanded_url | expandedUrl: <real> }
  //   newer client:   { href: <t.co>, url: <real> }
  function entityTarget(entity, isThisLink) {
    if (!entity || typeof entity !== 'object') return null;
    if (isThisLink(entity.url)) {
      return validUrl(entity.expanded_url) || validUrl(entity.expandedUrl);
    }
    if (isThisLink(entity.href)) return validUrl(entity.url);
    return null;
  }

  // Entity lists as they appear in tweet and user objects
  function entitiesTarget(entities, isThisLink) {
    if (!entities || typeof entities !== 'object') return null;
    const lists = [entities.urls, entities.url?.urls, entities.description?.urls];
    for (const list of lists) {
      if (!Array.isArray(list)) continue;
      for (const entity of list) {
        const target = entityTarget(entity, isThisLink);
        if (target) return target;
      }
    }
    return null;
  }

  // Source 1: React data. Walks up from the link and checks the props of each
  // component for an entity that belongs to exactly this t.co URL.
  function fromReact(anchor) {
    try {
      // wrappedJSObject bypasses Firefox Xray wrappers; undefined elsewhere
      const el = anchor.wrappedJSObject || anchor;
      const key = Object.keys(el).find(k => k.startsWith('__reactFiber$'));
      if (!key) return null;

      const secure = 'https://t.co' + anchor.pathname;
      const plain = 'http://t.co' + anchor.pathname;
      const isThisLink = value => value === secure || value === plain;

      let fiber = el[key];
      for (let depth = 0; depth < FIBER_DEPTH && fiber; depth++, fiber = fiber.return) {
        const props = fiber.memoizedProps;
        if (!props || typeof props !== 'object') continue;
        for (const name in props) {
          if (name === 'children') continue;
          const value = props[name];
          if (!value || typeof value !== 'object') continue;
          const target = entityTarget(value, isThisLink)
            || entitiesTarget(name === 'entities' ? value : value.entities, isThisLink);
          if (target) return target;
        }
      }
    } catch {
      // React internals changed or are not accessible: fall through
    }
    return null;
  }

  // Source 2: visible text. The classic client renders the complete URL inside
  // the link: the scheme in a hidden span, plus a separate "…" node when the
  // visible part is shortened.
  function fromText(anchor) {
    let text = '';
    for (const node of anchor.childNodes) {
      const part = node.textContent;
      if (part.trim() !== '…') text += part;
    }
    text = text.trim();
    if (!text || /[\s…]/.test(text)) return null;
    if (/^https?:\/\//i.test(text)) return validUrl(text);
    // The profile website link is shown without a scheme
    return anchor.dataset.testid === 'UserUrl' ? validUrl('https://' + text) : null;
  }

  // Point a t.co link at its real destination, so that every way of opening it
  // (click, middle-click, context menu, keyboard) skips t.co. The original
  // t.co URL is kept in data-spy-original.
  function fix(anchor) {
    // The newer client also exposes the full URL in the title attribute
    const target = validUrl(anchor.title) || fromReact(anchor) || fromText(anchor);
    if (!target) {
      unresolved.set(anchor, anchor.href);
      return false;
    }
    anchor.dataset.spyOriginal = anchor.href;
    anchor.href = target;
    anchor.relList.add('noopener', 'noreferrer');
    if (!anchor.target) anchor.target = '_blank';
    return true;
  }

  function scan() {
    for (const anchor of document.querySelectorAll('a[href*="//t.co/"]')) {
      if (isTco(anchor) && unresolved.get(anchor) !== anchor.href) fix(anchor);
    }
  }

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scan();
    });
  }).observe(document, { childList: true, subtree: true });
  scan();

  // The listeners below sit on window in the capture phase and are registered
  // at document-start, so they run before any handler of the page.

  // Last chance right before the browser uses a link: covers links the scan
  // has not reached yet and links whose href X has reset in the meantime.
  window.addEventListener('pointerdown', event => {
    const anchor = event.target.closest?.('a[href]');
    if (anchor && isTco(anchor)) fix(anchor);
  }, true);

  // The href already points to the real site, so the browser opens it on its
  // own and Ctrl/Shift/middle-click behave as usual. X's own handlers never
  // get to see the event, so the click is not reported.
  function hideFromX(event) {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor) return;
    if (isTco(anchor)) fix(anchor);
    if (isTco(anchor) || !anchor.dataset.spyOriginal) return;
    event.stopImmediatePropagation();
  }
  window.addEventListener('click', hideFromX, true);
  window.addEventListener('auxclick', hideFromX, true);
  // X reports middle-clicks from a mouseup handler
  window.addEventListener('mouseup', event => {
    if (event.button !== 0) hideFromX(event);
  }, true);

})();
