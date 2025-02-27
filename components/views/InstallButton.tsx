"use client";

import { usePWA } from "@/hooks/usePWA";

export default function InstallButton() {
  const { installPWA, deferredPrompt, isInstalled } = usePWA();

  if (isInstalled || !deferredPrompt) return null; // اگر نصب شده یا امکان نصب نیست، دکمه نمایش داده نشود.

  return (
    <button 
      onClick={installPWA} 
      className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg"
    >
      نصب PWA 📲
    </button>
  );
}
