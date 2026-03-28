#!/usr/bin/env bash
# ================================================
# Yuyu-Shell Installer
# One-liner: curl -sL https://raw.githubusercontent.com/yourname/yuyucode/main/shell/install.sh | bash
# ================================================

set -e

echo "🐱 Installing Yuyu-Shell v6.0..."

# Copy files
mkdir -p ~/.config/yuyu
cp -r core/ modules/ plugins/ themes/ conf.d/ bin/ ~/.config/yuyu/ 2>/dev/null || true

# Create init.sh
cat > ~/.config/yuyu/init.sh << 'INIT'
#!/usr/bin/env bash
YUYU_HOME="$HOME/.config/yuyu"
source "$YUYU_HOME/core/init.sh"
INIT

# Add to .bashrc
if ! grep -q "YUYU_HOME" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Yuyu-Shell v6.0" >> ~/.bashrc
    echo "export YUYU_HOME=\"\$HOME/.config/yuyu\"" >> ~/.bashrc
    echo "source \"\$YUYU_HOME/init.sh\"" >> ~/.bashrc
fi

echo "✅ Installation complete!"
echo "🔄 Please restart your terminal or run: source ~/.bashrc"
