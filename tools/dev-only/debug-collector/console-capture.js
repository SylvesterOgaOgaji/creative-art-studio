import { formatArgs, logUiEvent, pruneBuffer, store } from "./shared.js";

export function installConsoleCapture() {
  var originalConsole = {
    log: console.log.bind(console),
    debug: console.debug.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  ["log", "debug", "info", "warn", "error"].forEach(function (method) {
    console[method] = function () {
      var args = Array.prototype.slice.call(arguments);

      var entry = {
        timestamp: Date.now(),
        level: method.toUpperCase(),
        args: formatArgs(args),
        stack: method === "error" ? new Error().stack : null,
      };

      store.consoleLogs.push(entry);
      pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

      originalConsole[method].apply(console, args);
    };
  });

  window.addEventListener("error", function (event) {
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UncaughtError",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error ? event.error.stack : null,
        },
      ],
      stack: event.error ? event.error.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    // Mark an error moment in UI event stream for agents
    logUiEvent("error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    store.consoleLogs.push({
      timestamp: Date.now(),
      level: "ERROR",
      args: [
        {
          type: "UnhandledRejection",
          reason: reason && reason.message ? reason.message : String(reason),
          stack: reason && reason.stack ? reason.stack : null,
        },
      ],
      stack: reason && reason.stack ? reason.stack : null,
    });
    pruneBuffer(store.consoleLogs, CONFIG.bufferSize.console);

    logUiEvent("unhandledrejection", {
      reason: reason && reason.message ? reason.message : String(reason),
    });
  });

}
