import { useEffect, useRef, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWA() {
  const [showInstallButton, setShowInstallButton] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const alreadyPrompted = localStorage.getItem("pwa-install-prompt") === "true";
    if (alreadyPrompted) setShowInstallButton(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      localStorage.setItem("pwa-install-prompt", "true");
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt.current = null;
      localStorage.removeItem("pwa-install-prompt");
      setShowInstallButton(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt.current) {
      alert("در حال حاضر امکان نصب وجود ندارد.");
      return;
    }

    deferredPrompt.current.prompt();
    const result = await deferredPrompt.current.userChoice;

    if (result.outcome === "accepted") {
      localStorage.removeItem("pwa-install-prompt");
      setShowInstallButton(false);
    }
  };

  return {
    installPWA,
    showInstallButton,
  };
}
