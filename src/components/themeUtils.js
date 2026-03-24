export function resolveTheme(T) {
  return {
    bg:           T?.bg           || '#0a0a0f',
    bg2:          T?.bg2          || '#131108',
    bg3:          T?.bg3          || 'rgba(255,255,255,.04)',
    border:       T?.border       || 'rgba(255,255,255,.06)',
    borderMed:    T?.borderMed    || 'rgba(255,255,255,.1)',
    text:         T?.text         || '#f0f0f0',
    textSec:      T?.textSec      || 'rgba(255,255,255,.55)',
    textMute:     T?.textMute     || 'rgba(255,255,255,.3)',
    accent:       T?.accent       || '#a78bfa',
    accentBg:     T?.accentBg     || 'rgba(124,58,237,.1)',
    accentBorder: T?.accentBorder || 'rgba(124,58,237,.22)',
    success:      T?.success      || '#34d399',
    successBg:    T?.successBg    || 'rgba(52,211,153,.08)',
    error:        T?.error        || '#f87171',
    errorBg:      T?.errorBg      || 'rgba(248,113,113,.1)',
    warning:      T?.warning      || '#fbbf24',
    warningBg:    T?.warningBg    || 'rgba(251,191,36,.08)',
  };
}
