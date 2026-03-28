window.BENCHMARK_DATA = {
  "lastUpdate": 1774724504475,
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
      }
    ]
  }
}