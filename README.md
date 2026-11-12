<div align="center">

# 🕵️ Twitter/X Spy Link Remover

**Stop Twitter and X from tracking every link you click.**<br>
A small userscript that replaces `t.co` spy links with the real URL — no redirect, no click report.

<a href="https://greasyfork.org/scripts/568483-twitter-x-spy-link-remover">
  <img src="https://img.shields.io/badge/Install-Greasy%20Fork-8B0000?style=for-the-badge&logo=greasyfork&logoColor=white" alt="Install from Greasy Fork">
</a>

<br><br>

[![Release](https://img.shields.io/github/v/release/psimaker/twitter-x-spy-link-remover?style=flat-square&label=Release)](https://github.com/psimaker/twitter-x-spy-link-remover/releases/latest)
[![Installs](https://img.shields.io/greasyfork/dt/568483?style=flat-square&label=Installs)](https://greasyfork.org/scripts/568483-twitter-x-spy-link-remover)
[![Stars](https://img.shields.io/github/stars/psimaker/twitter-x-spy-link-remover?style=flat-square&logo=github&label=Stars)](https://github.com/psimaker/twitter-x-spy-link-remover/stargazers)
[![License: MIT](https://img.shields.io/github/license/psimaker/twitter-x-spy-link-remover?style=flat-square&label=License)](LICENSE)

</div>

---

## 🔍 Why

Every time you click a link on Twitter/X, it gets routed through `t.co` — Twitter's tracking server — before you reach the real website. They log **when** you clicked, **what** you clicked, and **who** you are.

```text
Without the script    you ──▶ t.co ──▶ example.com    X knows who, what and when
With the script       you ───────────▶ example.com    X is not told about the click
```

This script removes that. You click a link, you go directly there. No spy redirect. No tracking. No t.co.

---

## 🚀 Install

1. Install a userscript manager: [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/)
2. Click **[➕ Install from Greasy Fork](https://greasyfork.org/scripts/568483-twitter-x-spy-link-remover)** and confirm
3. Reload Twitter/X — done

Prefer GitHub? Install [twitter-x-spy-link-remover.user.js](https://github.com/psimaker/twitter-x-spy-link-remover/raw/main/twitter-x-spy-link-remover.user.js) directly. Your userscript manager keeps it up to date either way.

> [!NOTE]
> In Chrome-based browsers (Chrome, Brave, Edge), Tampermonkey only runs userscripts once **Allow User Scripts** (Chrome 138+) or Developer Mode is switched on. See the [Tampermonkey FAQ](https://www.tampermonkey.net/faq.php?q=Q209).

---

## ✅ What it fixes

| Where | Example | Status |
|---|---|---|
| Links in posts | `https://example.com/article` | ✅ Fixed |
| Link previews (Cards) | GitHub, YouTube, news articles | ✅ Fixed |
| Profile website and bio links | `example.com` | ✅ Fixed |
| Long truncated URLs | Ethereum TX hashes, etc. | ✅ Fixed |
| Middle-click / right-click | Open in new tab via context menu | ✅ Fixed |
| Ctrl-click / Shift-click | Background tab, new window | ✅ Works as in any other link |
| Click reporting | X's `open_link` event, also for middle-clicks | ✅ Blocked |
| DNS-blocked `t.co` | Links opening an `about:` page | ✅ Fixed |

---

## ⚙️ How it works

X puts a `t.co` short link into every `href`, but still ships the real destination to your browser. The script:

1. **Finds the real URL** as soon as a link appears on the page
2. **Rewrites the link**, so left-click, middle-click, keyboard and context menu all go straight to the real site
3. **Hides the click from X's own handlers**, so it is not reported
4. **Leaves the rest to the browser** — new tab, no referrer, modifier keys behave as usual

<details>
<summary><b>Where the real URL comes from</b></summary>

<br>

1. **React data** — every shortened link has a URL entity (`t.co` URL → real URL) in the props of a React component above it. The script matches it by the exact `t.co` URL, so it never guesses
2. **`title` attribute** — the newer X client puts the full URL there for links in posts
3. **Visible text** — the classic client renders the full URL as text inside the link (fallback)

A candidate is only used if it is an absolute `http(s)` URL that does not lead back to `t.co`. Links that cannot be resolved are left untouched.

X reports middle-clicks from a `mouseup` handler rather than from `click`, so the script hides that event as well.

</details>

---

## 🔒 Privacy

- **No external requests** — the script never contacts any server
- **No permissions** — it runs with `@grant none`
- **No dependencies** — one file of plain JavaScript, under 200 lines. Read it before you install it

---

## 🧩 Compatibility

Tested on **Brave**, **Chrome**, and **Firefox** with Tampermonkey or Violentmonkey.

Uses `wrappedJSObject` to bypass Firefox's Xray wrappers for React Fiber access — works transparently on Chrome where this isn't needed.

Works especially well combined with **DNS-level `t.co` blocking** (Pi-hole, AdGuard Home, router filters, etc.).

---

## ⚠️ Limitations

- Relies on React's internal `__reactFiber$` properties for most links — may need an update if Twitter changes their internal structure significantly
- Logged out, X serves a newer client that no longer ships the destination of link previews (Cards) and of the profile website link. There, only links inside posts are fixed
- A Card whose link is not part of the post's own link data stays on `t.co`

Found a link that still goes through `t.co`? Open an [issue](https://github.com/psimaker/twitter-x-spy-link-remover/issues) and mention the kind of link (post, Card, profile) and whether you were logged in.

---

## 📜 Changelog

See [Releases](https://github.com/psimaker/twitter-x-spy-link-remover/releases).

---

## License

[MIT](LICENSE) — do whatever you want with it.
