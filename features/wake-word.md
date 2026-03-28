# Wake Word

YuyuCode can activate hands-free by listening for "Hey Yuyu" in the background using the Web Speech API.

## Wake Phrases

Any of these will trigger activation:

- `hey yuyu`
- `hei yuyu`
- `yuyu`
- `oi yuyu`

Detection is case-insensitive and tolerant of minor pronunciation variation.

## How It Works

`useWakeWord.js` wraps the browser `SpeechRecognition` API in a continuous listen loop:

```
enabled = true
    │
    ▼
SpeechRecognition.start()
    │
    ├── onresult → check transcript against WAKE_PATTERNS
    │     ├── match → call onActivated() → agent input focused
    │     └── no match → keep listening
    │
    ├── onend → restart after 800ms (keeps listening indefinitely)
    │
    └── onerror
          ├── 'no-speech' / 'aborted' → restart after 500ms
          └── other errors → restart after 2000ms
```

The hook cleans up on unmount — `SpeechRecognition.stop()` is always called when the component unmounts or `enabled` flips to `false`.

## Enabling Wake Word

Toggle in `/config` → **Wake Word**. Off by default to conserve battery.

When enabled, the microphone stays open continuously. On Snapdragon 680, background speech recognition draws negligible CPU at rest — it only spikes during active speech processing.

::: warning Android mic permission
The first time wake word is enabled, Android will prompt for microphone permission. If denied, the feature silently does nothing — no error is thrown. Grant the permission in Android Settings → Apps → YuyuCode → Permissions → Microphone.
:::

## Implementation

```
src/hooks/useWakeWord.js
```

Props:

| Prop | Type | Description |
|------|------|-------------|
| `onActivated` | `() => void` | Callback fired when wake phrase detected |
| `enabled` | `boolean` | Whether to start listening (default: `false`) |

Usage in `App.jsx`:

```javascript
useWakeWord({
  enabled: ui.wakeWordEnabled,
  onActivated: () => {
    // focus the chat input
    inputRef.current?.focus();
  }
});
```
