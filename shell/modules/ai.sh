# ================================================
# AI Gateway - Integrated with External AI
# ================================================

export YUYU_AI_CONFIG="$HOME/.yuyu-ai-config"
export YUYU_AI_KEY="$HOME/.yuyu-ai-key"
export YUYU_AI_SCRIPT="$YUYU_HOME/bin/ai"

# ==================== AI INIT ====================
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

_yuyu_has_external_ai() {
    [[ -f "${YUYU_AI_SCRIPT}" ]] && [[ -x "${YUYU_AI_SCRIPT}" ]]
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

_yuyu_ai_external_call() {
    local query="$1"
    if _yuyu_has_external_ai; then
        "${YUYU_AI_SCRIPT}" "${query}"
    else
        echo "🐱 AI script not found at ${YUYU_AI_SCRIPT}"
        return 1
    fi
}

# ==================== LOCAL RESPONSE ====================
_neko_local_response() {
    local input="$1"
    local input_lower=$(echo "$input" | tr '[:upper:]' '[:lower:]')

    case "$input_lower" in
        *"help"*) echo "Try: yhelp for all commands" ;;
        *"hello"*|*"hi"*) echo "Nyaa~! Hello! I'm Yuyu, your cat assistant!" ;;
        *"thank"*) echo "You're welcome! Purr~!" ;;
        *"how to"*|*"tutorial"*) echo "💡 Try: yhelp or yai 'how to do X' (with AI enabled)" ;;
        *"error"*) echo "🐛 Check logs: ylogs | Server status: ystatus" ;;
        *"ai"*) echo "🤖 AI Mode: $(_yuyu_ai_is_enabled && echo "Enabled" || echo "Disabled")" ;;
        *) echo "Nyaa~! I'm here! Type 'yhelp' for commands, or 'yai-setup' for AI mode" ;;
    esac
}

# ==================== AI COMMANDS ====================
yai() {
    local query="$*"
    if [[ -z "${query}" ]]; then
        echo "🤖 Yuyu AI Assistant"
        echo ""
        echo "Usage: yai \"your question\""
        echo ""
        echo "Examples:"
        echo "  yai \"How to fix npm install error?\""
        echo "  yai \"Buat function bash untuk backup\""
        echo "  yai \"Optimasi Node.js untuk Snapdragon 680\""
        echo ""
        if _yuyu_ai_is_enabled; then
            if _yuyu_has_external_ai; then
                echo "✅ AI Mode: Enabled (External AI ready)"
            else
                echo "⚠️ AI Enabled but script not found at: ${YUYU_AI_SCRIPT}"
            fi
            echo "   Disable: yai-off"
        else
            echo "🐱 Neko Mode: Local responses (fast, offline)"
            if _yuyu_has_external_ai; then
                echo "   💡 External AI available! Enable: yai-setup"
            else
                echo "   📦 Place AI script at: ${YUYU_AI_SCRIPT}"
                echo "   Then run: yai-setup"
            fi
        fi
        return
    fi

    local context="Device: ${YUYU_DEVICE:-unknown} | Profile: ${YUYU_POWER_PROFILE:-cool}"

    if _yuyu_ai_is_enabled && _yuyu_has_external_ai; then
        echo "🤖 Thinking..."
        _yuyu_ai_external_call "${query}"
    else
        _neko_local_response "${query}"
    fi
}

yai_setup() {
    echo "🤖 Yuyu AI Setup Wizard"
    echo "========================"
    echo ""

    if _yuyu_has_external_ai; then
        echo "✅ External AI detected at: ${YUYU_AI_SCRIPT}"
        echo ""
        
        echo -n "Enable AI as Yuyu's brain? (y/N): "
        read ans
        if [[ "$ans" =~ ^[Yy]$ ]]; then
            if command -v jq >/dev/null 2>&1; then
                jq '.enabled = true' "${YUYU_AI_CONFIG}" > "${YUYU_AI_CONFIG}.tmp" 2>/dev/null && mv "${YUYU_AI_CONFIG}.tmp" "${YUYU_AI_CONFIG}"
            else
                sed -i 's/"enabled": false/"enabled": true/' "${YUYU_AI_CONFIG}"
            fi
            echo "✅ AI Mode enabled! Try: yai \"Hello!\""
        else
            echo "Cancelled"
        fi
    else
        echo "❌ No external AI script found at ${YUYU_AI_SCRIPT}"
        echo ""
        echo "Please place your AI script (Python/Bash) at:"
        echo "  ${YUYU_AI_SCRIPT}"
        echo ""
        echo "It should accept a query as argument and output response."
        echo ""
        echo "Example Python script:"
        echo "  #!/usr/bin/env python3"
        echo "  import sys"
        echo "  print(f\"Nya~! You said: {sys.argv[1]}\")"
        echo ""
        echo "Then run: yai-setup again"
    fi
}

