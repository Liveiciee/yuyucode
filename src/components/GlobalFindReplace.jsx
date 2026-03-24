// ── GlobalFindReplace — search & replace across all project files ─────────────
import React, { useState, useCallback } from 'react';
import { Search, Replace, ChevronDown, ChevronRight, Loader } from 'lucide-react';
import { callServer } from '../api.js';

export function GlobalFindReplace({ folder, onOpenFile, onClose, T }) {
  const [query,       setQuery]       = useState('');
  const [replaceStr,  setReplaceStr]  = useState('');
  const [results,     setResults]     = useState([]); // [{file, matches:[{line,col,text}]}]
  const [searching,   setSearching]   = useState(false);
  const [replacing,   setReplacing]   = useState(false);
  const [replaceLog,  setReplaceLog]  = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [expanded,    setExpanded]    = useState(new Set());
  const [useRegex,    setUseRegex]    = useState(false);
  const [matchCase,   setMatchCase]   = useState(false);

  const bg      = T?.bg2          || '#111116';
  const bg3     = T?.bg3          || 'rgba(255,255,255,.04)';
  const border  = T?.border       || 'rgba(255,255,255,.06)';
  const borderMed = T?.borderMed  || 'rgba(255,255,255,.1)';
  const text    = T?.text         || '#f0f0f0';
  const textMute = T?.textMute    || 'rgba(255,255,255,.3)';
  const textSec = T?.textSec      || 'rgba(255,255,255,.55)';
  const accent  = T?.accent       || '#a78bfa';
  const accentBg = T?.accentBg    || 'rgba(124,58,237,.15)';
  const accentBorder = T?.accentBorder || 'rgba(124,58,237,.3)';
  const error   = T?.error        || '#f87171';

  // ── Search ──────────────────────────────────────────────────────────────────
  const doSearch = useCallback(async () => {
    if (!query.trim() || !folder) return;
    setSearching(true);
    setResults([]);
    setReplaceLog('');

    const flags = ['-rn', '--include=*.js', '--include=*.jsx', '--include=*.ts',
      '--include=*.tsx', '--include=*.css', '--include=*.json', '--include=*.md',
      '--include=*.html', '--include=*.py', '--exclude-dir=node_modules',
      '--exclude-dir=.git', '--exclude-dir=dist', '--exclude-dir=android'];
    if (!matchCase) flags.push('-i');
    const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const cmd = `grep ${flags.join(' ')} -- "${pattern}" "${folder}" 2>/dev/null | head -500`;

    const r = await callServer({ type: 'exec', path: folder, command: cmd });
    setSearching(false);

    if (!r.ok || !r.data) { setResults([]); return; }

    const fileMap = new Map();
    (r.data || '').split('\n').filter(Boolean).forEach(line => {
      const m = line.match(/^(.+?):(\d+):\s*(.*)/);
      if (!m) return;
      const [, filePath, lineNum, content] = m;
      const rel = filePath.startsWith(folder) ? filePath.slice(folder.length + 1) : filePath;
      if (!fileMap.has(rel)) fileMap.set(rel, []);
      fileMap.get(rel).push({ line: parseInt(lineNum), text: content.trim() });
    });

    const parsed = Array.from(fileMap.entries()).map(([file, matches]) => ({ file, matches }));
    setResults(parsed);
    if (parsed.length <= 5) setExpanded(new Set(parsed.map(p => p.file)));
  }, [query, folder, useRegex, matchCase]);

  // ── Replace all ─────────────────────────────────────────────────────────────
  const doReplaceAll = useCallback(async () => {
    if (!query.trim() || replaceStr === undefined || !folder) return;
    setReplacing(true);
    setReplaceLog('');
    let replaced = 0;
    for (const { file } of results) {
      const absPath = folder + '/' + file;
      const r = await callServer({ type: 'read', path: absPath });
      if (!r.ok) continue;
      const content = r.data || '';
      const flags = matchCase ? 'g' : 'gi';
      const pattern = useRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newContent = content.replace(pattern, replaceStr);
      if (newContent === content) continue;
      const w = await callServer({ type: 'write', path: absPath, content: newContent });
      if (w.ok) { replaced++; setReplaceLog(l => l + `✅ ${file}\n`); }
      else setReplaceLog(l => l + `❌ ${file}: ${w.data}\n`);
    }
    setReplaceLog(l => l + `\n${replaced} file diupdate.`);
    setReplacing(false);
    doSearch(); // re-run search to show updated results
  }, [query, replaceStr, results, folder, useRegex, matchCase, doSearch]);

  const totalMatches = results.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div style={{
      position: 'absolute', inset: 0, background: bg,
      zIndex: 99, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid ' + border,
        display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, background: bg3 }}>
        <Search size={14} style={{ color: accent, flexShrink: 0 }}/>
        <span style={{ fontSize: '13px', fontWeight: '600', color: text, flex: 1 }}>
          Global Find & Replace
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: textMute,
          fontSize: '18px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}>×</button>
      </div>

      {/* Search bar */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid ' + border, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Cari..."
            style={{ flex: 1, background: bg3, border: '1px solid ' + borderMed, borderRadius: '8px',
              padding: '8px 12px', color: text, fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
          />
          <button onClick={() => setMatchCase(v => !v)}
            style={{ background: matchCase ? accentBg : bg3, border: '1px solid ' + (matchCase ? accentBorder : border),
              borderRadius: '6px', padding: '6px 10px', color: matchCase ? accent : textMute,
              fontSize: '11px', cursor: 'pointer', flexShrink: 0 }} title="Match case">Aa</button>
          <button onClick={() => setUseRegex(v => !v)}
            style={{ background: useRegex ? accentBg : bg3, border: '1px solid ' + (useRegex ? accentBorder : border),
              borderRadius: '6px', padding: '6px 10px', color: useRegex ? accent : textMute,
              fontSize: '11px', cursor: 'pointer', flexShrink: 0, fontFamily: 'monospace' }} title="Use regex">.*</button>
          <button onClick={doSearch} disabled={searching || !query.trim()}
            style={{ background: accent, border: 'none', borderRadius: '8px', padding: '8px 16px',
              color: 'white', fontSize: '12px', cursor: searching ? 'default' : 'pointer',
              flexShrink: 0, opacity: !query.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {searching ? <Loader size={12} style={{ animation: 'pulse 1.2s infinite' }}/> : <Search size={12}/>}
            {searching ? 'Mencari···' : 'Cari'}
          </button>
        </div>

        {/* Replace row */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => setShowReplace(v => !v)}
            style={{ background: 'none', border: 'none', color: textMute, cursor: 'pointer',
              padding: '2px 4px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}>
            {showReplace ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
            Replace
          </button>
          {showReplace && (
            <>
              <input
                value={replaceStr}
                onChange={e => setReplaceStr(e.target.value)}
                placeholder="Ganti dengan..."
                style={{ flex: 1, background: bg3, border: '1px solid ' + borderMed, borderRadius: '8px',
                  padding: '6px 12px', color: text, fontSize: '12px', outline: 'none', fontFamily: 'monospace' }}
              />
              <button onClick={doReplaceAll} disabled={replacing || !results.length}
                style={{ background: results.length ? 'rgba(248,113,113,.15)' : bg3,
                  border: '1px solid ' + (results.length ? error + '44' : border),
                  borderRadius: '8px', padding: '6px 12px', color: results.length ? error : textMute,
                  fontSize: '11px', cursor: results.length ? 'pointer' : 'default', flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: '4px' }}>
                {replacing ? <Loader size={11}/> : <Replace size={11}/>}
                {replacing ? 'Mengganti···' : `Replace all (${results.length} file)`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {/* Replace log */}
        {replaceLog && (
          <div style={{ margin: '4px 14px 8px', padding: '8px 12px', background: bg3,
            border: '1px solid ' + border, borderRadius: '8px', fontFamily: 'monospace',
            fontSize: '10px', color: textSec, whiteSpace: 'pre-wrap', maxHeight: '100px', overflowY: 'auto' }}>
            {replaceLog}
          </div>
        )}

        {/* Summary */}
        {results.length > 0 && !searching && (
          <div style={{ padding: '4px 14px 8px', fontSize: '11px', color: textMute }}>
            {totalMatches} hasil di {results.length} file
            <button onClick={() => setExpanded(new Set(results.map(r => r.file)))}
              style={{ background: 'none', border: 'none', color: accent, fontSize: '10px', cursor: 'pointer', marginLeft: '8px' }}>expand all</button>
            <button onClick={() => setExpanded(new Set())}
              style={{ background: 'none', border: 'none', color: textMute, fontSize: '10px', cursor: 'pointer', marginLeft: '4px' }}>collapse all</button>
          </div>
        )}

        {!searching && results.length === 0 && query && (
          <div style={{ padding: '20px 14px', color: textMute, fontSize: '12px', textAlign: 'center' }}>
            Tidak ada hasil untuk &ldquo;{query}&rdquo;
          </div>
        )}

        {results.map(({ file, matches }) => {
          const isExpanded = expanded.has(file);
          return (
            <div key={file} style={{ marginBottom: '2px' }}>
              {/* File header */}
              <div
                onClick={() => setExpanded(prev => {
                  const next = new Set(prev);
                  isExpanded ? next.delete(file) : next.add(file);
                  return next;
                })}
                style={{ display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', cursor: 'pointer', userSelect: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = bg3}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {isExpanded ? <ChevronDown size={11} style={{ color: textMute, flexShrink: 0 }}/> : <ChevronRight size={11} style={{ color: textMute, flexShrink: 0 }}/>}
                <span style={{ fontSize: '11px', color: accent, fontFamily: 'monospace', flex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</span>
                <span style={{ fontSize: '10px', color: textMute, flexShrink: 0,
                  background: bg3, padding: '1px 6px', borderRadius: '10px' }}>{matches.length}</span>
              </div>

              {/* Match lines */}
              {isExpanded && matches.map((m, i) => (
                <div key={i}
                  onClick={() => onOpenFile && onOpenFile(folder + '/' + file)}
                  style={{ display: 'flex', gap: '8px', padding: '3px 14px 3px 30px',
                    cursor: 'pointer', alignItems: 'baseline' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg3}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ fontSize: '10px', color: textMute, fontFamily: 'monospace',
                    flexShrink: 0, minWidth: '32px', textAlign: 'right' }}>{m.line}</span>
                  <span style={{ fontSize: '11px', color: textSec, fontFamily: 'monospace',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    flex: 1 }} dangerouslySetInnerHTML={{
                    __html: m.text.replace(
                      new RegExp(useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi'),
                      match => `<mark style="background:${accentBg};color:${accent};border-radius:2px;padding:0 1px">${match}</mark>`
                    )
                  }}/>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
