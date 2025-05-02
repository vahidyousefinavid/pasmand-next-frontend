// "use client";

// import { useEffect, useState } from "react";
// import { usePWA } from "@/hooks/usePWA";

// export default function InstallButton() {
//   const { installPWA, deferredPrompt, isInstalled } = usePWA();
//   const [shouldShow, setShouldShow] = useState(false);

//   useEffect(() => {
//     if (!isInstalled && deferredPrompt) {
//       setShouldShow(true);
//     }
//   }, [isInstalled, deferredPrompt]);

//   if (!shouldShow) return null;

//   return (
//     <button
//       onClick={() => {
//         installPWA();
//         setShouldShow(false); // بعد از کلیک، دکمه مخفی شود
//       }}
//       className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg animate-bounce"
//     >
//       نصب PWA 📲
//     </button>
//   );
// }

"use client";

import { usePWA } from "@/hooks/usePWA";

export default function InstallButton() {
  const { installPWA, showInstallButton } = usePWA();

  if (!showInstallButton) return null;

  const canInstall = typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches === false;

  return (
    <button
      onClick={installPWA}
      disabled={!canInstall}
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
        canInstall
          ? "bg-green-600 text-white animate-bounce"
          : "bg-gray-400 text-white cursor-not-allowed"
      }`}
    >
      {canInstall ? "نصب PWA 📲" : "نصب در حال حاضر ممکن نیست"}
    </button>
  );
}
