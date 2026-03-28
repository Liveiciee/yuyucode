#!/usr/bin/env node
/**
 * Mobile Health Check
 * Fast confidence gate for Snapdragon-class devices / Termux workflows.
 */
const { spawnSync } = require('child_process');

const CHECKS = [
  { name: 'Lint', cmd: 'npm', args: ['run', 'lint'] },
  { name: 'Critical slash handlers', cmd: 'npx', args: ['vitest', 'run', 'src/hooks/useSlashCommands/handlers/chat.test.js', 'src/hooks/useSlashCommands/handlers/agent.test.js', 'src/hooks/useSlashCommands/handlers/tools.test.js', 'src/hooks/useSlashCommands/handlers/plan.test.js'] },
  { name: 'Mobile command sequence smoke', cmd: 'npx', args: ['vitest', 'run', 'src/hooks/useSlashCommands/mobile.smoke.test.js', 'src/hooks/useSlashCommands/mobile.sequence.smoke.test.js'] },
  { name: 'API orchestration tests', cmd: 'npx', args: ['vitest', 'run', 'src/api.orchestration.test.js'] },
  { name: 'Runtime key tests', cmd: 'npx', args: ['vitest', 'run', 'src/runtimeKeys.test.js'] },
  { name: 'Node syntax check (api.js)', cmd: 'node', args: ['--check', 'src/api.js'] },
  { name: 'Production build', cmd: 'npm', args: ['run', 'build'] },
  { name: 'Performance budget', cmd: 'npm', args: ['run', 'perf:budget'] },
];

function runCheck({ name, cmd, args }) {
  process.stdout.write(`\n▶ ${name}\n`);
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error(`${name} failed with exit code ${result.status}`);
  }
}

function main() {
  const start = Date.now();
  try {
    CHECKS.forEach(runCheck);
    const sec = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n✅ Mobile health check passed in ${sec}s`);
  } catch (error) {
    console.error(`\n❌ ${error.message}`);
    process.exit(1);
  }
}

main();
