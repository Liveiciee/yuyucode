// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { hl } from './utils.js';

// ── Snapshot Tests: hl() output ───────────────────────────────────────────────
// Pertama kali run: vitest simpan "foto" output.
// Run berikutnya: kalau output berubah 1 karakter, test langsung fail.
// Update snapshot: npx vitest run --update-snapshots

describe('hl snapshots', () => {
  it('json snapshot', () => {
    expect(hl('{"name": "Yuyu", "age": 1, "active": true}', 'json')).toMatchSnapshot();
  });

  it('bash snapshot', () => {
    expect(hl('#!/bin/bash\necho "Hello $USER"\ngit commit -m "fix"', 'bash')).toMatchSnapshot();
  });

  it('python snapshot', () => {
    expect(hl('def greet(name):\n    return f"Hello {name}"\n\nif True:\n    print(None)', 'py')).toMatchSnapshot();
  });

  it('css snapshot', () => {
    expect(hl('.container { color: red; margin: 10px; }\n/* comment */\n#id { display: flex; }', 'css')).toMatchSnapshot();
  });

  it('js snapshot', () => {
    expect(hl('const App = () => {\n  const [x, setX] = useState(42);\n  return null;\n};', 'js')).toMatchSnapshot();
  });

  it('unknown lang falls back to js highlighter', () => {
    expect(hl('const x = 1;', 'unknown')).toMatchSnapshot();
  });

  it('html special chars are escaped before highlight', () => {
    expect(hl('<script>alert("xss")</script>', 'js')).toMatchSnapshot();
  });
});
