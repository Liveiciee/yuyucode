# ================================================
# YuyuCode Legacy Functions v5.1
# Server Management, File Operations, ZIP Tools
# Fixed: Now uses yuyu-server.cjs
# ================================================

# ==================== CONFIG ====================
export YUYU_SERVER_PORT="${YUYU_SERVER_PORT:-8765}"
export YUYU_LOG="$HOME/.yuyu-server.log"
export YUYU_PID="$HOME/.yuyu-server.pid"
export YUYU_RESTARTS="$HOME/.yuyu-server.restarts"
export YUYU_BACKUP_DIR="${YUYU_HOME:-$HOME/.config/yuyu}/backups"
export DOWNLOAD_DIR="/sdcard/Download"

mkdir -p "${YUYU_BACKUP_DIR}" 2>/dev/null

# ==================== SERVER MANAGEMENT ====================
_yuyu_server_running() {
    curl -sf --max-time 2 "http://127.0.0.1:${YUYU_SERVER_PORT}/health" >/dev/null 2>&1
    if [ $? -eq 0 ]; then return 0; fi
    if [ -f "${YUYU_PID}" ]; then
        local pid=$(cat "${YUYU_PID}" 2>/dev/null)
        [ -n "${pid}" ] && kill -0 "${pid}" 2>/dev/null && return 0
    fi
    return 1
}

ystart() {
    if _yuyu_server_running; then
        echo "⚠️ Server already running"
        return 1
    fi
    
    cd ~/yuyucode 2>/dev/null || { echo "❌ yuyucode not found"; return 1; }
    
    # Check for server file (prefer .cjs)
    local server_file=""
    if [ -f "yuyu-server.cjs" ]; then
        server_file="yuyu-server.cjs"
    elif [ -f "yuyu-server.js" ]; then
        server_file="yuyu-server.js"
    else
        echo "❌ Server file not found (yuyu-server.cjs or yuyu-server.js)"
        return 1
    fi
    
    echo "0" > "${YUYU_RESTARTS}"
    node "${server_file}" >> "${YUYU_LOG}" 2>&1 &
    echo $! > "${YUYU_PID}"
    echo "✅ Server started (PID: $!) using ${server_file}"
    sleep 1
    if _yuyu_server_running; then
        echo "✅ Server responding"
    else
        echo "⚠️ Server started but not responding. Check: ylogs"
    fi
}

ystop() {
    if [ -f "${YUYU_PID}" ]; then
        local pid=$(cat "${YUYU_PID}" 2>/dev/null)
        if [ -n "${pid}" ]; then
            kill -TERM "${pid}" 2>/dev/null
            sleep 2
            kill -9 "${pid}" 2>/dev/null
        fi
        rm -f "${YUYU_PID}" "${YUYU_RESTARTS}"
    fi
    echo "✅ Server stopped"
}

yrestart() { ystop; sleep 1; ystart; }
yreset() { rm -f "${YUYU_RESTARTS}"; echo "✅ Crash counter reset"; }
ylogs() { tail -f "${YUYU_LOG}" 2>/dev/null || echo "No logs found"; }
ystatus() { 
    if _yuyu_server_running; then 
        echo "✅ Running"
    else 
        echo "❌ Stopped"
    fi
}

