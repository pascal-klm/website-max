(function () {
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav-toggle");
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
    var title = box.getAttribute("data-title") || "Erfahrungsbericht";
    box.innerHTML =
      '<iframe src="' + src + '" title="' + title + '" allowfullscreen loading="lazy"></iframe>';
  });
})();
