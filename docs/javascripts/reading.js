/* Reading aids: scroll progress, text-size control, focus mode, and resume-where-
   you-left-off. All state is client-side in localStorage.

   navigation.instant is enabled, so the DOM is swapped without a page load --
   everything here re-binds through Material's document$ observable rather than
   DOMContentLoaded, which would only ever fire once. */

(function () {
  "use strict";

  var SCALE_KEY = "reading:scale";
  var FOCUS_KEY = "reading:focus";
  var POS_PREFIX = "reading:pos:";
  var MIN_SCALE = 0.85;
  var MAX_SCALE = 1.45;
  var STEP = 0.1;
  var RESUME_THRESHOLD = 400; // don't restore trivial scroll offsets
  var POS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode */ }
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* ---- text size ---- */

  function currentScale() {
    var v = parseFloat(read(SCALE_KEY));
    return isNaN(v) ? 1 : Math.min(MAX_SCALE, Math.max(MIN_SCALE, v));
  }

  function applyScale(v) {
    document.documentElement.style.setProperty("--reading-scale", v);
    store(SCALE_KEY, v);
  }

  function nudgeScale(delta) {
    var next = Math.round((currentScale() + delta) * 100) / 100;
    applyScale(Math.min(MAX_SCALE, Math.max(MIN_SCALE, next)));
  }

  /* ---- focus mode ---- */

  function applyFocus(on) {
    document.body.classList.toggle("reading-focus", on);
    store(FOCUS_KEY, on ? "1" : "0");
    var btn = document.querySelector("[data-reading='focus']");
    if (btn) {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.title = on ? "Exit focus mode" : "Focus mode — hide navigation";
    }
  }

  /* ---- scroll progress ---- */

  function scrollFraction() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    if (max <= 0) return 0;
    return Math.min(1, Math.max(0, doc.scrollTop / max));
  }

  /* ---- resume position ---- */

  function posKey() {
    return POS_PREFIX + location.pathname;
  }

  function savePosition() {
    var top = document.documentElement.scrollTop;
    if (top < RESUME_THRESHOLD) {
      try { localStorage.removeItem(posKey()); } catch (e) {}
      return;
    }
    store(posKey(), JSON.stringify({ top: top, at: Date.now() }));
  }

  function restorePosition() {
    // A deep link to an anchor should win over a saved position.
    if (location.hash) return;
    var raw = read(posKey());
    if (!raw) return;
    try {
      var saved = JSON.parse(raw);
      if (!saved || Date.now() - saved.at > POS_MAX_AGE_MS) return;
      if (saved.top < RESUME_THRESHOLD) return;
      window.scrollTo(0, saved.top);
    } catch (e) { /* corrupt entry, ignore */ }
  }

  /* ---- toolbar ---- */

  function buildToolbar() {
    if (document.querySelector(".reading-toolbar")) return;

    var bar = document.createElement("div");
    bar.className = "reading-toolbar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Reading controls");

    [
      ["smaller", "A−", "Decrease text size"],
      ["larger", "A+", "Increase text size"],
      ["focus", "▣", "Focus mode — hide navigation"]
    ].forEach(function (spec) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.reading = spec[0];
      b.textContent = spec[1];
      b.title = spec[2];
      b.setAttribute("aria-label", spec[2]);
      bar.appendChild(b);
    });

    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-reading]");
      if (!b) return;
      var action = b.dataset.reading;
      if (action === "smaller") nudgeScale(-STEP);
      else if (action === "larger") nudgeScale(STEP);
      else if (action === "focus") applyFocus(!document.body.classList.contains("reading-focus"));
    });

    document.body.appendChild(bar);
  }

  function buildProgress() {
    if (document.querySelector(".reading-progress")) return;
    var el = document.createElement("div");
    el.className = "reading-progress";
    document.body.appendChild(el);
  }

  /* ---- wiring ---- */

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var el = document.querySelector(".reading-progress");
      if (el) el.style.width = (scrollFraction() * 100).toFixed(2) + "%";
      savePosition();
      ticking = false;
    });
  }

  function init() {
    buildProgress();
    buildToolbar();
    applyScale(currentScale());
    applyFocus(read(FOCUS_KEY) === "1");
    restorePosition();
    onScroll();
  }

  // Bind scroll once; the handler reads live DOM each time so it survives
  // instant-navigation swaps.
  window.addEventListener("scroll", onScroll, { passive: true });

  // Keyboard: f toggles focus mode, unless the user is typing (e.g. search).
  document.addEventListener("keydown", function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (ev.key === "f") {
      applyFocus(!document.body.classList.contains("reading-focus"));
    }
  });

  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(init);
  } else if (document.readyState !== "loading") {
    init();
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
