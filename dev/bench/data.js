window.BENCHMARK_DATA = {
  "lastUpdate": 1774748543624,
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
      }
    ]
  }
}