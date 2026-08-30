/* Tracking-IDs hier eintragen. Leer = Dienst bleibt inaktiv und wird nicht geladen.
   Das Consent-Banner erscheint beim ersten Besuch immer. */
window.MH_TRACKING = {
  gaMeasurementId: "", // z. B. "G-XXXXXXXXXX"
  metaPixelId: "" // z. B. "123456789012345"
};

(function () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function toEmbed(url) {
    if (!url) return "";
    var youtube = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
    if (youtube) return "https://www.youtube.com/embed/" + youtube[1];
    var vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return "https://player.vimeo.com/video/" + vimeo[1];
    return url;
  }

  function isLocalVideo(url) {
    return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
  }

  document.querySelectorAll(".embed[data-video]").forEach(function (box) {
    var raw = (box.getAttribute("data-video") || "").trim();
    if (!raw) return;
    var title = box.getAttribute("data-title") || "Erfahrungsbericht";
    if (isLocalVideo(raw)) {
      var poster = (box.getAttribute("data-poster") || "").trim() || raw.replace(/\.(mp4|webm|mov|m4v)(\?.*)?$/i, ".jpg?v=sdr");
      box.innerHTML =
        '<video controls playsinline preload="none" poster="' +
        poster +
        '" title="' +
        title.replace(/"/g, "&quot;") +
        '"><source src="' +
        raw +
        '" type="video/mp4"></video>';
      box.querySelector("video").addEventListener("play", function () {
        document.querySelectorAll(".embed video").forEach(function (other) {
          if (other !== box.querySelector("video")) other.pause();
        });
      });
      return;
    }
    var src = toEmbed(raw);
    if (!src) return;
    box.innerHTML =
      '<iframe src="' +
      src +
      '" title="' +
      title +
      '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
  });

  initCoverflow();
})();

function initCoverflow() {
  var cover = document.querySelector(".coverflow");
  if (!cover) return;

  var deck = cover.querySelectorAll(".coverflow-slide");
  var dots = cover.querySelectorAll(".coverflow-dot");
  var counter = cover.querySelector(".coverflow-counter");
  var stage = cover.querySelector(".coverflow-stage") || cover;
  var index = 0;
  var startX = 0;
  var startY = 0;
  var tracking = false;
  var swiped = false;

  function show(next) {
    index = (next + deck.length) % deck.length;
    deck.forEach(function (slide, i) {
      slide.classList.remove("is-active", "is-prev", "is-next");
      if (i === index) slide.classList.add("is-active");
      else if (i === (index - 1 + deck.length) % deck.length) slide.classList.add("is-prev");
      else if (i === (index + 1) % deck.length) slide.classList.add("is-next");
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
    if (counter) counter.textContent = index + 1 + " / " + deck.length;
    deck.forEach(function (slide, i) {
      if (i === index) return;
      slide.querySelectorAll("video").forEach(function (video) {
        video.pause();
      });
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
    });
  });

  deck.forEach(function (slide, i) {
    slide.addEventListener("click", function () {
      if (i !== index) show(i);
    });
  });

  stage.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    startX = event.clientX;
    startY = event.clientY;
    tracking = true;
    swiped = false;
  });
  stage.addEventListener("pointerup", function (event) {
    if (!tracking) return;
    tracking = false;
    var dx = event.clientX - startX;
    var dy = event.clientY - startY;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    swiped = true;
    if (dx > 0) show(index - 1);
    else show(index + 1);
  });
  stage.addEventListener("pointercancel", function () {
    tracking = false;
  });
  stage.addEventListener(
    "click",
    function (event) {
      if (!swiped) return;
      event.preventDefault();
      event.stopPropagation();
      swiped = false;
    },
    true
  );

  show(0);
}

