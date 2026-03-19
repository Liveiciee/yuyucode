import React, { useEffect, useRef } from 'react';

// ── ThemeEffects ───────────────────────────────────────────────────────────────
// Render semua visual overlay berdasarkan tema aktif:
//   - Atmosphere orbs (semua tema)
//   - Scanlines layer (obsidian, neon)
//   - CRT scan bar (obsidian)
//   - Aurora animated orbs (aurora)
//   - Neon grid + scan pulse (neon)
//   - Paper grain SVG (ink)
//   - Vignette corner (obsidian)
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeEffects({ T }) {
  const name = T?.name || '';
  const isNeon     = name.toLowerCase().includes('neon');
  const isAurora   = name.toLowerCase().includes('aurora');
  const isInk      = name.toLowerCase().includes('ink');
  const isObsidian = name.toLowerCase().includes('obsidian');

  // Inject theme CSS once per theme change
  useEffect(() => {
    const id = 'yuyu-theme-css';
    let el = document.getElementById(id);
    if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
    el.textContent = T?.css || '';
    return () => { if (el) el.textContent = ''; };
  }, [T?.name]);

  const base = { position:'fixed', inset:0, pointerEvents:'none', zIndex:1, overflow:'hidden' };

  return (
    <>
      {/* ── Atmosphere Orbs (semua tema) ──────────────────────────────────── */}
      {T?.atm?.length > 0 && (
        <div style={base}>
          {T.atm.map((orb, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: orb.x, top: orb.y,
              width: orb.size, height: orb.size,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
              transform: 'translate(-50%,-50%)',
              animation: isAurora
                ? `auroraFloat${(i%3)+1} ${18+i*6}s ease-in-out infinite`
                : undefined,
              transition: 'opacity .5s',
            }}/>
          ))}
        </div>
      )}

      {/* ── Scanlines (obsidian, neon) ─────────────────────────────────────── */}
      {T?.scanlines && (
        <div style={{
          ...base,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.08) 2px, rgba(0,0,0,.08) 4px)',
          mixBlendMode: 'multiply',
          opacity: isNeon ? .4 : .55,
        }}/>
      )}

      {/* ── CRT rolling scan bar (obsidian) ──────────────────────────────── */}
      {isObsidian && (
        <div style={{
          ...base,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            height: '120px',
            background: 'linear-gradient(transparent, rgba(217,119,6,.025) 50%, transparent)',
            animation: 'crtScan 10s linear infinite',
            mixBlendMode: 'screen',
          }}/>
          {/* Corner vignette */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.45) 100%)',
          }}/>
        </div>
      )}

      {/* ── Neon grid + scan pulse (neon) ─────────────────────────────────── */}
      {isNeon && (
        <div style={{ ...base, opacity:.6 }}>
          {/* Subtle perspective grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,255,140,.025) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,140,.025) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            animation: 'gridPan 8s linear infinite',
            maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
          }}/>
          {/* Horizontal scan pulse */}
          <div style={{
            position: 'absolute', left:0, right:0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0,255,140,.3) 40%, rgba(0,255,140,.5) 50%, rgba(0,255,140,.3) 60%, transparent)',
            animation: 'neonScan 7s linear infinite',
            filter: 'blur(1px)',
          }}/>
          {/* Corner vignette dark */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.7) 100%)',
          }}/>
        </div>
      )}

      {/* ── Aurora shimmer overlay (aurora) ───────────────────────────────── */}
      {isAurora && (
        <div style={{ ...base }}>
          {/* Diagonal aurora band */}
          <div style={{
            position: 'absolute',
            top: '-20%', left: '-20%',
            width: '80%', height: '140%',
            background: 'linear-gradient(125deg, rgba(99,102,241,.04), rgba(236,72,153,.06) 40%, rgba(52,211,153,.03) 70%, transparent)',
            filter: 'blur(60px)',
            animation: 'auroraFloat1 22s ease-in-out infinite',
          }}/>
          {/* Corner vignette subtle */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 70%, rgba(0,0,0,.3) 100%)',
          }}/>
        </div>
      )}

      {/* ── Paper grain texture (ink) ─────────────────────────────────────── */}
      {isInk && (
        <div style={{ ...base, opacity: .55 }}>
          {/* SVG turbulence grain */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
            <filter id="ink-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.75"
                numOctaves="4"
                stitchTiles="stitch"
                result="noise"
              />
              <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
              <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended"/>
              <feComposite in="blended" in2="SourceGraphic" operator="in"/>
            </filter>
            <rect width="100%" height="100%" filter="url(#ink-grain)" opacity="0.045"
              style={{ animation:'inkGrainShift 0.15s steps(1) infinite' }}/>
          </svg>
          {/* Subtle paper discoloration */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 80% 20%, rgba(200,169,126,.03) 0%, transparent 60%)',
          }}/>
        </div>
      )}
    </>
  );
}
