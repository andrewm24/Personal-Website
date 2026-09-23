import "./style.css";

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Theme -------------------------------------------------------------------- */

const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const applyTheme = (theme) => {
  const next = theme === "dark" ? "dark" : "light";
  root.dataset.theme = next;
  root.style.colorScheme = next;

  if (themeLabel) {
    themeLabel.textContent = next === "dark" ? "Light" : "Dark";
  }
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", `Switch to ${next === "dark" ? "light" : "dark"} theme`);
  }
  if (themeMeta) {
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (bg) themeMeta.setAttribute("content", bg);
  }

  try {
    localStorage.setItem("am-theme", next);
  } catch (error) {
    // Storage can be unavailable in private modes; the theme still applies.
  }
};

themeToggle?.addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

applyTheme(root.dataset.theme);

/* Reveal on scroll --------------------------------------------------------- */

const revealNodes = document.querySelectorAll("[data-reveal]");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealNodes.forEach((node) => node.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

/* Top bar rule + current section ------------------------------------------- */

const topbar = document.querySelector(".topbar");
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const setCurrent = (id) => {
  navLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) {
      link.setAttribute("aria-current", "true");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

if (sections.length && "IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(visible.target.id);
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5] }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

const onScroll = () => {
  topbar?.setAttribute("data-scrolled", String(window.scrollY > 8));
};

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* THEIA ground station live demo ------------------------------------------ */
// The dashboard runs on a separate host (GitHub Pages is static). The card shows a screenshot
// until the visitor asks for the live sim, then wakes the host (free tiers sleep when idle)
// and swaps the screenshot for the dashboard in an iframe. Phones get a new tab instead.

const simCard = document.querySelector("[data-sim]");

if (simCard) {
  const demoUrl = (simCard.dataset.demoUrl || "").trim().replace(/\/+$/, "");
  const sourceUrl = (simCard.dataset.sourceUrl || "").trim();
  const frame = simCard.querySelector("[data-sim-frame]");
  const overlay = simCard.querySelector("[data-sim-overlay]");
  const launch = simCard.querySelector("[data-sim-launch]");
  const status = simCard.querySelector("[data-sim-status]");
  const openLink = simCard.querySelector("[data-sim-open]");
  const sourceLink = simCard.querySelector("[data-sim-source]");

  if (sourceUrl && sourceLink) {
    sourceLink.href = sourceUrl;
    sourceLink.hidden = false;
  }

  if (!demoUrl) {
    simCard.querySelectorAll("[data-sim-live-only]").forEach((node) => (node.hidden = true));
  } else {
    overlay.hidden = false;
    openLink.href = demoUrl;
    openLink.hidden = false;

    const embedSrc = () => `${demoUrl}/?embed=1&theme=${root.dataset.theme === "dark" ? "dark" : "light"}`;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const waitForStation = async (timeoutMs = 90000) => {
      const started = Date.now();
      while (Date.now() - started < timeoutMs) {
        try {
          const res = await fetch(`${demoUrl}/health`, { cache: "no-store" });
          if (res.ok) return true;
        } catch (error) {
          // Still waking up (or unreachable); keep polling until the timeout.
        }
        const seconds = Math.round((Date.now() - started) / 1000);
        status.textContent =
          seconds < 4
            ? "Contacting the ground station…"
            : `Waking up the ground station… ${seconds}s (the free host sleeps when idle)`;
        await sleep(2500);
      }
      return false;
    };

    let iframe = null;

    launch.addEventListener("click", async () => {
      if (window.matchMedia("(max-width: 40rem)").matches) {
        window.open(demoUrl, "_blank", "noopener");
        return;
      }

      launch.disabled = true;
      status.textContent = "Contacting the ground station…";
      const ok = await waitForStation();

      if (!ok) {
        launch.disabled = false;
        launch.lastChild.textContent = " Try again";
        status.textContent = "Couldn't reach the live demo just now. Try again, or open it full screen.";
        return;
      }

      const viewport = document.createElement("div");
      viewport.className = "sim__viewport";
      iframe = document.createElement("iframe");
      iframe.src = embedSrc();
      iframe.title = "THEIA ground station live simulation";
      iframe.loading = "eager";
      viewport.append(iframe);
      frame.querySelector(".sim__poster").replaceWith(viewport);
    });

    // Keep the embedded dashboard's theme in step with the site toggle.
    new MutationObserver(() => {
      if (iframe) iframe.src = embedSrc();
    }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }
}

/* Footer year -------------------------------------------------------------- */

const year = document.querySelector("[data-year]");
if (year) {
  year.textContent = String(new Date().getFullYear());
}
