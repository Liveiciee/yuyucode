# ================================================
# Zoxide - Smart Directory Jumper
# ================================================

if command -v zoxide >/dev/null 2>&1; then
    eval "$(zoxide init bash)"
    
    # Enhanced cd with zoxide
    alias cd="z"
    alias cdi="zi"  # Interactive
    
    _neko_info "Zoxide loaded! Try: cd project_name (jump anywhere!)"
else
    _neko_warn "zoxide not installed. Install: cargo install zoxide or pkg install zoxide"
    
    # Fallback to simple cd
    alias cdi="cd"
fi
