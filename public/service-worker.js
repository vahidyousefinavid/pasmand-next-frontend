self.addEventListener("install", (e) => {
    console.log("Service Worker installed");
  });
  
  self.addEventListener("activate", (e) => {
    console.log("Service Worker activated");
  });
  
  self.addEventListener("fetch", (event) => {
    // می‌تونی کش بزاری اینجا اگر خواستی
  });
  