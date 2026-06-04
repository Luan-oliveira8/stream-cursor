#!/bin/bash
# Copy desktop shortcut to each user's desktop after .deb install
DESKTOP_FILE="/usr/share/applications/stream-cursor.desktop"

for USER_HOME in /home/*; do
    [ -d "$USER_HOME" ] || continue
    USERNAME=$(basename "$USER_HOME")
    id "$USERNAME" &>/dev/null || continue

    DESKTOP_DIR=$(sudo -u "$USERNAME" xdg-user-dir DESKTOP 2>/dev/null)
    if [ -n "$DESKTOP_DIR" ] && [ -d "$DESKTOP_DIR" ]; then
        cp "$DESKTOP_FILE" "$DESKTOP_DIR/stream-cursor.desktop"
        chmod +x "$DESKTOP_DIR/stream-cursor.desktop"
        chown "$USERNAME:$USERNAME" "$DESKTOP_DIR/stream-cursor.desktop"
    fi
done

exit 0