(function () {
  var STORAGE_KEY = "mh-consent-v1";
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var tracking = window.MH_TRACKING || {};
  var gaId = (tracking.gaMeasurementId || "").trim();
  var metaId = (tracking.metaPixelId || "").trim();
  var root;
  var analyticsInput;
  var marketingInput;
  var lastFocus;

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.v !== 1 || typeof data.ts !== "number") return null;
      if (Date.now() - data.ts > MAX_AGE_MS) return null;
      return {
        analytics: Boolean(data.analytics),
        marketing: Boolean(data.marketing)
      };
    } catch (e) {
      return null;
    }
  }

  function writeConsent(consent) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        v: 1,
        ts: Date.now(),
        analytics: Boolean(consent.analytics),
        marketing: Boolean(consent.marketing)
      })
    );
  }

  function expireCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
  }

  function clearTrackingCookies() {
    ["_ga", "_gid", "_gat", "_fbp", "_fbc"].forEach(expireCookie);
    document.cookie.split(";").forEach(function (part) {
      var name = part.split("=")[0].trim();
      if (name.indexOf("_ga_") === 0 || name.indexOf("_gcl_") === 0) expireCookie(name);
    });
  }

  function loadGoogleAnalytics() {
    if (!gaId || window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaId);
    script.setAttribute("data-consent", "analytics");
    document.head.appendChild(script);
    window.gtag("js", new Date());
    window.gtag("config", gaId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
  }

  function loadMetaPixel() {
    if (!metaId || window.fbq) return;
    var n;
    var f = window;
    var b = document;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    var script = b.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.setAttribute("data-consent", "marketing");
    b.head.appendChild(script);
    window.fbq("init", metaId);
    window.fbq("track", "PageView");
  }

  function applyConsent(consent) {
    if (consent.analytics) loadGoogleAnalytics();
    else if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
    if (consent.marketing) loadMetaPixel();
    else if (window.fbq) window.fbq("consent", "revoke");
    if (!consent.analytics && !consent.marketing) clearTrackingCookies();
  }

  function currentFromUi() {
    return {
      analytics: analyticsInput ? analyticsInput.checked : false,
      marketing: marketingInput ? marketingInput.checked : false
    };
  }

  function fillUi(consent) {
    if (analyticsInput) analyticsInput.checked = Boolean(consent && consent.analytics);
    if (marketingInput) marketingInput.checked = Boolean(consent && consent.marketing);
  }

  function closeUi() {
    if (!root) return;
    root.classList.remove("is-open", "is-panel");
    root.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openUi(asPanel) {
    if (!root) return;
    lastFocus = document.activeElement;
    fillUi(readConsent());
    root.classList.add("is-open");
    root.classList.toggle("is-panel", Boolean(asPanel));
    root.setAttribute("aria-hidden", "false");
    if (asPanel) document.body.style.overflow = "hidden";
    var focusEl = root.querySelector(asPanel ? ".consent-close" : "[data-consent-accept]");
    if (focusEl) focusEl.focus();
  }

  function saveFrom(consent, reloadIfNeeded) {
    var prev = readConsent();
    writeConsent(consent);
    var dropping =
      prev && ((prev.analytics && !consent.analytics) || (prev.marketing && !consent.marketing));
    if (reloadIfNeeded && dropping && (window.gtag || window.fbq)) {
      applyConsent(consent);
      window.location.reload();
      return;
    }
    applyConsent(consent);
    closeUi();
  }

  function build() {
    root = document.createElement("div");
    root.className = "consent-root";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="consent-backdrop" data-consent-dismiss></div>' +
      '<div class="consent-box" role="dialog" aria-modal="true" aria-labelledby="consent-title">' +
      '<button class="consent-close" type="button" aria-label="Schließen" data-consent-dismiss>×</button>' +
      '<p class="consent-kicker">Datenschutz</p>' +
      '<h2 id="consent-title">Cookies und Tracking</h2>' +
      '<p class="consent-lead">Wir nutzen Google Analytics und den Meta Pixel nur mit Ihrer Einwilligung. Technisch notwendige Speicherung Ihrer Auswahl bleibt immer aktiv. Details: <a href="datenschutz.html#analyse-tools">Datenschutzerklärung</a>.</p>' +
      '<ul class="consent-cats">' +
      '<li class="consent-cat"><div><strong>Notwendig</strong><span>Speichert Ihre Einwilligung lokal im Browser.</span></div><label class="consent-switch"><input type="checkbox" checked disabled><i></i></label></li>' +
      '<li class="consent-cat"><div><strong>Statistik</strong><span>Google Analytics (Reichweite und Nutzung der Website).</span></div><label class="consent-switch"><input id="consent-analytics" type="checkbox"><i></i></label></li>' +
      '<li class="consent-cat"><div><strong>Marketing</strong><span>Meta Pixel (Messung und Optimierung von Anzeigen).</span></div><label class="consent-switch"><input id="consent-marketing" type="checkbox"><i></i></label></li>' +
      "</ul>" +
      '<div class="consent-actions">' +
      '<button class="consent-btn consent-btn-primary" type="button" data-consent-accept>Alle akzeptieren</button>' +
      '<button class="consent-btn" type="button" data-consent-reject>Nur notwendige</button>' +
      '<button class="consent-btn" type="button" data-consent-save>Auswahl speichern</button>' +
      "</div></div>";
    document.body.appendChild(root);
    analyticsInput = document.getElementById("consent-analytics");
    marketingInput = document.getElementById("consent-marketing");

    root.addEventListener("click", function (event) {
      var target = event.target;
      if (target.closest("[data-consent-accept]")) {
        saveFrom({ analytics: true, marketing: true }, true);
      } else if (target.closest("[data-consent-reject]")) {
        saveFrom({ analytics: false, marketing: false }, true);
      } else if (target.closest("[data-consent-save]")) {
        saveFrom(currentFromUi(), true);
      } else if (root.classList.contains("is-panel") && target.closest("[data-consent-dismiss]")) {
        closeUi();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && root.classList.contains("is-panel")) closeUi();
    });
  }

  document.querySelectorAll("[data-consent-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openUi(true);
    });
  });

  build();

  var stored = readConsent();
  if (stored) applyConsent(stored);
  else openUi(false);
})();

