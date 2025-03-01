"use client";

import { usePWA } from "@/hooks/usePWA";

export default function InstallButton() {
  const { installPWA, deferredPrompt, isInstalled } = usePWA();

  // اگر PWA نصب شده باشد، ولی دکمه نمایش داده نشده باشد، دوباره بررسی کنیم
  if (isInstalled || !deferredPrompt) return null;

  return (
    <button 
      onClick={installPWA} 
      className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg animate-bounce"
    >
      نصب PWA 📲
    </button>
  );
}
