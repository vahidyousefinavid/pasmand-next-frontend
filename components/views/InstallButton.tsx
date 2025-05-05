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
  const { installPWA, showInstallButton, canPromptInstall } = usePWA();

  if (!showInstallButton) return null;

  return (
    <button
      onClick={() => {
        if (!canPromptInstall) {
          alert("لطفاً چند لحظه صبر کنید تا امکان نصب فعال شود.");
        } else {
          installPWA();
        }
      }}
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300 ${
        canPromptInstall ? "bg-green-600 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
      }`}
      disabled={!canPromptInstall}
    >
      نصب اپلیکیشن 📲
    </button>
  );
}
