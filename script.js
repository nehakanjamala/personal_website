window.addEventListener("load", () => {
  const INTRO_HOLD_MS = 700;
  const SEAM_TO_WIPE_GAP_MS = 50;
  const REVEAL_OVERLAP_MS = 500;
  const CLEANUP_DELAY_MS = 260;
  const HERO_TYPE_DELAY_MS = 600;
  const root = document.documentElement;
  const logoShell = document.querySelector(".logo-shell");
  const heroCopy = document.querySelector(".hero-copy");
  const projectViewport = document.querySelector(".project-viewport");
  const projectList = document.querySelector(".project-list");
  const projectMoreButton = document.querySelector(".project-more");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const HERO_TAGLINE = "Learning to build things that matter.";
  let hasTypedHeroTagline = false;

  if (heroCopy) {
    heroCopy.textContent = "";
  }

  const initCursorTrail = () => {
    if (prefersReducedMotion.matches || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let lastEmitTime = 0;
    let lastX = -1000;
    let lastY = -1000;

    const emitTrail = (x, y, velocity = 0) => {
      const dot = document.createElement("span");
      dot.className = "cursor-trail";

      const size = Math.min(20, Math.max(10, 10 + velocity * 0.08));
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      document.body.appendChild(dot);
      dot.addEventListener("animationend", () => {
        dot.remove();
      }, { once: true });
    };

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const distance = Math.hypot(dx, dy);

      // Keep the trail smooth but limit particle count for performance.
      if (now - lastEmitTime < 14 && distance < 10) {
        return;
      }

      lastEmitTime = now;
      lastX = event.clientX;
      lastY = event.clientY;
      emitTrail(event.clientX, event.clientY, distance);
    });
  };

  const playHeroTypewriter = () => {
    if (!heroCopy || hasTypedHeroTagline) {
      return;
    }

    hasTypedHeroTagline = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      heroCopy.textContent = HERO_TAGLINE;
      return;
    }

    let cursor = 0;
    heroCopy.textContent = "";
    heroCopy.classList.add("is-typing");

    const step = () => {
      if (cursor > HERO_TAGLINE.length) {
        heroCopy.classList.remove("is-typing");
        return;
      }

      heroCopy.textContent = HERO_TAGLINE.slice(0, cursor);
      const nextChar = HERO_TAGLINE.charAt(cursor);
      cursor += 1;
      const delay = nextChar === " " ? 28 : 46;
      window.setTimeout(step, delay);
    };

    step();
  };

  const parseMsVar = (name, fallback) => {
    const value = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const getViewportLineEndpoints = (cx, cy, angleDeg) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const theta = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(theta);
    const dy = Math.sin(theta);
    const points = [];

    const maybeAddPoint = (x, y, t) => {
      if (x >= -0.5 && x <= w + 0.5 && y >= -0.5 && y <= h + 0.5) {
        const clampedX = Math.min(w, Math.max(0, x));
        const clampedY = Math.min(h, Math.max(0, y));
        const isDuplicate = points.some(
          (point) => Math.abs(point.x - clampedX) < 0.5 && Math.abs(point.y - clampedY) < 0.5,
        );

        if (!isDuplicate) {
          points.push({ x: clampedX, y: clampedY, t });
        }
      }
    };

    if (Math.abs(dx) > 1e-6) {
      const tLeft = (0 - cx) / dx;
      maybeAddPoint(0, cy + tLeft * dy, tLeft);

      const tRight = (w - cx) / dx;
      maybeAddPoint(w, cy + tRight * dy, tRight);
    }

    if (Math.abs(dy) > 1e-6) {
      const tTop = (0 - cy) / dy;
      maybeAddPoint(cx + tTop * dx, 0, tTop);

      const tBottom = (h - cy) / dy;
      maybeAddPoint(cx + tBottom * dx, h, tBottom);
    }

    if (points.length < 2) {
      return [
        { x: 0, y: 0 },
        { x: w, y: h },
      ];
    }

    points.sort((a, b) => a.t - b.t);
    return [points[0], points[points.length - 1]];
  };

  const syncSeamOrigin = () => {
    if (!logoShell) {
      return;
    }

    const styles = getComputedStyle(root);
    const seamXPercent = parseFloat(styles.getPropertyValue("--seam-logo-x")) || 50;
    const seamYPercent = parseFloat(styles.getPropertyValue("--seam-logo-y")) || 50;
    const seamAngle = parseFloat(styles.getPropertyValue("--seam-angle")) || -40;
    const seamWidth = parseFloat(styles.getPropertyValue("--seam-width")) || 12;
    const rect = logoShell.getBoundingClientRect();
    const seamX = rect.left + rect.width * (seamXPercent / 100);
    const seamY = rect.top + rect.height * (seamYPercent / 100);
    const [lineStart, lineEnd] = getViewportLineEndpoints(seamX, seamY, seamAngle);
    const viewportDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
    const shiftDistance = viewportDiagonal * 2.2;
    const theta = (seamAngle * Math.PI) / 180;
    const tangentX = Math.cos(theta);
    const tangentY = Math.sin(theta);
    const normalAX = -tangentY;
    const normalAY = tangentX;
    const normalBX = -normalAX;
    const normalBY = -normalAY;
    const upNormal = normalAY < normalBY
      ? { x: normalAX, y: normalAY }
      : { x: normalBX, y: normalBY };
    const downNormal = { x: -upNormal.x, y: -upNormal.y };
    const lineUpStart = {
      x: lineStart.x + upNormal.x * shiftDistance,
      y: lineStart.y + upNormal.y * shiftDistance,
    };
    const lineUpEnd = {
      x: lineEnd.x + upNormal.x * shiftDistance,
      y: lineEnd.y + upNormal.y * shiftDistance,
    };
    const lineDownStart = {
      x: lineStart.x + downNormal.x * shiftDistance,
      y: lineStart.y + downNormal.y * shiftDistance,
    };
    const lineDownEnd = {
      x: lineEnd.x + downNormal.x * shiftDistance,
      y: lineEnd.y + downNormal.y * shiftDistance,
    };
    const seamHalfThickness = seamWidth / 2;
    const seamBandAStart = {
      x: lineStart.x + upNormal.x * seamHalfThickness,
      y: lineStart.y + upNormal.y * seamHalfThickness,
    };
    const seamBandAEnd = {
      x: lineEnd.x + upNormal.x * seamHalfThickness,
      y: lineEnd.y + upNormal.y * seamHalfThickness,
    };
    const seamBandBStart = {
      x: lineStart.x + downNormal.x * seamHalfThickness,
      y: lineStart.y + downNormal.y * seamHalfThickness,
    };
    const seamBandBEnd = {
      x: lineEnd.x + downNormal.x * seamHalfThickness,
      y: lineEnd.y + downNormal.y * seamHalfThickness,
    };

    root.style.setProperty("--seam-screen-x", `${seamX}px`);
    root.style.setProperty("--seam-screen-y", `${seamY}px`);
    root.style.setProperty("--seam-angle", `${seamAngle}deg`);
    root.style.setProperty("--seam-line-x1", `${lineStart.x}px`);
    root.style.setProperty("--seam-line-y1", `${lineStart.y}px`);
    root.style.setProperty("--seam-line-x2", `${lineEnd.x}px`);
    root.style.setProperty("--seam-line-y2", `${lineEnd.y}px`);
    root.style.setProperty("--seam-up-x1", `${lineUpStart.x}px`);
    root.style.setProperty("--seam-up-y1", `${lineUpStart.y}px`);
    root.style.setProperty("--seam-up-x2", `${lineUpEnd.x}px`);
    root.style.setProperty("--seam-up-y2", `${lineUpEnd.y}px`);
    root.style.setProperty("--seam-down-x1", `${lineDownStart.x}px`);
    root.style.setProperty("--seam-down-y1", `${lineDownStart.y}px`);
    root.style.setProperty("--seam-down-x2", `${lineDownEnd.x}px`);
    root.style.setProperty("--seam-down-y2", `${lineDownEnd.y}px`);
    root.style.setProperty("--seam-band-a-x1", `${seamBandAStart.x}px`);
    root.style.setProperty("--seam-band-a-y1", `${seamBandAStart.y}px`);
    root.style.setProperty("--seam-band-a-x2", `${seamBandAEnd.x}px`);
    root.style.setProperty("--seam-band-a-y2", `${seamBandAEnd.y}px`);
    root.style.setProperty("--seam-band-b-x1", `${seamBandBStart.x}px`);
    root.style.setProperty("--seam-band-b-y1", `${seamBandBStart.y}px`);
    root.style.setProperty("--seam-band-b-x2", `${seamBandBEnd.x}px`);
    root.style.setProperty("--seam-band-b-y2", `${seamBandBEnd.y}px`);
  };

  const SEAM_PHASE_MS = parseMsVar("--seam-duration", 380);
  const WIPE_PHASE_MS = parseMsVar("--wipe-duration", 1180);
  const PROJECT_SCROLL_MS = 620;
  let isScrollingProjects = false;

  const measureProjectViewport = () => {
    if (!projectViewport || !projectList) {
      return;
    }

    const items = Array.from(projectList.children);
    if (items.length === 0) {
      return;
    }

    const listStyles = window.getComputedStyle(projectList);
    const gap = parseFloat(listStyles.rowGap || listStyles.gap || "0") || 0;
    const rowHeight = Math.max(...items.map((item) => item.getBoundingClientRect().height));

    items.forEach((item) => {
      item.style.minHeight = `${rowHeight}px`;
    });

    const visibleCount = Math.min(3, items.length);
    const visibleHeight = rowHeight * visibleCount + gap * Math.max(0, visibleCount - 1);

    projectViewport.style.setProperty("--project-viewport-height", `${visibleHeight}px`);
  };

  const scrollProjectList = () => {
    if (!projectList || isScrollingProjects) {
      return;
    }

    const items = Array.from(projectList.children);
    if (items.length <= 3) {
      return;
    }

    const firstItem = items[0];
    const remainingItems = items.slice(1);
    const firstItemRect = firstItem.getBoundingClientRect();
    const firstPositions = new Map(
      remainingItems.map((item) => {
        const rect = item.getBoundingClientRect();
        return [item, { x: rect.left, y: rect.top }];
      }),
    );

    isScrollingProjects = true;
    projectList.style.willChange = "transform";

    const floatingItem = firstItem.cloneNode(true);
    floatingItem.style.position = "fixed";
    floatingItem.style.left = `${firstItemRect.left}px`;
    floatingItem.style.top = `${firstItemRect.top}px`;
    floatingItem.style.width = `${firstItemRect.width}px`;
    floatingItem.style.margin = "0";
    floatingItem.style.zIndex = "3";
    floatingItem.style.pointerEvents = "none";
    floatingItem.style.transition = "transform 220ms ease, opacity 220ms ease";
    floatingItem.style.transform = "translateY(0)";
    floatingItem.style.opacity = "1";
    document.body.appendChild(floatingItem);

    projectList.appendChild(firstItem);

    const lastPositions = new Map(
      remainingItems.map((item) => {
        const rect = item.getBoundingClientRect();
        return [item, { x: rect.left, y: rect.top }];
      }),
    );

    remainingItems.forEach((item) => {
      const first = firstPositions.get(item);
      const last = lastPositions.get(item);
      const deltaX = first.x - last.x;
      const deltaY = first.y - last.y;

      item.style.transition = "none";
      item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      item.style.opacity = "1";
    });

    projectList.offsetHeight;

    window.requestAnimationFrame(() => {
      remainingItems.forEach((item) => {
        item.style.transition = "transform 620ms cubic-bezier(0.2, 0.9, 0.2, 1)";
        item.style.transform = "translate(0, 0)";
      });

      floatingItem.style.transform = "translateY(-12px)";
      floatingItem.style.opacity = "0";
    });

    const finishScroll = () => {
      remainingItems.forEach((item) => {
        item.style.transition = "";
        item.style.transform = "";
      });
      floatingItem.remove();
      projectList.style.willChange = "";
      isScrollingProjects = false;
      measureProjectViewport();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finishScroll();
      return;
    }

    window.setTimeout(finishScroll, PROJECT_SCROLL_MS);
  };

  if (projectMoreButton) {
    projectMoreButton.addEventListener("click", scrollProjectList);
  }

  initCursorTrail();

  syncSeamOrigin();

  window.requestAnimationFrame(() => {
    syncSeamOrigin();
    measureProjectViewport();
    document.body.classList.add("is-ready");
  });

  window.addEventListener("resize", () => {
    window.requestAnimationFrame(() => {
      syncSeamOrigin();
      measureProjectViewport();
    });
  });

  window.setTimeout(() => {
    document.body.classList.add("is-seam-phase");

    window.setTimeout(() => {
      document.body.classList.add("is-wipe-phase");

      // Reveal the main page while the wipe is still expanding so the expansion remains visible.
      window.setTimeout(() => {
        document.body.classList.add("is-reveal-phase");
        window.setTimeout(() => {
          playHeroTypewriter();
        }, HERO_TYPE_DELAY_MS);
      }, Math.max(0, WIPE_PHASE_MS - REVEAL_OVERLAP_MS));

      window.setTimeout(() => {
        window.setTimeout(() => {
          document.body.classList.add("is-complete");
        }, CLEANUP_DELAY_MS);
      }, WIPE_PHASE_MS);
    }, SEAM_PHASE_MS + SEAM_TO_WIPE_GAP_MS);
  }, INTRO_HOLD_MS);
});
