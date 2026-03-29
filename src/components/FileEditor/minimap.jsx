// src/components/FileEditor/minimap.jsx
import React, { useRef, useEffect } from 'react';

export function Minimap({ viewRef, T }) {
  const canvasRef = useRef(null);
  const frameRef  = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;
    function draw() {
      if (!running) return;
      const view = viewRef.current;
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = T?.bg3 || 'rgba(255,255,255,.03)';
      ctx.fillRect(0, 0, W, H);
      if (!view) { frameRef.current = requestAnimationFrame(draw); return; }
      const doc = view.state.doc;
      const totalLines = doc.lines;
      const lineH = Math.max(1, H / Math.max(totalLines, 1));
      for (let i = 1; i <= totalLines; i++) {
        const src = doc.line(i).text;
        const len = src.trimStart().length;
        const indent = src.length - src.trimStart().length;
        if (!len) continue;
        let color = T?.textMute || 'rgba(255,255,255,.15)';
        if (/^\s*(\/\/|#|<!--|\/\*)/.test(src)) color = (T?.success || '#4ade80') + '55';
        else if (/^\s*(import|export|from|require)/.test(src)) color = (T?.accent || '#a78bfa') + '88';
        else if (/^\s*(function|const|let|var|class|def|return)/.test(src)) color = (T?.accentBorder || '#7c3aed') + 'aa';
        else if (/^\s*['<]/.test(src)) color = (T?.warning || '#fbbf24') + '66';
        const y = ((i - 1) / Math.max(totalLines - 1, 1)) * (H - lineH);
        const xStart = Math.min(indent * 0.7, W * 0.3);
        const xEnd   = Math.min(xStart + len * 0.85, W - 2);
        ctx.fillStyle = color;
        ctx.fillRect(xStart, y, Math.max(xEnd - xStart, 1), Math.max(lineH * 0.7, 1));
      }
      try {
        const { scrollTop, scrollHeight, clientHeight } = view.scrollDOM;
        if (scrollHeight > clientHeight) {
          const ratio = clientHeight / scrollHeight;
          const vpH = H * ratio, vpY = (scrollTop / scrollHeight) * H;
          ctx.fillStyle = (T?.accent || '#a78bfa') + '22';
          ctx.fillRect(0, vpY, W, vpH);
          ctx.strokeStyle = (T?.accentBorder || '#7c3aed') + '55';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, vpY, W, vpH);
        }
      } catch (_) {}
      frameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [viewRef, T]);
  return (
    <canvas ref={canvasRef} width={64} height={300} style={{
      width: '64px', height: '100%', flexShrink: 0, cursor: 'pointer',
      borderLeft: '1px solid ' + (T?.border || 'rgba(255,255,255,.06)'),
    }} onClick={e => {
      const view = viewRef.current;
      if (!view) return;
      const rect  = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientY - rect.top) / rect.height;
      const doc   = view.state.doc;
      const line  = Math.max(1, Math.min(Math.round(ratio * doc.lines), doc.lines));
      view.dispatch({ selection: { anchor: doc.line(line).from }, scrollIntoView: true });
    }}/>
  );
}
