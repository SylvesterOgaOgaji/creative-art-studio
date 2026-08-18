import { CONFIG, pruneBuffer, store } from "./shared.js";
import { installConsoleCapture } from "./console-capture.js";
import { installNetworkCapture } from "./network-capture.js";
import { installUiEventListeners } from "./ui-event-capture.js";

function reportLogs(originalFetch) {
    var consoleLogs = store.consoleLogs.splice(0);
    var networkRequests = store.networkRequests.splice(0);
    var uiEvents = store.uiEvents.splice(0);

    // Skip if no new data
    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return Promise.resolve();
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      // agent-friendly semantic events
      uiEvents: uiEvents,
    };

    return originalFetch(CONFIG.reportEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(function () {
      // Put data back on failure (but respect limits)
      store.consoleLogs = consoleLogs.concat(store.consoleLogs);
      store.networkRequests = networkRequests.concat(store.networkRequests);
      store.uiEvents = uiEvents.concat(store.uiEvents);

      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);
      pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
      pruneBuffer(store.uiEvents, CONFIG.bufferSize.ui);
    });
}

  // Periodic reporting
  setInterval(() => { void reportLogs(originalFetch); }, CONFIG.reportInterval);

  // Report on page unload
  window.addEventListener("beforeunload", function () {
    var consoleLogs = store.consoleLogs;
    var networkRequests = store.networkRequests;
    var uiEvents = store.uiEvents;

    if (
      consoleLogs.length === 0 &&
      networkRequests.length === 0 &&
      uiEvents.length === 0
    ) {
      return;
    }

    var payload = {
      timestamp: Date.now(),
      consoleLogs: consoleLogs,
      networkRequests: networkRequests,
      // Mirror uiEvents to sessionEvents for sessionReplay.log
      sessionEvents: uiEvents,
      uiEvents: uiEvents,
    };

    if (navigator.sendBeacon) {
      var payloadStr = JSON.stringify(payload);
      // sendBeacon has ~64KB limit, truncate if too large
      var MAX_BEACON_SIZE = 60000; // Leave some margin
      if (payloadStr.length > MAX_BEACON_SIZE) {
        // Prioritize: keep recent events, drop older logs
        var truncatedPayload = {
          timestamp: Date.now(),
          consoleLogs: consoleLogs.slice(-50),
          networkRequests: networkRequests.slice(-20),
          sessionEvents: uiEvents.slice(-100),
          uiEvents: uiEvents.slice(-100),
          _truncated: true,
        };
        payloadStr = JSON.stringify(truncatedPayload);
      }
      navigator.sendBeacon(CONFIG.reportEndpoint, payloadStr);
    }
  });

installConsoleCapture();
const originalFetch = installNetworkCapture();

try {
  installUiEventListeners();
} catch (error) {
  console.warn("[Manus] Failed to install UI listeners:", error);
}

window.__MANUS_DEBUG_COLLECTOR__ = {
  version: "2.1-modular",
  store,
  forceReport: () => reportLogs(originalFetch),
};

console.debug("[Manus] Debug collector initialized (modular, no rrweb)");
