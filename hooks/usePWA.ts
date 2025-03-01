import { useEffect, useState } from "react";

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const checkInstallation = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const navigatorStandalone = "standalone" in window.navigator && (window.navigator as any).standalone;
      setIsInstalled(standalone || navigatorStandalone);
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      localStorage.setItem("deferredPrompt", "true");
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.removeItem("deferredPrompt");
    };

    // بررسی وضعیت نصب بعد از هر بار باز شدن صفحه
    checkInstallation();

    // اگر مقدار `deferredPrompt` قبلاً ذخیره شده باشد، دوباره فعالش کنیم
    if (localStorage.getItem("deferredPrompt")) {
      setDeferredPrompt({} as Event); // مقدار فیک برای نمایش دوباره دکمه
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("visibilitychange", checkInstallation);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("visibilitychange", checkInstallation);
    };
  }, []);

  const installPWA = async () => {
    if ((window.navigator as any).standalone) {
      console.log("App is already installed.");
      return;
    }
  
    if ((window as any).matchMedia("(display-mode: standalone)").matches) {
      console.log("PWA is already running in standalone mode.");
      return;
    }
  
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      setDeferredPrompt(null);
    }
  };

  return { installPWA, isInstalled, deferredPrompt };
}
