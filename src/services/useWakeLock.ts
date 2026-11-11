import { useEffect } from "react";

type Sentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
};

/**
 * Keeps the screen from dimming / locking while the app is open.
 *
 * The browser drops the lock whenever the tab is hidden (app switch, screen
 * locked by hand), so it is re-acquired every time the tab becomes visible.
 * Some browsers refuse the request until the user has touched the page, so
 * the first interaction retries as well.
 */
export const useWakeLock = () => {
  useEffect(() => {
    const wakeLock = (navigator as any).wakeLock;
    if (!wakeLock) return; // unsupported browser or non-HTTPS origin

    let sentinel: Sentinel | null = null;
    let pending = false;
    let disposed = false;

    const acquire = async () => {
      if (pending || disposed) return;
      if (sentinel && !sentinel.released) return;
      if (document.visibilityState !== "visible") return;

      pending = true;
      try {
        const next: Sentinel = await wakeLock.request("screen");
        if (disposed) {
          next.release().catch(() => {});
          return;
        }
        sentinel = next;
        next.addEventListener("release", () => {
          if (sentinel === next) sentinel = null;
        });
      } catch {
        // Denied (battery saver, no user gesture yet...) - retried on the
        // next interaction / visibility change.
      } finally {
        pending = false;
      }
    };

    acquire();
    document.addEventListener("visibilitychange", acquire);
    window.addEventListener("focus", acquire);
    window.addEventListener("pageshow", acquire);
    document.addEventListener("pointerdown", acquire);
    document.addEventListener("keydown", acquire);

    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", acquire);
      window.removeEventListener("focus", acquire);
      window.removeEventListener("pageshow", acquire);
      document.removeEventListener("pointerdown", acquire);
      document.removeEventListener("keydown", acquire);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, []);
};
