# ================================================
# Neko Theme - Beautiful Bash Prompt
# ================================================

# Git info for prompt
_yuyu_git_info() {
    local branch=""
    local dirty=""
    
    if git rev-parse --git-dir >/dev/null 2>&1; then
        branch=$(git branch --show-current 2>/dev/null)
        if [[ -n "$branch" ]]; then
            dirty=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
            if [[ "$dirty" -gt 0 ]]; then
                echo " 🌿${branch}*"
            else
                echo " 🌿${branch}"
            fi
        fi
    fi
}

# Power profile indicator
_yuyu_power_indicator() {
    if [[ "${YUYU_POWER_PROFILE:-cool}" == "hot" ]]; then
        echo "🔥"
    elif [[ "${YUYU_POWER_PROFILE:-cool}" == "warm" ]]; then
        echo "🌡️"
    else
        echo "❄️"
    fi
}

# AI mode indicator
_yuyu_ai_indicator() {
    if [[ "${YUYU_AI_ENABLED:-0}" == "1" ]]; then
        echo "🤖"
    else
        echo "🐱"
    fi
}

# Set prompt
if [[ "${YUYU_DEVICE:-}" == "Termux" ]]; then
    PS1="\n\[${COLOR_GREEN}\]┌─\[${COLOR_CYAN}\](\[$(_yuyu_ai_indicator)\]\[${COLOR_CYAN}\])\[$(_yuyu_power_indicator)\]\n\[${COLOR_GREEN}\]└─\[${COLOR_BLUE}\]\w\[${COLOR_MAGENTA}\]\$(_yuyu_git_info)\n\[${COLOR_GREEN}\]└─\[${COLOR_YELLOW}\]\$ \[${COLOR_RESET}\]"
else
    PS1="\[${COLOR_GREEN}\]┌─\[${COLOR_CYAN}\](\[$(_yuyu_ai_indicator)\]\[${COLOR_CYAN}\])\[$(_yuyu_power_indicator)\]\[${COLOR_GREEN}\]\n└─\[${COLOR_BLUE}\]\w\[${COLOR_MAGENTA}\]\$(_yuyu_git_info)\n\[${COLOR_GREEN}\]└─\[${COLOR_YELLOW}\]\$ \[${COLOR_RESET}\]"
fi

export PS1
