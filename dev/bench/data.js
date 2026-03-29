window.BENCHMARK_DATA = {
  "lastUpdate": 1774763576004,
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
      }
    ]
  }
}