# ================================================
# AI Gateway - Integrated with External AI
# ================================================

export YUYU_AI_CONFIG="$HOME/.yuyu-ai-config"
export YUYU_AI_KEY="$HOME/.yuyu-ai-key"
export YUYU_AI_SCRIPT="$YUYU_HOME/bin/ai"

# Helper functions
_neko_success() {
    echo -e "${COLOR_GREEN}✅ $*${COLOR_RESET}"
}

_neko_error() {
    echo -e "${COLOR_RED}❌ $*${COLOR_RESET}" >&2
}

_neko_warn() {
    echo -e "${COLOR_YELLOW}⚠️ $*${COLOR_RESET}"
}

_neko_info() {
    echo -e "${COLOR_CYAN}ℹ️ $*${COLOR_RESET}"
}

_yuyu_yes_no() {
    local prompt="$1"
    local default="${2:-y}"
    
    echo -ne "${COLOR_CYAN}${prompt} (y/N): ${COLOR_RESET}"
    read -r answer
    [[ "${answer:-${default}}" =~ ^[Yy]$ ]]
}

# Check if external AI exists
_yuyu_has_external_ai() {
    [[ -f "${YUYU_AI_SCRIPT}" ]] && [[ -x "${YUYU_AI_SCRIPT}" ]]
}

# Use external AI
_yuyu_ai_external_call() {
    local query="$1"
    if _yuyu_has_external_ai; then
        "${YUYU_AI_SCRIPT}" "${query}"
    else
        echo "${EMOJI_NEKO} AI script not found at ${YUYU_AI_SCRIPT}"
        return 1
    fi
}

_yuyu_ai_init() {
    mkdir -p "$(dirname "${YUYU_AI_CONFIG}")" 2>/dev/null
    if [[ ! -f "${YUYU_AI_CONFIG}" ]]; then
        cat > "${YUYU_AI_CONFIG}" << 'EOC'
{
  "enabled": false,
  "provider": "external",
  "script": "ai",
  "model": "llama3.1-8b"
}
EOC
    fi
}

_yuyu_ai_is_enabled() {
    _yuyu_ai_init
    if command -v jq >/dev/null 2>&1; then
        local enabled=$(jq -r '.enabled // false' "${YUYU_AI_CONFIG}" 2>/dev/null)
        [[ "${enabled}" == "true" ]]
    else
        grep -q '"enabled": true' "${YUYU_AI_CONFIG}" 2>/dev/null
    fi
}

_yuyu_ai_call() {
    local query="$1"
    local context="$2"
    
    if ! _yuyu_ai_is_enabled; then
        echo "${EMOJI_NEKO} Nyaa~! AI not enabled. Run: yai-setup"
        return
    fi
    
    if _yuyu_has_external_ai; then
        _yuyu_ai_external_call "${query}"
    else
        echo "${EMOJI_AI} AI script not found at ${YUYU_AI_SCRIPT}"
        echo "Please place your AI script at: ~/.config/yuyu/bin/ai"
    fi
}

_neko_local_response() {
    local input="$1"
    local input_lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')
    
    case "$input_lower" in
        *"help"*) echo "Try: yhelp for all commands" ;;
        *"hello"*|*"hi"*) echo "Nyaa~! Hello! I'm Yuyu, your cat assistant!" ;;
        *"thank"*) echo "You're welcome! Purr~!" ;;
        *"ai"*) echo "AI Mode: $( _yuyu_has_external_ai && echo "External AI ready!" || echo "Not installed" )" ;;
        *) echo "Nyaa~! I'm here! Type 'yhelp' for commands, or 'yai-setup' for AI mode" ;;
    esac
}

# AI Commands
yai() {
    local query="$*"
    if [[ -z "${query}" ]]; then
        echo "${EMOJI_AI} Yuyu AI Assistant"
        echo "Usage: yai \"your question\""
        echo ""
        if _yuyu_ai_is_enabled; then
            if _yuyu_has_external_ai; then
                local model=$(jq -r '.model // "llama3.1-8b"' "${YUYU_AI_CONFIG}" 2>/dev/null)
                echo "✅ AI Mode: Enabled (External: ${model})"
            else
                echo "⚠️ AI Enabled but script not found"
            fi
            echo "   Disable: yai-off"
        else
            echo "🐱 Neko Mode: Local responses"
            if _yuyu_has_external_ai; then
                echo "   💡 External AI available! Enable: yai-setup"
            else
                echo "   📦 Place AI script at: ~/.config/yuyu/bin/ai"
                echo "   Then run: yai-setup"
            fi
        fi
        return
    fi
    
    local context="Device: ${YUYU_DEVICE:-unknown} | Profile: ${YUYU_POWER_PROFILE:-cool} | Temp: $(_yuyu_get_cpu_temp 2>/dev/null || echo '?')°C"
    _yuyu_ai_call "${query}" "${context}"
}

