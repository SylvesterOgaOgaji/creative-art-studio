import {
  CONFIG,
  store,
  shouldIgnoreTarget,
  describeElement,
  getInputValueSafe,
  logUiEvent,
} from "./shared.js";

export function installUiEventListeners() {
    // Clicks
    document.addEventListener(
      "click",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("click", {
          target: describeElement(t),
          x: e.clientX,
          y: e.clientY,
        });
      },
      true
    );

    // Typing "commit" events
    document.addEventListener(
      "change",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("change", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    document.addEventListener(
      "focusin",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusin", { target: describeElement(t) });
      },
      true
    );

    document.addEventListener(
      "focusout",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("focusout", {
          target: describeElement(t),
          value: getInputValueSafe(t),
        });
      },
      true
    );

    // Enter/Escape are useful for form flows & modals
    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key !== "Enter" && e.key !== "Escape") return;
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("keydown", { key: e.key, target: describeElement(t) });
      },
      true
    );

    // Form submissions
    document.addEventListener(
      "submit",
      function (e) {
        var t = e.target;
        if (shouldIgnoreTarget(t)) return;
        logUiEvent("submit", { target: describeElement(t) });
      },
      true
    );

    // Throttled scroll events
    window.addEventListener(
      "scroll",
      function () {
        var now = Date.now();
        if (now - store.lastScrollTime < CONFIG.scrollThrottleMs) return;
        store.lastScrollTime = now;

        logUiEvent("scroll", {
          scrollX: window.scrollX,
          scrollY: window.scrollY,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
        });
      },
      { passive: true }
    );

    // Navigation tracking for SPAs
    function nav(reason) {
      logUiEvent("navigate", { reason: reason });
    }

    var origPush = history.pushState;
    history.pushState = function () {
      origPush.apply(this, arguments);
      nav("pushState");
    };

    var origReplace = history.replaceState;
    history.replaceState = function () {
      origReplace.apply(this, arguments);
      nav("replaceState");
    };

    window.addEventListener("popstate", function () {
      nav("popstate");
    });
    window.addEventListener("hashchange", function () {
      nav("hashchange");
    });

}
