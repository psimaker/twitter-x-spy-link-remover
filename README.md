# 🕵️ Twitter/X Spy Link Remover

> Stop Twitter and X from tracking every link you click.

Every time you click a link on Twitter/X, it gets routed through `t.co` — Twitter's tracking server — before you reach the real website. They log **when** you clicked, **what** you clicked, and **who** you are.

This script removes that. You click a link, you go directly there. No spy redirect. No tracking. No t.co.

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) for your browser
2. Click **[➕ Install from Greasy Fork](https://greasyfork.org/scripts/568483-twitter-x-spy-link-remover)** *(recommended — automatic updates)*
3. Confirm the installation
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
| Ctrl-click / Shift-click | Background tab, new window | ✅ Works as in any other link |
| Click reporting | X's `open_link` event, also for middle-clicks | ✅ Blocked |

---

## How it works

Twitter hides the real URL behind a `t.co` short link in the `href`, but still ships the actual destination to your browser:

1. **React data** — every shortened link has a URL entity (`t.co` URL → real URL) in the props of a React component above it. The script matches it by the exact `t.co` URL, so it never guesses
2. **`title` attribute** — the newer X client puts the full URL there for links in posts
3. **Visible text** — the classic client renders the full URL as text inside the link (fallback)

What the script does with it:

1. Replaces the `t.co` href with the real URL as soon as a link appears, so left-click, Ctrl/Shift-click, middle-click and the context menu all go straight to the real site
2. Hides your click from Twitter's own handlers, so it is not reported — including middle-clicks, which Twitter picks up via `mouseup`
3. Lets the browser open the link itself, in a new tab and without referrer

No external requests. No dependencies. Pure vanilla JS.

---

## Compatibility

Tested on **Brave**, **Chrome**, and **Firefox** with Tampermonkey or Violentmonkey.

Uses `wrappedJSObject` to bypass Firefox's Xray wrappers for React Fiber access — works transparently on Chrome where this isn't needed.

Works especially well combined with **DNS-level `t.co` blocking** (Pi-hole, AdGuard Home, router filters, etc.).

---

## Limitations

- Relies on React's internal `__reactFiber$` properties for most links — may need an update if Twitter changes their internal structure significantly
- Logged out, X serves a newer client that no longer ships the destination of link previews (Cards) and of the profile website link. There, only links inside posts are fixed
- A Card whose link is not part of the post's own link data stays on `t.co`
- Open an [issue](https://github.com/psimaker/twitter-x-spy-link-remover/issues) if you find a link that doesn't work

---

## License

MIT — do whatever you want with it.
