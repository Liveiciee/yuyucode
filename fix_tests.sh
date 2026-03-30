#!/bin/bash
for f in $(find test -type f \( -name "*.test.js" -o -name "*.test.cjs" \)); do
  last=$(tail -n1 "$f" | tr -d '\n')
  if [ "$last" = "}" ]; then
    echo "});" >> "$f"
    echo "Fixed: $f"
  fi
done
