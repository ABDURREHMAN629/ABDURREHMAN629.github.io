// Page behaviour only. All content is already in the HTML (written by build.js).
(function () {
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  // ---- theme ----
  const themeToggle = $("themeToggle");
  function labelThemeToggle() {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    themeToggle.setAttribute("aria-label", "Switch to " + next + " mode");
    themeToggle.title = "Switch to " + next + " mode";
  }
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    labelThemeToggle();
  });
  labelThemeToggle();

  // ---- mobile nav ----
  const toggle = $("navToggle");
  const navLinks = $("navLinks");
  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  navLinks.addEventListener("click", (e) => e.target.tagName === "A" && navLinks.classList.remove("open"));

  // ---- project filters ----
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter").forEach((f) => f.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.filter;
      document.querySelectorAll("#work .project").forEach((card) => {
        card.hidden = cat !== "All" && card.dataset.category !== cat;
      });
    });
  });

  // ---- video pop-up ----
  function embedUrl(url) {
    let m;
    if ((m = url.match(/(?:youtube\.com\/(?:watch\?.*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/)))
      return "https://www.youtube.com/embed/" + m[1] + "?autoplay=1&rel=0";
    if ((m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)))
      return "https://player.vimeo.com/video/" + m[1] + "?autoplay=1";
    if ((m = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/)))
      return "https://www.loom.com/embed/" + m[1] + "?autoplay=1";
    return null;
  }

  const modal = $("videoModal");
  const media = $("modalMedia");
  let lastFocus = null;

  function openVideo(btn) {
    const url = btn.dataset.video;
    const src = embedUrl(url);
    const node = document.createElement(src ? "iframe" : "video");
    if (src) {
      node.src = src;
      node.title = btn.dataset.title;
      node.allow = "autoplay; fullscreen; picture-in-picture";
      node.allowFullscreen = true;
    } else {
      node.src = url;
      if (btn.dataset.poster) node.poster = btn.dataset.poster;
      node.controls = true;
      node.autoplay = true;
      node.playsInline = true;
    }
    media.textContent = "";
    media.appendChild(node);
    $("modalTitle").textContent = btn.dataset.title;
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close").focus();
  }

  function closeVideo() {
    if (modal.hidden) return;
    modal.hidden = true;
    media.textContent = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-video]");
    if (btn) openVideo(btn);
    else if (e.target.closest("[data-close]")) closeVideo();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeVideo());

  // ---- reveal on scroll ----
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add("in"), io.unobserve(en.target))),
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
  } else {
    document.querySelectorAll(".reveal").forEach((n) => n.classList.add("in"));
  }
})();
