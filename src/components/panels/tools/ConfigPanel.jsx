import React from "react";
import { X, Settings } from 'lucide-react';
import { BottomSheet } from '../../panels.base.jsx';
import { resolveTheme } from '../../themeUtils.js';
import { THEME_KEYS } from '../../../constants.js';

export function ConfigPanel({
  effort, fontSize, theme, model, thinkingEnabled, models,
  onEffort, onFontSize, onTheme, onModel, onThinking,
  vimMode, onVimMode,
  showMinimap, onMinimap,
  ghostTextEnabled, onGhostText,
  lintEnabled, onLint,
  tsLspEnabled, onTsLsp,
  blameEnabled, onBlame,
  multiCursor, onMultiCursor,
  stickyScroll, onStickyScroll,
  collabEnabled, onCollab,
  diffReview, onDiffReview,
  onClose, T,
}) {
  const { bg3, border, text, textMute, accentBg, accentBorder, accent, success, successBg, warning } = resolveTheme(T);

  const configs = [
    { label: 'Effort Level', value: effort,           options: ['low','medium','high'],        onChange: onEffort },
    { label: 'Font Size',    value: String(fontSize),  options: ['12','13','14','15','16'],     onChange: v => onFontSize(parseInt(v)) },
    { label: 'Theme',        value: theme,             options: THEME_KEYS,                          onChange: onTheme },
    { label: 'Model',        value: model,             options: models.map(m => m.id),          onChange: onModel },
  ];

  const makeToggle = (label, sublabel, value, onToggle, color, bg, br) =>
    ({ label, sublabel, value, onToggle, color, bg, br });

  const fase12 = [
    makeToggle('Vim Mode',       'hjkl, normal/insert/visual',         vimMode,          onVimMode,    accent,  accentBg,  accentBorder),
    makeToggle('AI Ghost Text',  'inline suggestion, Tab to accept',   ghostTextEnabled, onGhostText,  success, successBg, success+'44'),
    makeToggle('Minimap',        'canvas scroll map side panel',       showMinimap,      onMinimap,    accent,  accentBg,  accentBorder),
    makeToggle('Inline Lint',    'syntax errors in gutter',            lintEnabled,      onLint,       warning, 'rgba(251,191,36,.1)', warning+'44'),
  ];

  const fase3 = [
    makeToggle('TypeScript LSP', 'autocomplete, hover types (TS/JS)', tsLspEnabled,  onTsLsp,       '#38bdf8', 'rgba(56,189,248,.1)',  '#38bdf844'),
    makeToggle('Inline Blame',   'git blame per line in gutter',       blameEnabled,  onBlame,       '#f59e0b', 'rgba(245,158,11,.1)', '#f59e0b44'),
    makeToggle('Multi-Cursor',   'Ctrl+D select next, Ctrl+Shift+L',  multiCursor,   onMultiCursor, success,   successBg,             success+'44'),
    makeToggle('Sticky Scroll',  'scope header stays at top',         stickyScroll,  onStickyScroll,accent,    accentBg,              accentBorder),
    makeToggle('Realtime Collab','sync edits across devices via WS',  collabEnabled, onCollab,      '#f59e0b', 'rgba(245,158,11,.1)', '#f59e0b44'),
    makeToggle('Diff Review',    'lihat diff sebelum agent apply patch/write', diffReview, onDiffReview, '#a78bfa', 'rgba(167,139,250,.1)', '#a78bfa44'),
  ];

  function ToggleRow({ t }) {
    return (
      <div style={{ padding: '10px 12px', background: t.value ? 'rgba(255,255,255,.025)' : bg3,
        border: '1px solid ' + (t.value ? t.br : border), borderRadius: '8px',
        display: 'flex', alignItems: 'center', gap: '10px', transition: 'all .15s' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', color: t.value ? t.color : text, fontWeight: t.value ? '600' : '400' }}>{t.label}</div>
          <div style={{ fontSize: '10px', color: textMute, marginTop: '2px' }}>{t.sublabel}</div>
        </div>
        <div onClick={() => t.onToggle?.(!t.value)}
          style={{ width: '40px', height: '22px', borderRadius: '11px', flexShrink: 0, cursor: 'pointer',
            background: t.value ? t.color : 'rgba(255,255,255,.12)', position: 'relative', transition: 'background .2s' }}>
          <div style={{ position: 'absolute', top: '3px', left: t.value ? '20px' : '3px', width: '16px', height: '16px',
            borderRadius: '50%', background: 'white', transition: 'left .2s' }}/>
        </div>
      </div>
    );
  }

  return (
    <BottomSheet onClose={onClose}>
      <div style={{ padding: '0 16px 8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: text, flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={14}/> Config
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textMute, fontSize: '16px', cursor: 'pointer' }}><X size={16}/></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {configs.map(cfg => (
            <div key={cfg.label} style={{ padding: '10px 12px', background: bg3, border: '1px solid ' + border, borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: textMute, marginBottom: '6px' }}>{cfg.label}</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {cfg.options.map(opt => (
                  <button key={opt} onClick={() => cfg.onChange(opt)}
                    style={{ background: cfg.value === opt ? accentBg : bg3, border: '1px solid ' + (cfg.value === opt ? accentBorder : border),
                      borderRadius: '6px', padding: '4px 10px', color: cfg.value === opt ? accent : textMute,
                      fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}>
                    {opt.length > 20 ? opt.slice(0, 20) + '…' : opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div style={{ padding: '10px 12px', background: bg3, border: '1px solid ' + border, borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: textMute, marginBottom: '6px' }}>Extended Thinking</div>
            <button onClick={onThinking}
              style={{ background: thinkingEnabled ? accentBg : bg3, border: '1px solid ' + (thinkingEnabled ? accentBorder : border),
                borderRadius: '6px', padding: '4px 10px', color: thinkingEnabled ? accent : textMute, fontSize: '11px', cursor: 'pointer' }}>
              {thinkingEnabled ? '✓ ON' : '○ OFF'}
            </button>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', padding: '2px 0' }}>
              Editor — Fase 1+2
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {fase12.map(t => <ToggleRow key={t.label} t={t}/>)}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '10px', color: textMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600', padding: '2px 0' }}>
              Editor — Fase 3
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {fase3.map(t => <ToggleRow key={t.label} t={t}/>)}
            </div>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
