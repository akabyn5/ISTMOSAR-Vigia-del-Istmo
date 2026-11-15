/*
 * ISTMOSAR — Leaflet radar explorer (Phase C)
 * - Loads assets/data/scenes.json and assets/data/study_area.json.
 * - app.js owns the scene selector and the metadata panel. It publishes the selected scene with
 *   the "istmosar:scenechange" event (and window.istmosarCurrentScene); this file shows the
 *   matching NISAR HHHH preview, so image and metadata always describe the same scene.
 * - Frames the whole raster preview extent with map.fitBounds() using the bounds in scenes.json.
 * - Radar layer opacity (#radar-opacity) and visibility (#radar-visible) are independent controls.
 * - Draws NO watershed polygon. The dashed rectangle is a provisional raster viewing extent.
 */
(function () {
  "use strict";

  var SCENES_URL = "assets/data/scenes.json";
  var STUDY_URL = "assets/data/study_area.json";
  var FALLBACK_VIEW = { center: [8.95, -79.55], zoom: 8 };
  var OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var DEFAULT_OPACITY = 0.9;

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error(url + " returned HTTP " + r.status);
      return r.json();
    });
  }

  // Shared data promise (comparison.js reuses it).
  var shared = { scenes: null, studyArea: null, promise: null };
  window.istmosarData = shared;
  shared.promise = Promise.all([fetchJson(SCENES_URL), fetchJson(STUDY_URL)]).then(function (r) {
    shared.scenes = r[0];
    shared.studyArea = r[1];
    return shared;
  });

  function showMapMessage(message) {
    var mapElement = document.getElementById("map");
    if (!mapElement) return;
    var box = document.createElement("div");
    box.className = "map-loading";
    box.textContent = message;
    mapElement.replaceChildren(box);
  }

  function fmtDb(v) {
    return (v < 0 ? "\u2212" : "") + Math.abs(v).toFixed(1) + " dB";
  }

  function initializeMap() {
    if (typeof L === "undefined") {
      showMapMessage("The map library could not load. Check your internet connection and refresh the page.");
      return;
    }
    var mapElement = document.getElementById("map");
    if (!mapElement) return;
    mapElement.replaceChildren(); // remove the "Loading map…" placeholder

    var map = L.map(mapElement, { scrollWheelZoom: false, minZoom: 5 }).setView(FALLBACK_VIEW.center, FALLBACK_VIEW.zoom);
    var osm = L.tileLayer(OSM_URL, {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | ' +
        'NISAR L2 GCOV data: NASA/ISRO, distributed by ASF DAAC (exploratory display by ISTMOSAR)'
    }).addTo(map);

    mapElement.dataset.mapReady = "true";
    window.istmosarMap = map;

    // ---- in-map message banner (errors / notices) ----
    var banner = document.createElement("div");
    banner.className = "map-banner";
    banner.hidden = true;
    banner.setAttribute("role", "status");
    mapElement.appendChild(banner);
    function showBanner(text, kind) {
      banner.textContent = text;
      banner.className = "map-banner" + (kind === "error" ? " map-banner-error" : "");
      banner.hidden = false;
    }
    function hideBanner() { banner.hidden = true; }

    shared.promise.then(function (d) {
      setup(d);
    }).catch(function (err) {
      console.error("ISTMOSAR map data error:", err);
      showBanner("Map data could not be loaded: " + err.message, "error");
    });

    function setup(d) {
      var display = d.scenes.display || {};
      var study = d.studyArea || {};

      // ---- radar layer state (opacity and visibility are independent) ----
      var radarGroup = L.layerGroup().addTo(map);
      var radarOpacity = DEFAULT_OPACITY;
      var currentOverlay = null;
      var currentSceneId = null;

      // ---- framing: show the whole raster extent from the scene metadata ----
      var framedBounds = null;   // JSON string of the bounds already framed
      var userMoved = false;     // true once the person pans or zooms by hand
      var framing = false;       // true while the code itself moves the map

      function frame(bounds) {
        if (!bounds) return;
        framing = true;
        map.invalidateSize();
        map.fitBounds(bounds, { padding: [10, 10], animate: false });
        framing = false;
        framedBounds = JSON.stringify(bounds);
      }
      map.on("dragstart", function () { if (!framing) userMoved = true; });
      map.on("zoomstart", function () { if (!framing) userMoved = true; });

      function currentBounds() {
        var sc = window.istmosarCurrentScene;
        if (sc && sc.preview && Array.isArray(sc.preview.leafletBounds)) return sc.preview.leafletBounds;
        if (study.provisionalViewingExtent && study.provisionalViewingExtent.leafletBounds) {
          return study.provisionalViewingExtent.leafletBounds;
        }
        return null;
      }
      function refit() {
        if (userMoved) return;
        var b = currentBounds();
        if (b) frame(b);
      }
      if (window.ResizeObserver) {
        new ResizeObserver(function () { map.invalidateSize(); refit(); }).observe(mapElement);
      }
      window.addEventListener("load", refit);

      // "Zoom to preview extent" button (also usable after panning on a phone)
      var fitControl = L.control({ position: "topleft" });
      fitControl.onAdd = function () {
        var div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
        var a = L.DomUtil.create("a", "map-fit-button", div);
        a.href = "#";
        a.title = "Zoom to the preview extent";
        a.setAttribute("role", "button");
        a.setAttribute("aria-label", "Zoom to the preview extent");
        a.textContent = "\u2922";
        L.DomEvent.disableClickPropagation(div);
        L.DomEvent.on(a, "click", function (e) {
          L.DomEvent.preventDefault(e);
          userMoved = false;
          var b = currentBounds();
          if (b) frame(b);
        });
        return div;
      };
      fitControl.addTo(map);

      // Provisional raster viewing extent — NOT an AOI / watershed.
      var extentLayer = L.layerGroup();
      var ext = study.provisionalViewingExtent;
      if (ext && ext.leafletBounds) {
        extentLayer.addLayer(L.rectangle(ext.leafletBounds, {
          color: "#e9bd72", weight: 1.5, dashArray: "6 6", fill: false, interactive: false
        }));
        extentLayer.addTo(map);
      }
      frame(ext && ext.leafletBounds ? ext.leafletBounds : null);

      var overlays = {};
      overlays["NISAR HHHH preview (selected scene)"] = radarGroup;
      overlays["Provisional raster extent (not an AOI)"] = extentLayer;
      L.control.layers({ "OpenStreetMap": osm }, overlays, { collapsed: true, position: "topright" }).addTo(map);

      // ---- legend (compact; can be minimised) ----
      var legendScene;
      var legend = L.control({ position: "bottomleft" });
      legend.onAdd = function () {
        var div = L.DomUtil.create("div", "map-legend");
        var head = L.DomUtil.create("div", "legend-head", div);
        var title = L.DomUtil.create("strong", "", head);
        title.textContent = "HHHH \u03B3\u2070 (dB)";
        var toggle = L.DomUtil.create("button", "legend-toggle", head);
        toggle.type = "button";
        var body = L.DomUtil.create("div", "legend-body", div);
        var ramp = L.DomUtil.create("div", "legend-ramp", body);
        ramp.setAttribute("aria-hidden", "true");
        var scale = L.DomUtil.create("div", "legend-scale", body);
        var lo = L.DomUtil.create("span", "", scale);
        var hi = L.DomUtil.create("span", "", scale);
        lo.textContent = typeof display.sharedVminDb === "number" ? fmtDb(display.sharedVminDb) : "min";
        hi.textContent = typeof display.sharedVmaxDb === "number" ? fmtDb(display.sharedVmaxDb) : "max";
        legendScene = L.DomUtil.create("div", "legend-scene", body);
        var more = L.DomUtil.create("details", "legend-more", body);
        var sum = L.DomUtil.create("summary", "", more);
        sum.textContent = "Notes";
        var note = L.DomUtil.create("div", "legend-note", more);
        note.textContent = "Shared 2\u201398th percentile stretch \u00B7 transparent = NoData or non-positive after resampling \u00B7 QA masks not applied \u00B7 exploratory display product";

        function setCollapsed(c) {
          div.classList.toggle("collapsed", c);
          toggle.textContent = c ? "+" : "\u2212";
          toggle.setAttribute("aria-expanded", String(!c));
          toggle.setAttribute("aria-label", c ? "Show legend" : "Minimize legend");
        }
        setCollapsed(!!(window.matchMedia && window.matchMedia("(max-width: 700px)").matches));
        toggle.addEventListener("click", function () { setCollapsed(!div.classList.contains("collapsed")); });

        L.DomEvent.disableClickPropagation(div);
        return div;
      };
      legend.addTo(map);

      // ---- opacity and visibility controls in the Radar Explorer panel ----
      var opacityInput = document.getElementById("radar-opacity");
      var opacityOut = document.getElementById("radar-opacity-value");
      var visibleInput = document.getElementById("radar-visible");

      function showOpacityValue() {
        if (opacityOut) opacityOut.textContent = Math.round(radarOpacity * 100) + "%";
        if (opacityInput) opacityInput.setAttribute("aria-valuetext", Math.round(radarOpacity * 100) + " percent");
      }
      if (opacityInput) {
        radarOpacity = Math.max(0.1, Math.min(1, Number(opacityInput.value) / 100 || DEFAULT_OPACITY));
        opacityInput.addEventListener("input", function () {
          radarOpacity = Math.max(0.1, Math.min(1, Number(opacityInput.value) / 100));
          if (currentOverlay) currentOverlay.setOpacity(radarOpacity); // updates the real Leaflet overlay
          showOpacityValue();
        });
      }
      showOpacityValue();

      if (visibleInput) {
        visibleInput.checked = map.hasLayer(radarGroup);
        visibleInput.addEventListener("change", function () {
          if (visibleInput.checked) { if (!map.hasLayer(radarGroup)) map.addLayer(radarGroup); }
          else if (map.hasLayer(radarGroup)) map.removeLayer(radarGroup);
        });
        // keep the checkbox in step with the Leaflet layers control
        map.on("overlayadd", function (e) { if (e.layer === radarGroup) visibleInput.checked = true; });
        map.on("overlayremove", function (e) { if (e.layer === radarGroup) visibleInput.checked = false; });
      }

      // ---- map-side text that depends on the data ----
      mapElement.setAttribute("aria-label", "Interactive map of Panama with the selected NISAR HHHH backscatter preview");

      // ---- scene handling ----
      function fidelityShort(scene) {
        return scene.orbitFidelity + " orbit/pointing";
      }

      function showScene(scene) {
        radarGroup.clearLayers(); // never leave an old image next to new metadata
        currentOverlay = null;
        hideBanner();
        if (!scene) return;
        currentSceneId = scene.id;
        legendScene.textContent = scene.label + " \u00B7 " + fidelityShort(scene);

        var pv = scene.preview;
        var okBounds = pv && Array.isArray(pv.leafletBounds) && pv.leafletBounds.length === 2;
        if (!pv || !pv.path || !okBounds) {
          showBanner("No NISAR preview is available for " + scene.label + ".");
          return;
        }
        if (JSON.stringify(pv.leafletBounds) !== framedBounds && !userMoved) frame(pv.leafletBounds);

        var overlay = L.imageOverlay(pv.path, pv.leafletBounds, {
          opacity: radarOpacity, interactive: false,
          alt: "NISAR Frequency A HHHH backscatter preview, " + scene.label
        });
        overlay.on("error", function () {
          if (currentSceneId === scene.id) {
            showBanner("Preview image for " + scene.label + " could not be loaded (" + pv.path + "). Check that the file exists in assets/maps/.", "error");
          }
        });
        overlay.on("load", function () {
          if (currentSceneId === scene.id) hideBanner();
        });
        currentOverlay = overlay;
        radarGroup.addLayer(overlay);
      }

      document.addEventListener("istmosar:scenechange", function (e) {
        showScene(e.detail && e.detail.scene);
      });
      if (window.istmosarCurrentScene) showScene(window.istmosarCurrentScene);
    }
  }

  window.addEventListener("DOMContentLoaded", initializeMap);
})();
