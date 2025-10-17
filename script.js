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
    constellations: "am-constellations",
  };

  // Update the language objects below to adjust spoken language content without editing markup.
  const languageData = [
    {
      name: "English",
      proficiency: "Native",
      description: "Daily academic, research, and professional collaboration across technical and design teams.",
      level: 100,
    },
    {
      name: "Russian",
      proficiency: "Native",
      description: "Native fluency for technical deep-dives, mission planning, and family conversations.",
      level: 100,
    },
    {
      name: "Spanish",
      proficiency: "Intermediate",
      description: "Collaborative working proficiency for outreach events, teammate pairing, and travel logistics.",
      level: 70,
    },
    {
      name: "French",
      proficiency: "Intermediate",
      description: "Comfortable navigating design reviews, documentation, and day-to-day discussions with francophone teams.",
      level: 60,
    },
    {
      name: "Mandarin Chinese",
      proficiency: "Beginner",
      description: "HSK 2 foundation supporting travel, cultural exchange, and introductory technical syncs.",
      level: 35,
    },
  ];

  const root = document.documentElement;
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeToggleText = document.querySelector("[data-theme-toggle-text]");
  const motionToggle = document.querySelector("[data-motion-toggle]");
  const motionToggleText = document.querySelector("[data-motion-toggle-text]");
  const constellationToggle = document.querySelector("[data-constellation-toggle]");
  const constellationToggleText = document.querySelector("[data-constellation-toggle-text]");
  const constellationGuideToggle = document.querySelector("[data-constellation-guide-toggle]");
  const constellationPanel = document.querySelector("[data-constellation-panel]");
  const constellationList = document.querySelector("[data-constellation-list]");
  const parallaxTargets = document.querySelectorAll("[data-parallax]");
  const starfield = document.querySelector("[data-starfield]");
  const languageList = document.querySelector("[data-languages-list]");
  const constellationGroups = Array.from(document.querySelectorAll(".constellation[data-constellation]"));
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
    constellations: root.dataset.constellations === "off" ? "off" : "on",
  };

  const constellationButtons = new Map();
  let hoverConstellationId = null;
  let lockedConstellationId = null;

  const renderLanguages = () => {
    if (!languageList || !languageData.length) {
      return;
    }

    languageList.innerHTML = "";

    languageData.forEach((language, index) => {
      const card = document.createElement("article");
      card.className = "language-card";

      const header = document.createElement("div");
      header.className = "language-card__header";

      const name = document.createElement("h3");
      name.className = "language-card__name";
      name.textContent = language.name;

      const badge = document.createElement("span");
      badge.className = "language-card__badge";
      badge.textContent = language.proficiency;
      badge.setAttribute("aria-label", `Proficiency level: ${language.proficiency}`);

      header.appendChild(name);
      header.appendChild(badge);

      const description = document.createElement("p");
      description.className = "language-card__description";
      description.textContent = language.description;

      card.appendChild(header);
      card.appendChild(description);

      if (typeof language.level === "number") {
        const normalisedLevel = clamp(language.level, 0, 100);
        const meterId = `language-meter-${index}`;
        const meter = document.createElement("div");
        meter.className = "language-card__meter";

        const label = document.createElement("label");
        label.setAttribute("for", meterId);
        label.textContent = `${language.proficiency} proficiency`;

        const progress = document.createElement("progress");
        progress.id = meterId;
        progress.max = 100;
        progress.value = normalisedLevel;
        progress.setAttribute("aria-valuemin", "0");
        progress.setAttribute("aria-valuenow", String(normalisedLevel));
        progress.setAttribute("aria-valuemax", "100");
        progress.setAttribute("aria-label", `${language.proficiency} proficiency ${normalisedLevel} out of 100`);

        meter.appendChild(label);
        meter.appendChild(progress);
        card.appendChild(meter);
      }

      languageList.appendChild(card);
    });
  };

  const syncConstellations = () => {
    const activeId = state.constellations === "on" ? lockedConstellationId || hoverConstellationId : null;

    constellationGroups.forEach((group) => {
      const isActive = Boolean(activeId && group.dataset.constellation === activeId);
      group.classList.toggle("is-active", isActive);
    });

    constellationButtons.forEach((button, id) => {
      const isLocked = lockedConstellationId === id && state.constellations === "on";
      const isActive = activeId === id;
      button.setAttribute("aria-pressed", String(isLocked));
      button.classList.toggle("is-active", isActive);
    });
  };

  const renderConstellationGuide = () => {
    if (!constellationList || !constellationGroups.length) {
      return;
    }

    constellationButtons.clear();
    constellationList.innerHTML = "";

    constellationGroups.forEach((group) => {
      const id = group.dataset.constellation;
      if (!id) return;

      const name = group.dataset.name || id;
      const description = group.dataset.description || "";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "constellation-guide__item";
      button.dataset.constellationItem = id;
      button.setAttribute("aria-pressed", "false");

      const title = document.createElement("span");
      title.className = "constellation-guide__item-title";
      title.textContent = name;
      button.appendChild(title);

      if (description) {
        const detail = document.createElement("p");
        detail.className = "constellation-guide__item-description";
        detail.textContent = description;
        button.appendChild(detail);
      }

      const setHover = () => {
        hoverConstellationId = id;
        syncConstellations();
      };

      const clearHover = () => {
        hoverConstellationId = null;
        syncConstellations();
      };

      button.addEventListener("mouseenter", setHover);
      button.addEventListener("focus", setHover);
      button.addEventListener("mouseleave", clearHover);
      button.addEventListener("blur", clearHover);
      button.addEventListener("click", () => {
        lockedConstellationId = lockedConstellationId === id ? null : id;
        syncConstellations();
      });

      constellationButtons.set(id, button);
      constellationList.appendChild(button);
    });

    syncConstellations();
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
    const hasHeroParallax = parallaxTargets.length > 0;
    const hasStarfield = Boolean(starfield);

    if (!hasHeroParallax && !hasStarfield) return null;

    const maxOffset = 520; // Scroll distance before clamping the parallax effect.
    const starScrollLimit = 48; // Adjust to increase or decrease scroll influence on the starfield.
    const pointerStrength = { x: 36, y: 24 }; // Change to tune pointer parallax range for the starfield.

    let ticking = false;
    let enabled = false;

    const pointerState = {
      active: false,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      rafId: null,
      lastFrame: 0,
    };

    const pointerStep = (timestamp) => {
      if (!pointerState.active) {
        pointerState.rafId = null;
        return;
      }

      if (timestamp - pointerState.lastFrame >= 1000 / 45) {
        pointerState.lastFrame = timestamp;
        pointerState.currentX += (pointerState.targetX - pointerState.currentX) * 0.1;
        pointerState.currentY += (pointerState.targetY - pointerState.currentY) * 0.1;
        root.style.setProperty("--star-parallax-x", `${pointerState.currentX.toFixed(2)}px`);
        root.style.setProperty("--star-parallax-y", `${pointerState.currentY.toFixed(2)}px`);
      }

      pointerState.rafId = window.requestAnimationFrame(pointerStep);
    };

    const startPointerLoop = () => {
      if (pointerState.active) return;
      pointerState.active = true;
      pointerState.lastFrame = 0;
      pointerState.rafId = window.requestAnimationFrame(pointerStep);
    };

    const stopPointerLoop = () => {
      pointerState.active = false;
      if (pointerState.rafId) {
        window.cancelAnimationFrame(pointerState.rafId);
        pointerState.rafId = null;
      }
      pointerState.targetX = 0;
      pointerState.targetY = 0;
      pointerState.currentX = 0;
      pointerState.currentY = 0;
    };

    const onPointerMove = (event) => {
      if (!hasStarfield) return;
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const ratioX = event.clientX / width - 0.5;
      const ratioY = event.clientY / height - 0.5;
      pointerState.targetX = ratioX * pointerStrength.x;
      pointerState.targetY = ratioY * pointerStrength.y;
    };

    const onPointerLeave = () => {
      pointerState.targetX = 0;
      pointerState.targetY = 0;
    };

    const update = () => {
      if (hasHeroParallax) {
        const progress = Math.max(0, Math.min(window.scrollY / maxOffset, 1));
        const formatted = progress.toFixed(3);
        root.style.setProperty("--parallax-progress", formatted);
        parallaxTargets.forEach((node) => {
          node.style.setProperty("--parallax-progress", formatted);
        });
      }

      if (hasStarfield) {
        const scrollProgress = Math.max(0, Math.min(window.scrollY / maxOffset, 1));
        const scrollY = scrollProgress * starScrollLimit;
        const scrollX = scrollProgress * -starScrollLimit * 0.35;
        root.style.setProperty("--star-scroll-y", `${scrollY.toFixed(2)}px`);
        root.style.setProperty("--star-scroll-x", `${scrollX.toFixed(2)}px`);
      }
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
        if (hasStarfield) {
          window.addEventListener("pointermove", onPointerMove, { passive: true });
          window.addEventListener("pointerleave", onPointerLeave);
          startPointerLoop();
        }
      },
      disable() {
        if (!enabled) return;
        enabled = false;
        window.removeEventListener("scroll", onScroll);
        if (hasHeroParallax) {
          root.style.removeProperty("--parallax-progress");
          parallaxTargets.forEach((node) => node.style.removeProperty("--parallax-progress"));
        }
        if (hasStarfield) {
          window.removeEventListener("pointermove", onPointerMove);
          window.removeEventListener("pointerleave", onPointerLeave);
          stopPointerLoop();
          root.style.setProperty("--star-parallax-x", "0px");
          root.style.setProperty("--star-parallax-y", "0px");
          root.style.setProperty("--star-scroll-x", "0px");
          root.style.setProperty("--star-scroll-y", "0px");
        }
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
    if (!motionActive) {
      root.style.setProperty("--star-parallax-x", "0px");
      root.style.setProperty("--star-parallax-y", "0px");
      root.style.setProperty("--star-scroll-x", "0px");
      root.style.setProperty("--star-scroll-y", "0px");
    }
    safeStorage.set(storageKeys.motion, state.motion);
  };

  const applyConstellations = (value) => {
    state.constellations = value === "off" ? "off" : "on";
    root.dataset.constellations = state.constellations;
    const isActive = state.constellations === "on";
    constellationToggle?.setAttribute("aria-pressed", String(isActive));
    if (constellationToggleText) {
      constellationToggleText.textContent = isActive ? "Constellations on" : "Constellations off";
    }
    safeStorage.set(storageKeys.constellations, state.constellations);
    if (!isActive) {
      hoverConstellationId = null;
      lockedConstellationId = null;
      if (constellationPanel && constellationGuideToggle) {
        constellationGuideToggle.setAttribute("aria-expanded", "false");
        constellationPanel.hidden = true;
      }
    }
    syncConstellations();
  };

  const toggleTheme = () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  };

  const toggleMotion = () => {
    const nextValue = state.motion === "off" ? "auto" : "off";
    applyMotion(nextValue);
  };

  const toggleConstellations = () => {
    const nextValue = state.constellations === "on" ? "off" : "on";
    applyConstellations(nextValue);
  };

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (motionToggle) {
    motionToggle.addEventListener("click", toggleMotion);
  }

  if (constellationToggle) {
    constellationToggle.addEventListener("click", toggleConstellations);
  }

  if (constellationGuideToggle && constellationPanel) {
    constellationGuideToggle.addEventListener("click", () => {
      const expanded = constellationGuideToggle.getAttribute("aria-expanded") === "true";
      const next = !expanded;
      constellationGuideToggle.setAttribute("aria-expanded", String(next));
      constellationPanel.hidden = !next;
    });
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

  renderLanguages();
  renderConstellationGuide();
  if (constellationPanel && constellationGuideToggle && window.matchMedia("(min-width: 960px)").matches) {
    constellationGuideToggle.setAttribute("aria-expanded", "true");
    constellationPanel.hidden = false;
  }
  updateThemeMeta();
  applyTheme(state.theme);
  applyMotion(state.motion);
  applyConstellations(state.constellations);
})();
