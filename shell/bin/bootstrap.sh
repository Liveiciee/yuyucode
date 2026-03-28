#!/usr/bin/env bash
# ================================================
# Yuyu-Shell Bootstrap Installer
# One-liner: curl -sL https://raw.githubusercontent.com/yourname/yuyu/main/bootstrap.sh | bash
# ================================================

echo "🐱 Installing Yuyu-Shell v6.0..."

# Create directories
mkdir -p ~/.config/yuyu/{modules,plugins,themes,conf.d,bin,.cache,logs}

# Copy files from current installation if exists
if [[ -d "$(dirname "${BASH_SOURCE[0]}")/.." ]]; then
    cp -r "$(dirname "${BASH_SOURCE[0]}")/.."/* ~/.config/yuyu/
fi

# Add to .bashrc if not already there
if ! grep -q "YUYU_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Yuyu-Shell v6.0 - The Galactic Neko" >> ~/.bashrc
    echo "export YUYU_HOME=\"\$HOME/.config/yuyu\"" >> ~/.bashrc
    echo "export YUYU_LOADED=0" >> ~/.bashrc
    echo "[ -f \"\$YUYU_HOME/init.sh\" ] && source \"\$YUYU_HOME/init.sh\"" >> ~/.bashrc
fi

echo "✅ Installation complete!"
echo "🔄 Please restart your terminal or run: source ~/.bashrc"
