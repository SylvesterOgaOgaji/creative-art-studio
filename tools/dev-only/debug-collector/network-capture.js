import {
  CONFIG,
  logUiEvent,
  pruneBuffer,
  sanitizeValue,
  store,
  tryParseJson,
} from "./shared.js";

export function installNetworkCapture() {
  var originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    init = init || {};
    var startTime = Date.now();
    // Handle string, Request object, or URL object
    var url = typeof input === "string"
      ? input
      : (input && (input.url || input.href || String(input))) || "";
    var method = init.method || (input && input.method) || "GET";

    // Don't intercept internal requests
    if (url.indexOf("/__manus__/") === 0) {
      return originalFetch(input, init);
    }

    // Safely parse headers (avoid breaking if headers format is invalid)
    var requestHeaders = {};
    try {
      if (init.headers) {
        requestHeaders = Object.fromEntries(new Headers(init.headers).entries());
      }
    } catch (e) {
      requestHeaders = { _parseError: true };
    }

    var entry = {
      timestamp: startTime,
      type: "fetch",
      method: method.toUpperCase(),
      url: url,
      request: {
        headers: requestHeaders,
        body: init.body ? sanitizeValue(tryParseJson(init.body)) : null,
      },
      response: null,
      duration: null,
      error: null,
    };

    return originalFetch(input, init)
      .then(function (response) {
        entry.duration = Date.now() - startTime;

        var contentType = (response.headers.get("content-type") || "").toLowerCase();
        var contentLength = response.headers.get("content-length");

        entry.response = {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: null,
        };

        // Semantic network hint for agents on failures (sync, no need to wait for body)
        if (response.status >= 400) {
          logUiEvent("network_error", {
            kind: "fetch",
            method: entry.method,
            url: entry.url,
            status: response.status,
            statusText: response.statusText,
          });
        }

        // Skip body capture for streaming responses (SSE, etc.) to avoid memory leaks
        var isStreaming = contentType.indexOf("text/event-stream") !== -1 ||
                          contentType.indexOf("application/stream") !== -1 ||
                          contentType.indexOf("application/x-ndjson") !== -1;
        if (isStreaming) {
          entry.response.body = "[Streaming response - not captured]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // Skip body capture for large responses to avoid memory issues
        if (contentLength && parseInt(contentLength, 10) > CONFIG.maxBodyLength) {
          entry.response.body = "[Response too large: " + contentLength + " bytes]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // Skip body capture for binary content types
        var isBinary = contentType.indexOf("image/") !== -1 ||
                       contentType.indexOf("video/") !== -1 ||
                       contentType.indexOf("audio/") !== -1 ||
                       contentType.indexOf("application/octet-stream") !== -1 ||
                       contentType.indexOf("application/pdf") !== -1 ||
                       contentType.indexOf("application/zip") !== -1;
        if (isBinary) {
          entry.response.body = "[Binary content: " + contentType + "]";
          store.networkRequests.push(entry);
          pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          return response;
        }

        // For text responses, clone and read body in background
        var clonedResponse = response.clone();

        // Async: read body in background, don't block the response
        clonedResponse
          .text()
          .then(function (text) {
            if (text.length <= CONFIG.maxBodyLength) {
              entry.response.body = sanitizeValue(tryParseJson(text));
            } else {
              entry.response.body = text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
            }
          })
          .catch(function () {
            entry.response.body = "[Unable to read body]";
          })
          .finally(function () {
            store.networkRequests.push(entry);
            pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);
          });

        // Return response immediately, don't wait for body reading
        return response;
      })
      .catch(function (error) {
        entry.duration = Date.now() - startTime;
        entry.error = { message: error.message, stack: error.stack };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        logUiEvent("network_error", {
          kind: "fetch",
          method: entry.method,
          url: entry.url,
          message: error.message,
        });

        throw error;
      });
  };

  // ==========================================================================
  // XHR Interception
  // ==========================================================================

  var originalXHROpen = XMLHttpRequest.prototype.open;
  var originalXHRSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._manusData = {
      method: (method || "GET").toUpperCase(),
      url: url,
      startTime: null,
    };
    return originalXHROpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    var xhr = this;

    if (
      xhr._manusData &&
      xhr._manusData.url &&
      xhr._manusData.url.indexOf("/__manus__/") !== 0
    ) {
      xhr._manusData.startTime = Date.now();
      xhr._manusData.requestBody = body ? sanitizeValue(tryParseJson(body)) : null;

      xhr.addEventListener("load", function () {
        var contentType = (xhr.getResponseHeader("content-type") || "").toLowerCase();
        var responseBody = null;

        // Skip body capture for streaming responses
        var isStreaming = contentType.indexOf("text/event-stream") !== -1 ||
                          contentType.indexOf("application/stream") !== -1 ||
                          contentType.indexOf("application/x-ndjson") !== -1;

        // Skip body capture for binary content types
        var isBinary = contentType.indexOf("image/") !== -1 ||
                       contentType.indexOf("video/") !== -1 ||
                       contentType.indexOf("audio/") !== -1 ||
                       contentType.indexOf("application/octet-stream") !== -1 ||
                       contentType.indexOf("application/pdf") !== -1 ||
                       contentType.indexOf("application/zip") !== -1;

        if (isStreaming) {
          responseBody = "[Streaming response - not captured]";
        } else if (isBinary) {
          responseBody = "[Binary content: " + contentType + "]";
        } else {
          // Safe to read responseText for text responses
          try {
            var text = xhr.responseText || "";
            if (text.length > CONFIG.maxBodyLength) {
              responseBody = text.slice(0, CONFIG.maxBodyLength) + "...[truncated]";
            } else {
              responseBody = sanitizeValue(tryParseJson(text));
            }
          } catch (e) {
            // responseText may throw for non-text responses
            responseBody = "[Unable to read response: " + e.message + "]";
          }
        }

        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: {
            status: xhr.status,
            statusText: xhr.statusText,
            body: responseBody,
          },
          duration: Date.now() - xhr._manusData.startTime,
          error: null,
        };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        if (entry.response && entry.response.status >= 400) {
          logUiEvent("network_error", {
            kind: "xhr",
            method: entry.method,
            url: entry.url,
            status: entry.response.status,
            statusText: entry.response.statusText,
          });
        }
      });

      xhr.addEventListener("error", function () {
        var entry = {
          timestamp: xhr._manusData.startTime,
          type: "xhr",
          method: xhr._manusData.method,
          url: xhr._manusData.url,
          request: { body: xhr._manusData.requestBody },
          response: null,
          duration: Date.now() - xhr._manusData.startTime,
          error: { message: "Network error" },
        };

        store.networkRequests.push(entry);
        pruneBuffer(store.networkRequests, CONFIG.bufferSize.network);

        logUiEvent("network_error", {
          kind: "xhr",
          method: entry.method,
          url: entry.url,
          message: "Network error",
        });
      });
    }

    return originalXHRSend.apply(this, arguments);
  };

  return originalFetch;
}
