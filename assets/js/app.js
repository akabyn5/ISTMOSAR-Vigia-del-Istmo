(function () {
  "use strict";

  const sceneSelect = document.getElementById("scene-select");
  const sceneDate = document.getElementById("scene-date");
  const sceneMeta = document.getElementById("scene-meta");
  const sceneStatus = document.getElementById("scene-status");
  const menuToggle = document.getElementById("menu-toggle");
  const primaryNav = document.getElementById("primary-nav");

  function createMetaCell(label, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "meta-cell";
    const labelElement = document.createElement("span");
    labelElement.textContent = label;
    const valueElement = document.createElement("strong");
    valueElement.textContent = value;
    wrapper.append(labelElement, valueElement);
    return wrapper;
  }

  function renderScene(scene) {
    if (!scene) return;
    sceneDate.textContent = new Date(`${scene.date}T12:00:00Z`).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
    });
    sceneMeta.replaceChildren(
      createMetaCell("PRODUCT", scene.product),
      createMetaCell("CYCLE", scene.cycle),
      createMetaCell("RELATIVE TRACK", scene.relativeTrack),
      createMetaCell("FRAME", scene.frame),
      createMetaCell("ORBIT", scene.orbitDirection),
      createMetaCell("ORBIT FIDELITY", scene.orbitFidelity),
      createMetaCell("FREQUENCY", scene.frequency),
      createMetaCell("POLARIZATIONS", scene.polarizations.join(" / ")),
      createMetaCell("CMR GRANULE", scene.cmrGranuleId)
    );
    sceneStatus.querySelector("strong").textContent = scene.preview ? "Preview available" : "Metadata record only";
    sceneStatus.querySelector("p").textContent = scene.preview
      ? "A preview is linked for this acquisition. Coverage and scientific approval must still be checked independently."
      : "No scene raster preview is currently loaded. Geographic intersection with the final study area has not been approved.";
  }

  async function loadScenes() {
    try {
      const response = await fetch("assets/data/scenes.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Scene catalogue returned HTTP ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.scenes) || data.scenes.length === 0) throw new Error("Scene catalogue is empty.");
      data.scenes.forEach((scene) => {
        const option = document.createElement("option");
        option.value = scene.id;
        option.textContent = `${scene.date} · Cycle ${scene.cycle} · Track ${scene.relativeTrack}`;
        sceneSelect.append(option);
      });
      sceneSelect.addEventListener("change", () => {
        renderScene(data.scenes.find((scene) => scene.id === sceneSelect.value));
      });
      renderScene(data.scenes[0]);
    } catch (error) {
      sceneSelect.disabled = true;
      sceneStatus.querySelector("strong").textContent = "Catalogue unavailable";
      sceneStatus.querySelector("p").textContent = error.message;
      console.error("ISTMOSAR scene catalogue error:", error);
    }
  }

  function configureNavigation() {
    if (menuToggle && primaryNav) {
      menuToggle.addEventListener("click", () => {
        const isOpen = primaryNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });
      primaryNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          primaryNav.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    const links = Array.from(document.querySelectorAll(".nav-link"));
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
          }
        });
      }, { rootMargin: "-25% 0px -60% 0px" });
      sections.forEach((section) => observer.observe(section));
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    configureNavigation();
    loadScenes();
  });
})();
