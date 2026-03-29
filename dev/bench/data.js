window.BENCHMARK_DATA = {
  "lastUpdate": 1774755067692,
  "repoUrl": "https://github.com/Liveiciee/yuyucode",
  "entries": {
    "YuyuCode Benchmark (CI · Ubuntu x86_64)": [
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5afeb49866d070436944e0df305c7ce19120908b",
          "message": "Merge pull request #21 from Liveiciee/codex/audit-and-fix-bugs-in-yuyucode-repository\n\nMobile-first V2: health & perf gates, runtime/keystore hardening, slash-command handlers + test and toolchain upgrades",
          "timestamp": "2026-03-29T02:58:23+08:00",
          "tree_id": "ecb42a7e1c6fba0fdb6d04a135b06b543cb636b0",
          "url": "https://github.com/Liveiciee/yuyucode/commit/5afeb49866d070436944e0df305c7ce19120908b"
        },
        "date": 1774724503913,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7995656.42,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1192328.76,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1407772.67,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8560149.98,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14653915.79,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5946165.31,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1425073.66,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171538.16,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.789,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14153540.02,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1940143.47,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1583449.62,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1717629.04,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7012939.8,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5065.17,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9742.83,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 219277.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 179911.59,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10430133.73,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1747334.94,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 447088.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119349.38,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13567195.65,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13815038.18,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4355521.28,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6835406.93,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7373.5,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5809973.19,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 976158.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5870205.6,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14057558.68,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2526,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124935.46,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13895251.08,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5405249.88,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1635645.86,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1606687.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1705034.92,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1654258.58,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4125518.11,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3800.15,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1874124.76,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197036.56,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2577011.52,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4077377.45,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1612.68,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99709.3,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59746.42,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d86cb8cfdd9852431b384d510a2be87f09744281",
          "message": "Merge pull request #22 from Liveiciee/codex/audit-and-fix-bugs-in-yuyucode-repository\n\nMobile release: tooling & deps upgrade, runtime/key hardening, new mobile health + perf gates, and extended tests",
          "timestamp": "2026-03-29T03:12:17+08:00",
          "tree_id": "80d36bb7b625ea67997cc767469b7dbac0cc66be",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d86cb8cfdd9852431b384d510a2be87f09744281"
        },
        "date": 1774725338426,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8275052.92,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1257538.43,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1441148.92,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8766619.14,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15145103.24,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6055366.76,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1404782.16,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168143.7,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.2073,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13820562.59,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 2003291.7,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1629232.41,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1753491.28,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6713599.99,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4809.91,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9723.32,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 220176.63,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 169157.45,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10376199.17,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1567604.75,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 447170.38,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120489.2,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13654596.2,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13854390.34,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4466028.19,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7333715.43,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7501.7,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5731929.66,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 975148.59,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5688432.84,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13818351.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2535,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124628.55,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14046082.54,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5444597.21,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1667505.01,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1635080.19,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1683163.49,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1651709.05,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4130186.79,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3798.89,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1771495.59,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198372.76,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2420412.7,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4108871.74,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1622.5,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96137.57,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61900,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 123056.15,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8966.25,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7902,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2141.74,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "509a54d6ba65673103d87d53891af82ad5b7b772",
          "message": "Merge pull request #23 from Liveiciee/codex/audit-and-fix-bugs-in-yuyucode-repository\n\nTooling & runtime hardening: CI bench isolation, Vite upgrade, keystore/crypto fixes, mobile health gates and expanded tests",
          "timestamp": "2026-03-29T03:31:05+08:00",
          "tree_id": "711853faff1ffe392b29b33d59c52323322f7414",
          "url": "https://github.com/Liveiciee/yuyucode/commit/509a54d6ba65673103d87d53891af82ad5b7b772"
        },
        "date": 1774726466357,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8204368.34,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1165394.81,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1435061.83,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8391835.83,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15198501.57,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6275337.07,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1420842.99,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171183.75,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6204,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14134669.1,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1991555.43,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1549098.62,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1778264.08,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6791635.13,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5064.4,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9600.55,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 219571.6,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 183426.36,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10775133.63,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1715216.6,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 439547.04,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117085.85,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13904138.8,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13918962.16,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4588609.54,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7336478.86,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7664.52,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5764906.87,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 968830.56,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5789858.03,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14134040.87,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2477,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124882.13,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14290502.63,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5617918.25,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1696382.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1631685.6,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1675075.82,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1675156.65,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4258944.6,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3804.41,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1866425.01,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197439.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2480131.01,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4213766.61,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1594.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97549.79,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62194.16,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ddd577ba28b04e89a51b2dafe6e3f3de849b8063",
          "message": "Merge pull request #24 from Liveiciee/codex/audit-and-fix-bugs-in-yuyucode-repository\n\nBench CI & release gates; API/runtime hardening; add polyglot runner + tests",
          "timestamp": "2026-03-29T03:50:42+08:00",
          "tree_id": "37b606ee8e11002e945f0a5068435d160c6a75ad",
          "url": "https://github.com/Liveiciee/yuyucode/commit/ddd577ba28b04e89a51b2dafe6e3f3de849b8063"
        },
        "date": 1774727640443,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7862909.91,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1131379.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1343132.41,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8099186.46,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14710382.88,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5663348.48,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1301075.96,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 156269.66,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.171,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13493869.33,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 2014786.59,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1677665.16,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1816366.09,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6335253.42,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5615.57,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9993.65,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 232703.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187286.11,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10678340.89,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1694106.95,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 433967.57,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 124421.57,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13533111.59,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13713917.48,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4866826.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6881057.02,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7592.15,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5633625.53,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 926043.18,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5450974.47,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13586439.21,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.257,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 117087.69,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13925107.55,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 3755685.62,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1565382.2,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1498553.55,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1600347.22,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1550300.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3157363.64,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4075.09,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1688859.57,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 181554.59,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2432214.71,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4322552.31,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1664.07,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 102630.13,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52647.89,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "1db65ff44062665eb19b0e05c261994bc62a559d",
          "message": "Update components: AppChat, AppHeader, AppSidebar, and constants",
          "timestamp": "2026-03-29T09:38:53+08:00",
          "tree_id": "f1b630fa40182e7619b69a9f90539de67aa8957a",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1db65ff44062665eb19b0e05c261994bc62a559d"
        },
        "date": 1774748543334,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8518428.57,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1278091.71,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1428765.32,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8352505.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15041995.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5929612.34,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1408616.25,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169767.8,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0352,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13938039.28,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1857094.79,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1625508.17,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1691141.35,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6427128.77,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4993.88,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9718.63,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 218648.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186336.48,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10818973.85,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1723615.36,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438055.85,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120561.98,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13768874.43,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13882591.53,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4851921.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7081009.84,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7519.62,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6023124.84,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 962351.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5893377.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13684964.39,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.248,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122201.93,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14188989.29,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5617453.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1628588.7,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1583844.39,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1648968.62,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1608248.21,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4049937.82,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3849.55,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1841444.82,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197455.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2558489.66,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4202048.28,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1612.4,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96047.85,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58137.36,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "67a2a1355b26d3efc716e84ead418396df7e99f6",
          "message": "release: V4.6.0 update [v4.5.10]",
          "timestamp": "2026-03-29T09:43:31+08:00",
          "tree_id": "013cd3a6bf5178c1a24af2c474ce8fd873403c17",
          "url": "https://github.com/Liveiciee/yuyucode/commit/67a2a1355b26d3efc716e84ead418396df7e99f6"
        },
        "date": 1774748809570,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8087183.06,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1230230.22,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1372819.01,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8291918.87,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15289002.35,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6028997.29,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1386762.25,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 164391.31,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.222,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14128633.18,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1950407.42,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1557896.29,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1712241.39,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6831685.48,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4945.39,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9757.89,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 218840.31,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181309.32,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10651168.32,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1532026.36,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 404771.89,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119217.71,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13631278.39,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14000178.12,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4476155.92,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7036032.26,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7265.28,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5590316.38,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 978298.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5563516.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14021969.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2505,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123597.59,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14211525.23,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5409057.49,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1588731.61,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1587531.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1653665.52,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1620011.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4356843.37,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3824.76,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1845947.21,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196280.32,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2463880.8,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4108991.69,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1602.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99009.29,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59270.36,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "41ae70a837f702f22ad1772ff6c9222e926c5487",
          "message": "release: V4.6.0 update [v4.5.11]",
          "timestamp": "2026-03-29T09:48:23+08:00",
          "tree_id": "11202a47d15a1c838265834658dcd821ee31d95c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/41ae70a837f702f22ad1772ff6c9222e926c5487"
        },
        "date": 1774749109613,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7588154.25,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1109573.55,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1312676.75,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7597193.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13181058.73,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5466611.75,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1331900.79,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 152083.02,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4328,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13377801.57,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 2019272.77,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1681022.74,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1795079.65,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6590174.43,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5585.31,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9967.4,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 231639.11,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187413.85,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10269653.96,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1886216.55,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 457109.73,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 128071.2,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12763549.13,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12604626.26,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4523689.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6679205.6,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7607.62,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5540297.24,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 918268.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5527092.35,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13236375.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2572,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 117302.73,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13385721.95,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 3700237.62,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1738734.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1675627.31,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1763518.93,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1714142.22,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4117035.97,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3727.85,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1802606.64,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 176548.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2414652.29,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4263301.1,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1698.96,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 105469.42,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 51600.54,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "613c529528508bd560aa7e2301e2f8db923719f8",
          "message": "Deleted AgentLoop.cfg",
          "timestamp": "2026-03-29T10:36:46+08:00",
          "tree_id": "7303dd44e4c24e583a8363c96927391c6b82bb0c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/613c529528508bd560aa7e2301e2f8db923719f8"
        },
        "date": 1774752009794,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7508874.36,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1124782.48,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1165599.95,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7692033.23,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14236335.86,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5418528.34,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1309587.01,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 153311.52,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1346,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12987373.79,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1965430.84,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1636394.57,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1740652.17,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6728253.91,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5711.1,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9955.15,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 232456.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187370.88,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10607708.68,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1617680.59,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 432288.85,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 124577.04,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12739456.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13216813.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4639311.41,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6673170.84,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7657.85,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5395596.6,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 910802.48,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5144792.63,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12580820.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2381,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 114444.26,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13112144,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 3684692.9,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1683504.06,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1656630.91,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1697383.01,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1653983.6,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4013386.18,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4075.06,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1752795.45,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 183524.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2422940.33,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4271815.89,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1127077be834f21714ef0758cfab7e22d9b406ad",
          "message": "Updated package-lock.json",
          "timestamp": "2026-03-29T10:37:38+08:00",
          "tree_id": "aa712718dcd569f1b58f117949053c86cf0a758f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1127077be834f21714ef0758cfab7e22d9b406ad"
        },
        "date": 1774752061208,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8392812.74,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1304216.62,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1427368.12,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8432773.83,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15762110.58,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6614123.87,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1535061.57,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 173891.28,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.641,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13884640.97,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1909521.18,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1664415.04,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1774258.16,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6798398.74,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5961.21,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 10305.7,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 193205.1,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 206734.24,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10926411.67,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1725243.44,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 454265.32,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 122987.11,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13910588.39,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13717651.48,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 5374084.86,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7103205.15,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 8948.48,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6240236.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 1053883.15,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6279786.89,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13633004.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2667,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 127316.26,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14211503.15,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 4913543.1,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1692425.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1617735.79,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1690292.13,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1672350.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4325926.88,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4113.07,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1854137.98,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 188588.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2819512.47,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4630242.34,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1675.86,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99692.3,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56054.78,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 128502,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 9387.81,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.8615,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2241.15,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 15196.47,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "1872dcea366fbc0955a3381b1e6703721e651417",
          "message": "fix: api js",
          "timestamp": "2026-03-29T11:10:33+08:00",
          "tree_id": "05781a4ce44000498da486b19118b613dd21a723",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1872dcea366fbc0955a3381b1e6703721e651417"
        },
        "date": 1774754051054,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8282959.42,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1273110.53,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1413495.99,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8427573.97,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14685341.27,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5928450.68,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1421329.1,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168283.26,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.047,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13759818.51,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1882040.26,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1605562.78,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1718347.71,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6703672.75,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5204.87,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9560.51,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 218009.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 185084.54,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10880417.48,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1801726.36,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446874.79,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120965.96,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 14009579.72,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14057979.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4735820.77,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7331998.77,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7562.07,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5555263.38,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 989494.73,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5767013.18,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14137334.47,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2498,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123836.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14460657.33,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5305147.15,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1628808.92,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1629478.97,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1662227.48,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1678275.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4339259.74,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3710.86,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1861694.13,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193239.31,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2589673.87,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4182882.02,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1621.99,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97199.78,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59350.88,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0b8f1f3d7da0b4015f447e579651e8d8c5f62209",
          "message": "Update api.js",
          "timestamp": "2026-03-29T11:14:14+08:00",
          "tree_id": "c8b51b25edf19e1e688ef81352689b6e195c8ac5",
          "url": "https://github.com/Liveiciee/yuyucode/commit/0b8f1f3d7da0b4015f447e579651e8d8c5f62209"
        },
        "date": 1774754256473,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8322528.42,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1198618.64,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1408758.21,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8307548.55,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14877406.81,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6028747.14,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1405083.42,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169893.03,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3729,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13984058.91,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1931183.51,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1590616.62,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1744929.06,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6051708.31,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4869.56,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9655.47,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 214589.25,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 183710.51,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10919096.62,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1767405.24,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446558.98,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121137.89,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13751133.61,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13743206.96,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4883660.89,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6970801.85,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7246.3,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5733980.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 968025.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5204161.64,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13918609.92,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2482,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124500.31,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14322516.74,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5472631.42,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1650208.61,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1577633.85,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1680818.36,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1641342.45,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4011996.15,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3777.38,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1816334.48,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197344.81,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2605517.12,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4188473.42,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1625.07,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95624.78,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58144.85,
            "unit": "ops/sec"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b396edf36331506917544a91649e61d1fe0fa6c8",
          "message": "Integrate features from multiple codebases in api.js\n\nRefactor api.js to integrate features from both codebases, enhancing configuration and error handling.",
          "timestamp": "2026-03-29T11:27:50+08:00",
          "tree_id": "e437f9d92c025157df29f749b69eca0f01beafa5",
          "url": "https://github.com/Liveiciee/yuyucode/commit/b396edf36331506917544a91649e61d1fe0fa6c8"
        },
        "date": 1774755067351,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7886715.79,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1247707.46,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1436471.33,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8705617.81,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14935557.1,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6296397.92,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1427142.06,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170861.94,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1045,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13938551.92,
            "unit": "ops/sec"
          },
          {
            "name": "open",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "close middle tab from",
            "value": 10,
            "unit": "ops/sec"
          },
          {
            "name": "find active tab from",
            "value": 20,
            "unit": "ops/sec"
          },
          {
            "name": "small file (4 lines)",
            "value": 1868209.26,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1531628.52,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1631755.12,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7084533.57,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5034.51,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9751.67,
            "unit": "ops/sec"
          },
          {
            "name": "small file —",
            "value": 1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component —",
            "value": 3,
            "unit": "ops/sec"
          },
          {
            "name": "no imports",
            "value": 218338.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181908.68,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10341351.88,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1747879.97,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445648.53,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118263.74,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13785622,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14049237.66,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4414349.58,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7145142.2,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7291.72,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5890408.96,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 979188.28,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5777074.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13993795.72,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2523,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123649.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13755242.57,
            "unit": "ops/sec"
          },
          {
            "name": "find dirty tab from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "close all dirty tabs from",
            "value": 200,
            "unit": "ops/sec"
          },
          {
            "name": "reorder — move last to first (200 tabs)",
            "value": 5635843.2,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1554611.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1573032,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1622150.5,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1583038.46,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3857111.99,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3837.91,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1844473.38,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199753.1,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2492795.29,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4204733.62,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1605.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95730.53,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61441.92,
            "unit": "ops/sec"
          }
        ]
      }
    ]
  }
}