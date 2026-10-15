(() => {
  "use strict";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let engine = null;
  let disposed = false;
  function destroy() {
    engine?.destroy();
    engine = null;
    document.documentElement.classList.remove("has-smooth-scroll");
    document.body.dataset.scrollMode = "native";
  }
  function sync() {
    if (disposed) return;
    const open = document.body.classList.contains("exhibition-open");
    if (!open || reduced.matches || !window.LocomotiveScroll) {
      destroy();
      return;
    }
    if (!engine) {
      try {
        engine = new window.LocomotiveScroll({
          autoStart: false,
          lenisOptions: {
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: false,
            anchors: false,
            prevent: (node) =>
              !!node.closest("dialog,select,textarea,[data-lenis-prevent]"),
          },
        });
        document.documentElement.classList.add("has-smooth-scroll");
        document.body.dataset.scrollMode = "locomotive";
      } catch {
        destroy();
        return;
      }
    }
    if (document.hidden || document.querySelector("dialog[open]")) {
      engine.lenisInstance?.stop();
      engine.stop();
    } else {
      engine.lenisInstance?.start();
      engine.start();
      engine.resize();
    }
  }
  function to(target, { immediate = false, offset = 0 } = {}) {
    const destination =
      typeof target === "string" ? document.querySelector(target) : target;
    if (destination == null) return;
    if (engine) {
      engine.resize();
      engine.scrollTo(destination, {
        immediate,
        duration: 0.9,
        offset,
        force: true,
      });
    } else {
      const top =
        typeof destination === "number"
          ? destination
          : destination.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: Math.max(0, top + offset),
        behavior: immediate || reduced.matches ? "instant" : "smooth",
      });
    }
  }
  const observer = new MutationObserver(sync);
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  document
    .querySelectorAll("dialog")
    .forEach((dialog) =>
      observer.observe(dialog, { attributes: true, attributeFilter: ["open"] }),
    );
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = event.target.closest(
      '.scroll-cue[href^="#"],.hall-navigation a[href^="#"]',
    );
    if (!anchor) return;
    const target = document.querySelector(anchor.hash);
    if (!target || !document.body.classList.contains("exhibition-open")) return;
    event.preventDefault();
    if (location.hash !== anchor.hash) history.pushState(null, "", anchor.hash);
    to(target);
  });
  window.addEventListener("exhibitionpower", sync);
  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", sync);
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) {
      engine?.lenisInstance?.stop();
      engine?.stop();
    } else {
      disposed = true;
      observer.disconnect();
      destroy();
    }
  });
  window.addEventListener("pageshow", sync);
  globalThis.ExhibitionScroll = { to };
  sync();
})();
