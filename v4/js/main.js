(function () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
  var hero = document.querySelector(".hero");
  var form = document.querySelector("#anfragen");
  var floatCta = document.querySelector(".float-cta");

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function onScroll() {
    if (!nav) return;
    var pastHero = hero ? window.scrollY > hero.offsetHeight - 80 : window.scrollY > 40;
    nav.classList.toggle("is-solid", pastHero);

    if (floatCta && form) {
      var rect = form.getBoundingClientRect();
      var formVisible = rect.top < window.innerHeight - 80 && rect.bottom > 80;
      floatCta.classList.toggle("show", pastHero && !formVisible);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("in");
    });
  }

  function animateCount(el) {
    var target = Number(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var start = performance.now();
    var duration = 1400;
    function tick(now) {
      var p = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString("de-DE") + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll("[data-count]").forEach(function (el) {
      co.observe(el);
    });
  }

  function toEmbed(url) {
    if (!url) return "";
    var yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]+)/);
    if (yt) return "https://www.youtube.com/embed/" + yt[1];
    var vim = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vim) return "https://player.vimeo.com/video/" + vim[1];
    return url;
  }

  document.querySelectorAll(".embed[data-video]").forEach(function (box) {
    var src = toEmbed((box.getAttribute("data-video") || "").trim());
    if (!src) return;
    box.innerHTML =
      '<iframe src="' +
      src +
      '" title="' +
      (box.getAttribute("data-title") || "Video") +
      '" allowfullscreen loading="lazy"></iframe>';
  });
})();
