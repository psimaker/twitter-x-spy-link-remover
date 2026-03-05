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
| DNS-blocked `t.co` | Links opening `about:` page | ✅ Fixed |
| Long truncated URLs | Ethereum TX hashes, etc. | ✅ Fixed |

---

## How it works

Twitter hides the real URL behind a `t.co` short link in the `href`, but renders the actual destination as visible text in the DOM. This script:

1. Intercepts your click **before** Twitter's tracking handler fires
2. Reads the real URL from the link's visible text
3. Opens it directly — skipping `t.co` entirely

No external requests. No dependencies. ~30 lines of vanilla JS.

---

## Compatibility

Tested on **Brave**, **Chrome**, and **Firefox** with Tampermonkey or Violentmonkey.

Works especially well combined with **DNS-level `t.co` blocking** (Pi-hole, router filters, etc.).

---

## Limitations

- May need an update if Twitter changes their DOM structure significantly — open an issue if that happens

---

## License

MIT — do whatever you want with it.
