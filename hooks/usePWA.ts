import { useEffect, useState } from "react";

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("deferredPrompt") as any) : null
  );
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event:any) => {
      event.preventDefault();
      console.log("beforeinstallprompt event fired");
      setDeferredPrompt(event);
      localStorage.setItem("deferredPrompt", JSON.stringify(true)); // ذخیره در localStorage
    };

    const handleAppInstalled = () => {
      console.log("PWA installed");
      setIsInstalled(true);
      localStorage.removeItem("deferredPrompt"); // پاک کردن از localStorage بعد از نصب
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
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
