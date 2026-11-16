/*
 * ISTMOSAR — Leaflet geographic explorer (MH-05)
 * - Loads assets/data/scenes.json and assets/data/study_area.json
 * - Shows the NISAR HHHH preview of the scene chosen in #scene-select
 * - Does NOT edit index.html or app.js: it listens to the existing selector.
 * - Draws NO watershed polygon. The dashed rectangle is a provisional raster viewing extent.
 */
(function () {
  "use strict";

  var SCENES_URL = "assets/data/scenes.json";
  var STUDY_URL = "assets/data/study_area.json";
  var FALLBACK_VIEW = { center: [8.95, -79.55], zoom: 8 };

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
    var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | ' +
        'NISAR L2 GCOV data: NASA/ISRO, distributed by ASF DAAC (exploratory display by ISTMOSAR)'
    }).addTo(map);

    mapElement.dataset.mapReady = "true";
    window.istmosarMap = map;
    // The map column now stretches to the height of the scene panel, so redraw whenever its size changes.
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () { map.invalidateSize(); }).observe(mapElement);
    }

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
      var scenes = d.scenes.scenes;
      var display = d.scenes.display || {};
      var study = d.studyArea || {};

      if (study.mapView && study.mapView.center) {
        map.setView(study.mapView.center, study.mapView.zoom || FALLBACK_VIEW.zoom);
      }

      // Provisional raster viewing extent — NOT an AOI / watershed.
      var extentLayer = L.layerGroup();
      var ext = study.provisionalViewingExtent;
      if (ext && ext.leafletBounds) {
        var rect = L.rectangle(ext.leafletBounds, {
          color: "#e9bd72", weight: 1.5, dashArray: "6 6", fill: false, interactive: false
        });
        extentLayer.addLayer(rect);
        extentLayer.addTo(map);
      }

      var radarGroup = L.layerGroup().addTo(map);

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
        note.textContent = "Shared 2\u201398% stretch \u00B7 transparent = NoData \u00B7 QA masks not applied \u00B7 exploratory";

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

      // ---- static text that index.html says "BASEMAP ONLY" ----
      var tag = document.querySelector(".map-tag");
      if (tag) tag.textContent = "EXPLORATORY PREVIEW";
      var foot = document.querySelectorAll(".map-foot span");
      if (foot.length >= 2) {
        foot[0].textContent = "Study-area polygon: not approved \u00B7 dashed outline = provisional raster extent";
        foot[1].textContent = "Base map \u00A9 OpenStreetMap contributors \u00B7 NISAR data: NASA/ISRO via ASF DAAC";
      }
      mapElement.setAttribute("aria-label", "Interactive map of Panama with the selected NISAR HHHH backscatter preview");

      // ---- scene handling ----
      var currentSceneId = null;
      var currentBounds = null; // footprint of the scene currently shown

      // ---- "Fit to scene" control (below the zoom buttons) ----
      var SVG_NS = "http://www.w3.org/2000/svg";
      var FitControl = L.Control.extend({
        options: { position: "topleft" },
        onAdd: function () {
          var bar = L.DomUtil.create("div", "leaflet-bar leaflet-control map-fit-control");
          var link = L.DomUtil.create("a", "map-fit-button", bar);
          link.href = "#";
          link.setAttribute("role", "button");
          link.title = "Fit to scene";
          link.setAttribute("aria-label", "Fit map to the current NISAR scene");
          var svg = document.createElementNS(SVG_NS, "svg");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("width", "16");
          svg.setAttribute("height", "16");
          svg.setAttribute("aria-hidden", "true");
          var path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", "M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7");
          path.setAttribute("fill", "none");
          path.setAttribute("stroke", "currentColor");
          path.setAttribute("stroke-width", "2");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("stroke-linejoin", "round");
          svg.appendChild(path);
          link.appendChild(svg);
          L.DomEvent.disableClickPropagation(bar);
          L.DomEvent.on(link, "click", function (e) {
            L.DomEvent.preventDefault(e);
            map.invalidateSize();
            var b = currentBounds || (ext && ext.leafletBounds) || null;
            if (b) map.fitBounds(b);
            else if (study.mapView && study.mapView.center) map.setView(study.mapView.center, study.mapView.zoom || FALLBACK_VIEW.zoom);
            else map.setView(FALLBACK_VIEW.center, FALLBACK_VIEW.zoom);
          });
          return bar;
        }
      });
      new FitControl().addTo(map);

      function selectScene(sceneId) {
        var scene = null;
        for (var i = 0; i < scenes.length; i++) if (scenes[i].id === sceneId) scene = scenes[i];
        currentSceneId = sceneId;
        radarGroup.clearLayers(); // never leave an old image next to new metadata
        currentBounds = null;
        hideBanner();
        if (!scene) {
          legendScene.textContent = "No scene selected";
          showBanner("Unknown scene: " + sceneId, "error");
          return;
        }
        legendScene.textContent = scene.label + " \u00B7 " + scene.orbitFidelity;
        if (!map.hasLayer(radarGroup)) map.addLayer(radarGroup);
        document.dispatchEvent(new CustomEvent("istmosar:scenechange", { detail: { scene: scene } }));

        var pv = scene.preview;
        var okBounds = pv && Array.isArray(pv.leafletBounds) && pv.leafletBounds.length === 2;
        if (!pv || !pv.path || !okBounds) {
          showBanner("No NISAR preview is available for " + scene.label + ".");
          return;
        }
        currentBounds = pv.leafletBounds;
        var overlay = L.imageOverlay(pv.path, pv.leafletBounds, {
          opacity: 0.9, interactive: false,
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
        radarGroup.addLayer(overlay);
      }

      var select = document.getElementById("scene-select");
      if (!select) return;
      select.addEventListener("change", function () { selectScene(select.value); });

      var initialised = false;
      function initialSelection() {
        if (initialised || select.options.length === 0) return;
        initialised = true;
        selectScene(select.value || select.options[0].value);
      }
      initialSelection();
      if (!initialised) {
        // app.js fills the selector asynchronously
        var observer = new MutationObserver(function () {
          initialSelection();
          if (initialised) observer.disconnect();
        });
        observer.observe(select, { childList: true });
      }
    }
  }

  window.addEventListener("DOMContentLoaded", initializeMap);
})();