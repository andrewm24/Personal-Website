(function () {
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const motionToggle = document.querySelector("[data-motion-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const motionLabel = document.querySelector("[data-motion-label]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const starsTarget = document.querySelector("[data-stars]");
  const revealNodes = document.querySelectorAll("[data-reveal]");
  const languageList = document.querySelector("[data-languages-list]");
  const spaceBuddy = document.querySelector("[data-space-buddy]");
  const spaceBuddyMessage = document.querySelector("[data-space-buddy-message]");

  const state = {
    theme: root.dataset.theme === "light" ? "light" : "dark",
    motion: root.dataset.motion === "off" ? "off" : "auto",
  };

  const languages = [
    {
      name: "English",
      level: "Native",
      detail: "Daily language for engineering collaboration, documentation, and presentation.",
    },
    {
      name: "Russian",
      level: "Native",
      detail: "Native fluency with strong conversational and technical comfort.",
    },
    {
      name: "Spanish",
      level: "Intermediate",
      detail: "Working proficiency for collaboration, travel, and outreach settings.",
    },
    {
      name: "French",
      level: "Intermediate",
      detail: "Comfortable with day-to-day discussion and reading across mixed contexts.",
    },
    {
      name: "Mandarin Chinese",
      level: "Beginner",
      detail: "Foundational study with practical conversational basics.",
    },
  ];

  let cleanupSpaceBuddyTargets = () => {};
  let cleanupSpaceBuddySections = () => {};

  const save = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage failures.
    }
  };

  const updateThemeMeta = () => {
    if (!themeMeta) return;
    const bg = getComputedStyle(root).getPropertyValue("--bg").trim();
    if (bg) themeMeta.setAttribute("content", bg);
  };

  const applyTheme = (theme) => {
    state.theme = theme === "light" ? "light" : "dark";
    root.dataset.theme = state.theme;
    root.style.colorScheme = state.theme;
    if (themeLabel) {
      themeLabel.textContent = state.theme === "dark" ? "Dark mode" : "Light mode";
    }
    save("am-theme", state.theme);
    updateThemeMeta();
  };

  const applyMotion = (motion) => {
    state.motion = motion === "off" ? "off" : "auto";
    root.dataset.motion = state.motion;
    if (motionLabel) {
      motionLabel.textContent = state.motion === "off" ? "Motion off" : "Motion on";
    }
    save("am-motion", state.motion);
  };

  const renderStars = () => {
    if (!starsTarget) return;
    starsTarget.innerHTML = "";
    const count = window.innerWidth < 700 ? 55 : 90;

    for (let index = 0; index < count; index += 1) {
      const star = document.createElement("span");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--size", `${Math.random() * 2.4 + 0.8}px`);
      star.style.setProperty("--opacity", `${Math.random() * 0.55 + 0.2}`);
      star.style.setProperty("--duration", `${Math.random() * 4 + 4}s`);
      star.style.setProperty("--delay", `${Math.random() * -5}s`);
      starsTarget.appendChild(star);
    }
  };

  const renderLanguages = () => {
    if (!languageList) return;
    languageList.innerHTML = "";

    languages.forEach((language) => {
      const card = document.createElement("article");
      card.className = "language-card reveal is-visible";

      const label = document.createElement("p");
      label.className = "language-card__label";
      label.textContent = language.level;

      const name = document.createElement("h3");
      name.textContent = language.name;

      const detail = document.createElement("p");
      detail.textContent = language.detail;

      card.append(label, name, detail);
      languageList.appendChild(card);
    });
  };

  const setBuddyMessage = (message) => {
    if (!spaceBuddyMessage || !message) return;
    spaceBuddyMessage.textContent = message;
    spaceBuddy?.classList.add("is-chatting");
  };

  const setupSpaceBuddy = () => {
    if (!spaceBuddy || window.matchMedia("(pointer: coarse)").matches || state.motion === "off") {
      spaceBuddy?.classList.remove("is-awake", "is-docked");
      cleanupSpaceBuddyTargets();
      cleanupSpaceBuddyTargets = () => {};
      cleanupSpaceBuddySections();
      cleanupSpaceBuddySections = () => {};
      return;
    }

    cleanupSpaceBuddyTargets();
    cleanupSpaceBuddySections();

    const targetSelector = [
      ".hero__panel",
      ".mission-band",
      ".timeline__item",
      ".system-card",
      ".language-card",
      ".contact-form",
    ].join(", ");

    const targets = Array.from(document.querySelectorAll(targetSelector));
    const trail = spaceBuddy.querySelector(".space-buddy__trail");
    const buddyState = {
      currentX: window.innerWidth * 0.38,
      currentY: window.innerHeight * 0.32,
      targetX: window.innerWidth * 0.38,
      targetY: window.innerHeight * 0.32,
      tilt: 0,
      desiredTilt: 0,
      activeTarget: null,
      awake: false,
      frame: null,
    };

    const sectionTargets = Array.from(document.querySelectorAll("[data-guide-text]")).filter((node) => {
      return !node.matches(".hero__panel, .mission-band, .timeline__item, .system-card, .language-card, .contact-form");
    });

    const getDockPoint = (target) => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5 - 40;
      const topY = rect.top - 44;
      return {
        x: Math.min(Math.max(centerX, 18), window.innerWidth - 98),
        y: Math.max(topY, 82),
      };
    };

    const clearTargetState = () => {
      if (buddyState.activeTarget) {
        buddyState.activeTarget.classList.remove("is-buddy-targeted");
      }
      buddyState.activeTarget = null;
      spaceBuddy.classList.remove("is-docked");
    };

    const dockToTarget = (target) => {
      if (buddyState.activeTarget === target) return;
      clearTargetState();
      buddyState.activeTarget = target;
      target.classList.add("is-buddy-targeted");
      const dockPoint = getDockPoint(target);
      buddyState.targetX = dockPoint.x;
      buddyState.targetY = dockPoint.y;
      buddyState.desiredTilt = 0;
      spaceBuddy.classList.add("is-docked");
      setBuddyMessage(target.dataset.guideText || "This part of my mission deserves a closer look.");
    };

    const releaseToCursor = () => {
      clearTargetState();
    };

    const handleMove = (event) => {
      buddyState.awake = true;
      spaceBuddy.classList.add("is-awake");
      if (buddyState.activeTarget) return;
      const nextX = event.clientX - 48;
      const nextY = event.clientY - 28;
      buddyState.desiredTilt = Math.max(-18, Math.min(18, (nextX - buddyState.currentX) * 0.18));
      buddyState.targetX = nextX;
      buddyState.targetY = nextY;
    };

    const step = () => {
      buddyState.currentX += (buddyState.targetX - buddyState.currentX) * 0.14;
      buddyState.currentY += (buddyState.targetY - buddyState.currentY) * 0.14;
      buddyState.tilt += (buddyState.desiredTilt - buddyState.tilt) * 0.12;

      const translate = `translate3d(${buddyState.currentX.toFixed(2)}px, ${buddyState.currentY.toFixed(2)}px, 0)`;
      spaceBuddy.style.transform = `${translate} rotate(${buddyState.tilt.toFixed(2)}deg)`;

      const trailScale = buddyState.activeTarget ? 0.42 : 0.95;
      const trailLength = buddyState.activeTarget ? 0.28 : 0.72;
      if (trail) {
        trail.style.transform = `scaleX(${trailScale + Math.min(Math.abs(buddyState.tilt) / 30, trailLength)})`;
      }

      buddyState.frame = window.requestAnimationFrame(step);
    };

    const disposers = [];

    targets.forEach((target) => {
      const onEnter = () => dockToTarget(target);
      const onLeave = () => releaseToCursor();
      const onFocus = () => dockToTarget(target);
      const onBlur = (event) => {
        if (event.relatedTarget && target.contains(event.relatedTarget)) return;
        releaseToCursor();
      };

      target.addEventListener("pointerenter", onEnter);
      target.addEventListener("pointerleave", onLeave);
      target.addEventListener("focusin", onFocus);
      target.addEventListener("focusout", onBlur);

      disposers.push(() => target.removeEventListener("pointerenter", onEnter));
      disposers.push(() => target.removeEventListener("pointerleave", onLeave));
      disposers.push(() => target.removeEventListener("focusin", onFocus));
      disposers.push(() => target.removeEventListener("focusout", onBlur));
    });

    const onWindowMove = (event) => handleMove(event);
    const onWindowLeave = () => {
      releaseToCursor();
      buddyState.targetX = window.innerWidth * 0.7;
      buddyState.targetY = 110;
      buddyState.desiredTilt = 8;
    };
    const onResize = () => {
      if (buddyState.activeTarget) {
        const dockPoint = getDockPoint(buddyState.activeTarget);
        buddyState.targetX = dockPoint.x;
        buddyState.targetY = dockPoint.y;
      }
    };

    window.addEventListener("pointermove", onWindowMove, { passive: true });
    window.addEventListener("pointerleave", onWindowLeave);
    window.addEventListener("resize", onResize);
    buddyState.frame = window.requestAnimationFrame(step);

    cleanupSpaceBuddyTargets = () => {
      disposers.forEach((dispose) => dispose());
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerleave", onWindowLeave);
      window.removeEventListener("resize", onResize);
      if (buddyState.frame) {
        window.cancelAnimationFrame(buddyState.frame);
      }
      clearTargetState();
      spaceBuddy.classList.remove("is-chatting");
      spaceBuddy.style.transform = "translate3d(-20vw, -20vh, 0)";
    };

    if ("IntersectionObserver" in window) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          if (buddyState.activeTarget) return;
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

          if (visible?.target?.dataset.guideText) {
            setBuddyMessage(visible.target.dataset.guideText);
          }
        },
        { threshold: [0.25, 0.5, 0.75] }
      );

      sectionTargets.forEach((target) => sectionObserver.observe(target));
      cleanupSpaceBuddySections = () => sectionObserver.disconnect();
    } else {
      cleanupSpaceBuddySections = () => {};
    }

    setBuddyMessage(
      "Welcome aboard. Follow me and I'll guide you through my mission timeline, systems, and contact deck."
    );
  };

  const revealObserver = (() => {
    if (!("IntersectionObserver" in window) || state.motion === "off") {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealNodes.forEach((node) => observer.observe(node));
    return observer;
  })();

  const handlePointerMove = (event) => {
    if (state.motion === "off") return;
    const ratioX = (event.clientX / window.innerWidth - 0.5) * 30;
    const ratioY = (event.clientY / window.innerHeight - 0.5) * 22;
    root.style.setProperty("--stars-x", `${ratioX.toFixed(2)}px`);
    root.style.setProperty("--stars-y", `${ratioY.toFixed(2)}px`);
  };

  const resetParallax = () => {
    root.style.setProperty("--stars-x", "0px");
    root.style.setProperty("--stars-y", "0px");
  };

  themeToggle?.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  motionToggle?.addEventListener("click", () => {
    const next = state.motion === "off" ? "auto" : "off";
    applyMotion(next);
    if (next === "off") {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      resetParallax();
    }
    setupSpaceBuddy();
  });

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", resetParallax);
  window.addEventListener("resize", renderStars);

  renderStars();
  renderLanguages();
  setupSpaceBuddy();
  applyTheme(state.theme);
  applyMotion(state.motion);

  if (!revealObserver || state.motion === "off") {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
})();
