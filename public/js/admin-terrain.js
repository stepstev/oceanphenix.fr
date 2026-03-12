// admin-terrain.js — Admin panel logic
// Data is passed from Astro via <script type="application/json" id="etapes-data">
(function() {
  'use strict';

  // ---- Read server-side data ----
  var etapesData = JSON.parse(document.getElementById('etapes-data').textContent);

  // ---- Config ----
  var PASS_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // "admin"
  var STORAGE_KEY = 'op-terrain-admin';
  var STORAGE_GPX_KEY = 'op-terrain-gpx';

  var data = null;
  var gpxFiles = [];
  var currentGpxContent = null;
  var gpxMap = null;
  var gpxLayer = null;

  // ---- Helpers ----
  async function sha256(str) {
    var buf = new TextEncoder().encode(str);
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  function loadData() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { data = JSON.parse(saved); return; } catch(e) { /* fall through */ }
    }
    data = JSON.parse(JSON.stringify(etapesData));
  }

  function loadGpx() {
    var saved = localStorage.getItem(STORAGE_GPX_KEY);
    if (saved) {
      try { gpxFiles = JSON.parse(saved); } catch(e) { gpxFiles = []; }
    }
  }

  function saveData(silent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (!silent) showToast('Donn\u00e9es sauvegard\u00e9es dans le navigateur');
  }

  function saveGpxData() {
    localStorage.setItem(STORAGE_GPX_KEY, JSON.stringify(gpxFiles));
  }

  function exportJson() {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'terrain-etapes.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON exporté — déposez-le dans src/data/');
  }

  function showToast(msg) {
    var toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('admin-toast--show'); }, 10);
    setTimeout(function() {
      toast.classList.remove('admin-toast--show');
      setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
  }

  // ---- Captcha ----
  var captchaA, captchaB, captchaOp, captchaAnswer;
  function generateCaptcha() {
    captchaA = Math.floor(Math.random() * 20) + 1;
    captchaB = Math.floor(Math.random() * 20) + 1;
    var ops = ['+', '-', '\u00d7'];
    captchaOp = ops[Math.floor(Math.random() * ops.length)];
    if (captchaOp === '+') captchaAnswer = captchaA + captchaB;
    else if (captchaOp === '-') { if (captchaA < captchaB) { var t = captchaA; captchaA = captchaB; captchaB = t; } captchaAnswer = captchaA - captchaB; }
    else captchaAnswer = captchaA * captchaB;
    document.getElementById('captcha-label').textContent = '\ud83d\udd12 V\u00e9rification : ' + captchaA + ' ' + captchaOp + ' ' + captchaB + ' = ?';
    document.getElementById('admin-captcha').value = '';
  }
  generateCaptcha();

  // ---- Auth ----
  var AUTH_SESSION_KEY = 'op-admin-auth';
  var AUTH_MAX_AGE = 3600000; // 1 hour
  var authEl = document.getElementById('admin-auth');
  var panelEl = document.getElementById('admin-panel');
  var passInput = document.getElementById('admin-pass');
  var captchaInput = document.getElementById('admin-captcha');
  var loginBtn = document.getElementById('admin-login-btn');
  var authError = document.getElementById('admin-auth-error');
  var failCount = 0;
  var MAX_ATTEMPTS = 5;
  var lockedUntil = 0;

  function isSessionValid() {
    var raw = sessionStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return false;
    try {
      var sess = JSON.parse(raw);
      if (sess.v !== 2 || !sess.ts) return false;
      if (Date.now() - sess.ts > AUTH_MAX_AGE) { sessionStorage.removeItem(AUTH_SESSION_KEY); return false; }
      return true;
    } catch(e) { sessionStorage.removeItem(AUTH_SESSION_KEY); return false; }
  }
  function setSession() {
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ v: 2, ts: Date.now() }));
  }

  if (isSessionValid()) {
    authEl.style.display = 'none';
    panelEl.style.display = 'block';
    init();
  }

  loginBtn.addEventListener('click', async function() {
    // Rate-limit
    if (Date.now() < lockedUntil) {
      var secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      authError.textContent = 'Trop de tentatives \u2014 r\u00e9essayez dans ' + secs + 's';
      authError.style.display = 'block';
      return;
    }
    // Validate captcha
    var userCaptcha = parseInt(captchaInput.value);
    if (isNaN(userCaptcha) || userCaptcha !== captchaAnswer) {
      failCount++;
      authError.textContent = 'Captcha incorrect';
      authError.style.display = 'block';
      generateCaptcha();
      if (failCount >= MAX_ATTEMPTS) { lockedUntil = Date.now() + 30000; }
      return;
    }
    // Validate password
    var hash = await sha256(passInput.value);
    if (hash === PASS_HASH) {
      setSession();
      authEl.style.display = 'none';
      panelEl.style.display = 'block';
      authError.style.display = 'none';
      failCount = 0;
      init();
    } else {
      failCount++;
      authError.textContent = 'Mot de passe incorrect';
      authError.style.display = 'block';
      passInput.value = '';
      passInput.focus();
      generateCaptcha();
      if (failCount >= MAX_ATTEMPTS) { lockedUntil = Date.now() + 30000; }
    }
  });

  captchaInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') loginBtn.click();
  });
  passInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') captchaInput.focus();
  });

  // ---- Tabs ----
  document.querySelectorAll('.admin-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('admin-tab--active'); });
      document.querySelectorAll('.admin-tab-content').forEach(function(c) { c.classList.remove('admin-tab-content--active'); });
      tab.classList.add('admin-tab--active');
      var target = document.getElementById('tab-' + tab.getAttribute('data-tab'));
      if (target) target.classList.add('admin-tab-content--active');
      if (tab.getAttribute('data-tab') === 'preview') renderPreview();
      if (tab.getAttribute('data-tab') === 'gpx' && !gpxMap) initGpxMap();
      if (tab.getAttribute('data-tab') === 'villes' && !villesRendered) renderVilles('');
      if (tab.getAttribute('data-tab') === 'coworking') renderCoworking();
    });
  });

  // ---- Villes de France ----
  var VILLES_FR = [
    {v:'Paris',r:'Île-de-France',lat:48.8566,lng:2.3522},
    {v:'Marseille',r:'Provence-Alpes-Côte d\'Azur',lat:43.2965,lng:5.3698},
    {v:'Lyon',r:'Auvergne-Rhône-Alpes',lat:45.7640,lng:4.8357},
    {v:'Toulouse',r:'Occitanie',lat:43.6047,lng:1.4442},
    {v:'Nice',r:'Provence-Alpes-Côte d\'Azur',lat:43.7102,lng:7.2620},
    {v:'Nantes',r:'Pays de la Loire',lat:47.2184,lng:-1.5536},
    {v:'Strasbourg',r:'Grand Est',lat:48.5734,lng:7.7521},
    {v:'Montpellier',r:'Occitanie',lat:43.6108,lng:3.8767},
    {v:'Bordeaux',r:'Nouvelle-Aquitaine',lat:44.8378,lng:-0.5792},
    {v:'Lille',r:'Hauts-de-France',lat:50.6292,lng:3.0573},
    {v:'Rennes',r:'Bretagne',lat:48.1173,lng:-1.6778},
    {v:'Reims',r:'Grand Est',lat:49.2583,lng:3.2794},
    {v:'Saint-Étienne',r:'Auvergne-Rhône-Alpes',lat:45.4397,lng:4.3872},
    {v:'Le Havre',r:'Normandie',lat:49.4944,lng:0.1079},
    {v:'Toulon',r:'Provence-Alpes-Côte d\'Azur',lat:43.1242,lng:5.9280},
    {v:'Grenoble',r:'Auvergne-Rhône-Alpes',lat:45.1885,lng:5.7245},
    {v:'Dijon',r:'Bourgogne-Franche-Comté',lat:47.3220,lng:5.0415},
    {v:'Angers',r:'Pays de la Loire',lat:47.4784,lng:-0.5632},
    {v:'Nîmes',r:'Occitanie',lat:43.8367,lng:4.3601},
    {v:'Villeurbanne',r:'Auvergne-Rhône-Alpes',lat:45.7667,lng:4.8799},
    {v:'Clermont-Ferrand',r:'Auvergne-Rhône-Alpes',lat:45.7772,lng:3.0870},
    {v:'Aix-en-Provence',r:'Provence-Alpes-Côte d\'Azur',lat:43.5297,lng:5.4474},
    {v:'Brest',r:'Bretagne',lat:48.3904,lng:-4.4861},
    {v:'Tours',r:'Centre-Val de Loire',lat:47.3941,lng:0.6848},
    {v:'Limoges',r:'Nouvelle-Aquitaine',lat:45.8336,lng:1.2611},
    {v:'Amiens',r:'Hauts-de-France',lat:49.8941,lng:2.2958},
    {v:'Perpignan',r:'Occitanie',lat:42.6986,lng:2.8956},
    {v:'Metz',r:'Grand Est',lat:49.1193,lng:6.1757},
    {v:'Besançon',r:'Bourgogne-Franche-Comté',lat:47.2378,lng:6.0241},
    {v:'Orléans',r:'Centre-Val de Loire',lat:47.9029,lng:1.9093},
    {v:'Rouen',r:'Normandie',lat:49.4432,lng:1.0999},
    {v:'Mulhouse',r:'Grand Est',lat:47.7508,lng:7.3359},
    {v:'Caen',r:'Normandie',lat:49.1829,lng:-0.3707},
    {v:'Nancy',r:'Grand Est',lat:48.6921,lng:6.1844},
    {v:'Argenteuil',r:'Île-de-France',lat:48.9472,lng:2.2467},
    {v:'Saint-Denis',r:'Île-de-France',lat:48.9362,lng:2.3574},
    {v:'Montreuil',r:'Île-de-France',lat:48.8634,lng:2.4484},
    {v:'Pau',r:'Nouvelle-Aquitaine',lat:43.2951,lng:-0.3708},
    {v:'Calais',r:'Hauts-de-France',lat:50.9513,lng:1.8587},
    {v:'Dunkerque',r:'Hauts-de-France',lat:51.0343,lng:2.3768},
    {v:'La Rochelle',r:'Nouvelle-Aquitaine',lat:46.1603,lng:-1.1511},
    {v:'Avignon',r:'Provence-Alpes-Côte d\'Azur',lat:43.9493,lng:4.8055},
    {v:'Poitiers',r:'Nouvelle-Aquitaine',lat:46.5802,lng:0.3404},
    {v:'Antibes',r:'Provence-Alpes-Côte d\'Azur',lat:43.5808,lng:7.1239},
    {v:'Cannes',r:'Provence-Alpes-Côte d\'Azur',lat:43.5528,lng:7.0174},
    {v:'Béziers',r:'Occitanie',lat:43.3448,lng:3.2150},
    {v:'Versailles',r:'Île-de-France',lat:48.8014,lng:2.1301},
    {v:'Le Mans',r:'Pays de la Loire',lat:48.0061,lng:0.1996},
    {v:'Ajaccio',r:'Corse',lat:41.9192,lng:8.7386},
    {v:'Bastia',r:'Corse',lat:42.6977,lng:9.4529},
    {v:'Bayonne',r:'Nouvelle-Aquitaine',lat:43.4929,lng:-1.4748},
    {v:'Boulogne-sur-Mer',r:'Hauts-de-France',lat:50.7264,lng:1.6147},
    {v:'Bourges',r:'Centre-Val de Loire',lat:47.0810,lng:2.3988},
    {v:'Brive-la-Gaillarde',r:'Nouvelle-Aquitaine',lat:45.1587,lng:1.5321},
    {v:'Chambéry',r:'Auvergne-Rhône-Alpes',lat:45.5646,lng:5.9178},
    {v:'Chartres',r:'Centre-Val de Loire',lat:48.4561,lng:1.4832},
    {v:'Colmar',r:'Grand Est',lat:48.0794,lng:7.3584},
    {v:'Épinal',r:'Grand Est',lat:48.1727,lng:6.4511},
    {v:'Évreux',r:'Normandie',lat:49.0270,lng:1.1508},
    {v:'La Roche-sur-Yon',r:'Pays de la Loire',lat:46.6706,lng:-1.4269},
    {v:'Laval',r:'Pays de la Loire',lat:48.0735,lng:-0.7714},
    {v:'Lorient',r:'Bretagne',lat:47.7482,lng:-3.3702},
    {v:'Quimper',r:'Bretagne',lat:47.9960,lng:-4.0958},
    {v:'Sophia Antipolis',r:'Provence-Alpes-Côte d\'Azur',lat:43.6163,lng:7.0554},
    {v:'Saint-Malo',r:'Bretagne',lat:48.6493,lng:-1.9990},
    {v:'Saint-Nazaire',r:'Pays de la Loire',lat:47.2736,lng:-2.2137},
    {v:'Tarbes',r:'Occitanie',lat:43.2328,lng:0.0781},
    {v:'Troyes',r:'Grand Est',lat:48.2973,lng:4.0744},
    {v:'Valence',r:'Auvergne-Rhône-Alpes',lat:44.9334,lng:4.8924},
    {v:'Vannes',r:'Bretagne',lat:47.6559,lng:-2.7600}
  ];

  var villesRendered = false;
  function renderVilles(filter) {
    var tbody = document.getElementById('villes-tbody');
    var count = document.getElementById('villes-count');
    if (!tbody) return;
    var q = (filter || '').toLowerCase().trim();
    var filtered = q ? VILLES_FR.filter(function(c) {
      return c.v.toLowerCase().indexOf(q) !== -1 || c.r.toLowerCase().indexOf(q) !== -1;
    }) : VILLES_FR;
    var html = '';
    filtered.forEach(function(c) {
      html += '<tr style="border-bottom:1px solid #262d38;">';
      html += '<td style="padding:8px 12px;font-weight:600;">' + c.v + '</td>';
      html += '<td style="padding:8px 12px;color:#aaa;">' + c.r + '</td>';
      html += '<td style="padding:8px 12px;text-align:center;font-family:monospace;">' + c.lat.toFixed(4) + '</td>';
      html += '<td style="padding:8px 12px;text-align:center;font-family:monospace;">' + c.lng.toFixed(4) + '</td>';
      html += '<td style="padding:8px 12px;text-align:center;">';
      html += '<button class="admin-btn admin-btn--primary" style="padding:4px 10px;font-size:0.8rem;" data-copy-coords="' + c.lat + ',' + c.lng + '" title="Copier lat,lng">';
      html += '<i class="fas fa-copy"></i> Copier</button></td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
    count.textContent = filtered.length + ' ville(s) affich\u00e9e(s) sur ' + VILLES_FR.length;
    // attach copy handlers
    tbody.querySelectorAll('[data-copy-coords]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var coords = btn.getAttribute('data-copy-coords');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(coords).then(function() {
            btn.innerHTML = '<i class="fas fa-check"></i> Copi\u00e9!';
            setTimeout(function() { btn.innerHTML = '<i class="fas fa-copy"></i> Copier'; }, 1500);
          });
        } else {
          window.prompt('Coordonn\u00e9es :', coords);
        }
      });
    });
    villesRendered = true;
  }

  document.getElementById('villes-search').addEventListener('input', function() {
    renderVilles(this.value);
  });

  // ---- Coworking CRUD ----
  var CW_KEY = 'op-terrain-coworking';
  var cwData = [];

  function loadCoworking() {
    try { var raw = localStorage.getItem(CW_KEY); if (raw) cwData = JSON.parse(raw); } catch(e) { cwData = []; }
  }
  function saveCoworking() {
    localStorage.setItem(CW_KEY, JSON.stringify(cwData));
    showToast('Coworking sauvegard\u00e9');
  }

  function renderCoworking() {
    var tbody = document.getElementById('cw-tbody');
    var count = document.getElementById('cw-count');
    if (!tbody) return;
    var html = '';
    cwData.forEach(function(cw, idx) {
      html += '<tr>';
      html += '<td style="text-align:center;font-weight:700;color:#d4845a;">' + (idx + 1) + '</td>';
      html += '<td style="font-weight:600;">' + (cw.nom || '') + '</td>';
      html += '<td style="color:#9ab0c4;">' + (cw.ville || '') + '</td>';
      html += '<td style="text-align:center;font-family:monospace;font-size:0.85rem;">' + (cw.lat || '') + '</td>';
      html += '<td style="text-align:center;font-family:monospace;font-size:0.85rem;">' + (cw.lng || '') + '</td>';
      html += '<td style="text-align:center;">' + (cw.visible !== false ? '<i class="fas fa-flag" style="color:#d4845a;"></i>' : '<i class="fas fa-eye-slash" style="color:#666;"></i>') + '</td>';
      html += '<td style="text-align:center;white-space:nowrap;">';
      html += '<button class="admin-btn admin-btn--sm" data-cw-edit="' + idx + '" title="Modifier"><i class="fas fa-pen"></i></button> ';
      html += '<button class="admin-btn admin-btn--sm admin-btn--danger" data-cw-del="' + idx + '" title="Supprimer"><i class="fas fa-trash"></i></button>';
      html += '</td></tr>';
    });
    tbody.innerHTML = html;
    count.textContent = cwData.length + ' espace(s) de coworking';
    tbody.querySelectorAll('[data-cw-edit]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openCwEditor(parseInt(btn.getAttribute('data-cw-edit')));
      });
    });
    tbody.querySelectorAll('[data-cw-del]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-cw-del'));
        var nom = cwData[idx] ? cwData[idx].nom : '';
        if (confirm('Supprimer "' + nom + '" ?')) {
          cwData.splice(idx, 1);
          saveCoworking();
          renderCoworking();
        }
      });
    });
  }

  function openCwEditor(idx) {
    var editor = document.getElementById('cw-editor');
    var cw = idx >= 0 ? cwData[idx] : null;
    document.getElementById('cw-edit-idx').value = idx;
    document.getElementById('cw-editor-title').textContent = cw ? 'Modifier : ' + cw.nom : 'Nouveau coworking';
    document.getElementById('cw-edit-nom').value = cw ? cw.nom || '' : '';
    document.getElementById('cw-edit-ville').value = cw ? cw.ville || '' : '';
    document.getElementById('cw-edit-adresse').value = cw ? cw.adresse || '' : '';
    document.getElementById('cw-edit-url').value = cw ? cw.url || '' : '';
    document.getElementById('cw-edit-lat').value = cw ? cw.lat || '' : '';
    document.getElementById('cw-edit-lng').value = cw ? cw.lng || '' : '';
    document.getElementById('cw-edit-visible').checked = cw ? cw.visible !== false : true;
    editor.style.display = 'block';
    editor.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  document.getElementById('cw-add-btn').addEventListener('click', function() {
    openCwEditor(-1);
  });

  document.getElementById('cw-save-btn').addEventListener('click', function() {
    var idx = parseInt(document.getElementById('cw-edit-idx').value);
    var nom = document.getElementById('cw-edit-nom').value.trim();
    if (!nom) { alert('Le nom est obligatoire'); return; }
    var obj = {
      nom: nom,
      ville: document.getElementById('cw-edit-ville').value.trim(),
      adresse: document.getElementById('cw-edit-adresse').value.trim(),
      url: document.getElementById('cw-edit-url').value.trim(),
      lat: parseFloat(document.getElementById('cw-edit-lat').value) || 0,
      lng: parseFloat(document.getElementById('cw-edit-lng').value) || 0,
      visible: document.getElementById('cw-edit-visible').checked
    };
    if (idx >= 0 && idx < cwData.length) {
      Object.assign(cwData[idx], obj);
      showToast('Coworking modifi\u00e9');
    } else {
      cwData.push(obj);
      showToast('Coworking ajout\u00e9');
    }
    saveCoworking();
    document.getElementById('cw-editor').style.display = 'none';
    renderCoworking();
  });

  document.getElementById('cw-cancel-btn').addEventListener('click', function() {
    document.getElementById('cw-editor').style.display = 'none';
  });

  // Load coworking on init
  loadCoworking();
  // Pre-populate with common French coworking spaces if empty
  if (cwData.length === 0) {
    cwData = [
      {nom:'Station F',ville:'Paris',adresse:'5 Parvis Alan Turing, 75013',lat:48.8341,lng:2.3716,visible:true,url:'https://stationf.co'},
      {nom:'La Cord\u00e9e Libert\u00e9',ville:'Lyon',adresse:'2 Rue de Cond\u00e9, 69002',lat:45.7580,lng:4.8320,visible:true,url:'https://www.la-cordee.net'},
      {nom:'WeWork La Fayette',ville:'Paris',adresse:'33 Rue La Fayette, 75009',lat:48.8748,lng:2.3493,visible:true,url:'https://www.wework.com'},
      {nom:'La Cantine',ville:'Toulouse',adresse:'27 Rue d\'Aubuisson, 31000',lat:43.6060,lng:1.4500,visible:true,url:''},
      {nom:'Le Wagon',ville:'Marseille',adresse:'Place de la Joliette, 13002',lat:43.3049,lng:5.3652,visible:true,url:'https://www.lewagon.com'},
      {nom:'La Ruche',ville:'Bordeaux',adresse:'3 Rue du Chai des Farines, 33000',lat:44.8396,lng:-0.5710,visible:true,url:'https://la-ruche.net'},
      {nom:'Le Palace',ville:'Nantes',adresse:'4 Rue Voltaire, 44000',lat:47.2140,lng:-1.5564,visible:true,url:''},
      {nom:'La Plage Digitale',ville:'Strasbourg',adresse:'13 Rue Jacques Peirotes, 67000',lat:48.5818,lng:7.7365,visible:true,url:''},
      {nom:'Le 144 Coworking',ville:'Rennes',adresse:'144 Rue de Chateaugiron, 35000',lat:48.0930,lng:-1.6490,visible:true,url:''},
      {nom:'La French Tech',ville:'Nice',adresse:'61 Rte de Grenoble, 06200',lat:43.6835,lng:7.2050,visible:true,url:''},
      {nom:'Blue Coworking',ville:'Montpellier',adresse:'296 Avenue du Mar\u00e9chal Leclerc, 34000',lat:43.6056,lng:3.8760,visible:true,url:''},
      {nom:'Now Coworking',ville:'Lille',adresse:'1 Place Nelson Mandela, 59000',lat:50.6356,lng:3.0653,visible:true,url:'https://now-coworking.com'},
      {nom:'SophiaTech',ville:'Sophia Antipolis',adresse:'450 Route des Chappes, 06410',lat:43.6163,lng:7.0554,visible:true,url:''},
      {nom:'Le 107',ville:'Grenoble',adresse:'107 Avenue de la R\u00e9publique, 38000',lat:45.1812,lng:5.7245,visible:true,url:''},
      {nom:'La Miel',ville:'Dijon',adresse:'10 Rue de Soissons, 21000',lat:47.3210,lng:5.0400,visible:true,url:''},
      {nom:'Le Connecteur',ville:'Biarritz',adresse:'20 Av. Edouard VII, 64200',lat:43.4832,lng:-1.5586,visible:true,url:''},
      {nom:'La Coque',ville:'Reims',adresse:'3 Rue de Caron, 51100',lat:49.2500,lng:3.2900,visible:true,url:''},
      {nom:'Anticaf\u00e9',ville:'Paris',adresse:'79 Rue Quincampoix, 75003',lat:48.8622,lng:2.3515,visible:true,url:'https://www.anticafe.eu'},
      {nom:'Le Lawo',ville:'Caen',adresse:'12 Rue Basse, 14000',lat:49.1826,lng:-0.3710,visible:true,url:''},
      {nom:'La Fabrique',ville:'Angers',adresse:'2 Quai Monge, 49000',lat:47.4710,lng:-0.5530,visible:true,url:''}
    ];
    saveCoworking();
  }

  // ---- Init ----
  function init() {
    loadData();
    loadGpx();
    populateDashboard();
    populatePosition();
    renderEtapes();
    renderJournal();
    renderPhotos();
    renderGpxList();
    bindTopbar();
  }

  function bindTopbar() {
    document.getElementById('admin-save-btn').addEventListener('click', function() {
      collectDashboard();
      collectPosition();
      saveData(true);
      showToast('\u2705 Tout sauvegard\u00e9 \u2014 Ouvrez /terrain/ pour voir les changements');
    });

    // Valider buttons per card
    document.getElementById('dash-validate-btn').addEventListener('click', function() {
      collectDashboard();
      collectPosition();
      saveData(true);
      showToast('\u2705 Dashboard + Position sauvegard\u00e9s \u2014 km:' + data.dashboard.kmParcourus + ' besoins:' + data.dashboard.besoinsIdentifies + ' statut:' + data.positionActuelle.statut);
    });
    document.getElementById('pos-validate-btn').addEventListener('click', function() {
      collectDashboard();
      collectPosition();
      saveData(true);
      showToast('\u2705 Dashboard + Position sauvegard\u00e9s \u2014 ville:' + data.positionActuelle.ville + ' statut:' + data.positionActuelle.statut);
    });

    document.getElementById('admin-export-btn').addEventListener('click', function() {
      collectDashboard();
      collectPosition();
      exportJson();
    });
    document.getElementById('admin-import-btn').addEventListener('click', function() {
      document.getElementById('admin-import-file').click();
    });
    document.getElementById('admin-import-file').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        try {
          data = JSON.parse(ev.target.result);
          saveData();
          populateDashboard();
          populatePosition();
          renderEtapes();
          renderJournal();
          renderPhotos();
          showToast('JSON import\u00e9 avec succ\u00e8s');
        } catch(err) {
          showToast('Erreur : fichier JSON invalide');
        }
      };
      reader.readAsText(file);
    });
  }

  // ---- Dashboard tab ----
  function populateDashboard() {
    var d = data.dashboard;
    document.getElementById('dash-km').value = d.kmParcourus;
    document.getElementById('dash-jours').value = d.joursRoute;
    document.getElementById('dash-besoins').value = d.besoinsIdentifies;
    document.getElementById('dash-rencontres').value = d.rencontresEntreprises;
    document.getElementById('dash-encours').value = d.etapeEnCours || '';
    document.getElementById('dash-joursprevus').value = d.joursPrevus;
    var sel = document.getElementById('dash-prochaine');
    sel.innerHTML = '<option value="">\u2014</option>';
    data.etapes.forEach(function(e) {
      var opt = document.createElement('option');
      opt.value = e.ville;
      opt.textContent = e.ville;
      if (e.ville === d.prochaineEtape) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function collectDashboard() {
    data.dashboard.kmParcourus = parseInt(document.getElementById('dash-km').value) || 0;
    data.dashboard.joursRoute = parseInt(document.getElementById('dash-jours').value) || 0;
    data.dashboard.besoinsIdentifies = parseInt(document.getElementById('dash-besoins').value) || 0;
    data.dashboard.rencontresEntreprises = parseInt(document.getElementById('dash-rencontres').value) || 0;
    data.dashboard.etapeEnCours = document.getElementById('dash-encours').value || null;
    data.dashboard.prochaineEtape = document.getElementById('dash-prochaine').value || null;
    data.dashboard.joursPrevus = parseInt(document.getElementById('dash-joursprevus').value) || 0;
  }

  // ---- Position tab ----
  function populatePosition() {
    var p = data.positionActuelle;
    document.getElementById('pos-ville').value = p.ville;
    document.getElementById('pos-statut').value = p.statut;
    document.getElementById('pos-lat').value = p.lat;
    document.getElementById('pos-lng').value = p.lng;
    document.getElementById('pos-depart').value = p.dateDepart;
  }

  function collectPosition() {
    data.positionActuelle.ville = document.getElementById('pos-ville').value;
    data.positionActuelle.statut = document.getElementById('pos-statut').value;
    data.positionActuelle.lat = parseFloat(document.getElementById('pos-lat').value) || 0;
    data.positionActuelle.lng = parseFloat(document.getElementById('pos-lng').value) || 0;
    data.positionActuelle.dateDepart = document.getElementById('pos-depart').value;
  }

  // ---- Étapes tab ----
  function renderEtapes() {
    var list = document.getElementById('etapes-list');
    list.innerHTML = '';
    var statusIcons = { planifie: 'fa-circle', actuel: 'fa-location-dot', visite: 'fa-check-circle' };
    var statusLabels = { planifie: 'Planifi\u00e9', actuel: 'Actuel', visite: 'Visit\u00e9' };
    var statusColors = { planifie: '#1a6b8a', actuel: '#f59e0b', visite: '#22c55e' };
    var html = '';
    data.etapes.forEach(function(etape, idx) {
      var sc = statusColors[etape.statut] || '#1a6b8a';
      html += '<tr>';
      html += '<td style="text-align:center;font-weight:700;color:' + sc + ';">' + etape.id + '</td>';
      html += '<td style="font-weight:600;">' + etape.ville + '</td>';
      html += '<td style="color:#9ab0c4;">' + (etape.region || '') + '</td>';
      html += '<td style="text-align:center;">' + (etape.distanceDepuisDepart || 0) + '</td>';
      html += '<td style="text-align:center;white-space:nowrap;"><i class="fas ' + (statusIcons[etape.statut] || 'fa-circle') + '" style="color:' + sc + ';"></i> <span style="color:' + sc + ';font-weight:600;">' + (statusLabels[etape.statut] || etape.statut) + '</span></td>';
      html += '<td style="text-align:center;font-family:monospace;font-size:0.85rem;">' + (etape.lat || '') + '</td>';
      html += '<td style="text-align:center;font-family:monospace;font-size:0.85rem;">' + (etape.lng || '') + '</td>';
      html += '<td style="text-align:center;white-space:nowrap;">';
      html += '<button class="admin-btn admin-btn--sm" data-edit="' + etape.id + '" title="Modifier"><i class="fas fa-pen"></i></button> ';
      html += '<button class="admin-btn admin-btn--sm admin-btn--danger" data-del-etape="' + idx + '" title="Supprimer"><i class="fas fa-trash"></i></button>';
      html += '</td></tr>';
    });
    list.innerHTML = html;
    list.querySelectorAll('[data-edit]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openEtapeEditor(parseInt(btn.getAttribute('data-edit')));
      });
    });
    list.querySelectorAll('[data-del-etape]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-del-etape'));
        var ville = data.etapes[idx] ? data.etapes[idx].ville : '';
        if (confirm('Supprimer l\'\u00e9tape "' + ville + '" ?')) {
          data.etapes.splice(idx, 1);
          data.etapes.forEach(function(e, i) { e.id = i + 1; });
          renderEtapes();
          saveData();
          showToast('\u00c9tape supprim\u00e9e');
        }
      });
    });
  }

  function openEtapeEditor(id) {
    var etape = id ? data.etapes.find(function(e) { return e.id === id; }) : null;
    document.getElementById('etape-editor').style.display = 'block';
    if (etape) {
      document.getElementById('etape-editor-title').textContent = 'Modifier \u2014 ' + etape.ville;
      document.getElementById('etape-edit-id').value = etape.id;
      document.getElementById('etape-edit-ville').value = etape.ville;
      document.getElementById('etape-edit-region').value = etape.region;
      document.getElementById('etape-edit-statut').value = etape.statut;
      document.getElementById('etape-edit-dist').value = etape.distanceDepuisDepart;
      document.getElementById('etape-edit-lat').value = etape.lat;
      document.getElementById('etape-edit-lng').value = etape.lng;
      document.getElementById('etape-edit-date').value = etape.dateEstimee;
      document.getElementById('etape-edit-desc').value = etape.description;
    } else {
      document.getElementById('etape-editor-title').textContent = 'Nouvelle \u00e9tape';
      document.getElementById('etape-edit-id').value = '0';
      document.getElementById('etape-edit-ville').value = '';
      document.getElementById('etape-edit-region').value = '';
      document.getElementById('etape-edit-statut').value = 'planifie';
      document.getElementById('etape-edit-dist').value = '';
      document.getElementById('etape-edit-lat').value = '';
      document.getElementById('etape-edit-lng').value = '';
      document.getElementById('etape-edit-date').value = '';
      document.getElementById('etape-edit-desc').value = '';
    }
    document.getElementById('etape-editor').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  document.getElementById('etape-add-btn').addEventListener('click', function() {
    openEtapeEditor(0);
  });

  document.getElementById('etape-save-btn').addEventListener('click', function() {
    var id = parseInt(document.getElementById('etape-edit-id').value);
    var ville = document.getElementById('etape-edit-ville').value.trim();
    if (!ville) { showToast('Le nom de la ville est obligatoire'); return; }
    var fields = {
      ville: ville,
      region: document.getElementById('etape-edit-region').value.trim(),
      statut: document.getElementById('etape-edit-statut').value,
      distanceDepuisDepart: parseInt(document.getElementById('etape-edit-dist').value) || 0,
      lat: parseFloat(document.getElementById('etape-edit-lat').value) || 0,
      lng: parseFloat(document.getElementById('etape-edit-lng').value) || 0,
      dateEstimee: document.getElementById('etape-edit-date').value,
      description: document.getElementById('etape-edit-desc').value.trim(),
    };
    if (id === 0) {
      var newId = data.etapes.length > 0 ? Math.max.apply(null, data.etapes.map(function(e){ return e.id; })) + 1 : 1;
      fields.id = newId;
      fields.type = 'etape';
      data.etapes.push(fields);
      showToast('Nouvelle \u00e9tape ajout\u00e9e : ' + ville);
    } else {
      var etape = data.etapes.find(function(e) { return e.id === id; });
      if (!etape) return;
      Object.assign(etape, fields);
      showToast('\u00c9tape mise \u00e0 jour');
    }
    document.getElementById('etape-editor').style.display = 'none';
    renderEtapes();
    saveData();
  });

  document.getElementById('etape-cancel-btn').addEventListener('click', function() {
    document.getElementById('etape-editor').style.display = 'none';
  });

  // ---- Journal tab ----
  function renderJournal() {
    var list = document.getElementById('journal-list');
    list.innerHTML = '';
    if (!data.journal || data.journal.length === 0) {
      list.innerHTML = '<p class="admin-hint">Aucune entr\u00e9e de journal.</p>';
      return;
    }
    data.journal.slice().reverse().forEach(function(entry, idx) {
      var realIdx = data.journal.length - 1 - idx;
      var div = document.createElement('div');
      div.className = 'admin-journal-item';
      div.innerHTML =
        '<div class="admin-journal-head">' +
        '<strong>' + entry.date + ' \u2014 ' + entry.ville + '</strong>' +
        '<button class="admin-btn admin-btn--sm admin-btn--danger" data-del-journal="' + realIdx + '">' +
        '<i class="fas fa-trash"></i>' +
        '</button>' +
        '</div>' +
        '<h4>' + entry.titre + '</h4>' +
        '<p>' + entry.contenu + '</p>' +
        '<div class="admin-journal-tags">' +
        entry.tags.map(function(t) { return '<span class="admin-tag">' + t + '</span>'; }).join(' ') +
        '</div>';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-del-journal]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-del-journal'));
        if (confirm('Supprimer cette entr\u00e9e du journal ?')) {
          data.journal.splice(idx, 1);
          renderJournal();
          saveData();
        }
      });
    });
  }

  document.getElementById('journal-add-btn').addEventListener('click', function() {
    var date = document.getElementById('journal-date').value;
    var ville = document.getElementById('journal-ville').value;
    var titre = document.getElementById('journal-titre').value;
    var contenu = document.getElementById('journal-contenu').value;
    var tagsRaw = document.getElementById('journal-tags').value;
    if (!date || !titre || !contenu) {
      showToast('Remplissez au minimum la date, le titre et le contenu');
      return;
    }
    var tags = tagsRaw.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    data.journal.push({ date: date, ville: ville, titre: titre, contenu: contenu, tags: tags });
    renderJournal();
    saveData();
    document.getElementById('journal-date').value = '';
    document.getElementById('journal-ville').value = '';
    document.getElementById('journal-titre').value = '';
    document.getElementById('journal-contenu').value = '';
    document.getElementById('journal-tags').value = '';
    showToast('Entr\u00e9e ajout\u00e9e au journal');
  });

  // ---- Photos tab (CSP-safe: no inline onerror) ----
  function renderPhotos() {
    var grid = document.getElementById('photos-grid');
    grid.innerHTML = '';
    var photos = data.dashboard.photos || [];
    if (photos.length === 0) {
      grid.innerHTML = '<p class="admin-hint">Aucune photo enregistr\u00e9e.</p>';
      return;
    }
    photos.forEach(function(src, idx) {
      var div = document.createElement('div');
      div.className = 'admin-photo-item';
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Photo terrain';
      img.addEventListener('error', function() {
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23142038" width="100" height="100"/><text x="50" y="55" text-anchor="middle" fill="%234db8d4" font-size="12">No img</text></svg>';
      });
      var overlay = document.createElement('div');
      overlay.className = 'admin-photo-overlay';
      var code = document.createElement('code');
      code.textContent = src;
      var delBtn = document.createElement('button');
      delBtn.className = 'admin-btn admin-btn--sm admin-btn--danger';
      delBtn.setAttribute('data-del-photo', idx);
      delBtn.innerHTML = '<i class="fas fa-trash"></i>';
      overlay.appendChild(code);
      overlay.appendChild(delBtn);
      div.appendChild(img);
      div.appendChild(overlay);
      grid.appendChild(div);
    });
    grid.querySelectorAll('[data-del-photo]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-del-photo'));
        data.dashboard.photos.splice(idx, 1);
        renderPhotos();
        saveData();
      });
    });
  }

  var selectedPhotoBlob = null;
  var selectedPhotoName = null;

  document.getElementById('photo-file-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    selectedPhotoBlob = file;
    selectedPhotoName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var reader = new FileReader();
    reader.onload = function(ev) {
      document.getElementById('photo-preview').style.display = 'flex';
      document.getElementById('photo-preview-img').src = ev.target.result;
      document.getElementById('photo-preview-name').textContent = selectedPhotoName;
      document.getElementById('photo-preview-path').textContent = '/Images/terrain/' + selectedPhotoName;
      document.getElementById('photo-path-input').value = '/Images/terrain/' + selectedPhotoName;
      document.getElementById('photo-download-btn').style.display = 'inline-flex';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('photo-download-btn').addEventListener('click', function() {
    if (!selectedPhotoBlob) return;
    var url = URL.createObjectURL(selectedPhotoBlob);
    var a = document.createElement('a');
    a.href = url;
    a.download = selectedPhotoName;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Photo t\u00e9l\u00e9charg\u00e9e \u2014 uploadez-la dans /Images/terrain/ sur O2switch');
  });

  document.getElementById('photo-add-btn').addEventListener('click', function() {
    var path = document.getElementById('photo-path-input').value.trim();
    if (!path) {
      showToast('Entrez un chemin pour la photo');
      return;
    }
    if (!data.dashboard.photos) data.dashboard.photos = [];
    data.dashboard.photos.push(path);
    renderPhotos();
    saveData();
    document.getElementById('photo-file-input').value = '';
    document.getElementById('photo-path-input').value = '';
    document.getElementById('photo-preview').style.display = 'none';
    document.getElementById('photo-download-btn').style.display = 'none';
    selectedPhotoBlob = null;
    selectedPhotoName = null;
    showToast('Photo ajout\u00e9e');
  });

  // ---- GPX tab ----
  function initGpxMap() {
    var el = document.getElementById('gpx-map');
    el.style.display = 'block';
    gpxMap = L.map('gpx-map', { scrollWheelZoom: true }).setView([46.6, 2.8], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(gpxMap);
    data.etapes.forEach(function(etape) {
      L.circleMarker([etape.lat, etape.lng], {
        radius: 5, fillColor: '#4db8d4', color: '#fff', weight: 1.5, opacity: 0.8, fillOpacity: 0.7,
      }).addTo(gpxMap).bindTooltip(etape.ville);
    });
    setTimeout(function() { gpxMap.invalidateSize(); }, 200);
  }

  function parseGpx(xmlStr) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xmlStr, 'application/xml');
    var points = [];
    var trkpts = doc.querySelectorAll('trkpt');
    if (trkpts.length === 0) trkpts = doc.querySelectorAll('rtept');
    if (trkpts.length === 0) trkpts = doc.querySelectorAll('wpt');
    trkpts.forEach(function(pt) {
      var lat = parseFloat(pt.getAttribute('lat'));
      var lon = parseFloat(pt.getAttribute('lon'));
      var eleEl = pt.querySelector('ele');
      var ele = eleEl ? parseFloat(eleEl.textContent) : null;
      if (!isNaN(lat) && !isNaN(lon)) points.push({ lat: lat, lng: lon, ele: ele });
    });
    return points;
  }

  function calcDistance(points) {
    var total = 0;
    for (var i = 1; i < points.length; i++) {
      var R = 6371;
      var dLat = (points[i].lat - points[i-1].lat) * Math.PI / 180;
      var dLon = (points[i].lng - points[i-1].lng) * Math.PI / 180;
      var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
              Math.cos(points[i-1].lat*Math.PI/180)*Math.cos(points[i].lat*Math.PI/180)*
              Math.sin(dLon/2)*Math.sin(dLon/2);
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }
    return total;
  }

  function calcElevation(points) {
    var gain = 0;
    for (var i = 1; i < points.length; i++) {
      if (points[i].ele !== null && points[i-1].ele !== null) {
        var diff = points[i].ele - points[i-1].ele;
        if (diff > 0) gain += diff;
      }
    }
    return gain;
  }

  document.getElementById('gpx-file-input').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      currentGpxContent = ev.target.result;
      var points = parseGpx(currentGpxContent);
      if (points.length === 0) {
        showToast('Aucun point GPS trouv\u00e9 dans ce fichier');
        return;
      }

      document.getElementById('gpx-info').style.display = 'block';
      document.getElementById('gpx-actions').style.display = 'flex';
      document.getElementById('gpx-filename').value = file.name;
      document.getElementById('gpx-points').value = points.length + ' points';
      document.getElementById('gpx-distance').value = calcDistance(points).toFixed(1) + ' km';
      document.getElementById('gpx-elevation').value = Math.round(calcElevation(points)) + ' m D+';

      if (!gpxMap) initGpxMap();
      if (gpxLayer) gpxMap.removeLayer(gpxLayer);
      var coords = points.map(function(p) { return [p.lat, p.lng]; });
      gpxLayer = L.polyline(coords, { color: '#f59e0b', weight: 3.5, opacity: 0.85 }).addTo(gpxMap);
      gpxMap.fitBounds(gpxLayer.getBounds(), { padding: [30, 30] });
    };
    reader.readAsText(file);
  });

  document.getElementById('gpx-download-btn').addEventListener('click', function() {
    if (!currentGpxContent) return;
    var name = document.getElementById('gpx-filename').value || 'parcours.gpx';
    var blob = new Blob([currentGpxContent], { type: 'application/gpx+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('gpx-add-btn').addEventListener('click', function() {
    if (!currentGpxContent) return;
    var name = document.getElementById('gpx-filename').value || 'parcours.gpx';
    var points = parseGpx(currentGpxContent);
    gpxFiles.push({
      name: name,
      date: new Date().toISOString().split('T')[0],
      points: points.length,
      distance: calcDistance(points).toFixed(1) + ' km',
      elevation: Math.round(calcElevation(points)) + ' m D+',
      path: '/gpx/' + name.replace(/[^a-zA-Z0-9._-]/g, '_'),
    });
    saveGpxData();
    renderGpxList();
    showToast('GPX ajout\u00e9 \u2014 pensez \u00e0 uploader le .gpx dans /public/gpx/');
  });

  function renderGpxList() {
    var list = document.getElementById('gpx-list');
    list.innerHTML = '';
    if (gpxFiles.length === 0) {
      list.innerHTML = '<p class="admin-hint">Aucun fichier GPX enregistr\u00e9.</p>';
      return;
    }
    gpxFiles.forEach(function(g, idx) {
      var div = document.createElement('div');
      div.className = 'admin-gpx-item';
      div.innerHTML =
        '<div class="admin-gpx-item-info">' +
        '<strong><i class="fas fa-route"></i> ' + g.name + '</strong>' +
        '<span>' + g.date + ' \u2014 ' + g.points + ' pts \u2014 ' + g.distance + ' \u2014 ' + g.elevation + '</span>' +
        '</div>' +
        '<button class="admin-btn admin-btn--sm admin-btn--danger" data-del-gpx="' + idx + '">' +
        '<i class="fas fa-trash"></i>' +
        '</button>';
      list.appendChild(div);
    });
    list.querySelectorAll('[data-del-gpx]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var idx = parseInt(btn.getAttribute('data-del-gpx'));
        gpxFiles.splice(idx, 1);
        saveGpxData();
        renderGpxList();
      });
    });
  }

  // ---- Preview tab ----
  function renderPreview() {
    collectDashboard();
    collectPosition();
    document.getElementById('preview-json').textContent = JSON.stringify(data, null, 2);
  }

  document.getElementById('preview-copy-btn').addEventListener('click', function() {
    collectDashboard();
    collectPosition();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(function() {
      showToast('JSON copi\u00e9 dans le presse-papier');
    });
  });

  document.getElementById('preview-export-btn').addEventListener('click', function() {
    collectDashboard();
    collectPosition();
    exportJson();
  });

})();
