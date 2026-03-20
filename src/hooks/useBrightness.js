// ── useBrightness — real-time brightness listener ─────────────────────────
// Subscribe ke ContentObserver via custom Capacitor plugin.
// Emit setiap user geser slider brightness — zero polling, event-driven.

import { useEffect, useRef } from 'react';
import { BrightnessPlugin } from '../plugins/brightness.js';

// Threshold: di bawah nilai ini → aktifkan filter
// 0.35 = sekitar 35% brightness → sudah cukup gelap untuk dicompensate
const LOW_BRIGHTNESS_THRESHOLD = 0.35;

export function useBrightness(setLowLight) {
  const listenerRef = useRef(null);

  useEffect(() => {
    // Baca initial brightness saat mount
    BrightnessPlugin.getBrightness()
      .then(({ brightness }) => {
        setLowLight(brightness < LOW_BRIGHTNESS_THRESHOLD);
      })
      .catch(() => {});

    // Subscribe ke perubahan real-time
    BrightnessPlugin.addListener('brightnessChange', ({ brightness }) => {
      setLowLight(brightness < LOW_BRIGHTNESS_THRESHOLD);
    }).then(handle => {
      listenerRef.current = handle;
    }).catch(() => {});

    return () => {
      listenerRef.current?.remove();
      BrightnessPlugin.removeAllListeners().catch(() => {});
    };
  }, [setLowLight]);
}
