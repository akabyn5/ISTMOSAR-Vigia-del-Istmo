(function () {
  "use strict";

  function showMapMessage(message) {
    const mapElement = document.getElementById("map");
    if (mapElement) mapElement.innerHTML = `<div class="map-loading">${message}</div>`;
  }

  function initializeMap() {
    if (typeof L === "undefined") {
      showMapMessage("The map library could not load. Check your internet connection and refresh the page.");
      return;
    }

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    const map = L.map(mapElement, { scrollWheelZoom: false }).setView([8.95, -79.55], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);

    mapElement.dataset.mapReady = "true";
    window.istmosarMap = map;
  }

  window.addEventListener("DOMContentLoaded", initializeMap);
})();
