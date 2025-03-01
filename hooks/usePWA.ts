import { useEffect, useState } from "react";

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<any>(false);

  useEffect(() => {
    const checkInstallation = () => {
      // بررسی وضعیت نصب PWA
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const navigatorStandalone = "standalone" in window.navigator && window.navigator.standalone;
      setIsInstalled(standalone || navigatorStandalone);
    };

    const handleBeforeInstallPrompt = (event:any) => {
      event.preventDefault();
      setDeferredPrompt(event);
      localStorage.setItem("deferredPrompt", "true"); // ذخیره در localStorage برای حفظ بعد از رفرش
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.removeItem("deferredPrompt");
    };

    // چک کردن نصب PWA بعد از هر رفرش
    checkInstallation();

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("visibilitychange", checkInstallation); // چک در هنگام تغییر وضعیت تب

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("visibilitychange", checkInstallation);
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
