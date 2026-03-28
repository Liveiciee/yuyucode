#!/usr/bin/env bash
# Install Yuyu-Shell from source

echo "🐱 Installing Yuyu-Shell..."

# Create target directory
mkdir -p ~/.config/yuyu

# Copy all files
cp -r $(dirname "$0")/* ~/.config/yuyu/

# Make scripts executable
chmod +x ~/.config/yuyu/bin/* 2>/dev/null

echo "✅ Installation complete!"
echo "🔄 Run: source ~/.bashrc"
