# 🔍 DOM Inspector — Bookmarklet & Address Bar Tool

> Click any element on any page → instantly capture its HTML, CSS selector, computed styles, or DOM tree → copy to clipboard. No install required.

---

## 🚀 Quick Start — Method 1: Bookmarklet (Recommended)

### Step 1 — Open the installer page

Download or clone this repo, then open **`dom-inspector.html`** in your browser:

```
double-click  →  dom-inspector.html
```

Or if serving locally:

```bash
# Python
python -m http.server 8080
# then open http://localhost:8080/dom-inspector.html
```

### Step 2 — Add to your Bookmarks Bar

1. Make sure your **Bookmarks Bar is visible**
   - Chrome: `Ctrl+Shift+B` (Win/Linux) or `Cmd+Shift+B` (Mac)
   - Firefox: `View → Toolbars → Bookmarks Toolbar`

2. **Drag** the gold **`🔍 DOM Inspector`** button from the page onto your bookmarks bar

3. Done — it lives in your browser permanently, no extension needed

### Step 3 — Use it on any page

1. Navigate to any website
2. Click **`🔍 DOM Inspector`** in your bookmarks bar
3. A dark overlay panel appears at the bottom of the page
4. **Hover** over elements — they glow gold
5. **Click** any element to capture it
6. The **CSS selector is auto-copied to clipboard** on every click
7. Switch tabs to change what you capture:

| Tab | What you get |
|-----|-------------|
| **HTML** | Full `outerHTML` of the element and all its children |
| **Selector** | Unique CSS path e.g. `#main > div:nth-of-type(2) > p` |
| **Tree** | Nested JSON — tag, id, classes, text (4 levels deep) |
| **Styles** | Key computed CSS: display, position, size, font, color |

8. Hit **`📋 Copy`** to copy the current view to clipboard
9. Press **`ESC`** or click **`✕`** to close the overlay

---

## ⌨️ Method 2: Address Bar Snippet

No bookmarks bar? Paste the snippet directly into Chrome's address bar and press **Enter**.

> ⚠️ Chrome strips the `javascript:` prefix when you paste — that's normal. Just press Enter.

Copy the full snippet from **`dom-inspector.html`** → *METHOD 2* section, or from [`bookmarklet.min.js`](./bookmarklet.min.js).

---

## ⚡ Method 3: Quick One-Liners

Paste any of these into the address bar for instant results — no overlay:

```javascript
// Copy page title + URL
javascript:navigator.clipboard.writeText(document.title+'\n'+location.href).then(()=>alert('Copied!'));
```

```javascript
// Show all links in a prompt box
javascript:prompt('All links',Array.from(document.querySelectorAll('a')).map(a=>a.href).filter(Boolean).join('\n'));
```

```javascript
// Copy full page HTML to clipboard
javascript:navigator.clipboard.writeText(document.documentElement.outerHTML).then(()=>alert('HTML copied! ('+document.documentElement.outerHTML.length+' chars)'));
```

```javascript
// Copy all visible text content
javascript:navigator.clipboard.writeText(document.body.innerText).then(()=>alert('Text copied!'));
```

```javascript
// Inspect any element by CSS selector → shows outerHTML in prompt
javascript:(function(){var s=prompt('CSS Selector?','h1');var el=document.querySelector(s);el?prompt('outerHTML',el.outerHTML):alert('Not found');})();
```

---

## 📁 Files

```
dom-inspector/
├── dom-inspector.html      ← Open this in your browser to install the bookmarklet
├── bookmarklet-source.js   ← Full readable source code of the bookmarklet
├── bookmarklet.min.js      ← Minified javascript: snippet (ready to paste)
└── README.md
```

---

## ✨ Features

- **Zero install** — pure `javascript:` bookmarklet, works in any browser
- **Works on any site** — including sites with strict CSP (no eval used for the overlay itself)
- **Gold hover highlight** — visual feedback as you move over elements
- **Auto-copy on click** — CSS selector goes to clipboard the moment you click
- **4 capture modes** — HTML, Selector, Tree JSON, Computed Styles
- **Toggle on/off** — clicking the bookmarklet again while active closes the inspector
- **ESC to dismiss** — keyboard friendly
- **No external dependencies** — no jQuery, no CDN, fully self-contained

---

## 🌐 Browser Compatibility

| Browser | Bookmarklet | Address Bar |
|---------|------------|-------------|
| Chrome 90+ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ |
| Firefox 88+ | ✅ | ✅ |
| Safari 14+ | ✅ | ⚠️ Clipboard API needs user gesture |

---

## 🔒 Privacy

This tool runs **100% locally in your browser**. No data is sent anywhere. Nothing is stored. Closing the overlay or refreshing the page removes all traces.

---

## 📄 License

MIT — free to use, modify, and distribute.
