// terrain-maps.js — Leaflet map initialization + live-update from localStorage
// Data is passed from Astro via <script type="application/json" id="terrain-data">

(function () {
  // ---- Read server-side data ----
  var _td = JSON.parse(document.getElementById('terrain-data').textContent);
  var etapes = _td.etapes;
  var position = _td.position;

  function _initTerrainMaps() {
    if (typeof L === 'undefined') {
      setTimeout(_initTerrainMaps, 100);
      return;
    }

    var colors = {
      actuel: '#f59e0b',
      planifie: '#1a6b8a',
      visite: '#22c55e',
      depart: '#f59e0b',
    };

    // ---- Helper: create a map with markers + route ----
    function initTerrainMap(elementId, opts) {
      var mapEl = document.getElementById(elementId);
      if (!mapEl) return null;

      var center = opts.center || [46.6, 2.8];
      var zoom = opts.zoom || 6;

      var map = L.map(elementId, {
        scrollWheelZoom: true,
        zoomControl: opts.zoomControl !== false,
      }).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Cycling overlay layers
      var cyclosmOverlay = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm-lite/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.cyclosm.org/">CyclOSM</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 18,
        opacity: 0.6,
      });
      var waymarkedOverlay = L.tileLayer('https://tile.waymarkedtrails.org/cycling/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://waymarkedtrails.org/">Waymarked Trails</a>',
        maxZoom: 18,
        opacity: 0.7,
      });
      map._cyclosmOverlay = cyclosmOverlay;
      map._waymarkedOverlay = waymarkedOverlay;
      if (!opts.compact) {
        cyclosmOverlay.addTo(map);
      }

      var routeCoords = [];
      var stepsData = opts.etapes || etapes;

      stepsData.forEach(function (etape) {
        var color = colors[etape.statut] || colors.planifie;
        var radius = etape.statut === 'actuel' ? (opts.compact ? 8 : 10) : (opts.compact ? 5 : 7);

        var marker = L.circleMarker([etape.lat, etape.lng], {
          radius: radius,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        // Label for visited / current
        if (!opts.compact && (etape.statut === 'actuel' || etape.statut === 'visite')) {
          L.circleMarker([etape.lat, etape.lng], {
            radius: 18,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 0.3,
            fillOpacity: 0.1,
          }).addTo(map);
        }

        if (!opts.compact) {
          var popupHtml =
            '<div style="font-family:Inter,sans-serif;min-width:200px;">' +
            '<strong style="font-size:14px;color:#0b1a2e;">' + etape.ville + '</strong>' +
            '<br><span style="color:#666;font-size:12px;">' + etape.region + '</span>' +
            '<br><span style="color:#888;font-size:11px;">Étape ' + etape.id + ' / 14 — ' + etape.distanceDepuisDepart + ' km</span>' +
            '<hr style="margin:6px 0;border:0;border-top:1px solid #e5e7eb;">' +
            '<p style="font-size:12px;color:#444;margin:0;">' + etape.description + '</p>' +
            '<p style="font-size:11px;color:#999;margin:6px 0 0;">Date estimée : ' + etape.dateEstimee + '</p>' +
            '</div>';
          marker.bindPopup(popupHtml);
        } else {
          marker.bindTooltip(etape.ville, { permanent: false, direction: 'top', className: 'tdash-tooltip' });
        }

        routeCoords.push({ lat: etape.lat, lng: etape.lng, statut: etape.statut });
      });

      // Draw segmented route: green solid for realized, dark blue dashed for planned
      for (var i = 0; i < routeCoords.length - 1; i++) {
        var from = routeCoords[i];
        var to = routeCoords[i + 1];
        var realized = (from.statut === 'visite' || from.statut === 'actuel' || from.statut === 'depart') &&
                       (to.statut === 'visite' || to.statut === 'actuel');
        L.polyline([[from.lat, from.lng], [to.lat, to.lng]], {
          color: realized ? '#22c55e' : '#1a6b8a',
          weight: opts.compact ? 2 : 2.5,
          opacity: realized ? 0.8 : 0.5,
          dashArray: realized ? null : '8, 8',
        }).addTo(map);
      }

      return map;
    }

    // ---- Helper: add coworking flag markers ----
    function addCoworkingMarkers(map, compact) {
      // Remove existing coworking markers
      if (map._cwMarkers) {
        map._cwMarkers.forEach(function(m) { map.removeLayer(m); });
      }
      map._cwMarkers = [];
      var CW_KEY = 'op-terrain-coworking';
      try {
        var raw = localStorage.getItem(CW_KEY);
        if (!raw) return;
        var cwList = JSON.parse(raw);
        cwList.forEach(function(cw) {
          if (!cw.visible || !cw.lat || !cw.lng) return;
          var flagIcon = L.divIcon({
            className: 'cw-flag-marker',
            html: '<i class="fas fa-flag" style="color:#d4845a;font-size:' + (compact ? '14px' : '18px') + ';filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));"></i>',
            iconSize: compact ? [14, 14] : [18, 18],
            iconAnchor: compact ? [2, 14] : [3, 18],
          });
          var m = L.marker([cw.lat, cw.lng], { icon: flagIcon }).addTo(map);
          if (!compact) {
            var popup = '<div style="font-family:Inter,sans-serif;min-width:180px;">' +
              '<strong style="font-size:13px;color:#0b1a2e;">' + (cw.nom || '') + '</strong>' +
              '<br><span style="color:#666;font-size:12px;"><i class="fas fa-map-marker-alt"></i> ' + (cw.ville || '') + '</span>';
            if (cw.adresse) popup += '<br><span style="color:#888;font-size:11px;">' + cw.adresse + '</span>';
            if (cw.url) popup += '<br><a href="' + cw.url + '" target="_blank" rel="noopener" style="font-size:11px;">Site web</a>';
            popup += '</div>';
            m.bindPopup(popup);
          } else {
            m.bindTooltip(cw.nom || 'Coworking', { permanent: false, direction: 'top' });
          }
          map._cwMarkers.push(m);
        });
      } catch(e) { /* skip */ }
    }

    // ---- Parse GPX XML string → [[lat,lng], ...] ----
    function parseGpxCoords(xml) {
      var doc = new DOMParser().parseFromString(xml, 'application/xml');
      var pts = doc.querySelectorAll('trkpt');
      if (pts.length === 0) pts = doc.querySelectorAll('rtept');
      var coords = [];
      pts.forEach(function(p) {
        var lat = parseFloat(p.getAttribute('lat'));
        var lon = parseFloat(p.getAttribute('lon'));
        if (!isNaN(lat) && !isNaN(lon)) coords.push([lat, lon]);
      });
      return coords;
    }

    // ---- Draw a GPX polyline on the map ----
    function drawGpxTrack(map, coords, name) {
      if (coords.length < 2) return;
      var layer = L.polyline(coords, {
        color: '#f59e0b',
        weight: 3,
        opacity: 0.8,
      }).addTo(map).bindTooltip(name || 'Tracé GPX', { sticky: true });
      map._gpxLayers.push(layer);
    }

    // ---- Load GPX tracks from localStorage ----
    function loadGpxTracks(map) {
      var gpxKey = 'op-terrain-gpx';
      var gpxRaw = localStorage.getItem(gpxKey);
      if (!gpxRaw) return;
      if (!map._gpxLayers) map._gpxLayers = [];
      try {
        var gpxFiles = JSON.parse(gpxRaw);
        gpxFiles.forEach(function(g) {
          if (g.visible === false) return;
          // New format: gpxContent stored inline
          if (g.gpxContent) {
            drawGpxTrack(map, parseGpxCoords(g.gpxContent), g.name);
            return;
          }
          // Legacy fallback: fetch from path
          if (g.path) {
            fetch(g.path)
              .then(function(r) { return r.ok ? r.text() : null; })
              .then(function(xml) {
                if (xml) drawGpxTrack(map, parseGpxCoords(xml), g.name);
              })
              .catch(function() { /* file not uploaded yet */ });
          }
        });
      } catch(e) { /* ignore */ }
    }

    // ---- 1. Full page map ----
    var mainMap = initTerrainMap('terrain-map', {
      center: [46.6, 2.8],
      zoom: 6,
      compact: false,
    });
    if (mainMap) loadGpxTracks(mainMap);
    if (mainMap) addCoworkingMarkers(mainMap, false);
    window._terrainMainMap = mainMap;

    // Toggle coworking flags
    var cwToggle = document.getElementById('cw-toggle');
    if (cwToggle) {
      cwToggle.addEventListener('change', function() {
        var show = cwToggle.checked;
        [mainMap, dashMap].forEach(function(map) {
          if (!map || !map._cwMarkers) return;
          map._cwMarkers.forEach(function(m) {
            if (show) { m.addTo(map); } else { map.removeLayer(m); }
          });
        });
      });
    }

    // Toggle pistes cyclables (CyclOSM)
    var cyclosmToggle = document.getElementById('cyclosm-toggle');
    if (cyclosmToggle) {
      cyclosmToggle.addEventListener('change', function() {
        var show = cyclosmToggle.checked;
        [mainMap, dashMap].forEach(function(map) {
          if (!map || !map._cyclosmOverlay) return;
          if (show) { map._cyclosmOverlay.addTo(map); } else { map.removeLayer(map._cyclosmOverlay); }
        });
      });
    }

    // Toggle routes vélo nationales (Waymarked Trails)
    var waymarkedToggle = document.getElementById('waymarked-toggle');
    if (waymarkedToggle) {
      waymarkedToggle.addEventListener('change', function() {
        var show = waymarkedToggle.checked;
        [mainMap, dashMap].forEach(function(map) {
          if (!map || !map._waymarkedOverlay) return;
          if (show) { map._waymarkedOverlay.addTo(map); } else { map.removeLayer(map._waymarkedOverlay); }
        });
      });
    }

    // Toggle tracé GPX
    var gpxToggle = document.getElementById('gpx-toggle');
    if (gpxToggle) {
      gpxToggle.addEventListener('change', function() {
        var show = gpxToggle.checked;
        [mainMap, dashMap].forEach(function(map) {
          if (!map || !map._gpxLayers) return;
          map._gpxLayers.forEach(function(layer) {
            if (show) { layer.addTo(map); } else { map.removeLayer(layer); }
          });
        });
      });
    }

    // ---- 2. Dashboard compact map ----
    var dashMap = initTerrainMap('tdash-map', {
      center: [47.5, 2.5],
      zoom: 6,
      compact: true,
      zoomControl: false,
    });
    window._terrainDashMap = dashMap;
    if (dashMap) addCoworkingMarkers(dashMap, true);
    if (dashMap) loadGpxTracks(dashMap);

    // Force map tiles to render correctly
    setTimeout(function() {
      if (mainMap) mainMap.invalidateSize();
      if (dashMap) dashMap.invalidateSize();
    }, 200);
  }

  // Init maps (Leaflet JS loaded via preceding script tag)
  _initTerrainMaps();
})();
