/*
 * ISTMOSAR — two-date VISUAL comparison (MH-06)
 * Overlays two exploratory HHHH previews (same extent, same dB stretch) and lets the user crossfade.
 * It does NOT compute or draw a difference map, change statistics, flood estimates or conclusions.
 * The panel is injected into #change so index.html does not need to change.
 */
(function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  window.istmosarComparison = Object.freeze({
    enabled: true,
    mode: "visual-only",
    differenceLayer: false,
    status: "pending-scientific-approval"
  });

  function el(tag, props, children) {
    var node = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      if (k === "text") node.textContent = props[k];
      else if (k === "class") node.className = props[k];
      else node.setAttribute(k, props[k]);
    });
    (children || []).forEach(function (c) { node.appendChild(c); });
    return node;
  }

  function fmtDate(iso) {
    var p = iso.split("-");
    return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  }

  function daysBetween(a, b) {
    return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);
  }

  function sameBounds(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  function loadData() {
    if (window.istmosarData && window.istmosarData.promise) {
      return window.istmosarData.promise.then(function (d) { return { scenes: d.scenes, study: d.studyArea }; });
    }
    return Promise.all([
      fetch("assets/data/scenes.json", { cache: "no-store" }).then(function (r) { return r.json(); }),
      fetch("assets/data/study_area.json", { cache: "no-store" }).then(function (r) { return r.json(); })
    ]).then(function (r) { return { scenes: r[0], study: r[1] }; });
  }

  function buildPanel(section) {
    var earlierSel = el("select", { id: "compare-earlier", class: "scene-select" });
    var laterSel = el("select", { id: "compare-later", class: "scene-select" });
    var showEarlier = el("input", { type: "checkbox", id: "compare-show-earlier", checked: "checked" });
    var showLater = el("input", { type: "checkbox", id: "compare-show-later", checked: "checked" });
    var fade = el("input", { type: "range", id: "compare-fade", min: "0", max: "100", value: "50", "aria-label": "Crossfade between earlier and later acquisition" });
    var opacity = el("input", { type: "range", id: "compare-opacity", min: "10", max: "100", value: "90", "aria-label": "Overall layer opacity" });
    var mapDiv = el("div", { id: "compare-map", role: "region", "aria-label": "Before and after NISAR HHHH preview comparison map" });
    var labelBefore = el("span", { class: "compare-label", id: "compare-label-before" });
    var labelAfter = el("span", { class: "compare-label", id: "compare-label-after" });
    var pill = el("span", { class: "pill pill-pending", id: "compare-pill", text: "Scientific pair status: PENDING" });
    var interval = el("span", { class: "compare-interval", id: "compare-interval" });
    var notice = el("div", { class: "notice notice-amber", id: "compare-notice", role: "status" }, [
      el("strong", { text: "Visual comparison only" }),
      el("p", { id: "compare-notice-text" })
    ]);

    function field(labelText, control, helpText) {
      var wrapper = el("label", { class: "compare-field" }, [
        el("span", { class: "field-label", text: labelText }),
        control
      ]);
      
      if (helpText) {
        var helpId = (control.id || "compare-field") + "-help";
        wrapper.appendChild(
          el("small", {
            class: "compare-help",
            id: helpId,
            text: helpText
          })
        );
        control.setAttribute("aria-describedby", helpId);
      }
      
      return wrapper;
    }

    function check(labelText, input) {
      return el("label", { class: "compare-check" }, [input, el("span", { text: labelText })]);
    }

    var panel = el("div", { class: "compare-panel", id: "compare-panel" }, [
      el("div", { class: "compare-head" }, [
        el("span", { class: "card-index", text: "C / TWO-DATE VISUAL COMPARISON" }), pill
      ]),
      el("div", { class: "compare-controls" }, [
        field("Before (earlier acquisition)", earlierSel, "The latest acquisition cannot be selected because no later scene exists."),
        field("After (later acquisition)", laterSel, "Only acquisitions later than your selected Before date are available."),
        field("Crossfade: earlier \u2190 \u2192 later", fade),
        field("Layer opacity", opacity),
        el("div", { class: "compare-checks" }, [check("Show earlier layer", showEarlier), check("Show later layer", showLater)])
      ]),
      el("div", { class: "compare-map-wrap" }, [
        mapDiv,
        el("div", { class: "compare-labels" }, [labelBefore, labelAfter])
      ]),
      interval,
      notice
    ]);

    var grid = section.querySelector(".change-grid");
    if (grid && grid.parentNode) grid.parentNode.insertBefore(panel, grid.nextSibling);
    else section.appendChild(panel);

    return { earlierSel: earlierSel, laterSel: laterSel, showEarlier: showEarlier, showLater: showLater,
             fade: fade, opacity: opacity, mapDiv: mapDiv, labelBefore: labelBefore, labelAfter: labelAfter,
             pill: pill, interval: interval, noticeText: panel.querySelector("#compare-notice-text") };
  }

  // "Fit to scene" control: same look and behaviour as the Radar Explorer button.
  // getBounds() returns the Leaflet bounds to fit (or null); fallback() runs when there are none.
  function addFitControl(map, getBounds, fallback) {
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
        // diagonal double-headed arrow (bottom-left <-> top-right)
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
          var b = getBounds();
          if (b) map.fitBounds(b);
          else if (fallback) fallback();
        });
        return bar;
      }
    });
    new FitControl().addTo(map);
  }

  function init() {
    var section = document.getElementById("change");
    if (!section) return;
    var ui = buildPanel(section);

    if (typeof L === "undefined") {
      ui.mapDiv.textContent = "The map library could not load. Check your connection and refresh.";
      ui.mapDiv.className = "map-loading";
      return;
    }

    loadData().then(function (data) {
      var scenes = data.scenes.scenes;
      var pairs = data.scenes.pairs || [];
      var byId = {};
      scenes.forEach(function (s) { byId[s.id] = s; });

      scenes.forEach(function (s) {
        [ui.earlierSel, ui.laterSel].forEach(function (sel) {
          sel.appendChild(el("option", { value: s.id, text: fmtDate(s.date) + " \u00B7 Cycle " + s.cycle + " \u00B7 " + s.orbitFidelity }));
        });
      });
      // First-priority candidate pair: June 16 -> June 28
      var first = pairs.length ? pairs[0] : { earlier: scenes[0].id, later: scenes[Math.min(1, scenes.length - 1)].id };
      ui.earlierSel.value = first.earlier;
      ui.laterSel.value = first.later;

      var map = L.map(ui.mapDiv, { scrollWheelZoom: false, minZoom: 5 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | NISAR L2 GCOV data: NASA/ISRO via ASF DAAC (exploratory display)'
      }).addTo(map);
      var study = data.study || {};
      if (study.mapView && study.mapView.center) map.setView(study.mapView.center, study.mapView.zoom || 8);
      else map.setView([8.95, -79.55], 8);

      var layerBefore = null, layerAfter = null;
      var token = 0;

      // Bounds of the comparison scene currently shown (null when no overlay is displayed).
      var currentBounds = null;
      var studyExtent = study.provisionalViewingExtent && study.provisionalViewingExtent.leafletBounds;
      addFitControl(
        map,
        function () { return currentBounds || studyExtent || null; },
        function () {
          var v = study.mapView && study.mapView.center ? study.mapView : { center: [8.95, -79.55], zoom: 8 };
          map.setView(v.center, v.zoom || 8);
        }
      );

      function setNotice(parts) { ui.noticeText.textContent = parts.join(" "); }

      function clearLayers() {
        if (layerBefore) { map.removeLayer(layerBefore); layerBefore = null; }
        if (layerAfter) { map.removeLayer(layerAfter); layerAfter = null; }
      }

      function applyOpacity() {
        var t = ui.fade.value / 100;
        var o = ui.opacity.value / 100;
        if (layerBefore) layerBefore.setOpacity(ui.showEarlier.checked ? o * (1 - t) : 0);
        if (layerAfter) layerAfter.setOpacity(ui.showLater.checked ? o * t : 0);
      }

      function update() {
        var myToken = ++token;
        clearLayers();
        currentBounds = null;
        var a = byId[ui.earlierSel.value], b = byId[ui.laterSel.value];
        ui.labelBefore.textContent = a ? "BEFORE: " + fmtDate(a.date) + " (" + a.orbitFidelity + ")" : "";
        ui.labelAfter.textContent = b ? "AFTER: " + fmtDate(b.date) + " (" + b.orbitFidelity + ")" : "";
        ui.interval.textContent = "";
        ui.pill.textContent = "Scientific pair status: PENDING";

        var base = "Two exploratory HHHH previews on the same display scale are overlaid. This is NOT a validated change-detection result: no difference map, change statistics, flooding estimate or environmental conclusion is shown.";
        if (!a || !b) { setNotice(["Select two acquisitions."]); return; }
        if (a.date >= b.date) {
          setNotice(["The earlier acquisition must be before the later one. Choose two different dates in chronological order."]);
          return;
        }
        ui.interval.textContent = "Interval: " + daysBetween(a.date, b.date) + " days";

        var extra = [];
        var pair = null;
        pairs.forEach(function (p) { if (p.earlier === a.id && p.later === b.id) pair = p; });
        if (pair) {
          ui.pill.textContent = "Scientific pair status: " + pair.status;
          (pair.caveats || []).forEach(function (c) { extra.push(c); });
        } else {
          extra.push("This pair is not in the candidate list; status PENDING.");
        }
        if (a.orbitFidelity !== b.orbitFidelity) {
          extra.push("Orbit fidelity differs between the two acquisitions.");
        }

        var pa = a.preview, pb = b.preview;
        if (!pa || !pa.path || !pb || !pb.path) { setNotice(["A preview is missing for one of the selected scenes.", base]); return; }
        if (!sameBounds(pa.leafletBounds, pb.leafletBounds)) {
          setNotice(["The two previews do not share the same geographic extent, so they are not overlaid.", base]);
          return;
        }

        var failed = [];
        function mk(p, scene) {
          var l = L.imageOverlay(p.path, p.leafletBounds, { opacity: 0, interactive: false, alt: "NISAR HHHH preview " + scene.label });
          l.on("error", function () {
            if (myToken !== token) return;
            failed.push(p.path);
            setNotice(["Preview file could not be loaded: " + failed.join(", ") + ". Check that it exists in assets/maps/.", base]);
          });
          return l;
        }
        layerBefore = mk(pa, a).addTo(map);
        layerAfter = mk(pb, b).addTo(map);
        applyOpacity();
        currentBounds = pa.leafletBounds;
        map.fitBounds(currentBounds);
        setNotice([base].concat(extra));
      }

      // Chronological guard: disable impossible options and keep the pairing valid.
      function refreshOptionStates() {
        var earlier = byId[ui.earlierSel.value];
        var latestDate = scenes.reduce(function (m, s) { return s.date > m ? s.date : m; }, scenes[0].date);
        Array.prototype.forEach.call(ui.earlierSel.options, function (o) {
          var sc = byId[o.value];
          // The latest acquisition has no later scene, so it cannot be "Before".
          o.disabled = sc.date >= latestDate;
        });
        Array.prototype.forEach.call(ui.laterSel.options, function (o) {
          var sc = byId[o.value];
          // Only scenes strictly later than the selected Before date.
          o.disabled = !!earlier && sc.date <= earlier.date;
        });
      }

      function ensureValidPairing() {
        var a = byId[ui.earlierSel.value];
        var b = byId[ui.laterSel.value];
        if (a && b && b.date > a.date) { refreshOptionStates(); return; }
        // Pick the nearest later scene after the selected Before date.
        var next = null;
        scenes.forEach(function (s) {
          if (a && s.date > a.date && (!next || s.date < next.date)) next = s;
        });
        if (next) {
          ui.laterSel.value = next.id;
        } else if (a) {
          // Before has no later scene (should be unreachable: option is disabled). Fall back to the
          // earliest scene as Before and the nearest later scene as After.
          var sorted = scenes.slice().sort(function (x, y) { return x.date < y.date ? -1 : 1; });
          ui.earlierSel.value = sorted[0].id;
          ui.laterSel.value = sorted[1] ? sorted[1].id : sorted[0].id;
        }
        refreshOptionStates();
      }

      ensureValidPairing();

      ui.earlierSel.addEventListener("change", function () { ensureValidPairing(); update(); });
      ui.laterSel.addEventListener("change", function () { ensureValidPairing(); update(); });
      [ui.fade, ui.opacity].forEach(function (i) { i.addEventListener("input", applyOpacity); });
      [ui.showEarlier, ui.showLater].forEach(function (i) { i.addEventListener("change", applyOpacity); });

      update();
      setTimeout(function () { map.invalidateSize(); }, 200);
      window.addEventListener("load", function () { map.invalidateSize(); });
    }).catch(function (err) {
      console.error("ISTMOSAR comparison error:", err);
      ui.mapDiv.className = "map-loading";
      ui.mapDiv.textContent = "Comparison data could not be loaded: " + err.message;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();