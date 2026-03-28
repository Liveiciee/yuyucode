# ================================================
# Fuzzy Finder Integration
# ================================================

if command -v fzf >/dev/null 2>&1; then
    # FZF Configuration
    export FZF_DEFAULT_OPTS="--height 40% --layout=reverse --border --info=inline --color=fg:#d0d0d0,fg+:#ffffff,bg+:#2a2a2a,hl:#ff87af,hl+:#ff5f87,info:#af87ff,prompt:#5f87ff,pointer:#ff87af,marker:#ff87af,spinner:#af87ff"
    
    # Better file search
    export FZF_DEFAULT_COMMAND="fd --type f --hidden --follow --exclude .git 2>/dev/null || find . -type f 2>/dev/null"
    export FZF_CTRL_T_COMMAND="${FZF_DEFAULT_COMMAND}"
    
    # History search with preview
    export FZF_CTRL_R_OPTS="--preview 'echo {}' --preview-window down:3:hidden:wrap --bind '?:toggle-preview'"
    
    # Custom commands
    y_find() {
        local pattern="$1"
        if [[ -z "${pattern}" ]]; then
            _neko_error "Usage: yfind <pattern>"
            return 1
        fi
        find . -type f -name "*${pattern}*" 2>/dev/null | fzf --preview 'head -50 {}'
    }
    
    y_history() {
        history | fzf --tac --no-sort --preview 'echo {}' | sed 's/^[0-9 ]*//' | bash
    }
    
    y_kill() {
        ps aux | fzf --header='Kill Process' | awk '{print $2}' | xargs kill -9 2>/dev/null
    }
    
    alias yf="y_find"
    alias yh="y_history"
    alias yk="y_kill"
    
    # Enhanced CTRL+R
    bind '"\C-r": "\C-e \C-u y_history\n"'
    
    _neko_info "FZF loaded! Try: yf (find files), yh (history), yk (kill process)"
else
    _neko_warn "fzf not installed. Install: pkg install fzf (Termux) or brew install fzf (macOS)"
fi
