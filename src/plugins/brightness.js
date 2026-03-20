// ── Brightness Plugin Bridge ───────────────────────────────────────────────
// Wraps native BrightnessPlugin via Capacitor — real-time ContentObserver

import { registerPlugin } from '@capacitor/core';

const BrightnessPlugin = registerPlugin('Brightness', {
  // Web fallback — tidak ada brightness API di browser
  web: {
    getBrightness: async () => ({ brightness: 1.0 }),
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: async () => {},
  },
});

export { BrightnessPlugin };
