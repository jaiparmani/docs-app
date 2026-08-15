/* Reading aids: scroll progress, time remaining, text size, line spacing,
   serif body, focus mode, resume-where-you-left-off, and a continue-reading
   list on the home page. All state is client-side in localStorage.

   navigation.instant swaps the DOM without a page load, so everything re-binds
   through Material's document$ observable rather than DOMContentLoaded, which
   would only ever fire once. */

(function () {
  "use strict";

  var K = {
    scale: "reading:scale",
    spacing: "reading:spacing",
    serif: "reading:serif",
    focus: "reading:focus",
    pos: "reading:pos:",
    marks: "reading:bookmarks",
    measure: "reading:measure"
  };

  var SCALE = { min: 0.85, max: 1.5, step: 0.1, base: 1 };
  var SPACING = { min: 1.4, max: 2.3, step: 0.15, base: 1.7 };
var MEASURE = { min: 34, max: 62, step: 4, base: 46 };   // rem, content width
  var RESUME_MIN_PX = 400;
  var POS_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;
  var CONTINUE_MAX = 5;
  var WPM = 200;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  function num(key, cfg) {
    var v = parseFloat(read(key));
    return isNaN(v) ? cfg.base : clamp(v, cfg.min, cfg.max);
  }

  /* ---- appearance ---- */

  function applyScale(v) {
    document.documentElement.style.setProperty("--reading-scale", v);
    store(K.scale, v);
  }

  function applySpacing(v) {
    document.documentElement.style.setProperty("--reading-spacing", v);
    store(K.spacing, v);
  }

  function applyMeasure(v) {
    document.documentElement.style.setProperty("--reading-measure", v + "rem");
    store(K.measure, v);
  }

  function applySerif(on) {
    document.body.classList.toggle("reading-serif", on);
    store(K.serif, on ? "1" : "0");
    press("serif", on);
  }

  function applyFocus(on) {
    document.body.classList.toggle("reading-focus", on);
    store(K.focus, on ? "1" : "0");
    press("focus", on);
  }

  function press(name, on) {
    var b = document.querySelector("[data-reading='" + name + "']");
    if (b) b.setAttribute("aria-pressed", on ? "true" : "false");
  }

  /* ---- progress + time remaining ---- */

  function fraction() {
    var d = document.documentElement;
    var max = d.scrollHeight - d.clientHeight;
    return max <= 0 ? 0 : clamp(d.scrollTop / max, 0, 1);
  }

  function totalMinutes() {
    var el = document.querySelector(".md-content__inner");
    if (!el) return 0;
    var words = (el.innerText || "").trim().split(/\s+/).length;
    return words / WPM;
  }

  var cachedTotal = 0;

  function paint() {
    var f = fraction();
    var bar = document.querySelector(".reading-progress");
    if (bar) bar.style.width = (f * 100).toFixed(2) + "%";

    var tag = document.querySelector(".reading-remaining");
    if (tag) {
      var left = Math.round(cachedTotal * (1 - f));
      if (cachedTotal >= 2 && f > 0.02 && f < 0.99) {
        tag.textContent = left <= 1 ? "under a min left" : left + " min left";
        tag.classList.add("is-visible");
      } else {
        tag.classList.remove("is-visible");
      }
    }
  }

  /* ---- resume ---- */

  function posKey() { return K.pos + location.pathname; }

  function pageTitle() {
    var h1 = document.querySelector(".md-content__inner h1");
    if (!h1) return document.title;
    // Clone so the permalink anchor ("¶") can be dropped without touching the page.
    var clone = h1.cloneNode(true);
    clone.querySelectorAll(".headerlink").forEach(function (a) { a.remove(); });
    return clone.textContent.replace(/¶/g, "").trim();
  }

  function savePosition() {
    var top = document.documentElement.scrollTop;
    if (top < RESUME_MIN_PX) { drop(posKey()); return; }
    store(posKey(), JSON.stringify({
      top: top,
      at: Date.now(),
      pct: Math.round(fraction() * 100),
      title: pageTitle()
    }));
  }

  function restorePosition() {
    if (location.hash) return;           // a deep link should win
    var raw = read(posKey());
    if (!raw) return;
    try {
      var s = JSON.parse(raw);
      if (!s || Date.now() - s.at > POS_MAX_AGE_MS) return;
      if (s.top < RESUME_MIN_PX) return;
      window.scrollTo(0, s.top);
    } catch (e) {}
  }

  /* ---- continue reading (home page only) ---- */

  function savedPages() {
    var out = [];
    var base = location.pathname.replace(/index\.html$|\/$/, "");
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || key.indexOf(K.pos) !== 0) continue;
      var path = key.slice(K.pos.length);
      if (path === location.pathname) continue;
      try {
        var s = JSON.parse(localStorage.getItem(key));
        if (!s || !s.title || Date.now() - s.at > POS_MAX_AGE_MS) continue;
        if (s.pct >= 97) continue;       // finished, not "in progress"
        out.push({ path: path, title: s.title, pct: s.pct || 0, at: s.at });
      } catch (e) {}
    }
    return out.sort(function (a, b) { return b.at - a.at; }).slice(0, CONTINUE_MAX);
  }

  function isHome() {
    return /\/(index\.html)?$/.test(location.pathname) &&
           document.querySelector(".md-content__inner h1");
  }

  function renderContinue() {
    // The bookmarks box shares .reading-continue for styling, so exclude it here
    // or this cleanup deletes it.
    var existing = document.querySelector(".reading-continue:not(.reading-marks)");
    if (existing) existing.remove();
    if (!isHome()) return;

    var pages = savedPages();
    if (!pages.length) return;

    var box = document.createElement("div");
    box.className = "reading-continue";

    var h = document.createElement("h2");
    h.textContent = "Continue reading";
    box.appendChild(h);

    var ol = document.createElement("ol");
    pages.forEach(function (p) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = p.path;
      a.textContent = p.title;
      li.appendChild(a);
      var span = document.createElement("span");
      span.className = "pct";
      span.textContent = "  " + p.pct + "%";
      li.appendChild(span);
      ol.appendChild(li);
    });
    box.appendChild(ol);

    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "clear";
    clear.textContent = "Clear list";
    clear.addEventListener("click", function () {
      Object.keys(localStorage)
        .filter(function (k) { return k.indexOf(K.pos) === 0; })
        .forEach(drop);
      renderContinue();
    });
    box.appendChild(clear);

    var h1 = document.querySelector(".md-content__inner h1");
    if (h1 && h1.parentNode) h1.parentNode.insertBefore(box, h1.nextSibling);
  }

  /* ---- bookmarks ----
     Deliberately page-level rather than text-range. Notes regenerate from the
     vault on every sync, so anything anchored to text offsets would silently
     orphan itself; a path never does. */

  function bookmarks() {
    try { return JSON.parse(read(K.marks) || "[]"); } catch (e) { return []; }
  }

  function isBookmarked() {
    return bookmarks().some(function (b) { return b.path === location.pathname; });
  }

  function toggleBookmark() {
    var list = bookmarks();
    var i = list.findIndex(function (b) { return b.path === location.pathname; });
    if (i >= 0) list.splice(i, 1);
    else list.unshift({ path: location.pathname, title: pageTitle(), at: Date.now() });
    store(K.marks, JSON.stringify(list.slice(0, 50)));
    reflectBookmark();
    renderBookmarks();
  }

  function reflectBookmark() {
    var on = isBookmarked();
    var b = document.querySelector("[data-reading='mark']");
    if (b) {
      b.textContent = on ? "★" : "☆";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.title = on ? "Remove bookmark" : "Bookmark this page";
    }
  }

  function renderBookmarks() {
    var old = document.querySelector(".reading-marks");
    if (old) old.remove();
    if (!isHome()) return;

    var list = bookmarks();
    if (!list.length) return;

    var box = document.createElement("div");
    box.className = "reading-continue reading-marks";
    var h = document.createElement("h2");
    h.textContent = "Bookmarks";
    box.appendChild(h);

    var ul = document.createElement("ul");
    list.forEach(function (b) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = b.path;
      a.textContent = b.title;
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(ul);

    var h1 = document.querySelector(".md-content__inner h1");
    if (h1 && h1.parentNode) h1.parentNode.insertBefore(box, h1.nextSibling);
  }

  /* ---- selection tools: define / copy with citation / find across notes ---- */

  function siteBase() {
    var logo = document.querySelector(".md-header__button.md-logo");
    if (logo && logo.getAttribute("href")) {
      return new URL(logo.getAttribute("href"), location.href).href;
    }
    return location.origin + "/";
  }

  function glossaryFor(term) {
    var t = term.trim();
    if (!t || t.length > 40) return null;
    var abbrs = document.querySelectorAll("abbr[title]");
    for (var i = 0; i < abbrs.length; i++) {
      if (abbrs[i].textContent.trim().toLowerCase() === t.toLowerCase()) {
        return abbrs[i].getAttribute("title");
      }
    }
    return null;
  }

  function buildSelectionTools() {
    if (document.querySelector(".reading-selection")) return;

    var pop = document.createElement("div");
    pop.className = "reading-selection";
    pop.innerHTML =
      '<button type="button" data-sel="find">Find in notes</button>' +
      '<button type="button" data-sel="copy">Copy quote</button>' +
      '<span class="def"></span>';
    document.body.appendChild(pop);

    pop.addEventListener("mousedown", function (e) { e.preventDefault(); });

    pop.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-sel]");
      if (!b) return;
      var text = (window.getSelection() || "").toString().trim();
      if (!text) return;
      if (b.dataset.sel === "find") {
        window.open(siteBase() + "?q=" + encodeURIComponent(text), "_blank", "noopener");
      } else {
        var quote = '"' + text + '" — ' + pageTitle() + ", " + location.href;
        if (navigator.clipboard) navigator.clipboard.writeText(quote);
        b.textContent = "Copied";
        setTimeout(function () { b.textContent = "Copy quote"; }, 1200);
      }
    });

    document.addEventListener("selectionchange", function () {
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : "";
      if (!text || text.length < 2 || !sel.rangeCount) {
        pop.classList.remove("is-visible");
        return;
      }
      // Only inside the article body — not the nav or search box.
      var node = sel.anchorNode;
      var host = node && (node.nodeType === 1 ? node : node.parentElement);
      if (!host || !host.closest(".md-content__inner")) {
        pop.classList.remove("is-visible");
        return;
      }
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) return;
      pop.style.top = (window.scrollY + rect.top - pop.offsetHeight - 8) + "px";
      pop.style.left = (window.scrollX + rect.left) + "px";
      var def = glossaryFor(text);
      pop.querySelector(".def").textContent = def ? def : "";
      pop.classList.add("is-visible");
    });
  }

  /* ---- offline ---- */

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;
    if (registerSW.done) return;
    registerSW.done = true;
    navigator.serviceWorker.register(siteBase() + "sw.js").catch(function () {
      /* offline support is a bonus; never break the page over it */
    });
  }

  /* ---- chrome ---- */

  function ensure(cls, tag) {
    var el = document.querySelector("." + cls);
    if (!el) {
      el = document.createElement(tag || "div");
      el.className = cls;
      document.body.appendChild(el);
    }
    return el;
  }

  function buildToolbar() {
    if (document.querySelector(".reading-toolbar")) return;
    var bar = document.createElement("div");
    bar.className = "reading-toolbar";
    bar.setAttribute("role", "group");
    bar.setAttribute("aria-label", "Reading controls");

    [
      ["smaller", "A−", "Smaller text"],
      ["larger", "A+", "Larger text"],
      ["spacing", "↕", "More line spacing (cycles back round)"],
      ["width", "↔", "Wider text column (cycles back round)"],
      ["mark", "☆", "Bookmark this page"],
      ["serif", "Aa", "Serif body text"],
      ["focus", "▣", "Focus mode — hide navigation (f)"]
    ].forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.reading = s[0];
      b.textContent = s[1];
      b.title = s[2];
      b.setAttribute("aria-label", s[2]);
      bar.appendChild(b);
    });

    bar.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-reading]");
      if (!b) return;
      var a = b.dataset.reading;
      if (a === "smaller") applyScale(round(clamp(num(K.scale, SCALE) - SCALE.step, SCALE.min, SCALE.max)));
      else if (a === "larger") applyScale(round(clamp(num(K.scale, SCALE) + SCALE.step, SCALE.min, SCALE.max)));
      else if (a === "spacing") {
        var next = round(num(K.spacing, SPACING) + SPACING.step);
        applySpacing(next > SPACING.max ? SPACING.min : next);
      }
      else if (a === "width") {
        var w = num(K.measure, MEASURE) + MEASURE.step;
        applyMeasure(w > MEASURE.max ? MEASURE.min : w);
      }
      else if (a === "mark") toggleBookmark();
      else if (a === "serif") applySerif(!document.body.classList.contains("reading-serif"));
      else if (a === "focus") applyFocus(!document.body.classList.contains("reading-focus"));
      cachedTotal = totalMinutes();
      paint();
    });

    document.body.appendChild(bar);
  }

  function round(v) { return Math.round(v * 100) / 100; }

  /* ---- wiring ---- */

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      paint();
      savePosition();
      ticking = false;
    });
  }

  function init() {
    ensure("reading-progress");
    ensure("reading-remaining");
    buildToolbar();
    applyScale(num(K.scale, SCALE));
    applySpacing(num(K.spacing, SPACING));
    applyMeasure(num(K.measure, MEASURE));
    applySerif(read(K.serif) === "1");
    applyFocus(read(K.focus) === "1");
    cachedTotal = totalMinutes();
    reflectBookmark();
    renderBookmarks();
    renderContinue();
    buildSelectionTools();
    registerSW();
    restorePosition();
    paint();
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  document.addEventListener("keydown", function (ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var t = ev.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
    if (ev.key === "f") applyFocus(!document.body.classList.contains("reading-focus"));
  });

  if (typeof document$ !== "undefined" && document$.subscribe) document$.subscribe(init);
  else if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
