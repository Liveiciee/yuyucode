// ── Brightness Plugin Bridge ───────────────────────────────────────────────

import { registerPlugin } from '@capacitor/core';

const BrightnessPlugin = registerPlugin('Brightness', {
  web: {
    getBrightness: async () => ({ brightness: 1.0 }),
    addListener: () => ({ remove: () => {} }),
    removeAllListeners: async () => {},
  },
});

export { BrightnessPlugin };
