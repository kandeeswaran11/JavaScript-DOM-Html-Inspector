/* ── DOM Inspector Bookmarklet — full source ──
 * Paste the MINIFIED version into your address bar as:
 *   javascript: <code>
 * Or drag the bookmarklet link to your bookmarks bar.
 *
 * Features:
 *  - Click any element to capture it
 *  - Shows: CSS selector, outerHTML, computed styles, DOM tree JSON
 *  - Output to: clipboard, prompt(), or overlay panel
 */

(function () {
  // Prevent double-inject
  if (window.__domInspectorActive) {
    window.__domInspectorRemove && window.__domInspectorRemove();
    return;
  }
  window.__domInspectorActive = true;

  /* ── Utility: generate unique CSS selector for an element ── */
  function getSelector(el) {
    if (el.id) return '#' + CSS.escape(el.id);
    const parts = [];
    while (el && el.nodeType === 1 && el !== document.body) {
      let selector = el.tagName.toLowerCase();
      if (el.id) { selector = '#' + CSS.escape(el.id); parts.unshift(selector); break; }
      const siblings = Array.from(el.parentNode?.children || []).filter(s => s.tagName === el.tagName);
      if (siblings.length > 1) selector += ':nth-of-type(' + (siblings.indexOf(el) + 1) + ')';
      parts.unshift(selector);
      el = el.parentNode;
    }
    return parts.join(' > ');
  }

  /* ── Utility: build compact DOM tree JSON ── */
  function domTree(el, depth) {
    if (depth > 4) return '…';
    const children = Array.from(el.children).map(c => domTree(c, depth + 1));
    const node = {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: el.className ? el.className.trim().split(/\s+/) : undefined,
      text: el.children.length === 0 ? el.textContent.trim().slice(0, 80) || undefined : undefined,
      children: children.length ? children : undefined,
    };
    // Clean undefined
    Object.keys(node).forEach(k => node[k] === undefined && delete node[k]);
    return node;
  }

  /* ── Utility: key computed styles ── */
  function getStyles(el) {
    const cs = window.getComputedStyle(el);
    const keys = ['display','position','width','height','margin','padding',
                  'font-size','font-family','color','background-color',
                  'border','z-index','flex','grid-template-columns','overflow'];
    const out = {};
    keys.forEach(k => { const v = cs.getPropertyValue(k); if (v && v !== 'none' && v !== 'normal' && v !== 'auto') out[k] = v; });
    return out;
  }

  /* ── Overlay UI ── */
  const overlay = document.createElement('div');
  overlay.id = '__dom_inspector_overlay';
  overlay.innerHTML = `
    <div id="__di_toolbar">
      <span id="__di_title">🔍 DOM Inspector — click any element</span>
      <div id="__di_btns">
        <button id="__di_btn_html">HTML</button>
        <button id="__di_btn_sel">Selector</button>
        <button id="__di_btn_tree">Tree</button>
        <button id="__di_btn_styles">Styles</button>
        <button id="__di_btn_copy">📋 Copy</button>
        <button id="__di_btn_close">✕</button>
      </div>
    </div>
    <pre id="__di_output">Click any element on the page…</pre>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #__dom_inspector_overlay {
      all: initial;
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 2147483647;
      background: #0d1117; color: #c9d1d9; font-family: 'JetBrains Mono', monospace, monospace;
      font-size: 12px; border-top: 2px solid #f0c040;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.6);
      display: flex; flex-direction: column; max-height: 40vh;
    }
    #__di_toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 12px; background: #161b22; border-bottom: 1px solid #30363d; flex-shrink: 0;
    }
    #__di_title { font-weight: 700; color: #f0c040; font-size: 11px; letter-spacing:.05em; }
    #__di_btns { display: flex; gap: 6px; }
    #__di_btns button {
      all: initial; font-family: inherit; font-size: 10px; font-weight: 600;
      padding: 3px 10px; border-radius: 4px; cursor: pointer; letter-spacing:.04em;
      background: #21262d; color: #8b949e; border: 1px solid #30363d;
      transition: all .15s;
    }
    #__di_btns button:hover { background: #f0c040; color: #0d1117; border-color: #f0c040; }
    #__di_btns button.active { background: #f0c040; color: #0d1117; border-color: #f0c040; }
    #__di_btn_copy { background: #238636; color: #fff; border-color: #2ea043; }
    #__di_btn_copy:hover { background: #2ea043; color: #fff; }
    #__di_btn_close { background: #da3633; color: #fff; border-color: #f85149; }
    #__di_btn_close:hover { background: #f85149; }
    #__di_output {
      margin: 0; padding: 10px 14px; overflow: auto; white-space: pre-wrap;
      word-break: break-all; line-height: 1.6; color: #a5d6ff; flex: 1;
    }
    .__di_highlight {
      outline: 2px solid #f0c040 !important;
      outline-offset: 1px !important;
      background-color: rgba(240,192,64,0.08) !important;
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);

  /* ── State ── */
  let currentEl = null;
  let mode = 'html'; // html | selector | tree | styles
  let hovered = null;

  const output = document.getElementById('__di_output');

  function setMode(m) {
    mode = m;
    ['html','sel','tree','styles'].forEach(id => {
      const b = document.getElementById('__di_btn_' + id);
      if (b) b.classList.toggle('active', id === m.replace('selector','sel'));
    });
    document.getElementById('__di_btn_sel').classList.toggle('active', m === 'selector');
    render();
  }

  function render() {
    if (!currentEl) { output.textContent = 'Click any element on the page…'; return; }
    try {
      if (mode === 'html')      output.textContent = currentEl.outerHTML;
      if (mode === 'selector')  output.textContent = getSelector(currentEl);
      if (mode === 'tree')      output.textContent = JSON.stringify(domTree(currentEl, 0), null, 2);
      if (mode === 'styles')    output.textContent = JSON.stringify(getStyles(currentEl), null, 2);
    } catch(e) { output.textContent = 'Error: ' + e.message; }
  }

  function getCurrentData() {
    if (!currentEl) return '';
    if (mode === 'html')     return currentEl.outerHTML;
    if (mode === 'selector') return getSelector(currentEl);
    if (mode === 'tree')     return JSON.stringify(domTree(currentEl, 0), null, 2);
    if (mode === 'styles')   return JSON.stringify(getStyles(currentEl), null, 2);
    return '';
  }

  /* ── Button handlers ── */
  document.getElementById('__di_btn_html').addEventListener('click', () => setMode('html'));
  document.getElementById('__di_btn_sel').addEventListener('click', () => setMode('selector'));
  document.getElementById('__di_btn_tree').addEventListener('click', () => setMode('tree'));
  document.getElementById('__di_btn_styles').addEventListener('click', () => setMode('styles'));

  document.getElementById('__di_btn_copy').addEventListener('click', () => {
    const data = getCurrentData();
    navigator.clipboard.writeText(data).then(() => {
      const btn = document.getElementById('__di_btn_copy');
      btn.textContent = '✓ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 1500);
    });
  });

  /* ── Remove / cleanup ── */
  function remove() {
    document.removeEventListener('mouseover', onHover, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKey, true);
    if (hovered) hovered.classList.remove('__di_highlight');
    overlay.remove();
    style.remove();
    window.__domInspectorActive = false;
    window.__domInspectorRemove = null;
  }
  window.__domInspectorRemove = remove;
  document.getElementById('__di_btn_close').addEventListener('click', remove);

  /* ── Hover highlight ── */
  function onHover(e) {
    if (overlay.contains(e.target)) return;
    if (hovered && hovered !== e.target) hovered.classList.remove('__di_highlight');
    hovered = e.target;
    hovered.classList.add('__di_highlight');
  }

  /* ── Click capture ── */
  function onClick(e) {
    if (overlay.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    currentEl = e.target;
    if (hovered) hovered.classList.remove('__di_highlight');
    render();

    // Also auto-copy selector to clipboard silently
    try { navigator.clipboard.writeText(getSelector(currentEl)); } catch(_) {}
  }

  /* ── ESC to close ── */
  function onKey(e) { if (e.key === 'Escape') remove(); }

  document.addEventListener('mouseover', onHover, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);

  // Default mode button highlight
  setMode('html');
})();
