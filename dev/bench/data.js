window.BENCHMARK_DATA = {
  "lastUpdate": 1774778947646,
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
          "id": "80114e61c57babfdb44ea4389d947584069b19bb",
          "message": "Add logger utility to utils.js\n\nAdded a logger utility for different log levels.",
          "timestamp": "2026-03-29T11:32:58+08:00",
          "tree_id": "16197af6c7a7ff4bcbb97caa8a2cf9ef9f163f38",
          "url": "https://github.com/Liveiciee/yuyucode/commit/80114e61c57babfdb44ea4389d947584069b19bb"
        },
        "date": 1774755371552,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7938088.84,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1246586.58,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1435431.69,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7803716.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15015677.34,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5408515.3,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1403274.37,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169809.61,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.5983,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13935109.33,
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
            "value": 1916198.87,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1571455.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1731696.72,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7208570.86,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4929.62,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9628.59,
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
            "value": 218407.6,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176802.44,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10899610.41,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1762082.39,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441156.3,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 113094.2,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13777914.71,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13923817.14,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4595109.33,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7001071.33,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7627.47,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5732691.91,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 990701.31,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5602134.61,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13845097.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2426,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121284.9,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14421676.01,
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
            "value": 5322091.96,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1609884.78,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1558856.29,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1668506.78,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1650319.04,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4373663.68,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3794.87,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1872141.34,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196134.99,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2466939.4,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3990227.17,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1587.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96885.3,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 53745.99,
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
          "id": "95816b6b3017f13ec2e93f04c0918118680e870a",
          "message": "Refactor logger to use import.meta.env for DEV check\n\nUpdate logger to check for development mode using import.meta.env.",
          "timestamp": "2026-03-29T11:42:05+08:00",
          "tree_id": "2c4b083578417857540d9085410cafca42cef5f1",
          "url": "https://github.com/Liveiciee/yuyucode/commit/95816b6b3017f13ec2e93f04c0918118680e870a"
        },
        "date": 1774755918085,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8600517.48,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1210711.8,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1415033.21,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8124613.03,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14699733.06,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6114476.42,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1464922.54,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 165410.25,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 24.4167,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13844864.39,
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
            "value": 1956757.55,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1481475.51,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1748765.24,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7236475.68,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5014.46,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9718.73,
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
            "value": 219905.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186209.49,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10735293.98,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1738543.99,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440493.57,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119273.07,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13620126.61,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13330294.59,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4355957.76,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6409167.64,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7744.25,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5710548.28,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 990648.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5129584.24,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14083165.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2467,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123334.79,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14446781.86,
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
            "value": 5696529.25,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1641980.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1650892.61,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1706935.76,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1680675.82,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4229760.27,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3816.6,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1884176.51,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195297.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2440508.6,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4348091.61,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1616.43,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99750.7,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60957.77,
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
          "id": "1aebd1b5f72e4a84a22ea73a75bcae9c38e8fb3b",
          "message": "Fix JSX syntax and style adjustments in AppHeader",
          "timestamp": "2026-03-29T11:42:58+08:00",
          "tree_id": "12c41d039d83fee1532d232cc89b76c174acd3b0",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1aebd1b5f72e4a84a22ea73a75bcae9c38e8fb3b"
        },
        "date": 1774755976695,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8502758.38,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1182546.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1431046.61,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8689499.04,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15380541.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5845688.14,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1460492.56,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170351.79,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6232,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14118779.55,
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
            "value": 1955847.24,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1609946.62,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1710275.48,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6767300.52,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4946.42,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9785.76,
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
            "value": 219755.7,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 182554.9,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10797408.64,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1669252.38,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441981.46,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120332.7,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13695361.01,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13971552.21,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4528525.55,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7121967.44,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7581.1,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5980870.22,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 987969.04,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5654871.42,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14133863.6,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2532,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 116498.31,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14481036.46,
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
            "value": 5528476.39,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1587903.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1570395.78,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1641235.29,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1621439.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3998069.52,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3757.33,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1847631.87,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195478.33,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2455360.42,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4243484.12,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1617.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 100192.42,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60781.95,
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
          "id": "a10d1706d6e5e003e7369263df8245dcf8bf1ce8",
          "message": "Remove successBg variable and adjust button styles",
          "timestamp": "2026-03-29T11:47:34+08:00",
          "tree_id": "e47e29483dadc719afc653559ba572d68223131f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/a10d1706d6e5e003e7369263df8245dcf8bf1ce8"
        },
        "date": 1774756249256,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8452018.23,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1247568.4,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1382631.67,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8110945.76,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15225605.18,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6071778.71,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1398001.72,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169457.45,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1658,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14085471.58,
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
            "value": 1763998.33,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1565258.11,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1702553.82,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6351527.57,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4836.17,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9808.96,
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
            "value": 218442.87,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 193801.82,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10849716.81,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1750900.12,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 425882.62,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120481,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13678926.47,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13940026.08,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4793115.32,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7137028.83,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7529.08,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5772538.88,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 972026.32,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5775115.3,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13999591.72,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2482,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124534.08,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14381679.74,
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
            "value": 5635226.94,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1557205.93,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1563129.12,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1637557.24,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1616253.12,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4050476.75,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3739.36,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1856317.45,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197908.33,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2687013.94,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4171341.44,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1597.27,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96611.32,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57520,
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
          "id": "576cc86cee6a20ef7c7e66857c5acf09196f0377",
          "message": "Rename readError to _readError in catch block",
          "timestamp": "2026-03-29T11:50:01+08:00",
          "tree_id": "494b2a640a59fd747861454d8dad8787a2b6ea22",
          "url": "https://github.com/Liveiciee/yuyucode/commit/576cc86cee6a20ef7c7e66857c5acf09196f0377"
        },
        "date": 1774756392843,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8217094.29,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1265770.38,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1428923.87,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8253710.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15355391.63,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6021475.53,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1377189.71,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171585.39,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.1238,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14032367.47,
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
            "value": 1834247.04,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1632038.92,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1723630.73,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6661101.6,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5038.84,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9771.92,
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
            "value": 219445.57,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187213.2,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11301642.89,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1753929.93,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446162.81,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 116140.15,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13906295.44,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13859256.14,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4854505.51,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6914408.23,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7495.99,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5646542.24,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 997000.9,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5607006.42,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13928607.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2513,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122172.37,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14390592.36,
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
            "value": 5628652.62,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1644546.78,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1604927.79,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1665186.38,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1654270.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4081577.61,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3800.72,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1856471.57,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199623.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2453492.63,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4147611.32,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1589.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98149.98,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60809.84,
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
          "id": "6c129545ab48c5505726ce6a42abc23b86fb8ae7",
          "message": "Rename crypto and encoder functions for clarity",
          "timestamp": "2026-03-29T11:51:10+08:00",
          "tree_id": "e14fba04e80321c2e5803c82cbb03301fb0639dd",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6c129545ab48c5505726ce6a42abc23b86fb8ae7"
        },
        "date": 1774756467405,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8367254.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1267939.02,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1361853.8,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8639266.55,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15046350.25,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5863164.67,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1418208.75,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 164608.7,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6229,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13634649.1,
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
            "value": 1922557.79,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1590205.95,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1705549.83,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6860843.77,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5250.21,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9729.64,
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
            "value": 219124.75,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184824.86,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10373942.96,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1750834.39,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445359.26,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119334.91,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13403714.1,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13866252.59,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4814770.77,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7140351.11,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7398.21,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5894382.5,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 969112.71,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5368585.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13636232.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.251,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123233.34,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13665456.33,
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
            "value": 5638822.33,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1638065.72,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1571836.76,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1680033.41,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1606890.91,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4197701.4,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3810.79,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1854999.05,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 190669.04,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2565841.54,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4217528.25,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1603.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97877.58,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59902.82,
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
          "id": "e01d526c303410333d2f9057b5d436efb2cc23bc",
          "message": "Update AI configuration references in tests",
          "timestamp": "2026-03-29T11:55:35+08:00",
          "tree_id": "3d5d95e0763010629ccea67f22bc1a0f5f7aba45",
          "url": "https://github.com/Liveiciee/yuyucode/commit/e01d526c303410333d2f9057b5d436efb2cc23bc"
        },
        "date": 1774756735324,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8470041.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 578002.81,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 650509.75,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8293492.44,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15111647.58,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5629520.22,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1407024.42,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167551.62,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1002,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13875624.89,
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
            "value": 1965424.12,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1520852.81,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1701816.77,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 5954800.77,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5164.75,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9625.57,
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
            "value": 219748.63,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188733.51,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10185301.82,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1642268.5,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441112.17,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119718.32,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13300900.32,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13632361.1,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4585266.27,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7187269.81,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7659.16,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5838769.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 972090.33,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5500877.5,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13873988.22,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2533,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123128.59,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14193686.98,
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
            "value": 5455085.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1580168.2,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1587343.83,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1637436.81,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1621158.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4023212.17,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3715.77,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1820455.32,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191845.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2526658.15,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4253395.71,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1575.38,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95778.97,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57105.61,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 120503.67,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8829.7,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7473,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2100.9,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14620.53,
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
          "id": "a679e0f90ca9c8e61d07878b283b38f4523049be",
          "message": "Add custom matchers for error handling in tests",
          "timestamp": "2026-03-29T12:01:17+08:00",
          "tree_id": "c0e75618b1c7bddb964cd81477bdbb9b56eb63e8",
          "url": "https://github.com/Liveiciee/yuyucode/commit/a679e0f90ca9c8e61d07878b283b38f4523049be"
        },
        "date": 1774757077961,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8089101.68,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1243002.85,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1418262.36,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8257239.34,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15039370.95,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5912259.74,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1394463.38,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171627.78,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.875,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13948738.77,
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
            "value": 1898891.1,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1628063.43,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1697345.95,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6753863.72,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5143.08,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9673.51,
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
            "value": 219766.59,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 169227.42,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9934318.99,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1726037.05,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446852.61,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120733.5,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13483974.33,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13564171.13,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4811593.2,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7031466.45,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7620.13,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6010104.16,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 974866.21,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5853372.95,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14053515.38,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2492,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124157.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14415741.22,
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
            "value": 5662209.07,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1574865.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1617382.56,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1640747.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1614941.71,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4096557.2,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3821.86,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1929357.61,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 182525.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2484272.61,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4363962.95,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.22,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96061.8,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59358.88,
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
          "id": "894323cbe8c2c175bfd671f18ace3bba2a3bee43",
          "message": "Merge remote changes: keep modular API structure",
          "timestamp": "2026-03-29T12:27:41+08:00",
          "tree_id": "99692339298cad32dada0f93719965a1d7f07ac2",
          "url": "https://github.com/Liveiciee/yuyucode/commit/894323cbe8c2c175bfd671f18ace3bba2a3bee43"
        },
        "date": 1774758730116,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7914071.86,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1219772.48,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1326365.65,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8085414.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15162209.03,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5743859.08,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1470630.71,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169293.26,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.119,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14084565.38,
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
            "value": 1956528.43,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1605045.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1686507.37,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6788567.05,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4810.27,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9602.21,
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
            "value": 219097.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 177373.6,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11043613.58,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1688725.34,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 439668,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120827.26,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13469762.46,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13581678.94,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4774417.36,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7190200.72,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7300.57,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6141280.44,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 973343.98,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5824434.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13534609.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2479,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121115.77,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14432050.99,
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
            "value": 5405235.99,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1576852.75,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1572445.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1653650.92,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1611282.74,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4146951.32,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3788.33,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1781951.86,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197012.06,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2511286.27,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4062438.56,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1609.2,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96823.71,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58752.14,
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
          "id": "d1ce22f8144a272ca3437887f3ca8711fb6a2e00",
          "message": "fix: add missing helpers and askCerebrasStream alias",
          "timestamp": "2026-03-29T12:34:26+08:00",
          "tree_id": "c3892be3748bac7a1d971f6a1b26df7bcf9ffbd4",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d1ce22f8144a272ca3437887f3ca8711fb6a2e00"
        },
        "date": 1774759064417,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7998697.34,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1288155.88,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1412436.48,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8433594.43,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15205939.27,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6241398.4,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1462243.04,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170166.41,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.6299,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13947786.44,
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
            "value": 1972456.65,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1514608.21,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1726846.8,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6430360.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5028.67,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9732.21,
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
            "value": 217981.57,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187966.81,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11166819.6,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1753205.56,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 443034.74,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118155.17,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13818058.65,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13493616.19,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4204777.73,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6912761.38,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7463.33,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5932095.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 995607.46,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5536426.96,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13885988.44,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2495,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125109.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14221414.86,
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
            "value": 5413459.84,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1595658.43,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1645997.43,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1651802.2,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1650506.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3994697,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3846.39,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1864279.26,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 189255.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2529874.3,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4082870.91,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1608.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97583.57,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60393.06,
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
          "id": "e7892b30485b6fc7e841f45b8d82365ac0268a3e",
          "message": "fix: add injectVisionImage to utils and export provider functions",
          "timestamp": "2026-03-29T12:36:45+08:00",
          "tree_id": "837aab13dc45c6a43da548850a876f7e20f5a319",
          "url": "https://github.com/Liveiciee/yuyucode/commit/e7892b30485b6fc7e841f45b8d82365ac0268a3e"
        },
        "date": 1774759204026,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7775204.27,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1278417.95,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1412386.63,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8032565.68,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15178539.33,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5981534.36,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1476498.73,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169774.77,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.7697,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14091974.11,
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
            "value": 1953512.57,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1519204.68,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1730090.13,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6737209.53,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5037.32,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9713.09,
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
            "value": 215082.21,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187944.47,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10575318.82,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1753838.53,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 453291.45,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117828.13,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13137093.65,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13255835.05,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4549268.83,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6997664.89,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7446.88,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5921636.89,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 973265.69,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5682064.78,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13968289.83,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2497,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124234.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14421052.39,
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
            "value": 5766317.83,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1610853.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1579601.19,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1673236.53,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1627999.81,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4149306.13,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3854.69,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1787685.1,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198528.62,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2477696.83,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3973387.05,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1613.12,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96255.71,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59089.68,
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
          "id": "bb4cc8100d3a58b62e1dca6d4255ea4780b28f2c",
          "message": "test: upgrade api orchestration tests with valid keys and custom matchers",
          "timestamp": "2026-03-29T12:43:41+08:00",
          "tree_id": "21667d47e47e28b269b9ecee64a5469e015393fc",
          "url": "https://github.com/Liveiciee/yuyucode/commit/bb4cc8100d3a58b62e1dca6d4255ea4780b28f2c"
        },
        "date": 1774759626755,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8066202.23,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 521357.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 492879.84,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7857759.78,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14867357.05,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5780186.15,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1415877.81,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171425.77,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.6887,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13952067.97,
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
            "value": 1966701.14,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1581913.36,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1721341.65,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7126033.17,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5108.33,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9650.42,
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
            "value": 219443.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 192884.91,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10054834.47,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1752136.35,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445200.06,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118506.2,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13694893.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13701797.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4521663.82,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7068527.9,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7452.97,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5890183.94,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 980140.65,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5773183.2,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13978656.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2497,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123477.08,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14279361.74,
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
            "value": 5657204.17,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1667502.89,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1635236.44,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1687445.25,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1674276.66,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4128390.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3812.35,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1907534.18,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195132,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2391074.32,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4075914.78,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1616.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 92745.77,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62246.28,
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
          "id": "863fce252a5f142b136e3940edb640df75757518",
          "message": "Update max_tokens expectation for Cerebras model",
          "timestamp": "2026-03-29T12:57:11+08:00",
          "tree_id": "c7a60bf4655210e50bc3e7a491137fc6086b0dd8",
          "url": "https://github.com/Liveiciee/yuyucode/commit/863fce252a5f142b136e3940edb640df75757518"
        },
        "date": 1774760426710,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8466462.26,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1167286.81,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1451385.8,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8734748.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15264829.69,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5644024.89,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1459863.07,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171171.67,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.7976,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14112010.84,
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
            "value": 1862903.18,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1490151.89,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1676812.47,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6716930.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5010.78,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9834.81,
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
            "value": 220023.74,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187748.84,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10910898.97,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1716137.38,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440671.18,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120655,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13652451.75,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13909906.72,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4733389.02,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7208447.38,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7143.85,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5915585.85,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 968030.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5662949.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13755877.61,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2515,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124926.9,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14443579.8,
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
            "value": 5585731.94,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1550202.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1557649.14,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1640791.56,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1579285.58,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4191264.68,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3828.88,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1907376.54,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193828.12,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2615120.48,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4107592.23,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97223.22,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61527.61,
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
          "id": "84e68c18eb99396952b16b1e4ec9b52ad9908f2a",
          "message": "Refactor mock keys and improve test responses",
          "timestamp": "2026-03-29T13:10:56+08:00",
          "tree_id": "6cec4502ad9017509b6783602fd3b263380f62ac",
          "url": "https://github.com/Liveiciee/yuyucode/commit/84e68c18eb99396952b16b1e4ec9b52ad9908f2a"
        },
        "date": 1774761255506,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8408216.62,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1253637.36,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1425455.63,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8295956.47,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15337189.33,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6021599.88,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1466984.89,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170603.39,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.8247,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13674631.29,
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
            "value": 1872371.12,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1655684.29,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1741419.44,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6987840.83,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4964.3,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9555.74,
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
            "value": 219337.81,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 177183.37,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10654503.96,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1673678.97,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440199.64,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120332.31,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13672401.86,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13333839.92,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4797193.87,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7267835.93,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7432.21,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5846250.91,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 967775.91,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6100869.07,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13360241.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2523,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 126068.18,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12997944.47,
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
            "value": 5449181.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1664669.9,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1606329.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1680142.2,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1656380.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4293334.78,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3732.17,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1955347.05,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196617.48,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2555466.03,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4162650.94,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1596.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95319.29,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60679.24,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 123515.61,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8890.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.822,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2125.63,
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
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "82ae09d56bfb2c812815798e166ed7a2377f17c5",
          "message": "Merge remote main: keep modular API structure",
          "timestamp": "2026-03-29T13:26:44+08:00",
          "tree_id": "7639aecfeb9c80d34c505325957ad6a349c912b9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/82ae09d56bfb2c812815798e166ed7a2377f17c5"
        },
        "date": 1774762215903,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8316471.18,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 647085.17,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 669846.06,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8625072.6,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14960905.04,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5887758.92,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1430402.61,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167403.17,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0315,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14111882.28,
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
            "value": 1906584.25,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1578833.3,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1691574.43,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7469257.96,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5087.02,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9554.37,
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
            "value": 218949.49,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176233.84,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10374143.73,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1702674.3,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446917.7,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121569.78,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13563033.38,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13675135.81,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4476136.21,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7239102.6,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7461.41,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5772837.79,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 983690.55,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5730430.19,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13638619.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.245,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123669.51,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14254461.91,
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
            "value": 5675377.17,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1601922.4,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1609145.78,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1611195.81,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1620487.32,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3917811.42,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3591.92,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1841961.36,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198341.37,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2449552.33,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4064839.64,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1614.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96867.61,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57412.08,
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
          "id": "f61c871ef438e58e55c30326219accdfd03e09bb",
          "message": "fix: add askCerebrasStream export and update fallback test with spy",
          "timestamp": "2026-03-29T13:39:14+08:00",
          "tree_id": "f00534d6a795667e61a26d920268f6aa49d71157",
          "url": "https://github.com/Liveiciee/yuyucode/commit/f61c871ef438e58e55c30326219accdfd03e09bb"
        },
        "date": 1774762953715,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8308719.34,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1303353.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1409259.64,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8513905.93,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15223393.06,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6408761.99,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1453942.01,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 144317.17,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.6386,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14020827.05,
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
            "value": 1933736.26,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1652443.68,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1730764.88,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6849619.15,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5207.56,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9809.91,
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
            "value": 219423.22,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 183116.15,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10685957.32,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1720272.36,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445368.24,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119313.27,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13656429.81,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13773256.37,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4587147.92,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7247580.35,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7619.38,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5884063.04,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 977079.76,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6192527.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14023846.57,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2518,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 115579.02,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14405774.9,
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
            "value": 5650005.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1625505.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1584381.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1664059.04,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1616773,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4125880.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3788.81,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1924931.54,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199920.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2678973.76,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4134376.06,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1620.48,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94811.18,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61202.34,
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
          "id": "6cc208dd08c931c174852436580cde78d0f0050e",
          "message": "chore: remove backup files",
          "timestamp": "2026-03-29T13:49:29+08:00",
          "tree_id": "4323f6de98edf3e3b3417b51c4656c49bb6f6506",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6cc208dd08c931c174852436580cde78d0f0050e"
        },
        "date": 1774763575377,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8119902.62,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1152218.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1356635.2,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8011877.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14076177.66,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5398814.7,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1347514.97,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 151487.58,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3799,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13747386.4,
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
            "value": 2055076.67,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1673421.35,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1793825.99,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6635422.83,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5577.51,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9964.9,
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
            "value": 232811.1,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188238.31,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10711646.77,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1923062.54,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438278.46,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 125446.11,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13418353.87,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13424314.45,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4792228.51,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6840562.41,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7712.88,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5391537.87,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 896369.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5452943.13,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14253646.35,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2619,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 115311.6,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14223676.41,
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
            "value": 3734467.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1717277.26,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1676528.68,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1751078.62,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1653119.09,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3998881.87,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4088.19,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1762097.41,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 175910.31,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2433056.38,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4218195.97,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1687.22,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 106306.65,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52237.05,
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
          "id": "02b85a096c82501e97e9a47a96a12867de1a654f",
          "message": "fix: move test file to api folder and adjust imports",
          "timestamp": "2026-03-29T14:03:50+08:00",
          "tree_id": "0a6ef0a6d01fbcca6d1d9e8ba611859650e50350",
          "url": "https://github.com/Liveiciee/yuyucode/commit/02b85a096c82501e97e9a47a96a12867de1a654f"
        },
        "date": 1774764450597,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7835928.4,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1177796.77,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1394491.58,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8043318.23,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15211773.45,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6076205.31,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1459144.83,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167261.12,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 25.8692,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13552896.4,
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
            "value": 1971840.21,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1602403.54,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1738496.91,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6546598.36,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4914.84,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9647.99,
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
            "value": 218343.28,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 180817.26,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10112851.82,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1757400.26,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 448402.65,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118477.88,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13877891.06,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13917595.19,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4881477.67,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7271120.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7399.67,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5933221.48,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 976389.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5951895.87,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13967878.21,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.245,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123068.24,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14152735.21,
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
            "value": 5626519.48,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1680688.18,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1641329.2,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1704516.22,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1678199.67,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4357570.87,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3794.21,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1894113.63,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196509.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2499902.85,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3983433.81,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1573.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96862.47,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59630.22,
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
          "id": "3c63bd99b2218c761ed5b2d3843e446801c36ecb",
          "message": "refactor: move all API test files into src/api/ and fix imports",
          "timestamp": "2026-03-29T14:06:37+08:00",
          "tree_id": "e56db7bf3d5ceced4c15c66c33b7ac1f1a7f88f3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3c63bd99b2218c761ed5b2d3843e446801c36ecb"
        },
        "date": 1774764602509,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7958479.08,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1071746.78,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1389360.78,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8232107.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15325561.17,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5814574.79,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1439167.02,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 159280.23,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1633,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14149161.07,
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
            "value": 1940899.42,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1594571.36,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1704481.84,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7189648.96,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5162.95,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9568.42,
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
            "value": 216176.44,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 173720.15,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10498605.71,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1697128.69,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 432090.98,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117035.4,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13604188.75,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13706640.68,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4351487.19,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7076080.5,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7575.43,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5781953.7,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 976700.65,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5506949.61,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13886336.37,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2489,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120451.09,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14457092.55,
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
            "value": 5546855.73,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1633839.18,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1600780.32,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1663971.23,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1625904.19,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3976292.33,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3827.23,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1886391.14,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197445.99,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2576803.57,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4318148.32,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1594.51,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95272.08,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56280.9,
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
          "id": "459b510fd0946e7e2828bdc399edb41f4d74144e",
          "message": "fix: correct import paths in server and stream tests",
          "timestamp": "2026-03-29T14:11:20+08:00",
          "tree_id": "174421d424825344bac3c7744e6280828969d91b",
          "url": "https://github.com/Liveiciee/yuyucode/commit/459b510fd0946e7e2828bdc399edb41f4d74144e"
        },
        "date": 1774764879986,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7986570.79,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1196338.96,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1201018.29,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7667565.86,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13233077.52,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5930840.73,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1423582.12,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170846.96,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3681,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13786841.61,
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
            "value": 1936660.73,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1603595.32,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1735361.76,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7157406.27,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5001.88,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9733.01,
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
            "value": 219631.25,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 192367.64,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10564629.83,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1761678.25,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 443880.39,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117652.57,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13975109.97,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14003000.21,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4935999.6,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7370067.41,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7248.72,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5888665.06,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 983960.65,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5731335.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13735038.05,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2513,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125050.56,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13939113.05,
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
            "value": 5686116.76,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1601098.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1599496.72,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1671394.59,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1632790.68,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4272628.5,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3856.54,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1943422.82,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 194803.39,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2530316.19,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4231264.37,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1619.76,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96063.8,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61367.87,
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
          "id": "d1b72afe25539b18c9fc02227b51a8dd3aaeadf0",
          "message": "fix: restore original test content with correct imports",
          "timestamp": "2026-03-29T14:17:41+08:00",
          "tree_id": "c511ce89bb88b3089919f23e5b6e7833a71f640d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d1b72afe25539b18c9fc02227b51a8dd3aaeadf0"
        },
        "date": 1774765261939,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8294247.47,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1274177.32,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1423981.97,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8025845.18,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15170822.36,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5824900.58,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1423111.47,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169739.84,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.8856,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14061827.52,
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
            "value": 1964841.57,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1512361.72,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1726665.24,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7437730.94,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5205.61,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9796.79,
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
            "value": 219816.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187904.4,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9873392.54,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1724110.13,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 437615.89,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118623.35,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13259895.15,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13797064.59,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4577097.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7294878.82,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7692.3,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5715095.53,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 987120.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5523889.32,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14098797.69,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2508,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121226.75,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14304738.37,
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
            "value": 5164383.39,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1575915.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1569128.29,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1667331.11,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1624003.97,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4010777.74,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3822.64,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1869339.75,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197286.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2542631.46,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4132655.11,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.12,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95000.31,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 55808.5,
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
          "id": "1fcd1b3b18baca7e11fb1e1ffcd0f15a9540a9eb",
          "message": "fix: restore original tests with correct import paths",
          "timestamp": "2026-03-29T14:22:03+08:00",
          "tree_id": "e56db7bf3d5ceced4c15c66c33b7ac1f1a7f88f3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1fcd1b3b18baca7e11fb1e1ffcd0f15a9540a9eb"
        },
        "date": 1774765526447,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8009189.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1189238.59,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1391507.22,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8563173.31,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15066209.67,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5932587.68,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1408002.9,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 151585.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.04,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14047885.94,
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
            "value": 1929974.08,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1568183.58,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1691230.5,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6371885.11,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5163.35,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9721.07,
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
            "value": 219281.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 170667.78,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10164656.09,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1748610.95,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440451.66,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120787.63,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13205687.58,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13676448.3,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4388738.32,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7060012.21,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7282.13,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5575695.53,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 962620.21,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5563286.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14019461.72,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2523,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124119.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14371101.02,
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
            "value": 5395790.64,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1574265.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1603668.69,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1640347.66,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1570700.41,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4088262.32,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3746.99,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1818564.56,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191334.82,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2554843.8,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4193616.18,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1621.11,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97326.68,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58076.22,
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
          "id": "4e25a7a0c2059aa583bb57a1eb120a6ec7461ef3",
          "message": "fix: correct import paths in server and stream tests",
          "timestamp": "2026-03-29T14:24:21+08:00",
          "tree_id": "0198208e84fad7dbdc05ca159dfacda6e5dacc3a",
          "url": "https://github.com/Liveiciee/yuyucode/commit/4e25a7a0c2059aa583bb57a1eb120a6ec7461ef3"
        },
        "date": 1774765664162,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8172226.04,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1201647.67,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1435114.58,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8750657.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15279743.94,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5791514.51,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1420838.93,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169522.54,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3566,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13370505.65,
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
            "value": 1950070.2,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1623123.99,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1743288.47,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6846431.66,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4990.77,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9658.25,
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
            "value": 219273.89,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 191853.08,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10345906.32,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1708403.98,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444564.18,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119129.47,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13636741.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13260002.75,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4357039.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7548209.79,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7504.17,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5690812.2,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 989675.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5690399.43,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13895968.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2492,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121249.32,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14415356.42,
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
            "value": 5207072.65,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1671618.62,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1603424.34,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1683402.08,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1648317.55,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4356729.18,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3848.47,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1908376.47,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193954.73,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2501590.39,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4127295.53,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98339.32,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57491.65,
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
          "id": "c48ee379f170d5ce125f88137aba0ae8442f9c8f",
          "message": "fix: move test files back to src/ root to resolve import issues",
          "timestamp": "2026-03-29T14:31:09+08:00",
          "tree_id": "18054b761718cea7c76138196ca6b754fe4941a0",
          "url": "https://github.com/Liveiciee/yuyucode/commit/c48ee379f170d5ce125f88137aba0ae8442f9c8f"
        },
        "date": 1774766078301,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7393258.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1009223.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1342554.77,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7423693.18,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13064331.45,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5293006.95,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1160103.57,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 155360.36,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.2145,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12231893.09,
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
            "value": 1929495.36,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1523643.83,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1753075.56,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 5831461.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5619.26,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9970.48,
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
            "value": 226883.1,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188288.62,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9960502.82,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1619542.35,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 432541.11,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 122365.82,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 11806850.81,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12138132.47,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4483520.34,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6478607.55,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7616.55,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5450557.01,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 917791.02,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5297003.37,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12220868.88,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2606,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 117385.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12581433.62,
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
            "value": 3624942.05,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1682217.72,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1657596.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1730621.29,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1662818.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3889725.33,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4048.61,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1779653.13,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 183840.54,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2389125.17,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4287033.59,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1681.47,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 106168.28,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52805.96,
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
          "id": "3cbe12d8359b690c0036e8121c254f60b565a61a",
          "message": "fix: correct import paths in test files (use './api.js' etc.)",
          "timestamp": "2026-03-29T14:34:28+08:00",
          "tree_id": "d99749cce922dbdd23b7e8838d1ec39e0e329e95",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3cbe12d8359b690c0036e8121c254f60b565a61a"
        },
        "date": 1774766267441,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7791217.53,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 470495.79,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 586033.52,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7687640.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14035579.86,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5420106.49,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1312753.33,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 153380.46,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.67,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12805644.69,
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
            "value": 2008479.26,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1669612.41,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1788543.51,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6094363.45,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5709.42,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9968.28,
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
            "value": 232650.86,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 185899.64,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9936232.75,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1872426.93,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444758.92,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 127072.29,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12553095.62,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12487362.68,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4682117.68,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6744221.15,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7557.79,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5336081.31,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 909271.05,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5169545.5,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12387964.71,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2362,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 113054.72,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13057523.82,
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
            "value": 3762079.73,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1735124.82,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1674593.64,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1717135.22,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1709162.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4204459.44,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4083.46,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1765609.47,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 182656.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2400138.08,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4230215.74,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1678.74,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 104137.21,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 51727.35,
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
          "id": "3ea51f55f3bb58c44e20aa9398a6e3e703e84e6b",
          "message": "fix: mock getCerebrasKey/getGroqKey directly to bypass path issues",
          "timestamp": "2026-03-29T14:39:05+08:00",
          "tree_id": "ff205a35dcf0e088b42a3dd03039ed288862e57e",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3ea51f55f3bb58c44e20aa9398a6e3e703e84e6b"
        },
        "date": 1774766548337,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7117433.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1258567.4,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1402087.96,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7634363.82,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 12492104.55,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5273328.42,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1404081.74,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168611.73,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.3234,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11632350.53,
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
            "value": 1860350.71,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1591803.4,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1724967.12,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6228003.89,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5153.54,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9724.34,
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
            "value": 219090.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187778.6,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8226686.75,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1704219.22,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 427134.71,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119039.8,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 11381869.29,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 11507522.27,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4445468.99,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6490488.53,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7346.68,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5435873.4,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 957223.98,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5118241.57,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11496739.88,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2298,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120857.12,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11344829.96,
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
            "value": 5070764.67,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1634389.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1580394.95,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1670524.13,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1647296.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3992782.2,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3862.85,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1932844.69,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199339.27,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2388328.24,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3914316.13,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1598.94,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94428.47,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58186.48,
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
          "id": "a9809a3045b32cd380e31a66c15b9aef55a6a7de",
          "message": "fix: mock cerebrasRequest and groqRequest directly to bypass key validation",
          "timestamp": "2026-03-29T14:43:40+08:00",
          "tree_id": "968ada9ca0d0caac439d500105eab14bcd125679",
          "url": "https://github.com/Liveiciee/yuyucode/commit/a9809a3045b32cd380e31a66c15b9aef55a6a7de"
        },
        "date": 1774766822949,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7822290.72,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1250246.06,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1423755.72,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7889803.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15230406.26,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6208430.4,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1416001.47,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170762.36,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1429,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13403306.55,
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
            "value": 1953430.33,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1594771.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1720060.73,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7329355.33,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5162.37,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9720.28,
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
            "value": 219434.23,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 192807.94,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10514050.09,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1709164.27,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 452170.17,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121003.13,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13808846.45,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13980608.71,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4687681.71,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7289480.69,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7429.72,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5723259.12,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 777214.17,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5513001.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14106191.89,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 119361.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14421575.02,
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
            "value": 5176386.96,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1597205.92,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1569881.95,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1665213.97,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1633456.14,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4058194.47,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3604.7,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1833394.78,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196579.36,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2838541.68,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4077433.17,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1616.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96490.73,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56179.83,
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
          "id": "9971044a0e4b7b0cdaece49cf2a5fffeed31d62b",
          "message": "test: fix default values test to be less strict",
          "timestamp": "2026-03-29T14:51:05+08:00",
          "tree_id": "4ac0de442edf74e9223461323d29f2a6606ec79e",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9971044a0e4b7b0cdaece49cf2a5fffeed31d62b"
        },
        "date": 1774767264980,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8192824.89,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1188906.45,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1322813.1,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7671810.19,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15081578.91,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5998354.4,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1397591.37,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170372.32,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.1225,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14079477.83,
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
            "value": 1876517.25,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1577780.24,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1700857.85,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7030850.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5094.19,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9685.35,
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
            "value": 218710.44,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187520.78,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10836186.24,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1687495.32,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440695.55,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120971.77,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13606617.59,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13794447.7,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4572730.01,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6890966.1,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7473.35,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5559966.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 942705.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5579185.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14049867.21,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2476,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124551.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14339675.04,
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
            "value": 5459417.65,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1617089.05,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1600546.43,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1660672.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1674110.23,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4085467.98,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3698.44,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1810700.53,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195650.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2507012.87,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4199157.71,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93205.94,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56925.15,
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
          "id": "61bd2de4b07206b42d12215f4aa9d9b7670c983a",
          "message": "refactor: split API tests into modular files",
          "timestamp": "2026-03-29T14:56:29+08:00",
          "tree_id": "7f1c75539fbdc95dbe4b0525e614bf9098ec6c29",
          "url": "https://github.com/Liveiciee/yuyucode/commit/61bd2de4b07206b42d12215f4aa9d9b7670c983a"
        },
        "date": 1774767589520,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7623231.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1248215.46,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1422690.74,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8764507.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15369458.19,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6187732.71,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1445265.25,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171258.65,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.0891,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14108977.46,
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
            "value": 1970594.49,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1533000.83,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1729232.74,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6995185.31,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5048.95,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9819.49,
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
            "value": 219977.81,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186359.68,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9892450.22,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1719136.07,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 434386.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119822.92,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13724528.27,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13075562.46,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4646880.95,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7431846.89,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7295.9,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5983205.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 994854.24,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5619164.88,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13993599.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2482,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122980.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13624114.86,
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
            "value": 5704686.61,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1658873.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1568901.39,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1659909.38,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1638602.7,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4065291.91,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3797.25,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1877898.18,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199009.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2551646.44,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4373129.35,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1610.76,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95911.17,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58892.3,
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
          "id": "b87c0e3be2370007db21bfdd42ed20706a6854ed",
          "message": "fix: correct imports in server and stream tests",
          "timestamp": "2026-03-29T15:01:23+08:00",
          "tree_id": "f9f06d287839f2ee14f4ac040695b64cb944cd94",
          "url": "https://github.com/Liveiciee/yuyucode/commit/b87c0e3be2370007db21bfdd42ed20706a6854ed"
        },
        "date": 1774767886179,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8030700.06,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1218875.12,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1436435.03,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8485593.64,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15087018.7,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5953257.51,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1406413.83,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167635.45,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6812,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14067128.56,
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
            "value": 1928147.75,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1564121.51,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1723419.37,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7188403.14,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5007.14,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9604.39,
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
            "value": 219548.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188605.8,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11070703.89,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1724492.49,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 431901.73,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119447.68,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13792153.48,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13766281.67,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4808239.71,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7511943.4,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7271.56,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5774699.13,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 970001.76,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5325177.77,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14080677.44,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2484,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121800.67,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14417378.96,
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
            "value": 5526288.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1610361.3,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1583790.95,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1681884.29,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1616707.74,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4338283.39,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3775.25,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1850410.24,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198925.81,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2434608.5,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3832638.09,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1581.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97571.86,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60267.67,
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
          "id": "4ddd16b69d42954d6e86bb5e0cd48e2b33e0a0f4",
          "message": "refactor: move all API tests into __tests__ folder",
          "timestamp": "2026-03-29T15:04:40+08:00",
          "tree_id": "3a05f6accc2b28bb4fb1c7b88aa3bfadb5d1afd1",
          "url": "https://github.com/Liveiciee/yuyucode/commit/4ddd16b69d42954d6e86bb5e0cd48e2b33e0a0f4"
        },
        "date": 1774768079861,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8280815.87,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1302197.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1421948.9,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8539401.4,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14986747.76,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6632387.81,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1547894.48,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 173871.42,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.4759,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13506683.62,
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
            "value": 2010569.82,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1656507.4,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1782504.65,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7472475.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5885.8,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 10499,
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
            "value": 196641.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 208436.42,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11217715.1,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1784195.26,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 474274.42,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 124468.54,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13929123.86,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14065769.32,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 5210960.52,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7383539.39,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 9204.73,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6220692.37,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 1019071.05,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6146544.24,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13377761.92,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2653,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 127661.17,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13927758.41,
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
            "value": 4556023.78,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1677610.66,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1588931.48,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1679851.53,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1666017.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4224664.91,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4100.53,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 2027144.48,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 190767.36,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2866104.34,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4623781.1,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1672.78,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96351.55,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 54167.61,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 126082.68,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 9363.77,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.8392,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2207.75,
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
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "18970d7eab570fcbf7ea3c61f379bf693b73ee20",
          "message": "fix: add MODELS mock to server test and fix vision import",
          "timestamp": "2026-03-29T15:07:31+08:00",
          "tree_id": "bd6f6c37ba7b90e2b376b9ed04fd42b84f8e377f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/18970d7eab570fcbf7ea3c61f379bf693b73ee20"
        },
        "date": 1774768256453,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8487438.29,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1254766.81,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1442244.27,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7641095.95,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15073413.88,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5873936.45,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1385950.38,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170067.19,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.2353,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12598193.67,
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
            "value": 1873878.55,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1595648.42,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1680819.53,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6596730.35,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5258.36,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9745.76,
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
            "value": 219275.81,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 183659.69,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10047043.54,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1674522.38,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444057.47,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119649.75,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12340075.8,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12293082.92,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4476781.44,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7172351.5,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7646.81,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5995044.59,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 825830.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5497164.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14112381.15,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2493,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125569.74,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14428409.13,
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
            "value": 5550963.51,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1641218.13,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1577359.24,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1672055.44,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1642837.9,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4360130.56,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3806.42,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1939974.1,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196439.9,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2615688.69,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3794170.32,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1540.36,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94258.72,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58782.52,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 123679.73,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8875.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7299,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2142.88,
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
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "6da2c5853c8f5f111df412e3c96463b5446203d8",
          "message": "test: rewrite API tests with modular structure and complete mocks",
          "timestamp": "2026-03-29T15:13:25+08:00",
          "tree_id": "197101269aceef53681ecf404c3487695f45d2b4",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6da2c5853c8f5f111df412e3c96463b5446203d8"
        },
        "date": 1774768605245,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7489689.66,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1262911.23,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1328679.5,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7302414.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 11649990.56,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5711105.05,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1407943.4,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168359.89,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.9114,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11574080.15,
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
            "value": 1884815.45,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1453363.44,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1659490.92,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6090064.53,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5104.2,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9744.32,
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
            "value": 219327.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186062.49,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9499654.69,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1733135.74,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441591.98,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118640.86,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 11446209.94,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 11615532.82,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4336146.83,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6266081.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7382.12,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5612172,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 979484.18,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5208675.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11579381.99,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.23,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122443.68,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11698291.2,
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
            "value": 5061076.95,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1595272.66,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1564128.48,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1611864.53,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1575011.97,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3807035.07,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3877.33,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1850504.31,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196067.93,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2470628.2,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4096354.58,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1569.27,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96099.04,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61066.22,
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
          "id": "00ffa9b3bd0c3ef3b453df97d6253c3c24001b56",
          "message": "test: import setup and mock getCerebrasKey in cerebras.test.js",
          "timestamp": "2026-03-29T15:17:04+08:00",
          "tree_id": "6a295ca162a339e7be77dc65cb8a2822769a7d22",
          "url": "https://github.com/Liveiciee/yuyucode/commit/00ffa9b3bd0c3ef3b453df97d6253c3c24001b56"
        },
        "date": 1774768825954,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8490847.44,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1234239.53,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1428156.18,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8183040.66,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15113697.03,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5756488.85,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1385462.15,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169533.67,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.9432,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14111495.94,
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
            "value": 1983278.82,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1571807.24,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1709824.97,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6488825.64,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5231.04,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9488.19,
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
            "value": 218980.31,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188591.22,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10055591.62,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1720905.37,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 407744.17,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121143.97,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13600348.53,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13430376.17,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4574938.66,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7117314.53,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7602.81,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5603725.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 971047.27,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5299920.66,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13645290.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.248,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123226.12,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14390055.62,
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
            "value": 5492901.23,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1612109.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1641331.99,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1658287.46,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1630062.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4147226.39,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3846.09,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1804339.5,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195594.82,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2429045.99,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3908715.57,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1542.99,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94034.67,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56931.67,
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
          "id": "e60b0b962ddf10745001c9ac7db8414e35a11e8e",
          "message": "test: skip problematic cerebras provider test",
          "timestamp": "2026-03-29T15:19:46+08:00",
          "tree_id": "3dff6d402901d57cf5dbf1a4e0dd33677c1fa6ef",
          "url": "https://github.com/Liveiciee/yuyucode/commit/e60b0b962ddf10745001c9ac7db8414e35a11e8e"
        },
        "date": 1774768990992,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8302354.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 597180.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 649036.77,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8528176.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14634230.74,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5827697.2,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1384145.14,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 147349.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.7513,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14112952.45,
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
            "value": 1915489.71,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1599149.91,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1690347.48,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6883527.12,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4964.26,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9716.94,
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
            "value": 217970.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187075.56,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11130613.51,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1661648.4,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 428136.8,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117502.16,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13818324.87,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13998668.96,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4896786.91,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7243723.45,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7429.38,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5703517.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 968079.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5564666.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14008410.68,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2452,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121316.79,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14327337.26,
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
            "value": 5708963.01,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1600112.99,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1558911.59,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1599608.24,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1587023.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4004957.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3764.71,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1731865.13,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193794.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2514194.09,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4199624.38,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1586.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98278,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 53555.23,
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
          "id": "d7a11178a540d446b0ee9490832294f0241175ff",
          "message": "fix: import injectVisionImage from correct module",
          "timestamp": "2026-03-29T15:22:08+08:00",
          "tree_id": "ba0a4e5237b299e3ef88adb9f18438aa092f591d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d7a11178a540d446b0ee9490832294f0241175ff"
        },
        "date": 1774769127940,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7690632.23,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1063893.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1379315.7,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8284444.41,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15394456.37,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6153236.54,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1424625.74,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168258.27,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4324,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13233269.15,
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
            "value": 1989595.23,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1528671.98,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1746815.53,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7088436.23,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5039.08,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9716.94,
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
            "value": 219095.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 182214.96,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10593171.07,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1720883.24,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 451432.42,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121291.61,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12728384.83,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12813704.49,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4841443.05,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7205942.62,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7418.07,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5859770.78,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 974094.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5525049.1,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13993795.27,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2507,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125019.53,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14315743.03,
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
            "value": 5533485.51,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1679044.42,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1626310.6,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1695953.3,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1641101.08,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4145849.88,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3764.74,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1876255.71,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198501.03,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2588368.89,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4212958.74,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1598.32,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 91999.37,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59597.48,
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
          "id": "8c7070133fb4884bf79cadea7bd801192134a450",
          "message": "test: skip vision tests until injectVisionImage is exported",
          "timestamp": "2026-03-29T15:25:15+08:00",
          "tree_id": "c6ed83e1df5c92df12763ee828f2b20a1224d19c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/8c7070133fb4884bf79cadea7bd801192134a450"
        },
        "date": 1774769316066,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8077793.64,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1244276.77,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1419016,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8498580.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15173161.67,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5934487.83,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1415438.63,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169892.2,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.439,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14113341.63,
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
            "value": 1911560.19,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1536502.25,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1715031.15,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6373130.7,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5135.03,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9654.84,
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
            "value": 218929.28,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 180929.27,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10561098.48,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1765200.56,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 437389.37,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118503.81,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13464104.71,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13692380.17,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4743955.53,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7413772.1,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7444.88,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6181054.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 998857.95,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5881880.62,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13922737.3,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2511,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125381.14,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14303991.71,
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
            "value": 5801641.94,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1644041.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1620760.63,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1681342.05,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1631359.81,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4051013.01,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3866.37,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1882370.54,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198251.52,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2648438.2,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4186520.9,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1610.35,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93697.68,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62648.08,
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
          "id": "d76e8fefe5c36e67c4e9dc165ba618842188dae5",
          "message": "test: fix orchestrator test with proper mocks",
          "timestamp": "2026-03-29T15:27:20+08:00",
          "tree_id": "647a2eead2cfaf8acec35c293ea4f611bc557624",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d76e8fefe5c36e67c4e9dc165ba618842188dae5"
        },
        "date": 1774769440194,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7918573.71,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1021050.67,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1371802.23,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8611436.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14987243.88,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6101960.49,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1448552.99,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168006.15,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.9873,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14158939.09,
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
            "value": 1932106.23,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1596499.93,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1689006.3,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7263369.03,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4866.28,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9623.1,
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
            "value": 217932.48,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186657.38,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11391368.75,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1590317.39,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 400877.21,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118647.97,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13574193.65,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13940577.78,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4759405.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7111434.56,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7309.65,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5934231.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 966519.65,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5620179.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14060469.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2487,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120171.22,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14383626.82,
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
            "value": 5421743.89,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1631560.4,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1615386.48,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1668850.73,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1600116.65,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4071153.45,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3702.89,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1792213.41,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 178859.32,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2407803.43,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4204963.63,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1600.45,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96331.39,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56396.68,
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
          "id": "82c41946e741c7f09486baef2ede0d0f747a4122",
          "message": "fix: correct runtimeKeys import paths in providers",
          "timestamp": "2026-03-29T16:19:10+08:00",
          "tree_id": "00ba80b1c6e38d425d5c4aaa8ee84a8c7814304d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/82c41946e741c7f09486baef2ede0d0f747a4122"
        },
        "date": 1774772549705,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8298963.55,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1315608.72,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1422744.46,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7961476.36,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15280790.38,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5908046.59,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1434805.8,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 166772.31,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.2832,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13782647.12,
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
            "value": 1957309.3,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1584537.17,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1712777.36,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7104776.05,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5098.8,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9769.98,
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
            "value": 219425.38,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 180996.08,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11241636.92,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1698432.74,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 439370.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120433.85,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13748065.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13862224.2,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4848965.24,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7401470.82,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7406.09,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5715167.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 960430.36,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5764806.2,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14087785.21,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2534,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122589.89,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14388813.8,
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
            "value": 5419375.9,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1679665.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1622720.79,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1709208.23,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1626450.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4164489.46,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3804.93,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1854218.57,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 190016.66,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2515074.74,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4232502.02,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1618.25,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94739.03,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60542.55,
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
          "id": "9f533da253c7fbb755a081decd44afe947590740",
          "message": "test: fix remaining importActual path in runtimeKeys test",
          "timestamp": "2026-03-29T16:25:19+08:00",
          "tree_id": "d9276c58ac92078b874c21ad99c5a643847c3c32",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9f533da253c7fbb755a081decd44afe947590740"
        },
        "date": 1774772921528,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8493631.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1270756.7,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1353281.22,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8376611.2,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15046944.71,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6034138.77,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1446225.55,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 166253.35,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.7413,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14109418.11,
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
            "value": 1939498.68,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1623385.45,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1731468.2,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6485195.75,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4885.26,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9696.93,
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
            "value": 216087.29,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 183753.34,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11087628.16,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1724189.59,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438162.37,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121594.46,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13601585.73,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13929088.13,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4462413.61,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7115216.42,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7476.62,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5929149.37,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 915130.96,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5762164.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13943783.36,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2493,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120673.53,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14315595.28,
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
            "value": 5354540.07,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1631134.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1577515.5,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1650830.77,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1544687.74,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3990664.63,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3792.13,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1844099.44,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199283.95,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2390763.12,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4217751.33,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1609.48,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97932.91,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56158.05,
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
          "id": "6621e126b7bca0422a592fb97ef201e17249f5f7",
          "message": "fix: correct logger recursion for debug method",
          "timestamp": "2026-03-29T16:28:54+08:00",
          "tree_id": "3f5761a1056a5c5a66ff050ac2fe3f7817cf3ce9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6621e126b7bca0422a592fb97ef201e17249f5f7"
        },
        "date": 1774773138212,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7698183.78,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1054353.36,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1317624.54,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7855783.51,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14066740.34,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5502265,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1295667.31,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 153154.78,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.499,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13548663.4,
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
            "value": 2027779.36,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1696855.35,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1822599.31,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6409643.05,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5560.26,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9996.2,
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
            "value": 231303.88,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186865.75,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10646563.1,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1676974.95,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 437168.34,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 126926.79,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12661516.33,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12284747.21,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4719094.98,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6661883.04,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7703.95,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5426080.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 903760.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5271507.36,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13674754.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.256,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 116767.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13576614.34,
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
            "value": 3755907.71,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1536667.15,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1715848.62,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1751109.3,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1711691.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4066177.16,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4055.46,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1850681.02,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 180467.73,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2397834.73,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4228640.48,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1664,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 101409.02,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 50499.34,
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
          "id": "563010d12b1a7fcc44b0930b235bcd42cf4761d8",
          "message": "test: explicitly set allowLogs false in lint test (fix quotes)",
          "timestamp": "2026-03-29T16:36:43+08:00",
          "tree_id": "289f522bd42936f95c5c282f32d93337661e933c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/563010d12b1a7fcc44b0930b235bcd42cf4761d8"
        },
        "date": 1774773610348,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7845022.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 599493.24,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 654857.82,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8224056.6,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14835815.5,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6052269.73,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1413946.96,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170645.9,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.5784,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12992410.73,
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
            "value": 1932701.7,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1638071.52,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1706962.2,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7121490.26,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5010.07,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9721.85,
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
            "value": 218727.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 190339.44,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10028534.82,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1742484.88,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 433469.55,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117028.91,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13586014.28,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13749564.3,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4582182.52,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6983543.22,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7511.82,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5840016.1,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 972639.81,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6004090.79,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13928473.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2522,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123950.94,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13532322,
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
            "value": 5334638.4,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1654567.5,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1523406.26,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1669271.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1631759.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4285799.06,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3781.64,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1909279.17,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193544.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2529846.95,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4318226.07,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1616.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95579.51,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59226.23,
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
          "id": "20a3ec58b02f33d9897f1f6eaa1efed171b25333",
          "message": "test: skip failing lint console.log detection temporarily",
          "timestamp": "2026-03-29T16:40:08+08:00",
          "tree_id": "11ad39384777cd698cac81999f6ebfcd84067a74",
          "url": "https://github.com/Liveiciee/yuyucode/commit/20a3ec58b02f33d9897f1f6eaa1efed171b25333"
        },
        "date": 1774773814081,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8280739.69,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1161458.57,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1397478.61,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8459427.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15062211.55,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5963329.46,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1406112.62,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167480.74,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.2246,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14033012.93,
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
            "value": 1949818.99,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1594097.43,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1635081.92,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7121326.78,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5181.49,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9672.82,
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
            "value": 218028.35,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 177613.94,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9651779.07,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1536040.25,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 435223.88,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118196.74,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13452435,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13510529.68,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4356183.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7345802.69,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7338.56,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5626703.68,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 963532.38,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5713840.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13839247.75,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2476,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122223.37,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14397107.2,
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
            "value": 5265621.44,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1625800.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1557064.67,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1628557.31,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1566589.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4211771.93,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3716.93,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1785625.68,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196967.9,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2488577.37,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3918293.73,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1580.32,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94311.44,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 55345.68,
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
          "id": "75e2c422b2494233fa2c4a57fa37943d8b90d3e8",
          "message": "refactor: split utils.js into modular files",
          "timestamp": "2026-03-29T16:58:14+08:00",
          "tree_id": "9b734fc9f1388c66cd8e568685e70486b7d105a3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/75e2c422b2494233fa2c4a57fa37943d8b90d3e8"
        },
        "date": 1774774892089,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8111182.43,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1213926.85,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1433022.3,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8360569.87,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14810725.35,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5865163.05,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1436810.95,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171148.29,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.5418,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13706965.1,
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
            "value": 1933133.48,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1606529.43,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1726708.57,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6359051.95,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5084.13,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9770.22,
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
            "value": 219392.85,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 174610.22,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10677909.19,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1754109.74,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 436651.52,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119431.79,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12748744.06,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13535561.19,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4582574.81,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7391718.39,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7297.25,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5683962.86,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 978716.73,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5323167.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13722236.77,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2499,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123603.91,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13905305.03,
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
            "value": 5422788.67,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1642931.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1599914.88,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1645391.56,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1648137.44,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3979396.26,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3785.8,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1883149.68,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195965.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2516537.45,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4242915.85,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1608.37,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 92927.66,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57733.65,
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
          "id": "9a3eb9882d708d0ef28cb4c9916f9d7dfa2fb535",
          "message": "fix: replace utils.js with re-exports to eliminate console warnings",
          "timestamp": "2026-03-29T17:03:56+08:00",
          "tree_id": "ede9ce848e51e1d47738801ac7b0178653ae09eb",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9a3eb9882d708d0ef28cb4c9916f9d7dfa2fb535"
        },
        "date": 1774775237021,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7222484,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1231086.97,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1276467.9,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7480193.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 11741222.19,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5610935.93,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1407758.9,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 165612.87,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4593,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 9480128.16,
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
            "value": 1907228.22,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1594791.22,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1745681.33,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6438610.36,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5191.12,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9677.39,
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
            "value": 218799.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181793.82,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 7759638.43,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1668133.07,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 426841.64,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119129.3,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 11368187.25,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 11388313.64,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4514222.78,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6365229.36,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7252.1,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5332706.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 981748.5,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5108240.15,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 10047439.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.247,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 119678.83,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 10251293.55,
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
            "value": 5108078.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1633462.13,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1610735.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1665475.1,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1622262.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3975352.7,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3862.67,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1881584.21,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 184293.14,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2507745.76,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4041146.86,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1615.36,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93937.59,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58852.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 119411.97,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8855.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.6478,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2104.85,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14331.59,
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
          "id": "329285c512400feed1b68c828a9538cdfbe640ae",
          "message": "fix: remove unused imports and console warnings (sync CI)",
          "timestamp": "2026-03-29T17:07:31+08:00",
          "tree_id": "d70c56b0833359f309f9385e9e02cc23108511b4",
          "url": "https://github.com/Liveiciee/yuyucode/commit/329285c512400feed1b68c828a9538cdfbe640ae"
        },
        "date": 1774775451155,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8625468.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1273159.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1400965.7,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8125160.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15292105.82,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5931723.95,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1461477.5,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167123.62,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.7911,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11411224.72,
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
            "value": 1907210.83,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1617153.97,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1717994.21,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6360510.7,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5109.76,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9793,
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
            "value": 219343.65,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 189981.09,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8983665.01,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1692014.67,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444275.25,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117152.27,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13624096.23,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14275631.4,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4746314.69,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6921604.84,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7442.81,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5844845.17,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 990264.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5633262.25,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11683515.79,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2298,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121164.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12116239.95,
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
            "value": 5680870.91,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1624938.41,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1574257.37,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1668321.53,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1628017.01,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4093647.12,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3815.66,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1916847.05,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191678.23,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2491565.25,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4336930.19,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1613.76,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95209.59,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59584.2,
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
          "id": "87eedafd2a14839f71c50e9ecc73ddcebc879383",
          "message": "refactor: split useAgentLoop.js into modular files",
          "timestamp": "2026-03-29T17:19:32+08:00",
          "tree_id": "0b7c81aa3adb43026eac1c2acbfee21a2ba0f16f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/87eedafd2a14839f71c50e9ecc73ddcebc879383"
        },
        "date": 1774776172015,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8225775.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1262722.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1408929.97,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7851775.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15181615.67,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5367873.9,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1374322.28,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 165981.82,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6599,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11800964.37,
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
            "value": 1911847.64,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1558291.38,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1707552.51,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6251874.04,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5100.1,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9707.13,
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
            "value": 216885.83,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 179842.14,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9580107.94,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1689912.27,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445344.64,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119563.4,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13361868.32,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13483873.78,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4910569.1,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6936066.35,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7522.99,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5084343.57,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 968931.62,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5693902.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11692850.9,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2304,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121503.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11971110.52,
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
            "value": 5377772.89,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1628360.37,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1579791.16,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1654740.77,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1615366.05,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4101572.38,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3524.85,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1921798.79,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 194459.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2457074.5,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4122936.16,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1603.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97773.96,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59361.86,
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
          "id": "cbe3e0d07149231c026f732422112242ab0bcef1",
          "message": "fix: pass file to abTest and guard against undefined in systemPrompt",
          "timestamp": "2026-03-29T17:22:32+08:00",
          "tree_id": "0f5c0d01a92e779dcaa229907523c6ee923c07bc",
          "url": "https://github.com/Liveiciee/yuyucode/commit/cbe3e0d07149231c026f732422112242ab0bcef1"
        },
        "date": 1774776353321,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7856438.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1113843.55,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1365038.87,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7982520.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14158994.39,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5445419.68,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1365050.97,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 155067.04,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.7431,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11597585.28,
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
            "value": 2038835.36,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1691649.1,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1797924.67,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6438868.15,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5614.05,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9939.8,
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
            "value": 232275.96,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187185.57,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9401037.84,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1841933.5,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 462481.66,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 126703.54,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13028599.79,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12702499.09,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4700472.21,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6737540.75,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7663.06,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5465968.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 928087.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5322090.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11688584.69,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2563,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 115826.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11890404.72,
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
            "value": 3761757.1,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1745654.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1710253.11,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1752762.47,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1664894.06,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4112495.74,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3722.27,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1770581.67,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 180892.61,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2521375.05,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4449487.99,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1671.91,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 104755.95,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52445.9,
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
          "id": "02fd65a6ef669625cc0c8fe4741a97366e451d03",
          "message": "fix: correct syntax error in systemPrompt.js",
          "timestamp": "2026-03-29T17:24:17+08:00",
          "tree_id": "11542b1f1fe7e3901e82e0407c1a4c6da4044727",
          "url": "https://github.com/Liveiciee/yuyucode/commit/02fd65a6ef669625cc0c8fe4741a97366e451d03"
        },
        "date": 1774776456953,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8415722.18,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1277572.73,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1401350.74,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8373391.92,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15401596.52,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5606748.55,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1409384.45,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 163775.77,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.8342,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11732000.87,
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
            "value": 1955066.71,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1613866.93,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1731943.67,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6654578.87,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5194.84,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9718.57,
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
            "value": 210094.96,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 190964.78,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9379272.05,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1695689.02,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 430870.15,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120936.57,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13896040.47,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13990254.15,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4899340.58,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7533389.73,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7520.61,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5856601.78,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 998736.39,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5703823.05,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11669829.03,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2353,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121884.65,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12131903.68,
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
            "value": 5494312.93,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1695785.98,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1631734.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1614768.38,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1705803.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4400668.18,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3786.77,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1958537.39,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 199291.65,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2586724.13,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4267247.6,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1615.84,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98479.81,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62065.03,
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
          "id": "0799ba86b53e6f8a49c98b10a0e17a1e97e73368",
          "message": "chore: disable ESLint warning for getSystemForModel (used but flagged)",
          "timestamp": "2026-03-29T17:41:23+08:00",
          "tree_id": "cff067644464015272d67ac2a148fac7dbb43be9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/0799ba86b53e6f8a49c98b10a0e17a1e97e73368"
        },
        "date": 1774777479384,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7388070.49,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1104553.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1458286.96,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8666863.98,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15040538.29,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6130586.75,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1473914.2,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167108.45,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4092,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11921628.66,
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
            "value": 1977922.33,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1538257.04,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1729778.7,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6603846.18,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4986.19,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9764.39,
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
            "value": 220007.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 192354.63,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9079927.93,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1649959.08,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 436948.22,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118674.83,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13738641.67,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14045693.1,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4641806.9,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7280911.55,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7433.6,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5903052.56,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 985385.14,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5793302.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11836838.37,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2317,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122566.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12229661.95,
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
            "value": 5928919.74,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1669709.78,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1624212.8,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1671673.33,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1660650.49,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4198844.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3838.29,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1868750.07,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 187249.16,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2622589.91,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4150244.88,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1609.29,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94304.53,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61354.26,
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
          "id": "fcd990a7beec94f78b9459dcfd9e8843d875070d",
          "message": "refactor: split FileEditor.jsx into modular files",
          "timestamp": "2026-03-29T17:51:27+08:00",
          "tree_id": "e1b6b39214f5461a2f0b09993670435a84e8ce32",
          "url": "https://github.com/Liveiciee/yuyucode/commit/fcd990a7beec94f78b9459dcfd9e8843d875070d"
        },
        "date": 1774778089195,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7812183.48,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1275663.07,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1440137.79,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8660839.64,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15253595.48,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6213417.12,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1452981.26,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167658.15,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.8288,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11923989.43,
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
            "value": 1955299.71,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1614248.64,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1756598.67,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6927465.24,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5005.79,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9639.58,
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
            "value": 219453.5,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181162.67,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8984855.17,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1670541.55,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446212.88,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120805.76,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13880950.58,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14079720.31,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4686895.89,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7337098.49,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7452.38,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5993509.22,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 992464.68,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5754882.73,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11959949.99,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2346,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122364,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12197016.93,
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
            "value": 5708114.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1666585.23,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1601389.11,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1690940.55,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1640967.02,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4229037.68,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3825.97,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1944246.35,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198746.31,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2630041.74,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4166511.41,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1621.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94417.89,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61253.46,
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
          "id": "5002fd69565c2f578fa7d80bd97da55a02bec276",
          "message": "test: add serious tests for FileEditor modules (ghost, blame, breadcrumb, minimap, collab, optionalExtensions, tsExtensions)",
          "timestamp": "2026-03-29T17:53:10+08:00",
          "tree_id": "4bdcae4b2810b64afc8fce99e34519a8fff94d20",
          "url": "https://github.com/Liveiciee/yuyucode/commit/5002fd69565c2f578fa7d80bd97da55a02bec276"
        },
        "date": 1774778187485,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8662443.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1237758.91,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1426751.29,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8005249.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15080642.49,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5761525.14,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1458963.56,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169223.74,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0716,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11819331.05,
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
            "value": 1965816.79,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1607534.73,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1778765.81,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7208843.7,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4936.61,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9750.09,
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
            "value": 219010.6,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 171637.25,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9309241.55,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1664113.16,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 425569.61,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 114742.71,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13690689.29,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13905011.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4612123.34,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7302395.74,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7375.29,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5537719.66,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 982907.28,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5441166.06,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11796821.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2474,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123488.91,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12296097.68,
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
            "value": 5488898.24,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1667095.97,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1599814.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1687530.29,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1652283.69,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4014920.13,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3772.65,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1881183.2,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197592.28,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2635085.67,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4263909.98,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1590.19,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93660.88,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58921.48,
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
          "id": "d0b11f49fd334a64869cade7fc455ca9077bc891",
          "message": "fix: add missing lint.js for makeSyntaxLinter",
          "timestamp": "2026-03-29T17:57:18+08:00",
          "tree_id": "f546affac2313f1e04beb35e319bcf832e2dce95",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d0b11f49fd334a64869cade7fc455ca9077bc891"
        },
        "date": 1774778433201,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7924695.86,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1268984.47,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1407491.19,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8050717.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15235854.26,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6193250.04,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1450256.54,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168656.82,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6051,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11766808.89,
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
            "value": 1909772.09,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1634699.47,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1616414.33,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6515242.8,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4821.25,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9740.62,
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
            "value": 219777.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 189209.24,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8921165.73,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1678633.27,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 442917.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120133.85,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13861099.53,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14147057.01,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4332805.31,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6617825.63,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7701.27,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6045460.5,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 979211.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5857945.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11861647.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2322,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122413.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12043022.77,
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
            "value": 5490787.67,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1631154.4,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1601517.09,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1662733.47,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1625781.46,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4194362.07,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3870.32,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1894081.09,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198402.55,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2525059.25,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4182689.1,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94380.5,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59284.28,
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
          "id": "16417caa74a97969969d644609a41494e8ea7a17",
          "message": "fix: correct imports in FileEditor modular files (keymap, Compartment, StateEffect)",
          "timestamp": "2026-03-29T18:01:06+08:00",
          "tree_id": "4c70d4d43124d94c69343563bdb5bff30c9154f9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/16417caa74a97969969d644609a41494e8ea7a17"
        },
        "date": 1774778665494,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8174147.01,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1256692.37,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1057237.65,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8200495.51,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15198478.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6145986.35,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1402276.45,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170342.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3034,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11724165.37,
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
            "value": 1906831.74,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1587676.47,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1758872.59,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6573634.34,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4996.48,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9706.8,
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
            "value": 219899.51,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 189292.49,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8548160.92,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1692174.64,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 431553.79,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119920.63,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12696826.73,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12902580.5,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4813877.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6800124.72,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7492.64,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5777083.97,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 983734.8,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5673413.78,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11730670.73,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2535,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123896.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11907377.81,
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
            "value": 5611402.24,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1673163.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1637722.77,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1690822.77,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1660746.27,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4354480.95,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3831.94,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1862710.41,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198629.53,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2597519.7,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4109175.91,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1606.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98077.27,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52725.69,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 123977.86,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8831.44,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.712,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2143.42,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14071.34,
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
          "id": "f69b80d8be7b0aabe9956e0768d83d694b420c2b",
          "message": "fix: import keymap with namespace to resolve missing export",
          "timestamp": "2026-03-29T18:05:38+08:00",
          "tree_id": "8a82ef695fd5f675878d87a53082e8f26627cedd",
          "url": "https://github.com/Liveiciee/yuyucode/commit/f69b80d8be7b0aabe9956e0768d83d694b420c2b"
        },
        "date": 1774778932392,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8589648.8,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1265602.25,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1397556.47,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7777464.79,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14875777.55,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6127200.14,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1428103.92,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168573.46,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4485,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11699680.92,
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
            "value": 1944578,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1611627.71,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1719909.12,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6591842.34,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4904.43,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9793.1,
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
            "value": 219603.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 195034.92,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9288235.11,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1626488.53,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 428815.96,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121573.91,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13490164.46,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13390858.13,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4586147.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6744332.72,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7720.3,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5931962.16,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 982783.69,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5629670.51,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11409259.84,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2523,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121100.51,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11381462.54,
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
            "value": 5567035.7,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1666833.04,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1597510.8,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1681227.79,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1645530.18,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4299140.16,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3849.96,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1915003.2,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 185556.45,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2579490.47,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4178811.26,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1619.57,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95643.79,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61437.66,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 121867.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8907.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7813,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2149.48,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14591.06,
            "unit": "ops/sec"
          }
        ]
      }
    ],
    "Benchmark": [
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
          "id": "863fce252a5f142b136e3940edb640df75757518",
          "message": "Update max_tokens expectation for Cerebras model",
          "timestamp": "2026-03-29T12:57:11+08:00",
          "tree_id": "c7a60bf4655210e50bc3e7a491137fc6086b0dd8",
          "url": "https://github.com/Liveiciee/yuyucode/commit/863fce252a5f142b136e3940edb640df75757518"
        },
        "date": 1774760432765,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8364986.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1300875.07,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1356649.72,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8576482.94,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15327881.85,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6109681.98,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1463874.62,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169089.67,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.8347,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14012517.86,
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
            "value": 1933679.04,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1528890.8,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1691136.51,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7554343.67,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5087.56,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9760.05,
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
            "value": 219130.79,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186928.13,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10447771.16,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1763554.16,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438910.84,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119078.63,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13994515.92,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14043876.26,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4853207.42,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6964114.82,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7508.77,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5850334.95,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 994420.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5530341.06,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13989789.86,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2496,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125128.89,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14212635.94,
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
            "value": 5557504.47,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1640907.83,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1631252.72,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1660985.81,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1644131.31,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3986254.55,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3801.91,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1801419.92,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196599.36,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2492922.13,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4299066.67,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1620.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 92528.26,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61822.46,
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
          "id": "84e68c18eb99396952b16b1e4ec9b52ad9908f2a",
          "message": "Refactor mock keys and improve test responses",
          "timestamp": "2026-03-29T13:10:56+08:00",
          "tree_id": "6cec4502ad9017509b6783602fd3b263380f62ac",
          "url": "https://github.com/Liveiciee/yuyucode/commit/84e68c18eb99396952b16b1e4ec9b52ad9908f2a"
        },
        "date": 1774761264304,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8426841.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1302316.82,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1372173.8,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8734238.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15364231.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5704140.45,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1404419.66,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170890.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.599,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14016852.65,
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
            "value": 1959456.2,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1561295.56,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1713269.21,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6868385.53,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4990.42,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9754.14,
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
            "value": 216577.83,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 193580.99,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10546857.26,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1692277.9,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 443681.86,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120887.02,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13483945.25,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14013819.55,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4783000.43,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7306659.3,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7661.21,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5526345.03,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 967872.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5654409.71,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13650420.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2508,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123353.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14371428.39,
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
            "value": 5382547.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1661849.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1619657.92,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1666160.21,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1627860.92,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4182486.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3744.65,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1843033.21,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191428.57,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2507210.84,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4278914.31,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1610.72,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95269.01,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59508.41,
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
          "id": "82ae09d56bfb2c812815798e166ed7a2377f17c5",
          "message": "Merge remote main: keep modular API structure",
          "timestamp": "2026-03-29T13:26:44+08:00",
          "tree_id": "7639aecfeb9c80d34c505325957ad6a349c912b9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/82ae09d56bfb2c812815798e166ed7a2377f17c5"
        },
        "date": 1774762228265,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8162093.54,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1238589.68,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1327856.93,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8299017.98,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15187843.09,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5887295.89,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1448047.13,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170656.32,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.4972,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13990746.21,
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
            "value": 2012324.46,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1653100.08,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1766630.68,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6733979.46,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4912.26,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9647.97,
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
            "value": 219130.99,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 185788.36,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11139815.67,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1769049.15,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 435779.92,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120510.51,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13444291,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13766771.37,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4760742.53,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7090596.34,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7415.83,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5972387.69,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 986771.54,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5795155.63,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14016760.6,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2501,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123346.26,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14385346.76,
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
            "value": 5286558.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1697039.79,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1622432.8,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1681867.81,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1678782.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4212906.87,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3811.17,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1838301.43,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196773.94,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2530140.5,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4207253.83,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1611.09,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97689.77,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58201.68,
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
          "id": "f61c871ef438e58e55c30326219accdfd03e09bb",
          "message": "fix: add askCerebrasStream export and update fallback test with spy",
          "timestamp": "2026-03-29T13:39:14+08:00",
          "tree_id": "f00534d6a795667e61a26d920268f6aa49d71157",
          "url": "https://github.com/Liveiciee/yuyucode/commit/f61c871ef438e58e55c30326219accdfd03e09bb"
        },
        "date": 1774762967468,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8255134.84,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1240376.57,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1450282.91,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8894669.4,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15142383.49,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5851087.43,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1473204.5,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 157697.86,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.0313,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13978543.86,
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
            "value": 1963757.08,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1610497.61,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1716964.44,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7239607.81,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5093.89,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9596.19,
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
            "value": 217778.17,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186507.03,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11198586.25,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1755279.78,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 432481.15,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119603.02,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13798108.87,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13576050.48,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4814438.83,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7109112.98,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7508.58,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5817382.32,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 982012.89,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5816583.16,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14132591.41,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2478,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120002,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14414563.51,
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
            "value": 5607181.22,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1628244.31,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1634148.49,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1654674.75,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1638512.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4348593.85,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3764.41,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1816415.82,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198945.85,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2594078.5,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4361196.47,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1576.36,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99753.31,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59389.12,
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
          "id": "6cc208dd08c931c174852436580cde78d0f0050e",
          "message": "chore: remove backup files",
          "timestamp": "2026-03-29T13:49:29+08:00",
          "tree_id": "4323f6de98edf3e3b3417b51c4656c49bb6f6506",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6cc208dd08c931c174852436580cde78d0f0050e"
        },
        "date": 1774763583976,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8268935.5,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1281895.09,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1347106.04,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8211673.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15246910.6,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6194129.28,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1422451.27,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171179.28,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3684,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14134437.35,
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
            "value": 1953413.89,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1586920.94,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1703444.5,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6224751.78,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4800.76,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9782.79,
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
            "value": 219443.03,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 196262.6,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10368060.53,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1730261.31,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 443784.04,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120865.11,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13924241.58,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14011214.8,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4634686.12,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6874904.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7329.16,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5968815.49,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 979795.56,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5932426.48,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14068818.45,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.255,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125557.03,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13922837.36,
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
            "value": 5634955.82,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1624883.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1604555.77,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1653496.88,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1612345.42,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3921358.34,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3873.84,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1878616.76,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198452.71,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2444445.12,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4330927.33,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1615.63,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93051.65,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60837.82,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 122809.63,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8899.3,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7801,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2142.91,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14647.96,
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
          "id": "02b85a096c82501e97e9a47a96a12867de1a654f",
          "message": "fix: move test file to api folder and adjust imports",
          "timestamp": "2026-03-29T14:03:50+08:00",
          "tree_id": "0a6ef0a6d01fbcca6d1d9e8ba611859650e50350",
          "url": "https://github.com/Liveiciee/yuyucode/commit/02b85a096c82501e97e9a47a96a12867de1a654f"
        },
        "date": 1774764461278,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8200741.11,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1127751.11,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1238525.42,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8303154.51,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15094135.91,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6035814.19,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1446667.86,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169187.79,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1619,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13801189.01,
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
            "value": 1909040.08,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1560489.58,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1678511.27,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6703144.82,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5037.87,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9716.79,
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
            "value": 218464.09,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 174974.6,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10585515.6,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1734166.73,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 439442.27,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121621.66,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13736330.46,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13758325.23,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4623578.4,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6598641.62,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7451.35,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5922885.36,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 969330.2,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5691385.01,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13806846.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2451,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123296.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13904838.33,
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
            "value": 5495121.34,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1589996.46,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1579311,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1575039.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1569040.21,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3928099.65,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3871.22,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1894093.81,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197985.89,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2461709.32,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 3972147.11,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1605.16,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95938.69,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58324.68,
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
          "id": "3c63bd99b2218c761ed5b2d3843e446801c36ecb",
          "message": "refactor: move all API test files into src/api/ and fix imports",
          "timestamp": "2026-03-29T14:06:37+08:00",
          "tree_id": "e56db7bf3d5ceced4c15c66c33b7ac1f1a7f88f3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3c63bd99b2218c761ed5b2d3843e446801c36ecb"
        },
        "date": 1774764609638,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7908921.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1270887.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1394519.47,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8382695.14,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14070538.68,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6017470.87,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1403841.11,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167660.85,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.5349,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12755103.16,
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
            "value": 1930515.3,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1600672.1,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1709194.7,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6605581.48,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5031.91,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9689.93,
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
            "value": 219114.88,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176748.89,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10222107.02,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1707574.61,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440618.91,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120094.88,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12608162.97,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12582088.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4713881.46,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6929590.85,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7489.92,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5894682.94,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 972665.45,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5480274.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12800352.64,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2504,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123699.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12940461.51,
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
            "value": 5041672.15,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1589067.12,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1597054.05,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1672700.95,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1645818.43,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4185749.55,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3827.48,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1843744.58,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 183029.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2500709.4,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4216119.75,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1603.57,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96147.81,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 55066.92,
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
          "id": "459b510fd0946e7e2828bdc399edb41f4d74144e",
          "message": "fix: correct import paths in server and stream tests",
          "timestamp": "2026-03-29T14:11:20+08:00",
          "tree_id": "174421d424825344bac3c7744e6280828969d91b",
          "url": "https://github.com/Liveiciee/yuyucode/commit/459b510fd0946e7e2828bdc399edb41f4d74144e"
        },
        "date": 1774764886281,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8405908.29,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1260858.42,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1397533.44,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8582105.87,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14614406.21,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5729833.31,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1436792.01,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 172352.5,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.7289,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13710054.66,
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
            "value": 1928917.71,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1618174.82,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1733055.68,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6793517.4,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5195.52,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9798.47,
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
            "value": 219714.68,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 189004.43,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10081142.99,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1762808.39,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 435775.5,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121107.74,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13588655.74,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13626819.89,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4620103.05,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7252885.52,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7428.14,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5898181.01,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 989904.84,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5599397.83,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13622136.37,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.249,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125483.68,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13976458.52,
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
            "value": 5405518.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1614952.3,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1611489.24,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1680336.26,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1664236.44,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4300613.56,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3934.79,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1862602.87,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198232.76,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2568612.77,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4101405.6,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1601.63,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97635.4,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59661.73,
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
          "id": "d1b72afe25539b18c9fc02227b51a8dd3aaeadf0",
          "message": "fix: restore original test content with correct imports",
          "timestamp": "2026-03-29T14:17:41+08:00",
          "tree_id": "c511ce89bb88b3089919f23e5b6e7833a71f640d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d1b72afe25539b18c9fc02227b51a8dd3aaeadf0"
        },
        "date": 1774765275644,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7839990.86,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1165778.82,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1365678.72,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7609858.3,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13729093.15,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5473421.96,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1258618.15,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 153041.69,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.9997,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13015477.14,
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
            "value": 2021334.44,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1508478.54,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1789947.41,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6441006.8,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5673.89,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 10018.45,
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
            "value": 232104.84,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187869.69,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10594179.77,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1684936.41,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441606.25,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 127261.04,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13841525.75,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13617079.97,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4635172.69,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6734589.04,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7668.34,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5341973.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 927749.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5259948.64,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13452513.86,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2579,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 117647.71,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13853004.84,
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
            "value": 3864429.91,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1671546.96,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1613968.77,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1683755.34,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1545491.23,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3332173.39,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4013.1,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1779975.44,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 181476.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2304428.33,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4132209.8,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1691.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 103762.05,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 53743.92,
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
          "id": "1fcd1b3b18baca7e11fb1e1ffcd0f15a9540a9eb",
          "message": "fix: restore original tests with correct import paths",
          "timestamp": "2026-03-29T14:22:03+08:00",
          "tree_id": "e56db7bf3d5ceced4c15c66c33b7ac1f1a7f88f3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/1fcd1b3b18baca7e11fb1e1ffcd0f15a9540a9eb"
        },
        "date": 1774765528778,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7989141.68,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1288137.86,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1376560.94,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8661205.64,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15191679.15,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5622735.89,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1426029.28,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170939.17,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.3592,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13905920.05,
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
            "value": 1905370.37,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1569868.83,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1685440.64,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6456057.7,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4623.61,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9806.07,
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
            "value": 219279.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184242,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10328621.65,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1734497.22,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 430836.44,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121122.81,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13592501.05,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13892837.94,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4950476.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6851059.75,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7231.25,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5750938.4,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 993648.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5497593.93,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13717203.29,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2447,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124389.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14459164.38,
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
            "value": 5723813.05,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1575262.48,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1612140.76,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1645620,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1614435.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4079364.91,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3786.39,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1846993.73,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198939.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2509437.89,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4149697.01,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1611.85,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 92528.84,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61730.89,
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
          "id": "4e25a7a0c2059aa583bb57a1eb120a6ec7461ef3",
          "message": "fix: correct import paths in server and stream tests",
          "timestamp": "2026-03-29T14:24:21+08:00",
          "tree_id": "0198208e84fad7dbdc05ca159dfacda6e5dacc3a",
          "url": "https://github.com/Liveiciee/yuyucode/commit/4e25a7a0c2059aa583bb57a1eb120a6ec7461ef3"
        },
        "date": 1774765675635,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8245880.04,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1293846.66,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1440126.91,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8614251.88,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15211948.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6080410.29,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1429039.89,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167726.58,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.7236,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13853005.61,
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
            "value": 1961206.73,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1606703.1,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1703241.18,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6872965.75,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5215.91,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9617.22,
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
            "value": 219279.79,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 159619,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10170711.71,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1698958.1,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 432679.16,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119517.18,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13802661.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13996971.75,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4882975.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7340112.96,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7277.65,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5848178.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 999926.68,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5718763.3,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13610739.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2522,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121645.85,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14383053.02,
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
            "value": 5390484.03,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1581558.95,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1569681.35,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1682868.36,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1617752.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4183918.15,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3881.85,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1926560.58,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 152018.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2698236.32,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4157210.72,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1612.85,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96865.06,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58159.19,
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
          "id": "c48ee379f170d5ce125f88137aba0ae8442f9c8f",
          "message": "fix: move test files back to src/ root to resolve import issues",
          "timestamp": "2026-03-29T14:31:09+08:00",
          "tree_id": "18054b761718cea7c76138196ca6b754fe4941a0",
          "url": "https://github.com/Liveiciee/yuyucode/commit/c48ee379f170d5ce125f88137aba0ae8442f9c8f"
        },
        "date": 1774766079061,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8563407.52,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 633162.75,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 673457.49,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8657416.44,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15254608.26,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6008134.95,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1446544.43,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168602.41,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.8728,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14081513.44,
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
            "value": 1915678.12,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1632732.97,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1719955.12,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7350638.77,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5512.14,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9794.17,
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
            "value": 219409.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176287.45,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10256427.12,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1656708.67,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438061.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119226.57,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13623396.8,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13631191.81,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4796033.64,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7393929.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7711.07,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5669114.08,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 987128.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5681784.32,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14102056.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2516,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123973.34,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14414177.37,
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
            "value": 5435106.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1603261.07,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1532418.21,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1662105.23,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1643730.44,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4183047.49,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3796.65,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1848869.19,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191521.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2574825.37,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4068345.31,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1614.15,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95382.53,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59964.45,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 116140.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8836.87,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.677,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2147.17,
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
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "3cbe12d8359b690c0036e8121c254f60b565a61a",
          "message": "fix: correct import paths in test files (use './api.js' etc.)",
          "timestamp": "2026-03-29T14:34:28+08:00",
          "tree_id": "d99749cce922dbdd23b7e8838d1ec39e0e329e95",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3cbe12d8359b690c0036e8121c254f60b565a61a"
        },
        "date": 1774766282289,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7559175.08,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1092651.75,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1330107.39,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7848838.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14059551.72,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5324243.15,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1303403.6,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 153226.61,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6748,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13033147.24,
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
            "value": 1964095.95,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1617053.05,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1816555.83,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6153533.38,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5662.64,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9857.93,
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
            "value": 228974.63,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 185363.97,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10281547.53,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1674289.22,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 428601.71,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 126638.97,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12499949.23,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12732004.68,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4352201.39,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6841355.86,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7562.88,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5531609.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 861607.06,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5252819.43,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12792355.39,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2393,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 115369.81,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13032815.14,
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
            "value": 3726318.81,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1716921.14,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1644052.97,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1770141.93,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1696618.77,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4050211.01,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4046.41,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1861161.87,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 171657.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2386283.32,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4401363.03,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1680.93,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 101008.41,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 51111.29,
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
          "id": "3ea51f55f3bb58c44e20aa9398a6e3e703e84e6b",
          "message": "fix: mock getCerebrasKey/getGroqKey directly to bypass path issues",
          "timestamp": "2026-03-29T14:39:05+08:00",
          "tree_id": "ff205a35dcf0e088b42a3dd03039ed288862e57e",
          "url": "https://github.com/Liveiciee/yuyucode/commit/3ea51f55f3bb58c44e20aa9398a6e3e703e84e6b"
        },
        "date": 1774766553831,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7323639,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1099179.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1340854.23,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7543154.54,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13244092.94,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5413053.94,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1279444.77,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 154379.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.052,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13278011.07,
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
            "value": 2024796.3,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1685115.98,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1804627.19,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6651158.62,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5577.59,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9936.62,
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
            "value": 231759.18,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 186820.92,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10269149.96,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1795109.75,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 436770.8,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 125947.55,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12466491.84,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12635959.07,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4602097.57,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6720625.11,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7643.73,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5436099.36,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 913413.44,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5317755.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12765669.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2442,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 111523.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12942998.24,
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
            "value": 3546943.46,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1742307.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1723556.24,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1758340.44,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1703191.22,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4093157.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3727.25,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1679530.84,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 175718.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2355507.93,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4174183.04,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1669.54,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 102842.53,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 50604.21,
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
          "id": "a9809a3045b32cd380e31a66c15b9aef55a6a7de",
          "message": "fix: mock cerebrasRequest and groqRequest directly to bypass key validation",
          "timestamp": "2026-03-29T14:43:40+08:00",
          "tree_id": "968ada9ca0d0caac439d500105eab14bcd125679",
          "url": "https://github.com/Liveiciee/yuyucode/commit/a9809a3045b32cd380e31a66c15b9aef55a6a7de"
        },
        "date": 1774766832262,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8410912.87,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1270003.12,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1425642.32,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8548147.86,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15357917.75,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5915601.63,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1438616.03,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167130.53,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4787,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14002811.69,
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
            "value": 1945676.81,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1610404.45,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1689228.33,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7199107.86,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5074.65,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9756.65,
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
            "value": 218728.84,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 193085.49,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10519805.47,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1687664.24,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444975.56,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121746.18,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13582642.67,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13944288.94,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4866713.93,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6607113.51,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7293.96,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5901691.42,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 996005.24,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5992210.94,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14080120.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2519,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121869.64,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14397847.98,
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
            "value": 5570577.24,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1660577.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1608146.27,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1687055.1,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1648834.94,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4099474.61,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3896.18,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1778833.71,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 192212.42,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2487659.9,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4139350.39,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1605.99,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98190.09,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59940.42,
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
          "id": "9971044a0e4b7b0cdaece49cf2a5fffeed31d62b",
          "message": "test: fix default values test to be less strict",
          "timestamp": "2026-03-29T14:51:05+08:00",
          "tree_id": "4ac0de442edf74e9223461323d29f2a6606ec79e",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9971044a0e4b7b0cdaece49cf2a5fffeed31d62b"
        },
        "date": 1774767275918,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8206325.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1151011.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1402264.16,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8438823.39,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15207599.85,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5974101.21,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1445816.45,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169953.18,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3822,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14157313.35,
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
            "value": 1739674.76,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1441543.88,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1586574.58,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6348356.78,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5023.78,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9721.73,
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
            "value": 220031.11,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181104.38,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10372850.73,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1668918.62,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 440141.42,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118958.12,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13766804.35,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13602906.42,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4822031.81,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7219586.04,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7322.83,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5728240.09,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 974454.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5416015.03,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13931328.16,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121548.26,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14201074.04,
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
            "value": 5601233.76,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1543734.2,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1550023.5,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1563156.55,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1526997.65,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3856486.49,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3861.99,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1809340.37,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 200010.39,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2570417.5,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4177919.32,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1601.72,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 92160.54,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58471.67,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 120425.35,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8958.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7659,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2126.63,
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
            "email": "liveiciee@gmail.com",
            "name": "Liveiciee",
            "username": "Liveiciee"
          },
          "distinct": true,
          "id": "61bd2de4b07206b42d12215f4aa9d9b7670c983a",
          "message": "refactor: split API tests into modular files",
          "timestamp": "2026-03-29T14:56:29+08:00",
          "tree_id": "7f1c75539fbdc95dbe4b0525e614bf9098ec6c29",
          "url": "https://github.com/Liveiciee/yuyucode/commit/61bd2de4b07206b42d12215f4aa9d9b7670c983a"
        },
        "date": 1774767592872,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8271751.19,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1295459.94,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1424682.62,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8451380.68,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15105641.85,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6567788.2,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1584127.85,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171957.32,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.2365,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14095313.61,
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
            "value": 2059961.62,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1676728.14,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1820506.73,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7555904.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5632.3,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 10481.61,
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
            "value": 196018.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 200150.88,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11122007.17,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1782384.88,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 465735.86,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 122119.95,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13737903.23,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13614008.45,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 5035998.35,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7156624.3,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 9132.87,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6143572.34,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 1038840.73,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6147758.25,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13715674.71,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2662,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 127963.49,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14284707.97,
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
            "value": 4713624.69,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1695902.83,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1603268.38,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1726509.69,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1673772.09,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4355389.73,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4141.49,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1950425.24,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 188776.84,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2773262.08,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4571750.26,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1663.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 101681.05,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 54269.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 126605.3,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 9389.84,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.8349,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2226.21,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 15060.4,
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
          "id": "b87c0e3be2370007db21bfdd42ed20706a6854ed",
          "message": "fix: correct imports in server and stream tests",
          "timestamp": "2026-03-29T15:01:23+08:00",
          "tree_id": "f9f06d287839f2ee14f4ac040695b64cb944cd94",
          "url": "https://github.com/Liveiciee/yuyucode/commit/b87c0e3be2370007db21bfdd42ed20706a6854ed"
        },
        "date": 1774767897038,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8188146.25,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1295853.32,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1422134.3,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7533405.49,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15308325.42,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5706181.17,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1446438.4,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169862.55,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0246,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13401458.74,
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
            "value": 1935417.62,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1589161.07,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1767525.91,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6902147.52,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4967.92,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9751,
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
            "value": 220166.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176322.33,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10786405.18,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1743980.38,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 448561.92,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 116506.64,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13735828.32,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13768512.13,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4869891.08,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7231173.07,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7337.38,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5595775.7,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 978997.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5554070.47,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13938645.41,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2473,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125528.7,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14307094.08,
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
            "value": 5645424.85,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1696543.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1627217.02,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1711941.16,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1694413.73,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4156116.1,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3765.41,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1855352.95,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 183211.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2360168.79,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4268265.2,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1576.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94138.14,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60448.63,
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
          "id": "4ddd16b69d42954d6e86bb5e0cd48e2b33e0a0f4",
          "message": "refactor: move all API tests into __tests__ folder",
          "timestamp": "2026-03-29T15:04:40+08:00",
          "tree_id": "3a05f6accc2b28bb4fb1c7b88aa3bfadb5d1afd1",
          "url": "https://github.com/Liveiciee/yuyucode/commit/4ddd16b69d42954d6e86bb5e0cd48e2b33e0a0f4"
        },
        "date": 1774768093771,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8512714.3,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1152655.02,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1413485.95,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8543373.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15142155.45,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5679747.42,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1422983.23,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 164963.77,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0565,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14126033.63,
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
            "value": 1937134.96,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1600498.22,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1718966.8,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6993405.72,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5019.01,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9519.38,
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
            "value": 219917.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181927.67,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10438332.46,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1745950.86,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 463240.27,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117846.35,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13769909.81,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13778453.92,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4596833.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7528529.47,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7671.46,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5800239.87,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 970558.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5658077.42,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13930041.19,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2451,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121213.63,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14202485.91,
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
            "value": 5378630.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1662086.8,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1592349.56,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1675356.86,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1614127.66,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4136614.63,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3772.97,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1843150.18,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197447,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2820484.71,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4217928.7,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1619.04,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 101357.47,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59971.07,
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
          "id": "18970d7eab570fcbf7ea3c61f379bf693b73ee20",
          "message": "fix: add MODELS mock to server test and fix vision import",
          "timestamp": "2026-03-29T15:07:31+08:00",
          "tree_id": "bd6f6c37ba7b90e2b376b9ed04fd42b84f8e377f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/18970d7eab570fcbf7ea3c61f379bf693b73ee20"
        },
        "date": 1774768265770,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8112103.45,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 585889.96,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 648693.19,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8236758.48,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15433305.17,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5824153.39,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1413747.36,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167841.23,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3344,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13642619.48,
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
            "value": 1841126.73,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1626992.82,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1735294.83,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6977491.29,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5065.16,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9737.55,
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
            "value": 219303,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 193827.89,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10272542.11,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1734842.83,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 446209.72,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120059.44,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13730402.41,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13826198.51,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4471733.18,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7018174.46,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7192.25,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5513432.8,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 788763.81,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5707640.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13572532.05,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2489,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124970.25,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14415309.57,
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
            "value": 5855087.07,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1578057.01,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1620423.92,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1650591.78,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1620638.19,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4143545.67,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3925.36,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1877166.8,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198101.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2584358.54,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4237206.06,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1616.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95969.56,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62684.85,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 123671.09,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8799.24,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7543,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2129.22,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 13639.73,
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
          "id": "6da2c5853c8f5f111df412e3c96463b5446203d8",
          "message": "test: rewrite API tests with modular structure and complete mocks",
          "timestamp": "2026-03-29T15:13:25+08:00",
          "tree_id": "197101269aceef53681ecf404c3487695f45d2b4",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6da2c5853c8f5f111df412e3c96463b5446203d8"
        },
        "date": 1774768610085,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8414981.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 674154.38,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 713636.09,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8537651.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15463018.39,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6545869.08,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1565825.13,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 172988.46,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.9495,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13970094.91,
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
            "value": 2007453.13,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1669729.86,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1797466.87,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7165005.61,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5765.96,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 10485.38,
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
            "value": 196416.06,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 208989.18,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11266119.5,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1705879.25,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 464280.7,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 125018.93,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13842929.78,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14018213.36,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 5432237.76,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7439793.69,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 9185.18,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6023624.72,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 1036415.05,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 6091138.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 12022832.56,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2425,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 126303.47,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13492592.92,
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
            "value": 4521714.8,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1642383.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1579523.46,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1700468.31,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1684779.25,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4452585,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4187.76,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1941030.52,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 186244.33,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2868256.76,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4444847.56,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1675.74,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 99629.54,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56855.82,
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
          "id": "00ffa9b3bd0c3ef3b453df97d6253c3c24001b56",
          "message": "test: import setup and mock getCerebrasKey in cerebras.test.js",
          "timestamp": "2026-03-29T15:17:04+08:00",
          "tree_id": "6a295ca162a339e7be77dc65cb8a2822769a7d22",
          "url": "https://github.com/Liveiciee/yuyucode/commit/00ffa9b3bd0c3ef3b453df97d6253c3c24001b56"
        },
        "date": 1774768829100,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8293084.24,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1265184.7,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1341892.64,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8301136.99,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15269964.69,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6166681.79,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1443450.88,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168882.66,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 25.9081,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13966989.86,
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
            "value": 1936818,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1616517.89,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1738832.97,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6551609.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4851.46,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9632.44,
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
            "value": 219713.43,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 191443.32,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 11189783.53,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1716158.86,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 449141.99,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120589.74,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13642255.29,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13871253.47,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4827793.82,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7088071.6,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7578.82,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6018633.81,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 975447.79,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5426131.47,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13957139.16,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2521,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121839.36,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14436518.84,
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
            "value": 5590341.49,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1651659.26,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1600490.4,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1690262.42,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1628413.37,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4078662.46,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3842.26,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1896393.64,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195213.41,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2572842.29,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4334039.47,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1615.41,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98658.42,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60016.44,
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
          "id": "e60b0b962ddf10745001c9ac7db8414e35a11e8e",
          "message": "test: skip problematic cerebras provider test",
          "timestamp": "2026-03-29T15:19:46+08:00",
          "tree_id": "3dff6d402901d57cf5dbf1a4e0dd33677c1fa6ef",
          "url": "https://github.com/Liveiciee/yuyucode/commit/e60b0b962ddf10745001c9ac7db8414e35a11e8e"
        },
        "date": 1774768999931,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8030361.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1105263.98,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1441925.23,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8658723.32,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15240796.57,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5949232.66,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1395113.07,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 172195.48,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0025,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14120685.63,
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
            "value": 1970122.24,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1610054.64,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1755438.61,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7169223.18,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5206.58,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9778.19,
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
            "value": 219324.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 191081.07,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10546555.3,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1772504.99,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 453397.64,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119299.49,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13781936.9,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13713926.44,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4769176.87,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7177870.42,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7708.28,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5707480.73,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 972363.4,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5463405.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14104792.08,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2498,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124033.05,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14399094.93,
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
            "value": 5491938.52,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1624611.3,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1588314.76,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1702971.07,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1661268.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4311986.83,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3854.81,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1909597.51,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196727.13,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2527033.69,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4171521.27,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1613.04,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96793,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58605.34,
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
          "id": "d7a11178a540d446b0ee9490832294f0241175ff",
          "message": "fix: import injectVisionImage from correct module",
          "timestamp": "2026-03-29T15:22:08+08:00",
          "tree_id": "ba0a4e5237b299e3ef88adb9f18438aa092f591d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d7a11178a540d446b0ee9490832294f0241175ff"
        },
        "date": 1774769135410,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8374191.4,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1284270.16,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1407192.68,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8385457.43,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14669523.82,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5958911.12,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1456276.37,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 172058.57,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3602,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 12920056.73,
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
            "value": 1938226.74,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1631065.52,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1742060.5,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6710539.13,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4980.85,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9669.46,
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
            "value": 219178.7,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 191445.84,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10445229.71,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1764699.57,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445537.79,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 117887.38,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13523176.76,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13210906.94,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4493602.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6642546.46,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7317.31,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5818151.69,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 984620.56,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5716769.9,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13190909.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2303,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123440.41,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13648899.89,
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
            "value": 5397652.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1602650.37,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1603997.12,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1675280.24,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1652159.36,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4124974.07,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3829.51,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1915537.51,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191656.23,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2509787.18,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4161182.87,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1605.68,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96940.04,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60721.93,
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
          "id": "8c7070133fb4884bf79cadea7bd801192134a450",
          "message": "test: skip vision tests until injectVisionImage is exported",
          "timestamp": "2026-03-29T15:25:15+08:00",
          "tree_id": "c6ed83e1df5c92df12763ee828f2b20a1224d19c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/8c7070133fb4884bf79cadea7bd801192134a450"
        },
        "date": 1774769327656,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7915594.26,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1103455.38,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1421997.34,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8215119.05,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14806317.59,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6034457.61,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1431795.96,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169555.43,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.9477,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14092771.8,
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
            "value": 1912898.63,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1579238.15,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1716799.54,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6591962.59,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5088.78,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9754.14,
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
            "value": 216597.69,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184994.54,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10813808.44,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1758226.29,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 442837.35,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 118458.33,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13340566.4,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13839983.61,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4785688.67,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7178420.82,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7504.57,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5839164.46,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 961711.64,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5805670.98,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13657277.48,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2476,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122675.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14250241.74,
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
            "value": 5398844.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1580682.67,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1564257.11,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1630476.76,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1619018.7,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4107173.14,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3648.73,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1876491.67,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 194827.07,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2452726.46,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4227261.94,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1609.48,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96838.73,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59687.35,
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
          "id": "d76e8fefe5c36e67c4e9dc165ba618842188dae5",
          "message": "test: fix orchestrator test with proper mocks",
          "timestamp": "2026-03-29T15:27:20+08:00",
          "tree_id": "647a2eead2cfaf8acec35c293ea4f611bc557624",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d76e8fefe5c36e67c4e9dc165ba618842188dae5"
        },
        "date": 1774769452585,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8430747.48,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1223698.79,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1277451.89,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8839282.18,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15104682.24,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6201255.16,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1420798.87,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 168595.98,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1829,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13694518.52,
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
            "value": 1925489.9,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1579995,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1686692.93,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7274951.4,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4969.76,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9677.22,
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
            "value": 219620.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188809.12,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10735248.37,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1680664.18,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445339.11,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119022.48,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13730315.37,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13977291.13,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4457522.54,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6415851.41,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7130.51,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5873113.03,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 980085.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5846442.13,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13928365.19,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2512,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120387.56,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14445491.91,
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
            "value": 5411457.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1639451.93,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1594511.44,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1664248.27,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1589766.14,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4299340.41,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3766.37,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1847706.18,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196918.49,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2449688.45,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4189518.77,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1596.12,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98053.97,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56796.78,
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
          "id": "82c41946e741c7f09486baef2ede0d0f747a4122",
          "message": "fix: correct runtimeKeys import paths in providers",
          "timestamp": "2026-03-29T16:19:10+08:00",
          "tree_id": "00ba80b1c6e38d425d5c4aaa8ee84a8c7814304d",
          "url": "https://github.com/Liveiciee/yuyucode/commit/82c41946e741c7f09486baef2ede0d0f747a4122"
        },
        "date": 1774772559073,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8318752.37,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1287703.39,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1422910.37,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7746760.76,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15288049.94,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5882724.27,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1488388.73,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171123.73,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 25.667,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13946497.78,
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
            "value": 1937812.25,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1597086.34,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1694558.12,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7032030.89,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5235.52,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9771.58,
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
            "value": 218660.56,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 196853.29,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10008558.88,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1690420.72,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 442005.95,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121525.07,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13729647.18,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13991159.94,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4499934.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6954015.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7341.72,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5853043.2,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 992504.19,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5705995.71,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13871801.75,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2402,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 125489.91,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14140331.18,
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
            "value": 5488912.51,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1563092.75,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1579181.99,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1633836.66,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1601375.72,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4100956.07,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3744.91,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1868873.38,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198721.77,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2498683.89,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4135204.23,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1610.1,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98423.12,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62567.98,
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
          "id": "9f533da253c7fbb755a081decd44afe947590740",
          "message": "test: fix remaining importActual path in runtimeKeys test",
          "timestamp": "2026-03-29T16:25:19+08:00",
          "tree_id": "d9276c58ac92078b874c21ad99c5a643847c3c32",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9f533da253c7fbb755a081decd44afe947590740"
        },
        "date": 1774772930605,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8099476.56,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1157400.75,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1360615.32,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8329717.1,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14367480.28,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6019082.27,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1430737.99,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169465.96,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.0465,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13337865.04,
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
            "value": 1959166.46,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1587801.04,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1712659.33,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6993457.38,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4829.83,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9842.75,
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
            "value": 219435.77,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 187474.43,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10335911.65,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1769182.36,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 436579.89,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119545.56,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13681083.59,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13499530.79,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4624443.55,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6633374.43,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7203.04,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5735951.02,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 977635.41,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5716797.53,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13441805.81,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2524,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124584.62,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 13623304.8,
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
            "value": 5643441.26,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1608840.88,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1594609.31,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1603638.48,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1607649.35,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4200802.14,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3826.52,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1948235.11,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 192343.27,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2644566.48,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4118835.46,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1617.32,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95523.19,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 63118.15,
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
          "id": "6621e126b7bca0422a592fb97ef201e17249f5f7",
          "message": "fix: correct logger recursion for debug method",
          "timestamp": "2026-03-29T16:28:54+08:00",
          "tree_id": "3f5761a1056a5c5a66ff050ac2fe3f7817cf3ce9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/6621e126b7bca0422a592fb97ef201e17249f5f7"
        },
        "date": 1774773144861,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8233965.84,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1249311,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1423224.55,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8406134.15,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14923526.84,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5642325.15,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1422943.78,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 162930.88,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.5524,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14018855.05,
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
            "value": 1857257.26,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1581879.81,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1665528.11,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7057936.34,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5019.79,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9647.82,
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
            "value": 219182.78,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 178100.93,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10559505.56,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1664861.68,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 436959.94,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119008.17,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13657949.84,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13382702.29,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4760735.44,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6962648.8,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7393.86,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5678009.43,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 973731.03,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5673617.09,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13748785.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2451,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121517.16,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14345873.57,
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
            "value": 5444752.86,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1558409.7,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1589200.66,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1610255.47,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1595344.5,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4030909.32,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3736.75,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1825386.31,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 181061.69,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2537244.32,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4176730.3,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1572.61,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 91505.01,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56949.3,
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
          "id": "563010d12b1a7fcc44b0930b235bcd42cf4761d8",
          "message": "test: explicitly set allowLogs false in lint test (fix quotes)",
          "timestamp": "2026-03-29T16:36:43+08:00",
          "tree_id": "289f522bd42936f95c5c282f32d93337661e933c",
          "url": "https://github.com/Liveiciee/yuyucode/commit/563010d12b1a7fcc44b0930b235bcd42cf4761d8"
        },
        "date": 1774773617118,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8235080.5,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1274797.79,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1405220.21,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8278316.28,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14964039.4,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5900387.33,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1439010.53,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 165520.15,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.9918,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13623730.99,
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
            "value": 1964824.91,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1594096.89,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1700078.67,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7247780.75,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5016.51,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9714.81,
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
            "value": 219359.47,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 189326.52,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10355831.57,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1664894.7,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 442674.02,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 116896.61,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13268631.23,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13334811.95,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4341767.13,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6963942.23,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7423.36,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5815489.62,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 971099.25,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5647323.74,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13789827.31,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2551,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121217.33,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14148063.89,
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
            "value": 5309096.51,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1583255.39,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1580690.25,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1672715.51,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1605887.08,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3958476.91,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3793.12,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1806748.75,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197768.54,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2548706.14,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4223944.18,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.24,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95819.37,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 56905.5,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 121335.73,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8808.69,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.792,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2126.18,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 13777.99,
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
          "id": "20a3ec58b02f33d9897f1f6eaa1efed171b25333",
          "message": "test: skip failing lint console.log detection temporarily",
          "timestamp": "2026-03-29T16:40:08+08:00",
          "tree_id": "11ad39384777cd698cac81999f6ebfcd84067a74",
          "url": "https://github.com/Liveiciee/yuyucode/commit/20a3ec58b02f33d9897f1f6eaa1efed171b25333"
        },
        "date": 1774773822473,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8393315.58,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1226688.88,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1446145.13,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8662346.63,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15264124.5,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5943508.93,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1447193.69,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 170290.64,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6792,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 13962880.35,
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
            "value": 1923992.82,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1598133.54,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1690894.7,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 5849679.84,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4714.86,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9771.08,
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
            "value": 213837.61,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 185404.56,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 10964781.89,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1727873.25,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441493.09,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120523.39,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13586330.34,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13819987.89,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4405860.19,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7136318.72,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7484.6,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 6134241.75,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 988836.28,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5970249.39,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 13801277.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2503,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121541.07,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14176674.41,
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
            "value": 5854726.58,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1623340.34,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1600113.66,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1644133.73,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1612361.11,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4003078.12,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3740.59,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1826180.66,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198786.71,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2454893.01,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4077050.15,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1621.07,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 94366.15,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61952.76,
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
          "id": "75e2c422b2494233fa2c4a57fa37943d8b90d3e8",
          "message": "refactor: split utils.js into modular files",
          "timestamp": "2026-03-29T16:58:14+08:00",
          "tree_id": "9b734fc9f1388c66cd8e568685e70486b7d105a3",
          "url": "https://github.com/Liveiciee/yuyucode/commit/75e2c422b2494233fa2c4a57fa37943d8b90d3e8"
        },
        "date": 1774774906457,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8656296.77,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1194014.41,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1368958.23,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8149942.74,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15365582.86,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5724108.82,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1438099.14,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169274.2,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.8566,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 14148148.64,
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
            "value": 1890220.17,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1561330.87,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1681890.24,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7149194.03,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4999.23,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9719.84,
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
            "value": 218643.39,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 193725.87,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9955735.7,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1721378.52,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 452400.76,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121267.28,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13308620.26,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 14002367.38,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4517117.9,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7213603.24,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7260.3,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5845927.09,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 994620.26,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5460655.86,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 14100272.42,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.237,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 124860.21,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 14409033.77,
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
            "value": 5669593.54,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1614031.76,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1590119.03,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1648141.9,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1615040.77,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4150992.52,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3800.27,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1906565.87,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 190425.08,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2490772.87,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4178224.46,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1576.53,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95920.46,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 62179.01,
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
          "id": "9a3eb9882d708d0ef28cb4c9916f9d7dfa2fb535",
          "message": "fix: replace utils.js with re-exports to eliminate console warnings",
          "timestamp": "2026-03-29T17:03:56+08:00",
          "tree_id": "ede9ce848e51e1d47738801ac7b0178653ae09eb",
          "url": "https://github.com/Liveiciee/yuyucode/commit/9a3eb9882d708d0ef28cb4c9916f9d7dfa2fb535"
        },
        "date": 1774775245276,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8593224.68,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1257670.85,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1432090.31,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8711058.73,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14751039.55,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6013970.54,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1430942.27,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167426.63,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3825,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11957605.87,
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
            "value": 1959282.09,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1611786.6,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1694002.66,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6796053.06,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4984.82,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9684.75,
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
            "value": 219355.46,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188210.33,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9726944.37,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1671032.19,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 444913.84,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 115772.19,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13266415.55,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13197337.6,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4556404.75,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7077166.17,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7418.52,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5903791.26,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 986914.78,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5658849.55,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11917890.14,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2301,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121135.4,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12145959.85,
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
            "value": 5684521.41,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1610038.92,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1596092.63,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1644895.95,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1611028.31,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4191050.2,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3721.35,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1866708.79,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198210.93,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2509088.67,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4122491.86,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1605.4,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 98996.33,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 59344.64,
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
          "id": "329285c512400feed1b68c828a9538cdfbe640ae",
          "message": "fix: remove unused imports and console warnings (sync CI)",
          "timestamp": "2026-03-29T17:07:31+08:00",
          "tree_id": "d70c56b0833359f309f9385e9e02cc23108511b4",
          "url": "https://github.com/Liveiciee/yuyucode/commit/329285c512400feed1b68c828a9538cdfbe640ae"
        },
        "date": 1774775466308,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7411999.82,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1205643.7,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1349213.1,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8247376.25,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15085494.58,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5882904.99,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1413719.93,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167435.81,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.1228,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11828939.41,
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
            "value": 2037233.99,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1598487.41,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1743566.22,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6556622.87,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5016.15,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9659.74,
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
            "value": 219272.03,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176664.43,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9286694.5,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1714631.68,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 428063.16,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119104.94,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13675704.85,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13863086.89,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4400502.53,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6816389.63,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7368.69,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5928823.3,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 976526.45,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5474926.54,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11684403.91,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2316,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121547.83,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12060688.89,
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
            "value": 5241729.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1688855.98,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1634496.53,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1727584.12,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1675978.82,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4313512.17,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3787.94,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1904401.26,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 191178.63,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2443715.14,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4157101.98,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1611.33,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95838.71,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 57171.18,
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
          "id": "87eedafd2a14839f71c50e9ecc73ddcebc879383",
          "message": "refactor: split useAgentLoop.js into modular files",
          "timestamp": "2026-03-29T17:19:32+08:00",
          "tree_id": "0b7c81aa3adb43026eac1c2acbfee21a2ba0f16f",
          "url": "https://github.com/Liveiciee/yuyucode/commit/87eedafd2a14839f71c50e9ecc73ddcebc879383"
        },
        "date": 1774776185228,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7785112.66,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1139490.57,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1332859.97,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7861747.03,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14014568.57,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5603708.89,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1341815.39,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 147996.73,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.6153,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11296207.41,
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
            "value": 2031315.18,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1710735.92,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1811899.41,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6374439.21,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5654.06,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9920.66,
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
            "value": 232634.28,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184391.35,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9081570.71,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1820982.99,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 433830.55,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 125700.77,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13484521.6,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13586844,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4729835.63,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6943556.86,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7604.11,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5637995.24,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 932152.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5334876.76,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11511201.17,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2374,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 112738.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11865976.91,
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
            "value": 3869060.99,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1738842.29,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1742632.69,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1766253.82,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1621291.29,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4155787.79,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4054.97,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1802752.76,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 182257.03,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2402593.81,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4339093.75,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1682.3,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 105834.83,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 52731,
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
          "id": "cbe3e0d07149231c026f732422112242ab0bcef1",
          "message": "fix: pass file to abTest and guard against undefined in systemPrompt",
          "timestamp": "2026-03-29T17:22:32+08:00",
          "tree_id": "0f5c0d01a92e779dcaa229907523c6ee923c07bc",
          "url": "https://github.com/Liveiciee/yuyucode/commit/cbe3e0d07149231c026f732422112242ab0bcef1"
        },
        "date": 1774776368146,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8074484.9,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1295944.78,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1451660.08,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8695453.57,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15043066.68,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5746617.82,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1427623.92,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 162431.34,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3024,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11722223.2,
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
            "value": 1942207.12,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1586910.85,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1703563.88,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7193684.76,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5247.32,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9685.88,
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
            "value": 219493.54,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 174339.2,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8521329.28,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1711523.66,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 421992.29,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120502.61,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12603184,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13691926.38,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4646808.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7054444.36,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7308,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5449752.13,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 970432.7,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5791586.11,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11742403.98,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2312,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 114065.73,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11896494.24,
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
            "value": 5276033.38,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1614949.56,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1614617.82,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1644047.81,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1621761.65,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3980603.28,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3777.23,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1910068.75,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 196854.95,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2656265.79,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4192282.52,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1607.52,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96985.77,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 58376.9,
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
          "id": "02fd65a6ef669625cc0c8fe4741a97366e451d03",
          "message": "fix: correct syntax error in systemPrompt.js",
          "timestamp": "2026-03-29T17:24:17+08:00",
          "tree_id": "11542b1f1fe7e3901e82e0407c1a4c6da4044727",
          "url": "https://github.com/Liveiciee/yuyucode/commit/02fd65a6ef669625cc0c8fe4741a97366e451d03"
        },
        "date": 1774776464601,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7780864.18,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1274226.75,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1409997.91,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7985581.3,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15012125.97,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5950275.87,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1410452.96,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 164167.92,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 28.047,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11394500.22,
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
            "value": 1911619.92,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1584770.75,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1706420.94,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6679525.81,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4886.56,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9749.97,
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
            "value": 216929.58,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184660.56,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8829176.55,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1693194.57,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 442881.96,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 114286.47,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13374722.88,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13491173.81,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4495613.96,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7220919.61,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7367.12,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5949537.05,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 974793.84,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5501254,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11119543.13,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.252,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120563.21,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11603480.75,
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
            "value": 5424596.81,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1640045,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1576513.87,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1664033.23,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1633018.84,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3976043.7,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3772.54,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1838317.56,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 200034.83,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2504439.18,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4176985.59,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1522,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 95882.69,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60949.93,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 117691,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8797.83,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.749,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2101.51,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 13893.69,
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
          "id": "0799ba86b53e6f8a49c98b10a0e17a1e97e73368",
          "message": "chore: disable ESLint warning for getSystemForModel (used but flagged)",
          "timestamp": "2026-03-29T17:41:23+08:00",
          "tree_id": "cff067644464015272d67ac2a148fac7dbb43be9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/0799ba86b53e6f8a49c98b10a0e17a1e97e73368"
        },
        "date": 1774777487544,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7550712.52,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1246683.11,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1390865.55,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7575225.17,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 11867309.91,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5457478.28,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1473136.94,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 171521.12,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.3498,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 9785806.49,
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
            "value": 1921457.33,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1566153.87,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1673111.38,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6485865.73,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5061.97,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9740.24,
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
            "value": 215939.75,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 175954.86,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 7629811.05,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1691078.53,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 438449.62,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 120227.02,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 11796738.91,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 11405115.61,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4512270.11,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6371176.6,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7617.82,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5413659,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 970718.87,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5430280.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 9870662.03,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.252,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 120631.59,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 10131478.7,
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
            "value": 5337993.65,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1584722.09,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1574680.49,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1614265.83,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1575914.3,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3939075.52,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3893.75,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1744813.39,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 198470.39,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2495676.68,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4059508.6,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1602.87,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96375.13,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60486.72,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 120471,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8837.24,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7109,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2122.42,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 14615.88,
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
          "id": "fcd990a7beec94f78b9459dcfd9e8843d875070d",
          "message": "refactor: split FileEditor.jsx into modular files",
          "timestamp": "2026-03-29T17:51:27+08:00",
          "tree_id": "e1b6b39214f5461a2f0b09993670435a84e8ce32",
          "url": "https://github.com/Liveiciee/yuyucode/commit/fcd990a7beec94f78b9459dcfd9e8843d875070d"
        },
        "date": 1774778096016,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7931720.51,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1260592.43,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1445926.77,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8511261.97,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14971507.58,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6089681.89,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1427523.63,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 169123.57,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0245,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 10933021.61,
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
            "value": 1912221.58,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1608040.77,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1695214.99,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6490689.49,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5165.82,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9824.29,
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
            "value": 216997.16,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 188447.09,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8710773.63,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1674478.78,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 441816.41,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119946.57,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12850304.82,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13471126.36,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4615869.75,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7319944.71,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7342.1,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5837728.96,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 979319.01,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5652558.97,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 10203416.18,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2309,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 121270.49,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11152288.33,
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
            "value": 5838345.64,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1665521.33,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1607338.39,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1681063.85,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1646363.86,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4237467.53,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3839.86,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1881762.42,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 195205.13,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2601145.53,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4107227.49,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1597.32,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 97363.4,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 61283.99,
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
          "id": "5002fd69565c2f578fa7d80bd97da55a02bec276",
          "message": "test: add serious tests for FileEditor modules (ghost, blame, breadcrumb, minimap, collab, optionalExtensions, tsExtensions)",
          "timestamp": "2026-03-29T17:53:10+08:00",
          "tree_id": "4bdcae4b2810b64afc8fce99e34519a8fff94d20",
          "url": "https://github.com/Liveiciee/yuyucode/commit/5002fd69565c2f578fa7d80bd97da55a02bec276"
        },
        "date": 1774778195086,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7632677.59,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1133283.73,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1185136.94,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7797099.71,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 13865351.2,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5488332.39,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1372423.91,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 154627.95,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.4049,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 10870944.7,
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
            "value": 2017494.84,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1696464.26,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1822268.79,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6728815.6,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5609.85,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9941.69,
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
            "value": 230439.56,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 184466.26,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 8816660.18,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1822722.97,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 447839.81,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 124955.12,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12738341.85,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12970154.63,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4636144.48,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6743204.45,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7682.89,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5510572.55,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 933530.89,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5322957.28,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11342316.23,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.26,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 116292.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11117919.58,
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
            "value": 3830487.3,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1713672.37,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1728873.16,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1759449.54,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1729819.79,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4108636.29,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4077.16,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1761574.54,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 177871.22,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2452778.7,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4247721.54,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1672.59,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 104956.39,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 53194.18,
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
          "id": "d0b11f49fd334a64869cade7fc455ca9077bc891",
          "message": "fix: add missing lint.js for makeSyntaxLinter",
          "timestamp": "2026-03-29T17:57:18+08:00",
          "tree_id": "f546affac2313f1e04beb35e319bcf832e2dce95",
          "url": "https://github.com/Liveiciee/yuyucode/commit/d0b11f49fd334a64869cade7fc455ca9077bc891"
        },
        "date": 1774778440609,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8012586.27,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1286670.76,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1419121.1,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8745415.83,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15183031.09,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 6175371.22,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1426149.06,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 165892.57,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.0188,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11878610.19,
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
            "value": 1992223.3,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1630620.15,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1794798.33,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7214543.03,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4978.94,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9700.75,
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
            "value": 219778.64,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 180183.64,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9310705.16,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1676651.81,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 445213.92,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 119709.76,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13692177.37,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13645110,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4596763.09,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 7147326.76,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7185.64,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5504805.79,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 982991.93,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5717634.34,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11702836,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2552,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 122130.82,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12020329.9,
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
            "value": 5943522.38,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1734038.75,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1602911.94,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1754999.13,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1708316.61,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4261823.77,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3675.59,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1888022.49,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 193156.6,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2486579.1,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4250875.33,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1597.43,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 96148.58,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60674.45,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 122241.33,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8845.61,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7314,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2126.07,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 13849.14,
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
          "id": "16417caa74a97969969d644609a41494e8ea7a17",
          "message": "fix: correct imports in FileEditor modular files (keymap, Compartment, StateEffect)",
          "timestamp": "2026-03-29T18:01:06+08:00",
          "tree_id": "4c70d4d43124d94c69343563bdb5bff30c9154f9",
          "url": "https://github.com/Liveiciee/yuyucode/commit/16417caa74a97969969d644609a41494e8ea7a17"
        },
        "date": 1774778669021,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 8555318.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1278183.47,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1431297.1,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 8312170.75,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 15164212.6,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5850045.88,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1408886.82,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 167203.19,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 26.378,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11775993.01,
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
            "value": 1961284.92,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1585262.12,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1726615.07,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 7161989.46,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 4967.72,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9693.59,
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
            "value": 219529.46,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 176795.97,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9055937.98,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1611655.38,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 428203.17,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 121171.76,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 12784471.95,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 12965115.25,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4734554.5,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6750867.39,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7669.84,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5812902.97,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 977405.97,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5476965.77,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11182735.11,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2513,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 123926.87,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 12108261.28,
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
            "value": 5524478,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1633767.15,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1600445.09,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1643635.89,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1625677.93,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 3851485.34,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 3823.26,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1935563.7,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 197966.51,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2604965.95,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4150491.93,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1608.49,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 93747.89,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 60503.12,
            "unit": "ops/sec"
          },
          {
            "name": "10 extractSymbols in parallel (Promise.all)",
            "value": 124056.37,
            "unit": "ops/sec"
          },
          {
            "name": "10 compressSource in parallel",
            "value": 8849.05,
            "unit": "ops/sec"
          },
          {
            "name": "10 generateDiff in parallel",
            "value": 2.7592,
            "unit": "ops/sec"
          },
          {
            "name": "50 parseActions in parallel",
            "value": 2132.54,
            "unit": "ops/sec"
          },
          {
            "name": "mixed workload —",
            "value": 5,
            "unit": "ops/sec"
          },
          {
            "name": "200 files with cross-imports",
            "value": 13277.26,
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
          "id": "f69b80d8be7b0aabe9956e0768d83d694b420c2b",
          "message": "fix: import keymap with namespace to resolve missing export",
          "timestamp": "2026-03-29T18:05:38+08:00",
          "tree_id": "8a82ef695fd5f675878d87a53082e8f26627cedd",
          "url": "https://github.com/Liveiciee/yuyucode/commit/f69b80d8be7b0aabe9956e0768d83d694b420c2b"
        },
        "date": 1774778946638,
        "tool": "customSmallerIsBetter",
        "benches": [
          {
            "name": "single call — jsx",
            "value": 7955008.87,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed extensions",
            "value": 1092307.13,
            "unit": "ops/sec"
          },
          {
            "name": "10 mixed",
            "value": 1340204.22,
            "unit": "ops/sec"
          },
          {
            "name": "single call — ts",
            "value": 7941346.9,
            "unit": "ops/sec"
          },
          {
            "name": "empty tabs",
            "value": 14698506.24,
            "unit": "ops/sec"
          },
          {
            "name": "js only",
            "value": 5237212.72,
            "unit": "ops/sec"
          },
          {
            "name": "html + css + js",
            "value": 1343072.26,
            "unit": "ops/sec"
          },
          {
            "name": "small diff (4 lines)",
            "value": 150200.55,
            "unit": "ops/sec"
          },
          {
            "name": "large diff (500 lines, many changes)",
            "value": 27.5579,
            "unit": "ops/sec"
          },
          {
            "name": "identical (no diff)",
            "value": 11749199.41,
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
            "value": 1908190.13,
            "unit": "ops/sec"
          },
          {
            "name": "realistic component (~50 lines)",
            "value": 1653073.31,
            "unit": "ops/sec"
          },
          {
            "name": "large file (10 components, ~500 lines)",
            "value": 1738764.83,
            "unit": "ops/sec"
          },
          {
            "name": "non-code file (early return)",
            "value": 6407457.1,
            "unit": "ops/sec"
          },
          {
            "name": "large file (500 lines)",
            "value": 5708.51,
            "unit": "ops/sec"
          },
          {
            "name": "large component (10x realistic, ~500 lines)",
            "value": 9911.76,
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
            "value": 227814.72,
            "unit": "ops/sec"
          },
          {
            "name": "20 pre-built file data objects",
            "value": 181498.81,
            "unit": "ops/sec"
          },
          {
            "name": "no action blocks",
            "value": 9021804.92,
            "unit": "ops/sec"
          },
          {
            "name": "1 action block",
            "value": 1601117.35,
            "unit": "ops/sec"
          },
          {
            "name": "5 action blocks",
            "value": 435450.91,
            "unit": "ops/sec"
          },
          {
            "name": "mixed — valid + invalid + non-action blocks",
            "value": 123705.73,
            "unit": "ops/sec"
          },
          {
            "name": "null input",
            "value": 13027576.67,
            "unit": "ops/sec"
          },
          {
            "name": "undefined input",
            "value": 13227420.39,
            "unit": "ops/sec"
          },
          {
            "name": "no extension",
            "value": 4671008.6,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested path",
            "value": 6323233.91,
            "unit": "ops/sec"
          },
          {
            "name": "500 mixed files (stress)",
            "value": 7677.42,
            "unit": "ops/sec"
          },
          {
            "name": "giant JS (500 lines)",
            "value": 5585789.37,
            "unit": "ops/sec"
          },
          {
            "name": "20 tabs (only first html/css/js matter)",
            "value": 903245.17,
            "unit": "ops/sec"
          },
          {
            "name": "unicode content",
            "value": 5183001.17,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines identical (no diff — best case)",
            "value": 11622680.02,
            "unit": "ops/sec"
          },
          {
            "name": "5000 lines all changed (worst case Myers)",
            "value": 0.2655,
            "unit": "ops/sec"
          },
          {
            "name": "unicode diff",
            "value": 110783.7,
            "unit": "ops/sec"
          },
          {
            "name": "empty →",
            "value": 500,
            "unit": "ops/sec"
          },
          {
            "name": "500 lines → empty (delete everything)",
            "value": 11895111.5,
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
            "value": 3526773.86,
            "unit": "ops/sec"
          },
          {
            "name": "5000 line file",
            "value": 1726993.41,
            "unit": "ops/sec"
          },
          {
            "name": "unicode source",
            "value": 1681572.98,
            "unit": "ops/sec"
          },
          {
            "name": "deeply nested (50 levels)",
            "value": 1747734.77,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbols",
            "value": 1717710.78,
            "unit": "ops/sec"
          },
          {
            "name": "empty string",
            "value": 4012301.15,
            "unit": "ops/sec"
          },
          {
            "name": "200 unique symbol names (compression resistant)",
            "value": 4048.77,
            "unit": "ops/sec"
          },
          {
            "name": "single line (1 char)",
            "value": 1831401.73,
            "unit": "ops/sec"
          },
          {
            "name": "50 imports",
            "value": 173968.75,
            "unit": "ops/sec"
          },
          {
            "name": "unicode import paths",
            "value": 2354082.63,
            "unit": "ops/sec"
          },
          {
            "name": "malformed import (no from)",
            "value": 4141256.84,
            "unit": "ops/sec"
          },
          {
            "name": "100 fake action blocks (all invalid JSON)",
            "value": 1676.23,
            "unit": "ops/sec"
          },
          {
            "name": "20 valid action blocks",
            "value": 104841.16,
            "unit": "ops/sec"
          },
          {
            "name": "10MB-ish text — no actions",
            "value": 50942.2,
            "unit": "ops/sec"
          }
        ]
      }
    ]
  }
}