/*
 * ISTMOSAR — page behaviour (Phase C)
 * - Fills the scene selector from assets/data/scenes.json.
 * - Renders the acquisition metadata panel and the status checklist for the selected scene.
 * - Publishes the selected scene with the "istmosar:scenechange" event (and window.istmosarCurrentScene)
 *   so map.js shows the matching preview image. One selection drives both, so they cannot disagree.
 * - Handles the mobile menu and the active navigation link.
 * All text from the JSON files is written with textContent (never innerHTML).
 */
(function () {
  "use strict";

  var sceneSelect = document.getElementById("scene-select");
  var sceneDate = document.getElementById("scene-date");
  var sceneMeta = document.getElementById("scene-meta");
  var sceneStatus = document.getElementById("scene-status");
  var sceneChecks = document.getElementById("scene-checks");
  var sceneNote = document.getElementById("scene-note");
  var menuToggle = document.getElementById("menu-toggle");
  var primaryNav = document.getElementById("primary-nav");

  function createMetaCell(label, value, wide) {
    var wrapper = document.createElement("div");
    wrapper.className = "meta-cell" + (wide ? " meta-cell-wide" : "");
    var labelElement = document.createElement("span");
    labelElement.textContent = label;
    var valueElement = document.createElement("strong");
    valueElement.textContent = value;
    wrapper.append(labelElement, valueElement);
    return wrapper;
  }

  function isPending(text) {
    return typeof text !== "string" || text.toUpperCase().indexOf("PENDING") === 0;
  }

  // "Forecast (filename token F)" — the token is the orbit-ephemeris / radar-pointing fidelity letter.
  function fidelityText(scene) {
    var token = scene.productDetails && scene.productDetails.orbitPointingFidelityToken;
    return token ? scene.orbitFidelity + " (filename token " + token + ")" : scene.orbitFidelity;
  }

  function utcWindow(scene) {
    var a = scene.acquisition;
    if (!a || !a.startUtc || !a.endUtc) return "\u2014";
    return a.startUtc.slice(0, 19).replace("T", " ") + " \u2013 " + a.endUtc.slice(11, 19) + " UTC";
  }

  function collectionText(scene) {
    var cmr = scene.cmr || {};
    if (cmr.collectionShortName) {
      return cmr.collectionShortName + " (" + (cmr.collectionConceptId || "ID pending") + ") \u2014 association awaiting official CMR verification";
    }
    return "Pending CMR verification";
  }

  function checkItem(state, text) {
    var li = document.createElement("li");
    li.className = "status-" + state;
    var mark = document.createElement("span");
    mark.className = "status-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = state === "ok" ? "\u2713" : (state === "no" ? "\u00D7" : "\u2026");
    var label = document.createElement("span");
    label.textContent = text;
    li.append(mark, label);
    return li;
  }

  function renderChecks(scene) {
    if (!sceneChecks) return;
    var v = scene.verification || {};
    var cmr = scene.cmr || {};
    var items = [
      scene.preview ? checkItem("ok", "Preview image: available (exploratory display product)")
                    : checkItem("no", "Preview image: not available for this scene"),
      v.metadataVerified ? checkItem("ok", "HDF5 metadata: inspected (grid, CRS, datasets)")
                         : checkItem("pending", "HDF5 metadata: not verified"),
      isPending(cmr.ummG) ? checkItem("pending", "CMR record: verification pending (concept ID shown is previously associated)")
                          : checkItem("ok", "CMR record: verified"),
      v.rasterPreviewVisuallyVerified ? checkItem("ok", "Visual inspection of preview placement: done")
                                      : checkItem("pending", "Visual inspection of preview placement: pending"),
      v.approvedForComparison ? checkItem("ok", "Scientific approval for comparison: granted")
                              : checkItem("pending", "Scientific approval: pending (not approved for change analysis)")
    ];
    sceneChecks.replaceChildren.apply(sceneChecks, items);
  }

  function publishScene(scene) {
    window.istmosarCurrentScene = scene;
    document.dispatchEvent(new CustomEvent("istmosar:scenechange", { detail: { scene: scene } }));
  }

  function renderScene(scene) {
    if (!scene) return;
    var details = scene.productDetails || {};
    var cmr = scene.cmr || {};
    sceneDate.textContent = new Date(scene.date + "T12:00:00Z").toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric", timeZone: "UTC"
    });
    sceneMeta.replaceChildren(
      createMetaCell("PRODUCT", scene.product),
      createMetaCell("CYCLE", scene.cycle),
      createMetaCell("RELATIVE TRACK", scene.relativeTrack),
      createMetaCell("FRAME", scene.frame),
      createMetaCell("ORBIT DIRECTION", scene.orbitDirection),
      createMetaCell("FREQUENCY", scene.frequency),
      createMetaCell("ORBIT & POINTING FIDELITY", fidelityText(scene), true),
      createMetaCell("POLARIZATIONS", scene.polarizations.join(" / ")),
      createMetaCell("CRID", details.crid || "\u2014"),
      createMetaCell("ACQUISITION", utcWindow(scene), true),
      createMetaCell("GRANULE ID", scene.granuleId || scene.filename, true),
      createMetaCell(isPending(cmr.ummG) ? "CMR CONCEPT ID (UNVERIFIED)" : "CMR CONCEPT ID", scene.cmrGranuleId, true),
      createMetaCell("COLLECTION", collectionText(scene), true)
    );

    sceneStatus.querySelector("strong").textContent = scene.preview ? "Exploratory preview" : "Metadata record only";
    sceneStatus.querySelector("p").textContent = scene.preview
      ? (scene.scientificStatus || "Exploratory single-date preview.") + " Extent and scientific approval must be checked independently."
      : "No scene raster preview is loaded for this acquisition. Geographic intersection with the final study area has not been approved.";

    renderChecks(scene);
    if (sceneNote) {
      var note = cmr.collectionNote || "";
      sceneNote.textContent = note;
      sceneNote.hidden = !note;
    }
    publishScene(scene);
  }

  async function loadScenes() {
    try {
      var response = await fetch("assets/data/scenes.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Scene catalogue returned HTTP " + response.status);
      var data = await response.json();
      if (!Array.isArray(data.scenes) || data.scenes.length === 0) throw new Error("Scene catalogue is empty.");
      data.scenes.forEach(function (scene) {
        var option = document.createElement("option");
        option.value = scene.id;
        option.textContent = scene.date + " \u00B7 Cycle " + scene.cycle + " \u00B7 Track " + scene.relativeTrack;
        sceneSelect.append(option);
      });
      sceneSelect.addEventListener("change", function () {
        renderScene(data.scenes.find(function (scene) { return scene.id === sceneSelect.value; }));
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
      menuToggle.addEventListener("click", function () {
        var isOpen = primaryNav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });
      primaryNav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          primaryNav.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    var links = Array.from(document.querySelectorAll(".nav-link"));
    var sections = links.map(function (link) { return document.querySelector(link.getAttribute("href")); }).filter(Boolean);
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (link) { link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id); });
          }
        });
      }, { rootMargin: "-25% 0px -60% 0px" });
      sections.forEach(function (section) { observer.observe(section); });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    configureNavigation();
    loadScenes();
  });
})();
