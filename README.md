# 🕵️ Twitter/X Spy Link Remover

> Stop Twitter and X from tracking every link you click.

Every time you click a link on Twitter/X, it gets routed through `t.co` — Twitter's tracking server — before you reach the real website. They log **when** you clicked, **what** you clicked, and **who** you are.

This script removes that. You click a link, you go directly there. No spy redirect. No tracking. No t.co.

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click **[➕ Install from Greasy Fork](https://greasyfork.org/scripts/568483-twitter-x-spy-link-remover)** *(recommended — automatic updates)*
3. Confirm in Tampermonkey
4. Reload Twitter/X — done

> Also available directly from GitHub: [twitter-x-spy-link-remover.user.js](https://github.com/psimaker/twitter-x-spy-link-remover/raw/main/twitter-x-spy-link-remover.user.js)

---

## What it fixes

| Where | Example | Status |
|---|---|---|
| Links in tweets | `http://example.com` | ✅ Fixed |
| Profile bio URLs | `example.com` | ✅ Fixed |
| Twitter Cards | Link previews (GitHub, YouTube, etc.) | ✅ Fixed |
| DNS-blocked `t.co` | Links opening `about:` page | ✅ Fixed |
| Long truncated URLs | Ethereum TX hashes, etc. | ✅ Fixed |
| Middle-click / right-click | Open in new tab via context menu | ✅ Fixed |

---

## How it works

Twitter hides the real URL behind a `t.co` short link in the `href`, but stores the actual destination in two places:

1. **Visible text** — for inline links, the real URL is rendered as text in the DOM
2. **React Fiber tree** — for Twitter Cards (link previews), the real URL lives in `tweet.entities.urls` inside React's internal component state

This script uses both approaches:

1. Intercepts your click **before** Twitter's tracking handler fires
2. Reads the real URL from the link's visible text — or extracts it from the React Fiber tree for Cards
3. Proactively replaces `t.co` hrefs in the DOM so middle-click and right-click also work
4. Opens links directly — skipping `t.co` entirely

No external requests. No dependencies. Pure vanilla JS.

---

## Compatibility

Tested on **Brave**, **Chrome**, and **Firefox** with Tampermonkey or Violentmonkey.

Uses `wrappedJSObject` to bypass Firefox's Xray wrappers for React Fiber access — works transparently on Chrome where this isn't needed.

Works especially well combined with **DNS-level `t.co` blocking** (Pi-hole, AdGuard Home, router filters, etc.).

---

## Limitations

- Relies on React's internal `__reactFiber$` properties for Card links — may need an update if Twitter changes their internal structure significantly
- Open an [issue](https://github.com/psimaker/twitter-x-spy-link-remover/issues) if you find a link that doesn't work

---

## License

MIT — do whatever you want with it.
