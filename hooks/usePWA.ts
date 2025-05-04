import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWA() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [loading, setLoading] = useState(true);

  const isStandalone = () =>
    window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;

  useEffect(() => {
    const alreadySaved = localStorage.getItem("can-install-pwa") === "true";

    if (alreadySaved && !isStandalone()) {
      setCanInstall(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      localStorage.setItem("can-install-pwa", "true");
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      localStorage.removeItem("can-install-pwa");
      setCanInstall(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    setTimeout(() => {
      setLoading(false); // بعد از چند میلی‌ثانیه اجازه بده چک تمام بشه
    }, 100); // کوچیک ولی کاربردی

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt.current) {
      alert("امکان نصب در حال حاضر وجود ندارد.");
      return;
    }

    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;

    if (result.outcome === "accepted") {
      localStorage.removeItem("can-install-pwa");
      setCanInstall(false);
    }
  };

  return {
    installPWA,
    showInstallButton: !loading && canInstall && !isStandalone(),
  };
}
