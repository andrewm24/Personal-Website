/*
  Interaction controls
  --------------------
  Handles theme swapping, motion toggling, live parallax updates, and keeps settings persistent.
  Adjust the constants below to retune animation ranges or storage keys.
*/

(function () {
  const storageKeys = {
    theme: "am-theme",
    motion: "am-motion",
  };

  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeToggleText = document.querySelector("[data-theme-toggle-text]");
  const motionToggle = document.querySelector("[data-motion-toggle]");
  const motionToggleText = document.querySelector("[data-motion-toggle-text]");
  const parallaxTargets = document.querySelectorAll("[data-parallax]");

  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");

  const safeStorage = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // Storage might be unavailable; ignore gracefully.
      }
    },
  };

  const state = {
    theme: root.dataset.theme === "light" ? "light" : "dark",
    motion: root.dataset.motion === "off" ? "off" : "auto",
  };

  const updateThemeMeta = () => {
    if (!themeMeta) return;
    const pageColor = getComputedStyle(root).getPropertyValue("--surface-page").trim();
    if (pageColor) {
      themeMeta.setAttribute("content", pageColor);
    }
  };

  const applyTheme = (value) => {
    state.theme = value === "light" ? "light" : "dark";
    root.dataset.theme = state.theme;
    root.style.colorScheme = state.theme;
    themeToggle?.setAttribute("aria-pressed", String(state.theme === "dark"));
    if (themeToggleText) {
      themeToggleText.textContent = state.theme === "dark" ? "Dark mode" : "Light mode";
    }
    safeStorage.set(storageKeys.theme, state.theme);
    updateThemeMeta();
  };

  const parallax = (function createParallaxController() {
    if (!parallaxTargets.length) return null;

    const maxOffset = 500; // Scroll distance before clamping the parallax effect.
    let ticking = false;
    let enabled = false;

    const update = () => {
      const progress = Math.max(0, Math.min(window.scrollY / maxOffset, 1));
      root.style.setProperty("--parallax-progress", progress.toFixed(3));
      parallaxTargets.forEach((node) => {
        node.style.setProperty("--parallax-progress", progress.toFixed(3));
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    return {
      enable() {
        if (enabled) return;
        enabled = true;
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
      },
      disable() {
        if (!enabled) return;
        enabled = false;
        window.removeEventListener("scroll", onScroll);
        root.style.removeProperty("--parallax-progress");
        parallaxTargets.forEach((node) => node.style.removeProperty("--parallax-progress"));
      },
    };
  })();

  const motionAllowsAnimation = () => {
    const systemReduce = prefersReduce && prefersReduce.matches;
    return state.motion === "auto" && !systemReduce;
  };

  const applyMotion = (value) => {
    state.motion = value === "off" ? "off" : "auto";
    root.dataset.motion = state.motion;
    const motionActive = motionAllowsAnimation();
    motionToggle?.setAttribute("aria-pressed", String(motionActive));
    if (motionToggleText) {
      motionToggleText.textContent = motionActive ? "Motion on" : "Motion off";
    }
    if (parallax) {
      if (motionActive) {
        parallax.enable();
      } else {
        parallax.disable();
      }
    }
    safeStorage.set(storageKeys.motion, state.motion);
  };

  const toggleTheme = () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  };

  const toggleMotion = () => {
    const nextValue = state.motion === "off" ? "auto" : "off";
    applyMotion(nextValue);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (motionToggle) {
    motionToggle.addEventListener("click", toggleMotion);
  }

  if (prefersDark) {
    const handleDarkChange = (event) => {
      const stored = safeStorage.get(storageKeys.theme);
      if (stored === "light" || stored === "dark") return; // Respect explicit user selection.
      applyTheme(event.matches ? "dark" : "light");
    };
    prefersDark.addEventListener("change", handleDarkChange);
  }

  if (prefersReduce) {
    const handleReduceChange = () => {
      applyMotion(state.motion);
    };
    prefersReduce.addEventListener("change", handleReduceChange);
  }

  updateThemeMeta();
  applyTheme(state.theme);
  applyMotion(state.motion);
})();
