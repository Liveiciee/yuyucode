#!/bin/bash
# Script to apply docs update
unzip -o yuyu-docs.zip -d yuyu-docs/
mv yuyu-docs/README.md README.md
mv yuyu-docs/CHANGELOG.md CHANGELOG.md
# Assume other doc files are in root /docs
mkdir -p docs && mv yuyu-docs/docs/* docs/ 2>/dev/null || true
