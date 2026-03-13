// terrain-live.js — Live-update: reads admin data from localStorage + cross-tab sync
(function () {
  var STORAGE_KEY = 'op-terrain-admin';

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  var statusConfig = {
    'Pr\u00e9paration': { css: 'terrain-status-badge--preparation', icon: 'fa-tools' },
    'En route':       { css: 'terrain-status-badge--enroute',      icon: 'fa-bicycle' },
    '\u00c9tape':     { css: 'terrain-status-badge--etape',        icon: 'fa-map-pin' },
    'Repos':          { css: 'terrain-status-badge--repos',        icon: 'fa-bed' },
    'Termin\u00e9':   { css: 'terrain-status-badge--termine',      icon: 'fa-check-circle' }
  };

  function updatePositionBadge(statut) {
    var badge = document.getElementById('live-position-badge');
    var icon = document.getElementById('live-position-icon');
    if (!badge) return;
    // Remove all status classes
    var keys = Object.keys(statusConfig);
    for (var i = 0; i < keys.length; i++) {
      badge.classList.remove(statusConfig[keys[i]].css);
    }
    var cfg = statusConfig[statut] || statusConfig['Pr\u00e9paration'];
    badge.classList.add(cfg.css);
    if (icon) icon.className = 'fas ' + cfg.icon;
  }

  var statusTexts = {
    'Pr\u00e9paration': 'Phase de pr\u00e9paration\u00a0: contacts entreprises, planification logistique, recherche sponsors.',
    'En route':         'Actuellement en route \u00e0 v\u00e9lo \u2014 rencontres terrain et exploration des besoins data.',
    '\u00c9tape':       '\u00c9tape en cours \u2014 rencontres entreprises, diagnostics data et \u00e9changes terrain.',
    'Repos':            'Journ\u00e9e de repos \u2014 pr\u00e9paration de la prochaine \u00e9tape.',
    'Termin\u00e9':     'Parcours termin\u00e9\u00a0! Merci \u00e0 toutes les entreprises rencontr\u00e9es.'
  };

  function updatePositionInfo(pos) {
    var el = document.getElementById('live-position-info');
    if (!el) return;
    var dateStr = pos.dateDepart || '';
    var desc = statusTexts[pos.statut] || statusTexts['Pr\u00e9paration'];
    el.innerHTML = 'D\u00e9part pr\u00e9vu le <strong id="live-position-depart">' + escapeHtml(dateStr) + '</strong>. ' + escapeHtml(desc);
  }

  function applyLiveData(d) {
    if (!d) return;
    var dash = d.dashboard || {};
    var pos = d.positionActuelle || {};
    var etapes = d.etapes || [];
    var journal = d.journal || [];

    // --- Show last-updated indicator ---
    if (d._lastSaved) {
      var updEl = document.getElementById('live-updated-at');
      if (updEl) {
        try {
          var dt = new Date(d._lastSaved);
          updEl.textContent = '\u26a1 Donn\u00e9es live \u2014 maj : ' + dt.toLocaleString('fr-FR');
          updEl.style.display = 'block';
        } catch(e) { /* skip */ }
      }
    }

    // --- Dashboard stats ---
    setText('live-km', dash.kmParcourus != null ? dash.kmParcourus : '');
    setText('live-jours', dash.joursPrevus != null ? dash.joursPrevus : '');
    setText('live-jours-route', dash.joursRoute != null ? dash.joursRoute : '');
    setText('live-jours-bar', dash.joursPrevus != null ? dash.joursPrevus : '');
    setText('live-besoins', dash.besoinsIdentifies != null ? dash.besoinsIdentifies : '');
    setText('live-rencontres', dash.rencontresEntreprises != null ? dash.rencontresEntreprises : '');
    setText('live-besoins-m', dash.besoinsIdentifies != null ? dash.besoinsIdentifies : '');
    setText('live-rencontres-m', dash.rencontresEntreprises != null ? dash.rencontresEntreprises : '');
    setText('live-status', dash.etapeEnCours || pos.statut || '');

    // Prochaine étape
    var prochaine = dash.prochaineEtape || '';
    setText('live-prochaine', prochaine);
    setText('live-route-arrivee', prochaine);

    // Départ
    var departVille = '';
    for (var i = 0; i < etapes.length; i++) {
      if (etapes[i].statut === 'depart' || etapes[i].statut === 'actuel') {
        departVille = etapes[i].ville;
        break;
      }
    }
    if (!departVille && pos.ville) departVille = pos.ville;
    setText('live-route-depart', departVille);

    // --- Position section ---
    setText('live-position-ville', pos.ville || '');
    setText('live-position-statut', pos.statut || '');
    setText('live-position-depart', pos.dateDepart || '');
    setText('live-depart-date-bar', pos.dateDepart || '');

    // --- Position badge: class + icon based on statut ---
    updatePositionBadge(pos.statut || '');

    // --- Position info text ---
    updatePositionInfo(pos);

    // --- Photos (using DOM API to avoid inline onerror) ---
    var photosEl = document.getElementById('live-photos');
    if (photosEl && dash.photos) {
      photosEl.innerHTML = '';
      dash.photos.forEach(function (src) {
        var thumb = document.createElement('div');
        thumb.className = 'tdash-thumb';
        var img = document.createElement('img');
        img.src = src;
        img.alt = 'Photo terrain';
        img.loading = 'lazy';
        img.addEventListener('error', function () { thumb.style.display = 'none'; });
        thumb.appendChild(img);
        photosEl.appendChild(thumb);
      });
    }

    // --- Journal ---
    var journalEl = document.getElementById('live-journal');
    if (journalEl && journal.length > 0) {
      var jhtml = '';
      journal.forEach(function (entry) {
        jhtml += '<div class="terrain-journal-entry">' +
          '<div class="terrain-journal-date">' +
          '<i class="fas fa-calendar-day"></i> ' + escapeHtml(entry.date || '') +
          '<span class="terrain-journal-ville">— ' + escapeHtml(entry.ville || '') + '</span>' +
          '</div>' +
          '<h3 class="terrain-journal-titre">' + escapeHtml(entry.titre || '') + '</h3>' +
          '<p>' + escapeHtml(entry.contenu || '') + '</p>';
        if (entry.tags && entry.tags.length) {
          jhtml += '<div class="terrain-journal-tags">';
          entry.tags.forEach(function (tag) {
            jhtml += '<span class="terrain-tag">' + escapeHtml(tag) + '</span>';
          });
          jhtml += '</div>';
        }
        jhtml += '</div>';
      });
      journalEl.innerHTML = jhtml;
    }

    // --- Update Leaflet map markers if maps exist ---
    if (etapes.length && window._terrainMainMap) {
      rebuildMapMarkers(window._terrainMainMap, etapes, false);
      addCwFlags(window._terrainMainMap, false);
    }
    if (etapes.length && window._terrainDashMap) {
      rebuildMapMarkers(window._terrainDashMap, etapes, true);
      addCwFlags(window._terrainDashMap, true);
    }
  }

  function rebuildMapMarkers(map, etapes, compact) {
    var colors = { actuel: '#f59e0b', planifie: '#1a6b8a', visite: '#22c55e', depart: '#f59e0b' };
    // Remove existing markers and polylines
    map.eachLayer(function (layer) {
      if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });
    var routeCoords = [];
    etapes.forEach(function (etape) {
      var color = colors[etape.statut] || colors.planifie;
      var radius = etape.statut === 'actuel' ? (compact ? 8 : 10) : (compact ? 5 : 7);
      var marker = L.circleMarker([etape.lat, etape.lng], {
        radius: radius, fillColor: color, color: '#fff',
        weight: 2, opacity: 1, fillOpacity: 0.9,
      }).addTo(map);
      if (!compact && (etape.statut === 'actuel' || etape.statut === 'visite')) {
        L.circleMarker([etape.lat, etape.lng], {
          radius: 18, fillColor: color, color: color,
          weight: 2, opacity: 0.3, fillOpacity: 0.1,
        }).addTo(map);
      }
      if (!compact) {
        marker.bindPopup(
          '<div style="font-family:Inter,sans-serif;min-width:200px;">' +
          '<strong style="font-size:14px;color:#0b1a2e;">' + etape.ville + '</strong>' +
          '<br><span style="color:#666;font-size:12px;">' + etape.region + '</span>' +
          '<br><span style="color:#888;font-size:11px;">Étape ' + etape.id + ' / 14 — ' + etape.distanceDepuisDepart + ' km</span>' +
          '<hr style="margin:6px 0;border:0;border-top:1px solid #e5e7eb;">' +
          '<p style="font-size:12px;color:#444;margin:0;">' + etape.description + '</p>' +
          '<p style="font-size:11px;color:#999;margin:6px 0 0;">Date estimée : ' + etape.dateEstimee + '</p></div>'
        );
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
        weight: compact ? 2 : 2.5,
        opacity: realized ? 0.8 : 0.5,
        dashArray: realized ? null : '8, 8',
      }).addTo(map);
    }
  }

  // Load from localStorage on page load
  function loadAndApply() {
    // Apply initial badge style from data attribute
    var badge = document.getElementById('live-position-badge');
    if (badge) {
      var initStatut = badge.getAttribute('data-statut') || 'Pr\u00e9paration';
      updatePositionBadge(initStatut);
    }
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) applyLiveData(JSON.parse(raw));
    } catch (e) { /* invalid JSON, skip */ }
    // Also refresh coworking flags
    addCwFlags(window._terrainMainMap, false);
    addCwFlags(window._terrainDashMap, true);
    // Attach error handlers to initial photo thumbnails (CSP-safe)
    var photosEl = document.getElementById('live-photos');
    if (photosEl) {
      var imgs = photosEl.querySelectorAll('img');
      for (var i = 0; i < imgs.length; i++) {
        (function(img) {
          img.addEventListener('error', function() { img.parentElement.style.display = 'none'; });
        })(imgs[i]);
      }
    }
  }

  // Helper to reload coworking flags
  function addCwFlags(map, compact) {
    if (!map || typeof L === 'undefined') return;
    // Remove existing
    if (map._cwMarkers) {
      map._cwMarkers.forEach(function(m) { map.removeLayer(m); });
    }
    map._cwMarkers = [];
    try {
      var raw = localStorage.getItem('op-terrain-coworking');
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

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAndApply);
  } else {
    loadAndApply();
  }

  // Cross-tab real-time: update when admin saves in another tab
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue) {
      try { applyLiveData(JSON.parse(e.newValue)); } catch (err) { /* skip */ }
    }
    if (e.key === 'op-terrain-coworking') {
      addCwFlags(window._terrainMainMap, false);
      addCwFlags(window._terrainDashMap, true);
    }
  });
})();