# ==================== FILE OPERATIONS ====================
_yuyu_curl_post() {
    local type="$1"
    shift
    local json="{\"type\":\"${type}\""
    while [ $# -gt 0 ]; do
        local key="${1%%=*}"
        local value="${1#*=}"
        value="${value//\\/\\\\}"
        value="${value//\"/\\\"}"
        json="${json},\"${key}\":\"${value}\""
        shift
    done
    json="${json}}"
    curl -s -X POST "http://127.0.0.1:${YUYU_SERVER_PORT}" \
        -H "Content-Type: application/json" \
        -d "${json}" 2>/dev/null | jq -r '.data // empty' 2>/dev/null
}

yread() { 
    [ -z "$1" ] && echo "Usage: yread <path> [human]" && return 1
    _yuyu_curl_post "read" "path=$1" "human=${2:-false}"
}

ywrite() { 
    [ -z "$1" ] || [ -z "$2" ] && echo "Usage: ywrite <path> <content>" && return 1
    _yuyu_curl_post "write" "path=$1" "content=$2"
}

ylist() { 
    _yuyu_curl_post "list" "path=${1:-$HOME/yuyucode}"
}

ytree() { 
    local path="${1:-$HOME/yuyucode}"
    local depth="${2:-3}"
    _yuyu_curl_post "tree" "path=${path}" "depth=${depth}"
}

ysearch() { 
    [ -z "$1" ] && echo "Usage: ysearch <query>" && return 1
    _yuyu_curl_post "search" "content=$1"
}

yinfo() { 
    [ -z "$1" ] && echo "Usage: yinfo <path>" && return 1
    _yuyu_curl_post "info" "path=$1"
}

yhealth() { 
    curl -s "http://127.0.0.1:${YUYU_SERVER_PORT}/health" | jq '.' 2>/dev/null
}

yping() { 
    curl -s "http://127.0.0.1:${YUYU_SERVER_PORT}" | jq '.' 2>/dev/null
}

ypkg() { 
    yread "$HOME/yuyucode/package.json" true
}

# ==================== ZIP & BACKUP ====================
_yuyu_create_backup() {
    mkdir -p "${YUYU_BACKUP_DIR}"
    local backup="backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "${YUYU_BACKUP_DIR}/${backup}" -C "$(dirname "$HOME/yuyucode")" "yuyucode" 2>/dev/null
    echo "${backup}"
}

yapply() {
    local zip="$1"
    local dry_run=false
    local force=false
    
    while [ $# -gt 0 ]; do
        case "$1" in
            --dry-run|-d) dry_run=true ;;
            --force|-f) force=true ;;
            *) zip="$1" ;;
        esac
        shift
    done
    
    if [ -z "${zip}" ]; then
        local zips=($(find /sdcard/Download -maxdepth 1 -name "yuyu*.zip" 2>/dev/null))
        if [ ${#zips[@]} -eq 0 ]; then
            echo "❌ No yuyu*.zip found in /sdcard/Download"
            return 1
        fi
        echo "📦 Available zips:"
        for i in "${!zips[@]}"; do
            echo "  $((i+1)) $(basename "${zips[$i]}")"
        done
        echo -n "Select (1-${#zips[@]}): "
        read choice
        zip="${zips[$((choice-1))]}"
    fi
    
    [ ! -f "${zip}" ] && echo "❌ File not found: ${zip}" && return 1
    
    echo "📦 Applying: $(basename "${zip}")"
    if $dry_run; then
        echo "🔍 DRY RUN — no changes made"
        return 0
    fi
    
    if ! $force; then
        echo -n "Apply? (y/N): "
        read ans
        [[ ! "$ans" =~ ^[Yy]$ ]] && echo "Cancelled" && return 0
    fi
    
    local backup=$(_yuyu_create_backup)
    cd ~/yuyucode
    
    if ! unzip -o "${zip}"; then
        echo "❌ Extraction failed"
        return 1
    fi
    
    rm -f "${zip}"
    echo "✅ Applied! Backup: ${backup}"
}

yrestore() {
    local backups=($(ls -t ${YUYU_BACKUP_DIR}/*.tar.gz 2>/dev/null))
    if [ ${#backups[@]} -eq 0 ]; then
        echo "❌ No backups found in ${YUYU_BACKUP_DIR}"
        return 1
    fi
    echo "📦 Available backups:"
    for i in "${!backups[@]}"; do
        echo "  $((i+1)) $(basename "${backups[$i]}")"
    done
    echo -n "Select (1-${#backups[@]}): "
    read choice
    local backup="${backups[$((choice-1))]}"
    
    echo "Restoring: $(basename "${backup}")"
    ystop 2>/dev/null
    tar -xzf "${backup}" -C "$(dirname "$HOME/yuyucode")"
    echo "✅ Restored"
}

ycp() {
    local file="$1"
    local dest="${2:-}"
    local src="/sdcard/Download/${file}"
    
    [ ! -f "${src}" ] && echo "❌ Not found: ${src}" && return 1
    
    if [[ "${file}" == *.zip ]]; then
        yapply "${src}"
        return $?
    fi
    
    local target="$HOME/yuyucode/${dest:+${dest}/}${file}"
    mkdir -p "$(dirname "${target}")"
    cp "${src}" "${target}" && rm "${src}"
    echo "✅ Copied: ${file} → ${target}"
}

# ==================== ALIASES ====================
alias ystart="ystart"
alias ystop="ystop"
alias yrestart="yrestart"
alias yreset="yreset"
alias ylogs="ylogs"
alias ystatus="ystatus"
alias yread="yread"
alias ywrite="ywrite"
alias ylist="ylist"
alias ytree="ytree"
alias ysearch="ysearch"
alias yinfo="yinfo"
alias yhealth="yhealth"
alias yping="yping"
alias ypkg="ypkg"
alias yapply="yapply"
alias yrestore="yrestore"
alias ycp="ycp"

echo "🐱 Legacy functions loaded! (ycp, yapply, yread, ywrite, ylist, ytree, ysearch, yinfo, ystart, ystop, yrestart, yreset, ylogs, ystatus, yhealth, yping, ypkg, yrestore)"
