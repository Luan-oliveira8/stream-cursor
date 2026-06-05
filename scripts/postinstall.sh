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

    # Restart StreamCursor if it was running
    SC_PID=$(pgrep -u "$USERNAME" -x "stream-cursor" -o 2>/dev/null)
    if [ -n "$SC_PID" ]; then
        kill "$SC_PID" 2>/dev/null
        sleep 1
        kill -0 "$SC_PID" 2>/dev/null && kill -9 "$SC_PID" 2>/dev/null
        DISPLAY_VAL=$(cat /proc/"$SC_PID"/environ 2>/dev/null | tr '\0' '\n' | grep ^DISPLAY= | cut -d= -f2)
        [ -z "$DISPLAY_VAL" ] && DISPLAY_VAL=":0"
        sudo -u "$USERNAME" DISPLAY="$DISPLAY_VAL" XAUTHORITY="$USER_HOME/.Xauthority" nohup /opt/StreamCursor/stream-cursor --hidden > /dev/null 2>&1 &
        disown
    fi
done

exit 0
