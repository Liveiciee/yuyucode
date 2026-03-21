// ── LivePreview — live HTML/CSS/JS iframe preview ─────────────────────────────
// Combines open HTML/CSS/JS files into a single srcdoc iframe.
// Intercepts console.log via postMessage for in-app display.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, Terminal as TermIcon, X, AlertCircle } from 'lucide-react';

const CONSOLE_INTERCEPT = `
<script>
(function(){
  var _c = window.console;
  ['log','warn','error','info'].forEach(function(m){
    var orig = _c[m].bind(_c);
    _c[m] = function(){
      var args = Array.prototype.slice.call(arguments);
      window.parent.postMessage({type:'console',level:m,args:args.map(function(a){
        try{return JSON.stringify(a);}catch(e){return String(a);}
      })}, '*');
      orig.apply(_c, arguments);
    };
  });
  window.addEventListener('error', function(e){
    window.parent.postMessage({type:'console',level:'error',args:[e.message + ' (line '+e.lineno+')']}, '*');
  });
})();
</script>
`;

function buildSrcdoc(tabs) {
  const htmlTab = tabs.find(t => /\.html?$/.test(t.path));
  const cssTab  = tabs.find(t => /\.s?css$/.test(t.path));
  const jsTab   = tabs.find(t => /\.[jt]sx?$/.test(t.path) && !/\.test\.|\.spec\./.test(t.path));

  if (htmlTab) {
    // Inject CSS and JS into HTML
    let html = htmlTab.content || '';
    if (cssTab && !html.includes('<link') && !html.includes('<style')) {
      html = html.replace('</head>', `<style>${cssTab.content}</style></head>`);
    }
    if (jsTab && !html.includes('<script')) {
      html = html.replace('</body>', `<script>${jsTab.content}</script></body>`);
    }
    return CONSOLE_INTERCEPT + html;
  }

  // No HTML tab — synthesize one from CSS + JS
  return `<!DOCTYPE html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${cssTab ? `<style>${cssTab.content}</style>` : ''}
${CONSOLE_INTERCEPT}
</head><body>
<div id="app"></div>
${jsTab ? `<script type="module">${jsTab.content}</script>` : '<p style="font:14px monospace;padding:16px;opacity:.5">No JS / HTML file open</p>'}
</body></html>`;
}

export function LivePreview({ tabs, T, onClose }) {
  const iframeRef   = useRef(null);
  const [logs, setLogs]     = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [srcdoc, setSrcdoc] = useState('');
  const refreshTimer = useRef(null);

  const bg      = T?.bg2       || '#111116';
  const bg3     = T?.bg3       || 'rgba(255,255,255,.04)';
  const border  = T?.border    || 'rgba(255,255,255,.06)';
  const textMute = T?.textMute || 'rgba(255,255,255,.3)';
  const accent  = T?.accent    || '#a78bfa';
  const accentBg = T?.accentBg || 'rgba(124,58,237,.15)';
  const error   = T?.error     || '#f87171';
  const warning = T?.warning   || '#fbbf24';

  // Debounced rebuild on tab content change
  useEffect(() => {
    if (!autoRefresh) return;
    clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => {
      setSrcdoc(buildSrcdoc(tabs));
    }, 300);
    return () => clearTimeout(refreshTimer.current);
  }, [tabs, autoRefresh]);

  // Manual refresh
  const refresh = useCallback(() => {
    setSrcdoc('');
    requestAnimationFrame(() => setSrcdoc(buildSrcdoc(tabs)));
  }, [tabs]);

  // Console message listener
  useEffect(() => {
    function onMsg(e) {
      // srcdoc iframes have origin 'null' — reject anything else
      if (e.origin !== 'null') return;
      if (e.data?.type !== 'console') return;
      const { level, args } = e.data;
      setLogs(prev => [...prev.slice(-99), { level, text: args.join(' '), ts: Date.now() }]);
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const logColor = (level) => {
    if (level === 'error') return error;
    if (level === 'warn') return warning;
    if (level === 'info') return accent;
    return textMute;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: bg }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
        borderBottom: '1px solid ' + border, background: bg3, flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', color: textMute, fontFamily: 'monospace', flex: 1 }}>
          Live Preview
        </span>
        <button
          onClick={() => setAutoRefresh(v => !v)}
          style={{
            background: autoRefresh ? accentBg : bg3,
            border: '1px solid ' + (autoRefresh ? T?.accentBorder || accent + '44' : border),
            borderRadius: '6px', padding: '4px 10px',
            color: autoRefresh ? accent : textMute,
            fontSize: '11px', cursor: 'pointer',
          }}
        >
          {autoRefresh ? '● auto' : '○ manual'}
        </button>
        <button
          onClick={refresh}
          style={{ background: bg3, border: '1px solid ' + border, borderRadius: '6px',
            padding: '4px 8px', color: textMute, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <RefreshCw size={12}/>
        </button>
        <button
          onClick={() => setShowLogs(v => !v)}
          style={{
            background: logs.some(l => l.level === 'error') ? T?.errorBg || 'rgba(248,113,113,.1)' : bg3,
            border: '1px solid ' + (logs.some(l => l.level === 'error') ? error + '44' : border),
            borderRadius: '6px', padding: '4px 8px',
            color: logs.length ? (logs.some(l => l.level === 'error') ? error : warning) : textMute,
            fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          <TermIcon size={11}/>
          {logs.length > 0 && <span>{logs.length}</span>}
        </button>
        {onClose && (
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', color: textMute, cursor: 'pointer',
              fontSize: '16px', lineHeight: 1, padding: '2px 4px' }}>
            ×
          </button>
        )}
      </div>

      {/* Console panel */}
      {showLogs && (
        <div style={{
          height: '140px', overflowY: 'auto', flexShrink: 0,
          borderBottom: '1px solid ' + border, background: bg,
          fontFamily: '"JetBrains Mono", monospace', fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '4px 10px', borderBottom: '1px solid ' + border }}>
            <span style={{ color: textMute, fontSize: '10px', flex: 1 }}>Console</span>
            <button onClick={() => setLogs([])}
              style={{ background: 'none', border: 'none', color: textMute, cursor: 'pointer', fontSize: '10px' }}>
              Clear
            </button>
          </div>
          {logs.length === 0 && (
            <div style={{ padding: '8px 10px', color: textMute, fontSize: '11px' }}>No output yet~</div>
          )}
          {logs.map((l, i) => (
            <div key={i} style={{
              padding: '3px 10px', color: logColor(l.level),
              display: 'flex', gap: '8px', alignItems: 'flex-start',
              borderBottom: '1px solid ' + border + '55',
            }}>
              {l.level === 'error' && <AlertCircle size={10} style={{ flexShrink: 0, marginTop: '2px' }}/>}
              <span style={{ wordBreak: 'break-all', flex: 1 }}>{l.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* iframe */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {srcdoc ? (
          <iframe
            ref={iframeRef}
            srcDoc={srcdoc}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
            title="Live Preview"
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: textMute, fontSize: '13px' }}>
            Loading preview···
          </div>
        )}
      </div>
    </div>
  );
}
