# Getting Started

YuyuCode requires an Android phone running Termux. It will not run on a desktop browser — it is not designed to.

## Prerequisites

- Android phone (tested on Oppo A77s, Snapdragon 680, Android 14)
- [Termux](https://termux.dev/) installed from F-Droid (not Play Store)
- Node.js 20+ installed in Termux

```bash
# Install Node.js in Termux
pkg install nodejs
```

## API Keys

Three services are required. All offer free tiers.

| Service | Purpose | Link |
|---------|---------|------|
| Cerebras | Primary AI inference (Qwen 3 235B) | [cloud.cerebras.ai](https://cloud.cerebras.ai) |
| Groq | Fallback + vision routing | [console.groq.com](https://console.groq.com) |
| Tavily | Web search (optional) | [tavily.com](https://tavily.com) |

## Installation

```bash
git clone https://github.com/liveiciee/yuyucode
cd yuyucode
npm install
```

## Configuration

### Option A — Termux `.bashrc` (recommended)

```bash
# Add to ~/.bashrc
export VITE_CEREBRAS_API_KEY="your_key"
export VITE_GROQ_API_KEY="your_key"
export VITE_TAVILY_API_KEY="your_key"
```

Then `source ~/.bashrc`.

### Option B — `.env.local`

```
VITE_CEREBRAS_API_KEY=your_key
VITE_GROQ_API_KEY=your_key
VITE_TAVILY_API_KEY=your_key
```

## Running

Two processes must be running simultaneously — open two Termux sessions.

**Session 1 — YuyuServer:**
```bash
node ~/yuyu-server.js &
```

**Session 2 — Dev server:**
```bash
cd ~/yuyucode
npm run dev
```

Open `http://localhost:5173` in your Android browser.

::: warning Server dependency
Every feature that touches the filesystem, executes commands, or searches the codebase requires `yuyu-server.js` to be running. If Termux kills it (Android memory pressure), the app will display a server health error and refuse to start the agent loop until the server is restarted.
:::

## First Use

1. Tap the folder icon and set your project folder (e.g. `/data/data/com.termux/files/home/myproject`)
2. Type a task in natural language
3. YuyuCode will gather context, stream a response, and execute actions automatically

## Building the APK

Local builds are not recommended — the Vite build takes 1–2 minutes on ARM64 and produces only a web bundle. The signed APK is produced by GitHub Actions on every `release:` commit.

```bash
node yugit.cjs "release: v4.x — description"
```

This bumps `version` in `package.json`, triggers CI, and creates a GitHub Release with the signed APK attached.

::: danger Do not remove
The `"overrides": { "rollup": "npm:@rollup/wasm-node" }` entry in `package.json` is what makes Vite build on Termux ARM64. Removing it breaks the CI build silently.
:::
