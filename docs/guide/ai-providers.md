# AI Providers

YuyuCode runs on two free-tier AI inference providers: Cerebras as the primary and Groq as fallback. Claude (Anthropic) is intentionally not used as the runtime model — the app was *built* with Claude, but runs on open models due to API cost constraints.

## Cerebras (Default)

Fast inference for large models. Default for all non-vision tasks.

| Model | ID | Use |
|-------|----|-----|
| Qwen 3 235B | `qwen-3-235b-a22b-instruct-2507` | Default — all agent tasks |
| Llama 3.1 8B | `llama3.1-8b` | Auto-compact, ghost text L1 |

Cerebras excels at speed. Qwen 3 235B runs at competitive throughput on their hardware, making it practical for multi-iteration agent loops where each iteration requires a full round-trip.

## Groq (Fallback + Vision)

Fallback when Cerebras hits rate limits, and the only option for vision tasks.

| Model | ID | Note |
|-------|----|------|
| Kimi K2 | `moonshotai/kimi-k2-instruct-0905` | 262K context — primary fallback |
| Llama 3.3 70B | `llama-3.3-70b-versatile` | General purpose |
| Llama 4 Scout | `meta-llama/llama-4-scout-17b-16e-instruct` | Vision — auto-routed when image attached |
| Qwen 3 32B | `qwen/qwen3-32b` | Coding tasks |
| Llama 8B Fast | `llama-3.1-8b-instant` | Rate limit conservation |

## Fallback Logic

```
User sends message
    │
    ▼
Cerebras (primary)
    │
    ├── success → stream response
    │
    ├── 429 rate limit → switch to Kimi K2 (Groq), silently
    │
    └── 5xx error → retry 2× with 2s/4s backoff
                     → fail gracefully with error message
```

Fallback requires `VITE_GROQ_API_KEY` to be set and baked into the APK build. When the key is present, the switch to Groq is transparent. When the key is absent or Groq also returns an error, the UI shows a rate limit countdown timer and halts until the user waits or switches models manually with `/model`.

## Vision Routing

When an image is attached (camera or file upload), the model is overridden to `VISION_MODEL` (`llama-4-scout-17b-16e-instruct` on Groq) regardless of the active default model. The routing is automatic.

## Model Switching

```bash
# Cycle through available models
/model

# One-shot override (doesn't change default)
/ask kimi review this PR
/ask llama8b quick check
/ask qwen235 architect this
```

One-shot aliases: `kimi`, `llama`, `llama8b`, `qwen`, `scout`, `qwen235`.

## A/B Testing

```bash
/ab modelA vs modelB: your task here
```

Runs the same prompt against two models simultaneously, streams both responses, and presents them side-by-side. Useful for evaluating model suitability for a specific type of task.

## Context Window Considerations

Kimi K2's 262K context window is large enough to hold most codebases in a single prompt. When working on large projects, switching to Kimi K2 (`/ask kimi ...`) avoids mid-session context truncation that can cause the agent to lose track of earlier decisions.

## Rate Limit Behaviour

Both providers have free-tier rate limits. The app handles them gracefully:

- Cerebras 429 → silent switch to Groq
- Groq 429 → countdown timer displayed in UI (`chat.startRateLimitTimer(secs)`)
- Network offline → `📡 Internet terputus~` message

There is no automatic retry queue. If both providers are rate-limited simultaneously, the agent loop halts and the user must wait.
