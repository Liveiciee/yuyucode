// ui.cjs
function startWatch(callback, interval = 60000) {
  console.log(`\n👀 Watch mode enabled (every ${interval/1000}s)`);
  console.log('Press Ctrl+C to stop\n');

  const watchInterval = setInterval(() => {
    console.log(`\n🔄 Re-running benchmark at ${new Date().toLocaleTimeString()}...\n`);
    callback();
  }, interval);

  process.on('SIGINT', () => {
    console.log('\n\n👋 Watch mode stopped');
    if (watchInterval) clearInterval(watchInterval);
    process.exit(0);
  });

  return watchInterval;
}

function interactiveMenu() {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║     yuyu-bench Interactive Mode         ║');
  console.log('╚══════════════════════════════════════════╝\n');
  console.log('  1. Run benchmark');
  console.log('  2. Show trends');
  console.log('  3. Compare commits');
  console.log('  4. Set performance budget');
  console.log('  5. View statistics');
  console.log('  6. Export data');
  console.log('  7. Check anomalies');
  console.log('  0. Exit\n');
}

module.exports = { startWatch, interactiveMenu };