yai_setup() {
    echo "${EMOJI_WIZARD} Yuyu AI Setup Wizard"
    echo "================================"
    echo ""
    
    if _yuyu_has_external_ai; then
        echo "${EMOJI_AI} External AI detected at: ${YUYU_AI_SCRIPT}"
        echo ""
        
        # Test AI
        echo "Testing AI connection..."
        if "${YUYU_AI_SCRIPT}" "Say 'OK' if you can hear me" 2>/dev/null | grep -q "OK"; then
            _neko_success "AI is working!"
        else
            _neko_warn "AI test failed, but we'll still enable it"
        fi
        echo ""
        
        if _yuyu_yes_no "Enable this AI as Yuyu's brain?" "y"; then
            if command -v jq >/dev/null 2>&1; then
                jq '.enabled = true | .provider = "external"' "${YUYU_AI_CONFIG}" > "${YUYU_AI_CONFIG}.tmp" 2>/dev/null && mv "${YUYU_AI_CONFIG}.tmp" "${YUYU_AI_CONFIG}"
            else
                # Manual edit if jq not available
                sed -i 's/"enabled": false/"enabled": true/' "${YUYU_AI_CONFIG}"
            fi
            _neko_success "AI Mode enabled! Try: yai \"Hello!\""
            echo ""
            echo "💡 Example:"
            echo "   yai \"Buat script Python untuk backup file\""
            echo "   yai \"Optimasi Node.js untuk Snapdragon 680\""
        else
            echo "Cancelled"
        fi
    else
        echo "${EMOJI_WARN} No external AI script found at ${YUYU_AI_SCRIPT}"
        echo ""
        echo "Options:"
        echo "  1) Copy your AI script to: ${YUYU_AI_SCRIPT}"
        echo "  2) Use built-in AI (coming soon)"
        echo "  3) Cancel"
        echo ""
        
        local choice
        echo -ne "${COLOR_CYAN}Choose (1-3): ${COLOR_RESET}"
        read -r choice
        
        case $choice in
            1)
                echo ""
                echo "Please copy your AI script:"
                echo "  cp /path/to/your/ai ${YUYU_AI_SCRIPT}"
                echo "  chmod +x ${YUYU_AI_SCRIPT}"
                echo ""
                echo "Then run: yai-setup again"
                ;;
            2)
                echo "Built-in AI coming in v6.1..."
                ;;
            *)
                echo "Cancelled"
                ;;
        esac
    fi
}

yai_off() {
    if command -v jq >/dev/null 2>&1; then
        jq '.enabled = false' "${YUYU_AI_CONFIG}" > "${YUYU_AI_CONFIG}.tmp" 2>/dev/null && mv "${YUYU_AI_CONFIG}.tmp" "${YUYU_AI_CONFIG}"
    else
        sed -i 's/"enabled": true/"enabled": false/' "${YUYU_AI_CONFIG}"
    fi
    echo "${EMOJI_NEKO} AI disabled. Neko Mode active!"
}

yai_status() {
    echo "${EMOJI_AI} AI Status"
    echo "━━━━━━━━━━━━━━━━━━━━"
    if _yuyu_ai_is_enabled; then
        echo "  ✅ Enabled: Yes"
        if _yuyu_has_external_ai; then
            echo "  📦 External AI: Present"
            echo "  📍 Path: ${YUYU_AI_SCRIPT}"
            local model=$(jq -r '.model // "llama3.1-8b"' "${YUYU_AI_CONFIG}" 2>/dev/null)
            echo "  🤖 Model: ${model}"
        else
            echo "  ⚠️ External AI: Missing"
        fi
    else
        echo "  ❌ Enabled: No"
        echo "  🐱 Mode: Neko (local)"
        if _yuyu_has_external_ai; then
            echo "  💡 External AI available! Run: yai-setup"
        fi
    fi
}

# Initialize
_yuyu_ai_init
export YUYU_AI_ENABLED="$(_yuyu_ai_is_enabled && echo "1" || echo "0")"

# Show AI status on load (only if enabled)
if _yuyu_ai_is_enabled && _yuyu_has_external_ai; then
    echo -e "${COLOR_GREEN}🤖 AI Mode: External AI ready!${COLOR_RESET}"
fi

# Fix for yes/no prompt
_yuyu_yes_no() {
    local prompt="$1"
    local default="${2:-n}"
    
    echo -ne "${COLOR_CYAN}${prompt} (y/N): ${COLOR_RESET}"
    read -r answer
    answer="${answer:-${default}}"
    [[ "${answer}" =~ ^[Yy]$ ]]
}
