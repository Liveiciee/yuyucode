// handoff.cjs
const fs = require('fs');
const path = require('path');

function ensureHandoffTemplate(yuyuDir) {
  const p = path.join(yuyuDir, 'handoff.md');
  if (fs.existsSync(p)) return;
  fs.writeFileSync(p, `# YuyuCode — Session Handoff
> Last updated: ${new Date().toISOString().split('T')[0]}
> Update with: /handoff in YuyuCode chat

## Completed this session
- (nothing yet)

## In progress / pending
- (nothing yet)

## Architectural decisions made
- (nothing yet)

## Known issues
- Brightness over-shoots at mid-range (gamma curve too aggressive)
- codemirror bundle 4.5MB — candidate for dynamic import()

## Next session priorities
1. (fill in)

## Hot files touched recently
- (fill in)
`);
  console.log('  ✅ Created .yuyu/handoff.md (template)');
}

module.exports = { ensureHandoffTemplate };
