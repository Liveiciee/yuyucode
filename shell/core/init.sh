#!/usr/bin/env bash
# ================================================
# Yuyu-Shell v6.0 "The Galactic Neko"
# Part of YuyuCode Ecosystem
# ================================================

[[ "${YUYU_LOADED:-}" == "1" ]] && return 0
export YUYU_LOADED=1
export YUYU_VERSION="6.0-galactic-neko"
export YUYU_HOME="${HOME}/.config/yuyu"

# Create directories
mkdir -p "${YUYU_HOME}"/{modules,plugins,themes,conf.d,bin,.cache,logs} 2>/dev/null

# Load configuration
for conf in "${YUYU_HOME}"/conf.d/*.conf 2>/dev/null; do
    [ -f "$conf" ] && source "$conf"
done

# Load modules
for module in "${YUYU_HOME}"/modules/*.sh 2>/dev/null; do
    [ -f "$module" ] && source "$module"
done

# Load plugins
for plugin in "${YUYU_HOME}"/plugins/*.sh 2>/dev/null; do
    [ -f "$plugin" ] && source "$plugin"
done

# Load theme
if [ -f "${YUYU_HOME}/themes/neko.sh" ]; then
    source "${YUYU_HOME}/themes/neko.sh"
fi

# Welcome banner (only in interactive shell)
if [[ -t 1 ]] && [[ "${YUYU_QUIET:-0}" != "1" ]]; then
    echo "╔═══════════════════════════════════════════════════════════╗"
    printf "║  😻 Yuyu-Shell v${YUYU_VERSION}%-32s ║\n" ""
    echo "║  🚀 Part of YuyuCode Ecosystem                           ║"
    echo "║  💡 Type 'yhelp' for commands                            ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
fi
