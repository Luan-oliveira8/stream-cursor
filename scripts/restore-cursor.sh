#!/bin/bash
# StreamCursor - Restore system cursor if it was hidden and the app crashed
# Usage: bash restore-cursor.sh

echo "Restoring system cursor..."

# Method 1: Use xfixes via xdotool if available
if command -v xdotool &> /dev/null; then
    xdotool key --clearmodifiers Escape
    echo "Sent escape key to reset cursor"
fi

# Method 2: Reset cursor theme to force redraw
if command -v gsettings &> /dev/null; then
    CURRENT_THEME=$(gsettings get org.gnome.desktop.interface cursor-theme 2>/dev/null)
    if [ -n "$CURRENT_THEME" ]; then
        gsettings set org.gnome.desktop.interface cursor-theme 'default'
        sleep 0.2
        gsettings set org.gnome.desktop.interface cursor-theme "$CURRENT_THEME"
        echo "Cursor theme reset to $CURRENT_THEME"
    fi
fi

# Method 3: Use our native addon directly
ADDON_PATH="$(dirname "$0")/../build/Release/x11_addon.node"
if [ -f "$ADDON_PATH" ]; then
    node -e "
      const addon = require('$ADDON_PATH');
      addon.init();
      addon.showCursor();
      addon.cleanup();
      console.log('Cursor restored via native addon');
    " 2>/dev/null
fi

echo "Done. If cursor is still hidden, try logging out and back in."