yai_off() {
    if command -v jq >/dev/null 2>&1; then
        jq '.enabled = false' "${YUYU_AI_CONFIG}" > "${YUYU_AI_CONFIG}.tmp" 2>/dev/null && mv "${YUYU_AI_CONFIG}.tmp" "${YUYU_AI_CONFIG}"
    else
        sed -i 's/"enabled": true/"enabled": false/' "${YUYU_AI_CONFIG}"
    fi
    echo "🐱 AI disabled. Neko Mode active! (fast, private, offline)"
}

yai_status() {
    echo "🤖 AI Status"
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

# ==================== API KEY MANAGEMENT ====================
yai_key() {
    echo "🔑 Yuyu AI Key Manager"
    echo "======================"
    echo ""
    
    local ai_script="${YUYU_AI_SCRIPT:-$HOME/.config/yuyu/bin/ai}"
    
    if [ ! -f "$ai_script" ]; then
        echo "❌ AI script not found at: $ai_script"
        echo ""
        echo "Please create AI script first:"
        echo "  mkdir -p $(dirname "$ai_script")"
        echo "  nano $ai_script"
        return 1
    fi
    
    echo "📁 Current AI script: $ai_script"
    echo ""
    
    # Show current key (partial)
    if grep -q "API_KEY" "$ai_script" 2>/dev/null; then
        local current_key=$(grep "API_KEY" "$ai_script" | head -1 | sed -n 's/.*API_KEY = "\([^"]*\).*/\1/p')
        if [ -n "$current_key" ]; then
            local partial="${current_key:0:8}********${current_key: -4}"
            echo "🔍 Current API key: $partial"
        else
            echo "⚠️ No API_KEY found in script"
        fi
        echo ""
    fi
    
    echo "Options:"
    echo "  1) Change API Key"
    echo "  2) Change AI Model"
    echo "  3) View full current key (show all)"
    echo "  4) Disable AI"
    echo "  5) Cancel"
    echo ""
    
    local choice
    echo -ne "\033[0;36mChoose (1-5): \033[0m"
    read -r choice
    
    case $choice in
        1)
            echo ""
            echo "🔑 Enter new API Key:"
            echo -ne "\033[0;36m> \033[0m"
            read -rs new_key
            echo ""
            
            if [ -z "$new_key" ]; then
                echo "❌ No key provided"
                return 1
            fi
            
            # Backup original
            local backup="${ai_script}.backup.$(date +%Y%m%d-%H%M%S)"
            cp "$ai_script" "$backup"
            echo "💾 Backup saved: $(basename "$backup")"
            
            # Update API_KEY in script
            if grep -q "API_KEY" "$ai_script"; then
                sed -i "s/API_KEY = \".*\"/API_KEY = \"$new_key\"/" "$ai_script"
                echo "✅ API Key updated!"
            else
                # Add API_KEY after imports
                sed -i "/^import/a API_KEY = \"$new_key\"" "$ai_script"
                echo "✅ API Key added to script!"
            fi
            ;;
            
        2)
            echo ""
            echo "🤖 Available models:"
            echo "  • llama3.1-8b (default)"
            echo "  • llama3-70b"
            echo "  • mixtral-8x7b"
            echo "  • gpt-3.5-turbo"
            echo "  • gpt-4"
            echo "  • custom"
            echo ""
            echo -ne "\033[0;36mEnter model name: \033[0m"
            read -r new_model
            
            if [ -z "$new_model" ]; then
                echo "❌ No model provided"
                return 1
            fi
            
            # Update config
            if command -v jq >/dev/null 2>&1; then
                jq ".model = \"$new_model\"" "${YUYU_AI_CONFIG}" > "${YUYU_AI_CONFIG}.tmp" 2>/dev/null && mv "${YUYU_AI_CONFIG}.tmp" "${YUYU_AI_CONFIG}"
            else
                sed -i "s/\"model\": \".*\"/\"model\": \"$new_model\"/" "${YUYU_AI_CONFIG}"
            fi
            
            echo "✅ Model updated to: $new_model"
            ;;
            
        3)
            echo ""
            echo "🔑 Full API Key:"
            grep "API_KEY" "$ai_script" | head -1 | sed 's/API_KEY = "\(.*\)"/\1/'
            echo ""
            echo "⚠️  Keep this key secret! Don't share it."
            ;;
            
        4)
            yai_off
            ;;
            
        *)
            echo "Cancelled"
            return 0
            ;;
    esac
    
    echo ""
    echo "🔄 Test new configuration:"
    echo "   yai \"Hello, test connection\""
}

# ==================== ALIASES ====================
alias yai="yai"
alias yai-setup="yai_setup"
alias yai-off="yai_off"
alias yai-status="yai_status"
alias yai-key="yai_key"

# Initialize
_yuyu_ai_init
export YUYU_AI_ENABLED="$(_yuyu_ai_is_enabled && echo "1" || echo "0")"

# Show AI status on load (only if enabled)
if _yuyu_ai_is_enabled && _yuyu_has_external_ai; then
    echo -e "\033[38;5;99m🤖 AI Mode: External AI ready!\033[0m"
fi
