// ── useBrightness — real-time adaptive brightness ────────────────────────

import { useEffect, useRef } from 'react';
import { BrightnessPlugin } from '../plugins/brightness.js';

export function useBrightness(setBrightnessLevel) {
  const listenerRef = useRef(null);

  useEffect(() => {
    BrightnessPlugin.getBrightness()
      .then(({ brightness }) => setBrightnessLevel(brightness))
      .catch(() => {});

    BrightnessPlugin.addListener('brightnessChange', ({ brightness }) => {
      setBrightnessLevel(brightness);
    }).then(handle => {
      listenerRef.current = handle;
    }).catch(() => {});

    return () => {
      listenerRef.current?.remove();
      BrightnessPlugin.removeAllListeners().catch(() => {});
    };
  }, [setBrightnessLevel]);
}
