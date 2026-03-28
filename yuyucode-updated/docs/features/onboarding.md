# Onboarding Wizard

On first launch (when `yc_onboarded` is not set in Capacitor Preferences), YuyuCode opens the Onboarding Wizard automatically. It replaces the old "manually enter folder path" first-run experience.

## Steps

### Step 0 — Server Check

Pings `yuyu-server.js` via `callServer({ type: 'ping' })`.

- ✅ **Pass** — server is running, proceed
- ❌ **Fail** — shows `node ~/yuyu-server.js &` command inline, retry button

The wizard does not block on a failed ping — you can continue without a running server, but most features will be unavailable until it's up.

### Step 1 — API Keys

Input fields for Cerebras and Groq API keys.

Keys are passed to `saveRuntimeKeys()` which encrypts them with AES-256-GCM (PBKDF2, 300K iterations) before writing to Capacitor Preferences. They are never stored in plaintext. See [Runtime Key Encryption](/guide/runtime-keys) for full details.

Both fields are optional — you can skip and set them later with `/apikeys`.

### Step 2 — Done

Writes `yc_onboarded = 1` to Preferences. Wizard will not show again on subsequent launches.

## Skipping

Every step has a **"Lewati"** (skip) button. The wizard can be fully skipped — none of the steps are mandatory to complete.

## Re-running

There is no direct UI to re-open the wizard after first run. To reset:

```bash
# In Termux, reset the onboarding flag
node -e "
const { Preferences } = require('@capacitor/preferences');
Preferences.remove({ key: 'yc_onboarded' });
"
```

Or use `/apikeys` in chat to update keys without re-running the full wizard.

## Implementation

```
src/components/OnboardingWizard.jsx
```

State: `step (0–2)`, `cerebras`, `groq`, `ping`, `pinging`

The component uses inline styles derived from the active theme token `T` — same pattern as all other YuyuCode components. No external CSS.
