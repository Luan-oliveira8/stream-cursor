import log from "electron-log";

let autoLauncher: any = null;

async function getAutoLauncher() {
  if (!autoLauncher) {
    const AutoLaunch = (await import("auto-launch")).default;
    autoLauncher = new AutoLaunch({
      name: "StreamCursor",
      path: process.execPath,
      isHidden: true,
    });
  }
  return autoLauncher;
}

export async function setAutostart(enabled: boolean): Promise<void> {
  try {
    const launcher = await getAutoLauncher();
    if (enabled) {
      await launcher.enable();
      log.info("Autostart enabled");
    } else {
      await launcher.disable();
      log.info("Autostart disabled");
    }
  } catch (e) {
    log.error("Failed to set autostart:", e);
  }
}

export async function isAutostartEnabled(): Promise<boolean> {
  try {
    const launcher = await getAutoLauncher();
    return await launcher.isEnabled();
  } catch (e) {
    log.error("Failed to check autostart:", e);
    return false;
  }
}
