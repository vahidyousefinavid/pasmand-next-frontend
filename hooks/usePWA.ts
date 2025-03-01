import { useEffect, useState } from "react";

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
    };

    const handleBeforeInstallPrompt = (event:any) => {
      event.preventDefault();
      setDeferredPrompt(event);
      localStorage.setItem("deferredPrompt", JSON.stringify(true));
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.removeItem("deferredPrompt");
    };

    // بررسی نصب برنامه
    checkInstalled();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("visibilitychange", checkInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("visibilitychange", checkInstalled);
    };
  }, []);

  const installPWA = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult:any) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted PWA install");
        } else {
          console.log("User dismissed PWA install");
        }
        setDeferredPrompt(null);
        localStorage.removeItem("deferredPrompt");
      });
    }
  };

  return { installPWA, deferredPrompt, isInstalled };
}
