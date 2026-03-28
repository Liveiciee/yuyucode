#!/usr/bin/env bash
# ================================================
# Yuyu-Shell v6.0 "The Galactic Neko"
# Modular Shell Framework
# ================================================

# Guard
[[ "${YUYU_LOADED:-}" == "1" ]] && return 0
export YUYU_LOADED=1
export YUYU_VERSION="6.0-galactic-neko"
export YUYU_HOME="${HOME}/.config/yuyu"

# Create directories
mkdir -p "${YUYU_HOME}"/{modules,plugins,themes,conf.d,bin,.cache,logs} 2>/dev/null

# Load configuration first
if [ -d "${YUYU_HOME}/conf.d" ]; then
    for conf in "${YUYU_HOME}"/conf.d/*.conf; do
        [ -f "$conf" ] && source "$conf"
    done
fi

# Load core modules
if [ -d "${YUYU_HOME}/modules" ]; then
    for module in "${YUYU_HOME}"/modules/*.sh; do
        [ -f "$module" ] && source "$module"
    done
fi

# Load plugins
if [ -d "${YUYU_HOME}/plugins" ]; then
    for plugin in "${YUYU_HOME}"/plugins/*.sh; do
        [ -f "$plugin" ] && source "$plugin"
    done
fi

# Load theme
if [ -f "${YUYU_HOME}/themes/neko.sh" ]; then
    source "${YUYU_HOME}/themes/neko.sh"
fi
source "$YUYU_HOME/modules/legacy.sh"
