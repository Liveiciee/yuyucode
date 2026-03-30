import React from 'react';
import { Play } from 'lucide-react';

export function TabBar({ T, file, ui }) {
  const activeTab = file.openTabs[file.activeTabIdx] || null;

  return (
    <div style={{
      display: 'flex', borderBottom: '1px solid ' + T.border,
      flexShrink: 0, background: T.bg, minHeight: '48px',
      alignItems: 'stretch', padding: '0 6px', gap: '2px',
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      {/* Chat tab */}
      <button onClick={() => file.setActiveTab('chat')}
        style={{
          padding: '0 14px', flexShrink: 0,
          background: file.activeTab === 'chat' ? T.accentBg : 'none',
          border: file.activeTab === 'chat' ? '1px solid ' + T.accentBorder : '1px solid transparent',
          borderRadius: '8px', margin: '6px 2px',
          color: file.activeTab === 'chat' ? T.accent : T.textMute,
          fontSize: '13px', cursor: 'pointer',
          fontWeight: file.activeTab === 'chat' ? '600' : '400',
        }}>
        Chat
      </button>

      {/* File tabs */}
      {file.openTabs.map((tab, idx) => {
        const isActive = file.activeTab === 'file' && file.activeTabIdx === idx;
        const name = tab.path.split('/').pop();
        return (
          <div key={tab.path} style={{
            display: 'flex', alignItems: 'center', gap: '0', flexShrink: 0,
            background: isActive ? T.bg3 : 'none',
            border: isActive ? '1px solid ' + T.border : '1px solid transparent',
            borderRadius: '8px', margin: '6px 2px',
            overflow: 'hidden',
          }}>
            <button
              onClick={() => { file.setActiveTabIdx(idx); file.setActiveTab('file'); file.setEditMode(false); }}
              style={{
                background: 'none', border: 'none', padding: '0 4px 0 10px',
                color: isActive ? T.text : T.textMute,
                fontSize: '12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                maxWidth: '130px', minHeight: '36px',
              }}>
              {tab.dirty && <span style={{ color: T.warning, fontSize: '9px', flexShrink: 0 }}>●</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
            </button>
            {/* Edit mode toggle */}
            {isActive && (
              <button
                onClick={() => file.setEditMode(!file.editMode)}
                style={{
                  background: file.editMode ? 'rgba(245,158,11,.15)' : 'none',
                  border: 'none', padding: '0 6px',
                  color: file.editMode ? '#f59e0b' : T.textMute,
                  fontSize: '10px', cursor: 'pointer', minHeight: '36px',
                }}>
                {file.editMode ? 'edit' : 'view'}
              </button>
            )}
            {/* Close */}
            <button
              onClick={e => { e.stopPropagation(); file.closeTab(idx); }}
              style={{
                background: 'none', border: 'none', padding: '0 7px',
                color: T.textMute, fontSize: '14px', cursor: 'pointer',
                minHeight: '36px', lineHeight: 1,
              }}
              onMouseEnter={e => e.currentTarget.style.color = T.text}
              onMouseLeave={e => e.currentTarget.style.color = T.textMute}>
              ×
            </button>
          </div>
        );
      })}

      <div style={{ flex: 1 }}/>

      {/* Live Preview button */}
      {file.activeTab === 'file' && (
        <button
          onClick={() => ui.setShowLivePreview(!ui.showLivePreview)}
          title="Live Preview"
          style={{
            padding: '0 10px', flexShrink: 0,
            background: ui.showLivePreview ? T.accentBg : 'none',
            border: ui.showLivePreview ? '1px solid ' + T.accentBorder : '1px solid transparent',
            borderRadius: '8px', margin: '6px 2px',
            color: ui.showLivePreview ? T.accent : T.textMute,
            fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
          <Play size={10}/> Preview
        </button>
      )}

      {/* Terminal toggle */}
      <button onClick={() => ui.setShowTerminal(!ui.showTerminal)}
        style={{
          padding: '0 12px', flexShrink: 0,
          background: ui.showTerminal ? T.bg3 : 'none',
          border: ui.showTerminal ? '1px solid ' + T.border : '1px solid transparent',
          borderRadius: '8px', margin: '6px 2px',
          color: ui.showTerminal ? T.textSec : T.textMute,
          fontSize: '13px', cursor: 'pointer', fontFamily: 'monospace',
        }}>
        $
      </button>
    </div>
  );
}
