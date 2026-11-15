/*
 * ISTMOSAR — two-date VISUAL comparison (Phase C)
 * Overlays two exploratory HHHH previews (same extent, same dB stretch) and lets the user crossfade.
 * It does NOT compute or draw a difference map, change statistics, flood estimates or conclusions.
 * The panel is injected into #change.
 *
 * Date pairs are generated from the scene list (every chronological pair), not hard-coded.
 * Invalid choices are disabled in the selectors: the Before scene is always the earlier date.
 * scenes.json "pairs" only supplies status and caveats for a pair; it never limits the choices.
 */
(function () {
  "use strict";

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  var WARNING = "Visual comparison only \u2014 not validated change detection.";

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

  function utcWindow(scene) {
    var a = scene.acquisition;
    if (!a || !a.startUtc || !a.endUtc) return "\u2014";
    return a.startUtc.slice(0, 19).replace("T", " ") + " \u2013 " + a.endUtc.slice(11, 19) + " UTC";
  }

  function fidelityText(scene) {
    var token = scene.productDetails && scene.productDetails.orbitPointingFidelityToken;
    return token ? scene.orbitFidelity + " (token " + token + ")" : scene.orbitFidelity;
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
    var metaBefore = el("dl", { class: "compare-meta-list", id: "compare-meta-before" });
    var metaAfter = el("dl", { class: "compare-meta-list", id: "compare-meta-after" });
    var notice = el("div", { class: "notice notice-amber", id: "compare-notice", role: "status" }, [
      el("strong", { text: WARNING }),
      el("p", { id: "compare-notice-text" })
    ]);

    function field(labelText, control, helpText) {
      var wrapper = el("label", { class: "compare-field" }, [el("span", { class: "field-label", text: labelText }), control]);
      if (helpText) {
        var helpId = (control.id || "compare-field") + "-help";
        wrapper.appendChild(el("small", { class: "compare-help", id: helpId, text: helpText }));
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
      el("div", { class: "compare-meta" }, [
        el("div", { class: "compare-meta-col" }, [el("span", { class: "card-index", text: "BEFORE" }), metaBefore]),
        el("div", { class: "compare-meta-col" }, [el("span", { class: "card-index", text: "AFTER" }), metaAfter])
      ]),
      notice
    ]);

    var grid = section.querySelector(".change-grid");
    if (grid && grid.parentNode) grid.parentNode.insertBefore(panel, grid.nextSibling);
    else section.appendChild(panel);

    return { earlierSel: earlierSel, laterSel: laterSel, showEarlier: showEarlier, showLater: showLater,
             fade: fade, opacity: opacity, mapDiv: mapDiv, labelBefore: labelBefore, labelAfter: labelAfter,
             pill: pill, interval: interval, metaBefore: metaBefore, metaAfter: metaAfter,
             noticeText: panel.querySelector("#compare-notice-text") };
  }

  function fillMeta(dl, scene) {
    dl.replaceChildren();
    if (!scene) return;
    var cmr = scene.cmr || {};
    var pending = typeof cmr.ummG !== "string" || cmr.ummG.toUpperCase().indexOf("PENDING") === 0;
    var rows = [
      ["Date", fmtDate(scene.date)],
      ["Acquisition", utcWindow(scene)],
      ["Cycle", scene.cycle],
      ["Orbit & pointing fidelity", fidelityText(scene)],
      ["Granule ID", scene.granuleId || scene.filename],
      [pending ? "CMR concept ID (unverified)" : "CMR concept ID", scene.cmrGranuleId]
    ];
    rows.forEach(function (r) {
      dl.appendChild(el("dt", { text: r[0] }));
      dl.appendChild(el("dd", { text: r[1] }));
    });
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
      var pairs = data.scenes.pairs || [];
      var all = data.scenes.scenes.slice().sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });

      // Valid scenes: a preview file and bounds are recorded, and the bounds match the first valid scene.
      var scenes = all.filter(function (s) {
        return s.preview && s.preview.path && Array.isArray(s.preview.leafletBounds) && s.preview.leafletBounds.length === 2;
      });
      var commonBounds = scenes.length ? scenes[0].preview.leafletBounds : null;
      scenes = scenes.filter(function (s) { return sameBounds(s.preview.leafletBounds, commonBounds); });

      var byId = {};
      scenes.forEach(function (s) { byId[s.id] = s; });

      if (scenes.length < 2) {
        ui.mapDiv.className = "map-loading";
        ui.mapDiv.textContent = "At least two scenes with previews on the same extent are needed for a visual comparison.";
        return;
      }
      var lastDate = scenes[scenes.length - 1].date;

      scenes.forEach(function (s) {
        [ui.earlierSel, ui.laterSel].forEach(function (sel) {
          sel.appendChild(el("option", { value: s.id, text: fmtDate(s.date) + " \u00B7 Cycle " + s.cycle + " \u00B7 " + s.orbitFidelity }));
        });
      });

      // Disable invalid choices: Before must have a later scene; After must be later than Before.
      function refreshOptionStates() {
        var a = byId[ui.earlierSel.value];
        Array.prototype.forEach.call(ui.earlierSel.options, function (o) {
          o.disabled = byId[o.value].date >= lastDate;
        });
        Array.prototype.forEach.call(ui.laterSel.options, function (o) {
          o.disabled = !a || byId[o.value].date <= a.date;
        });
      }
      function firstLaterThan(a) {
        for (var i = 0; i < scenes.length; i++) if (scenes[i].date > a.date) return scenes[i];
        return null;
      }

      // First candidate pair: the first entry of "pairs" if valid, otherwise the first chronological pair.
      var first = null;
      pairs.forEach(function (p) {
        var e = byId[p.earlier], l = byId[p.later];
        if (!first && e && l && e.date < l.date) first = { earlier: e.id, later: l.id };
      });
      if (!first) first = { earlier: scenes[0].id, later: firstLaterThan(scenes[0]).id };
      ui.earlierSel.value = first.earlier;
      refreshOptionStates();
      ui.laterSel.value = first.later;

      var map = L.map(ui.mapDiv, { scrollWheelZoom: false, minZoom: 5 });
      L.tileLayer(OSM_URL, {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> | NISAR L2 GCOV data: NASA/ISRO via ASF DAAC (exploratory display)'
      }).addTo(map);
      var study = data.study || {};
      if (study.mapView && study.mapView.center) map.setView(study.mapView.center, study.mapView.zoom || 8);
      else map.setView([8.95, -79.55], 8);

      var layerBefore = null, layerAfter = null;
      var token = 0;
      var userMoved = false, framing = false;

      function frame() {
        framing = true;
        map.invalidateSize();
        map.fitBounds(commonBounds, { padding: [10, 10], animate: false });
        framing = false;
      }
      map.on("dragstart", function () { if (!framing) userMoved = true; });
      map.on("zoomstart", function () { if (!framing) userMoved = true; });
      if (window.ResizeObserver) {
        new ResizeObserver(function () { map.invalidateSize(); if (!userMoved) frame(); }).observe(ui.mapDiv);
      }

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
        refreshOptionStates();
        var a = byId[ui.earlierSel.value], b = byId[ui.laterSel.value];
        ui.labelBefore.textContent = a ? "BEFORE: " + fmtDate(a.date) + " (" + a.orbitFidelity + " orbit/pointing)" : "";
        ui.labelAfter.textContent = b ? "AFTER: " + fmtDate(b.date) + " (" + b.orbitFidelity + " orbit/pointing)" : "";
        fillMeta(ui.metaBefore, a);
        fillMeta(ui.metaAfter, b);
        ui.interval.textContent = "";
        ui.pill.textContent = "Scientific pair status: PENDING";

        var base = "Two exploratory HHHH previews on the same display scale are overlaid. This is NOT a validated change-detection result: no difference map, change statistics, flooding estimate or environmental conclusion is shown.";
        if (!a || !b) { setNotice(["Select two acquisitions."]); return; }
        if (a.date >= b.date) {
          setNotice(["The Before scene must be earlier than the After scene. Choose two different dates in chronological order."]);
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
          extra.push("No pair record exists for this combination; its scientific status is PENDING.");
        }
        if (a.orbitFidelity !== b.orbitFidelity) {
          extra.push("Orbit and pointing fidelity differs between the two acquisitions.");
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
        layerBefore = mk(a.preview, a).addTo(map);
        layerAfter = mk(b.preview, b).addTo(map);
        applyOpacity();
        if (!userMoved) frame();
        setNotice([base].concat(extra));
      }

      ui.earlierSel.addEventListener("change", function () {
        var a = byId[ui.earlierSel.value];
        var b = byId[ui.laterSel.value];
        if (a && (!b || b.date <= a.date)) {
          var nxt = firstLaterThan(a);
          if (nxt) ui.laterSel.value = nxt.id;
        }
        update();
      });
      ui.laterSel.addEventListener("change", update);
      [ui.fade, ui.opacity].forEach(function (i) { i.addEventListener("input", applyOpacity); });
      [ui.showEarlier, ui.showLater].forEach(function (i) { i.addEventListener("change", applyOpacity); });

      update();
      setTimeout(function () { map.invalidateSize(); if (!userMoved) frame(); }, 200);
      window.addEventListener("load", function () { map.invalidateSize(); if (!userMoved) frame(); });
    }).catch(function (err) {
      console.error("ISTMOSAR comparison error:", err);
      ui.mapDiv.className = "map-loading";
      ui.mapDiv.textContent = "Comparison data could not be loaded: " + err.message;
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
