# ================================================
# Utility Functions
# ================================================

_neko_success() { echo -e "${COLOR_GREEN}✅ $*${COLOR_RESET}"; }
_neko_error()   { echo -e "${COLOR_RED}❌ $*${COLOR_RESET}" >&2; }
_neko_warn()    { echo -e "${COLOR_YELLOW}⚠️ $*${COLOR_RESET}"; }
_neko_info()    { echo -e "${COLOR_CYAN}ℹ️ $*${COLOR_RESET}"; }

_yuyu_log() {
    local level="$1"
    local msg="$2"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    echo "[${timestamp}] [${level}] ${msg}" >> "${YUYU_LOG:-$HOME/.yuyu.log}"
}

_yuyu_yes_no() {
    local prompt="$1"
    echo -ne "${COLOR_CYAN}${prompt} (y/N): ${COLOR_RESET}"
    read -r answer
    [[ "${answer}" =~ ^[Yy]$ ]]
}
