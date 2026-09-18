/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./worker/index.js":
/*!*************************!*\
  !*** ./worker/index.js ***!
  \*************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

eval(__webpack_require__.ts("/**\n * The push half of the service worker.\n *\n * next-pwa builds the caching worker from workbox and importScripts this file\n * into it, so everything push-related lives here rather than in generated code.\n *\n * The server (Utils/Notify.js) sends { title, body, url }. `url` is the screen\n * the notification is about — an accepted request goes to /history, a message\n * goes to the same place — and tapping the notification has to land there, otherwise\n * the citizen gets told something happened and then has to go find it.\n */ self.addEventListener(\"push\", (event)=>{\n    let payload = {};\n    try {\n        payload = event.data ? event.data.json() : {};\n    } catch  {\n        // A push whose body is not JSON is still worth showing.\n        payload = {\n            body: event.data ? event.data.text() : \"\"\n        };\n    }\n    const title = payload.title || \"شهر شهر\";\n    const url = payload.url || \"/\";\n    event.waitUntil(self.registration.showNotification(title, {\n        body: payload.body || \"\",\n        icon: payload.icon || \"/icons/icon-192.png\",\n        badge: \"/icons/icon-128.png\",\n        dir: \"rtl\",\n        lang: \"fa\",\n        // Same tag replaces an unread notification about the same screen instead\n        // of stacking five of them while the phone is in a pocket.\n        tag: url,\n        renotify: true,\n        data: {\n            url\n        }\n    }));\n});\nself.addEventListener(\"notificationclick\", (event)=>{\n    event.notification.close();\n    const target = event.notification.data && event.notification.data.url || \"/\";\n    event.waitUntil(self.clients.matchAll({\n        type: \"window\",\n        includeUncontrolled: true\n    }).then((list)=>{\n        // Reuse a tab that is already on this origin — the old code compared the\n        // full href to \"/\" and so never matched, opening a new window every time.\n        for (const client of list){\n            if (client.url.startsWith(self.location.origin) && \"focus\" in client) {\n                if (\"navigate\" in client) client.navigate(target).catch(()=>{});\n                return client.focus();\n            }\n        }\n        if (self.clients.openWindow) return self.clients.openWindow(target);\n        return undefined;\n    }));\n});\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                /* unsupported import.meta.webpackHot */ undefined.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi93b3JrZXIvaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Q0FVQyxHQUVEQSxLQUFLQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUNDO0lBQzdCLElBQUlDLFVBQVUsQ0FBQztJQUNmLElBQUk7UUFDRkEsVUFBVUQsTUFBTUUsSUFBSSxHQUFHRixNQUFNRSxJQUFJLENBQUNDLElBQUksS0FBSyxDQUFDO0lBQzlDLEVBQUUsT0FBTTtRQUNOLHdEQUF3RDtRQUN4REYsVUFBVTtZQUFFRyxNQUFNSixNQUFNRSxJQUFJLEdBQUdGLE1BQU1FLElBQUksQ0FBQ0csSUFBSSxLQUFLO1FBQUc7SUFDeEQ7SUFFQSxNQUFNQyxRQUFRTCxRQUFRSyxLQUFLLElBQUk7SUFDL0IsTUFBTUMsTUFBTU4sUUFBUU0sR0FBRyxJQUFJO0lBRTNCUCxNQUFNUSxTQUFTLENBQ2JWLEtBQUtXLFlBQVksQ0FBQ0MsZ0JBQWdCLENBQUNKLE9BQU87UUFDeENGLE1BQU1ILFFBQVFHLElBQUksSUFBSTtRQUN0Qk8sTUFBTVYsUUFBUVUsSUFBSSxJQUFJO1FBQ3RCQyxPQUFPO1FBQ1BDLEtBQUs7UUFDTEMsTUFBTTtRQUNOLHlFQUF5RTtRQUN6RSwyREFBMkQ7UUFDM0RDLEtBQUtSO1FBQ0xTLFVBQVU7UUFDVmQsTUFBTTtZQUFFSztRQUFJO0lBQ2Q7QUFFSjtBQUVBVCxLQUFLQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQ0M7SUFDMUNBLE1BQU1pQixZQUFZLENBQUNDLEtBQUs7SUFFeEIsTUFBTUMsU0FBUyxNQUFPRixZQUFZLENBQUNmLElBQUksSUFBSUYsTUFBTWlCLFlBQVksQ0FBQ2YsSUFBSSxDQUFDSyxHQUFHLElBQUs7SUFFM0VQLE1BQU1RLFNBQVMsQ0FDYlYsS0FBS3NCLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDO1FBQUVDLE1BQU07UUFBVUMscUJBQXFCO0lBQUssR0FBR0MsSUFBSSxDQUFDLENBQUNDO1FBQ3pFLHlFQUF5RTtRQUN6RSwwRUFBMEU7UUFDMUUsS0FBSyxNQUFNQyxVQUFVRCxLQUFNO1lBQ3pCLElBQUlDLE9BQU9uQixHQUFHLENBQUNvQixVQUFVLENBQUM3QixLQUFLOEIsUUFBUSxDQUFDQyxNQUFNLEtBQUssV0FBV0gsUUFBUTtnQkFDcEUsSUFBSSxjQUFjQSxRQUFRQSxPQUFPSSxRQUFRLENBQUNYLFFBQVFZLEtBQUssQ0FBQyxLQUFPO2dCQUMvRCxPQUFPTCxPQUFPTSxLQUFLO1lBQ3JCO1FBQ0Y7UUFDQSxJQUFJbEMsS0FBS3NCLE9BQU8sQ0FBQ2EsVUFBVSxFQUFFLE9BQU9uQyxLQUFLc0IsT0FBTyxDQUFDYSxVQUFVLENBQUNkO1FBQzVELE9BQU9lO0lBQ1Q7QUFFSiIsInNvdXJjZXMiOlsid2VicGFjazovL19OX0UvLi93b3JrZXIvaW5kZXguanM/ODA1ZSJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBwdXNoIGhhbGYgb2YgdGhlIHNlcnZpY2Ugd29ya2VyLlxuICpcbiAqIG5leHQtcHdhIGJ1aWxkcyB0aGUgY2FjaGluZyB3b3JrZXIgZnJvbSB3b3JrYm94IGFuZCBpbXBvcnRTY3JpcHRzIHRoaXMgZmlsZVxuICogaW50byBpdCwgc28gZXZlcnl0aGluZyBwdXNoLXJlbGF0ZWQgbGl2ZXMgaGVyZSByYXRoZXIgdGhhbiBpbiBnZW5lcmF0ZWQgY29kZS5cbiAqXG4gKiBUaGUgc2VydmVyIChVdGlscy9Ob3RpZnkuanMpIHNlbmRzIHsgdGl0bGUsIGJvZHksIHVybCB9LiBgdXJsYCBpcyB0aGUgc2NyZWVuXG4gKiB0aGUgbm90aWZpY2F0aW9uIGlzIGFib3V0IOKAlCBhbiBhY2NlcHRlZCByZXF1ZXN0IGdvZXMgdG8gL2hpc3RvcnksIGEgbWVzc2FnZVxuICogZ29lcyB0byB0aGUgc2FtZSBwbGFjZSDigJQgYW5kIHRhcHBpbmcgdGhlIG5vdGlmaWNhdGlvbiBoYXMgdG8gbGFuZCB0aGVyZSwgb3RoZXJ3aXNlXG4gKiB0aGUgY2l0aXplbiBnZXRzIHRvbGQgc29tZXRoaW5nIGhhcHBlbmVkIGFuZCB0aGVuIGhhcyB0byBnbyBmaW5kIGl0LlxuICovXG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcigncHVzaCcsIChldmVudCkgPT4ge1xuICBsZXQgcGF5bG9hZCA9IHt9O1xuICB0cnkge1xuICAgIHBheWxvYWQgPSBldmVudC5kYXRhID8gZXZlbnQuZGF0YS5qc29uKCkgOiB7fTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gQSBwdXNoIHdob3NlIGJvZHkgaXMgbm90IEpTT04gaXMgc3RpbGwgd29ydGggc2hvd2luZy5cbiAgICBwYXlsb2FkID0geyBib2R5OiBldmVudC5kYXRhID8gZXZlbnQuZGF0YS50ZXh0KCkgOiAnJyB9O1xuICB9XG5cbiAgY29uc3QgdGl0bGUgPSBwYXlsb2FkLnRpdGxlIHx8ICfYtNmH2LEg2LTZh9ixJztcbiAgY29uc3QgdXJsID0gcGF5bG9hZC51cmwgfHwgJy8nO1xuXG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBzZWxmLnJlZ2lzdHJhdGlvbi5zaG93Tm90aWZpY2F0aW9uKHRpdGxlLCB7XG4gICAgICBib2R5OiBwYXlsb2FkLmJvZHkgfHwgJycsXG4gICAgICBpY29uOiBwYXlsb2FkLmljb24gfHwgJy9pY29ucy9pY29uLTE5Mi5wbmcnLFxuICAgICAgYmFkZ2U6ICcvaWNvbnMvaWNvbi0xMjgucG5nJyxcbiAgICAgIGRpcjogJ3J0bCcsXG4gICAgICBsYW5nOiAnZmEnLFxuICAgICAgLy8gU2FtZSB0YWcgcmVwbGFjZXMgYW4gdW5yZWFkIG5vdGlmaWNhdGlvbiBhYm91dCB0aGUgc2FtZSBzY3JlZW4gaW5zdGVhZFxuICAgICAgLy8gb2Ygc3RhY2tpbmcgZml2ZSBvZiB0aGVtIHdoaWxlIHRoZSBwaG9uZSBpcyBpbiBhIHBvY2tldC5cbiAgICAgIHRhZzogdXJsLFxuICAgICAgcmVub3RpZnk6IHRydWUsXG4gICAgICBkYXRhOiB7IHVybCB9LFxuICAgIH0pLFxuICApO1xufSk7XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbm90aWZpY2F0aW9uY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgZXZlbnQubm90aWZpY2F0aW9uLmNsb3NlKCk7XG5cbiAgY29uc3QgdGFyZ2V0ID0gKGV2ZW50Lm5vdGlmaWNhdGlvbi5kYXRhICYmIGV2ZW50Lm5vdGlmaWNhdGlvbi5kYXRhLnVybCkgfHwgJy8nO1xuXG4gIGV2ZW50LndhaXRVbnRpbChcbiAgICBzZWxmLmNsaWVudHMubWF0Y2hBbGwoeyB0eXBlOiAnd2luZG93JywgaW5jbHVkZVVuY29udHJvbGxlZDogdHJ1ZSB9KS50aGVuKChsaXN0KSA9PiB7XG4gICAgICAvLyBSZXVzZSBhIHRhYiB0aGF0IGlzIGFscmVhZHkgb24gdGhpcyBvcmlnaW4g4oCUIHRoZSBvbGQgY29kZSBjb21wYXJlZCB0aGVcbiAgICAgIC8vIGZ1bGwgaHJlZiB0byBcIi9cIiBhbmQgc28gbmV2ZXIgbWF0Y2hlZCwgb3BlbmluZyBhIG5ldyB3aW5kb3cgZXZlcnkgdGltZS5cbiAgICAgIGZvciAoY29uc3QgY2xpZW50IG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKGNsaWVudC51cmwuc3RhcnRzV2l0aChzZWxmLmxvY2F0aW9uLm9yaWdpbikgJiYgJ2ZvY3VzJyBpbiBjbGllbnQpIHtcbiAgICAgICAgICBpZiAoJ25hdmlnYXRlJyBpbiBjbGllbnQpIGNsaWVudC5uYXZpZ2F0ZSh0YXJnZXQpLmNhdGNoKCgpID0+IHt9KTtcbiAgICAgICAgICByZXR1cm4gY2xpZW50LmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzZWxmLmNsaWVudHMub3BlbldpbmRvdykgcmV0dXJuIHNlbGYuY2xpZW50cy5vcGVuV2luZG93KHRhcmdldCk7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0pLFxuICApO1xufSk7XG4iXSwibmFtZXMiOlsic2VsZiIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInBheWxvYWQiLCJkYXRhIiwianNvbiIsImJvZHkiLCJ0ZXh0IiwidGl0bGUiLCJ1cmwiLCJ3YWl0VW50aWwiLCJyZWdpc3RyYXRpb24iLCJzaG93Tm90aWZpY2F0aW9uIiwiaWNvbiIsImJhZGdlIiwiZGlyIiwibGFuZyIsInRhZyIsInJlbm90aWZ5Iiwibm90aWZpY2F0aW9uIiwiY2xvc2UiLCJ0YXJnZXQiLCJjbGllbnRzIiwibWF0Y2hBbGwiLCJ0eXBlIiwiaW5jbHVkZVVuY29udHJvbGxlZCIsInRoZW4iLCJsaXN0IiwiY2xpZW50Iiwic3RhcnRzV2l0aCIsImxvY2F0aW9uIiwib3JpZ2luIiwibmF2aWdhdGUiLCJjYXRjaCIsImZvY3VzIiwib3BlbldpbmRvdyIsInVuZGVmaW5lZCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./worker/index.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	!function() {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = function() {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: function(script) { return script; }
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	!function() {
/******/ 		__webpack_require__.ts = function(script) { return __webpack_require__.tt().createScript(script); };
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	!function() {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push(function(options) {
/******/ 			var originalFactory = options.factory;
/******/ 			options.factory = function(moduleObject, moduleExports, webpackRequire) {
/******/ 				var hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				var cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : function() {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval-source-map devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./worker/index.js");
/******/ 	
/******/ })()
;