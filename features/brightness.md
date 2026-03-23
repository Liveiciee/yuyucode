# Perceptual Brightness Compensation

One of the features that doesn't exist anywhere else. YuyuCode adjusts its UI brightness in real time based on your screen brightness — not linearly, but using the same logarithmic curve your eyes use.

## The Problem

At 10% screen brightness in a dark room, a standard dark-themed UI becomes nearly unreadable. The obvious fix — increase CSS `brightness()` — introduces two problems:

1. Linear boosts feel wrong. Human brightness perception follows the **Weber-Fechner law**: perceived brightness is proportional to the logarithm of stimulus intensity. A linear 40% boost at low brightness feels like a harsh jolt, not a smooth compensation.

2. CSS `brightness()` introduces a warm orange shift. Boosting brightness through a CSS filter changes the perceived colour temperature — code that looked neutral at normal brightness looks warm and washed out when compensated linearly.

## The Solution

A native Capacitor plugin (`@capgo/capacitor-brightness`) streams `Settings.System.SCREEN_BRIGHTNESS` changes from Android via a `ContentObserver`. This gives YuyuCode real-time brightness values without polling.

Below 25% screen brightness, `useBrightness.js` applies:

1. **Weber-Fechner scaling** — the brightness boost is `1.0 + (0.4 × (1 - brightness/0.25)²)`, producing a curve that feels perceptually uniform as you dim the screen
2. **Desaturation** (-18%) — counteracts the warm-orange shift that CSS `brightness()` introduces
3. **Frosted overlay** — a `backdrop-filter: blur` layer adds depth at extreme low-light (below ~10%), preventing the UI from feeling flat

Above 25%, compensation is completely disabled. Zero processing, zero visible effect.

## Implementation

The full pipeline:

```
Android Settings.System.SCREEN_BRIGHTNESS
    │
    ▼ ContentObserver (Java — BrightnessPlugin.java)
    │
    ▼ @capgo/capacitor-brightness bridge
    │
    ▼ useBrightness.js — React hook
    │
    ▼ brightnessLevel state (0–1)
    │
    ▼ ThemeEffects.jsx — applies CSS filters
        └── brightness(1.0–1.4×)
        └── saturate(0.82)
        └── backdrop-filter: blur (extreme low-light)
```

## Why 25%?

Empirically determined threshold for the test device (Oppo A77s). Below 25%, the display's hardware backlight dims noticeably enough that compensation becomes perceptible and beneficial. Above it, the display is bright enough that any software compensation would be visible as an unwanted effect.

## Cost

- Above 25%: zero. The compensation branch never executes.
- Below 25%: one CSS filter application per brightness change event. `ContentObserver` fires only on actual changes — not on a polling interval.

The implementation was designed around the constraint that it must add zero perceptible latency on a Snapdragon 680.
