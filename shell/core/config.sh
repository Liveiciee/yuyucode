# ================================================
# Core Configuration
# ================================================

# System detection
export YUYU_OS="$(uname -s | tr '[:upper:]' '[:lower:]')"

if [[ -d "/data/data/com.termux" ]]; then
    export YUYU_IS_TERMUX=true
    export YUYU_DEVICE="Termux"
elif [[ -n "${WSL_DISTRO_NAME:-}" ]]; then
    export YUYU_IS_WSL=true
    export YUYU_DEVICE="WSL"
elif [[ "${YUYU_OS}" == "darwin" ]]; then
    export YUYU_IS_MAC=true
    export YUYU_DEVICE="macOS"
else
    export YUYU_IS_LINUX=true
    export YUYU_DEVICE="Linux"
fi

# Node.js optimization (for Snapdragon 680)
export NODE_MAX_HEAP="${NODE_MAX_HEAP:-512}"
export NODE_SEMI_SPACE="${NODE_SEMI_SPACE:-16}"
export NODE_OPTIONS="--max-old-space-size=${NODE_MAX_HEAP} --max-semi-space-size=${NODE_SEMI_SPACE}"

# Colors
export COLOR_RESET='\033[0m'
export COLOR_RED='\033[0;31m'
export COLOR_GREEN='\033[0;32m'
export COLOR_YELLOW='\033[1;33m'
export COLOR_BLUE='\033[0;34m'
export COLOR_MAGENTA='\033[0;35m'
export COLOR_CYAN='\033[0;36m'
export COLOR_ORANGE='\033[38;5;208m'
export COLOR_PURPLE='\033[38;5;141m'
export COLOR_AI='\033[38;5;99m'

# Emojis
export EMOJI_OK="✅"
export EMOJI_ERROR="❌"
export EMOJI_WARN="⚠️"
export EMOJI_INFO="ℹ️"
export EMOJI_NEKO="🐱"
export EMOJI_AI="🤖"
export EMOJI_ROCKET="🚀"
export EMOJI_NEKO_HAPPY="😺"
export EMOJI_NEKO_PURR="😻"
