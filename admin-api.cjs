// admin-api.cjs — Serveur local de mise à jour du journal terrain
// Usage : node admin-api.cjs  (ou : npm run api)
// Reçoit le JSON du panel admin, écrit src/data/terrain-etapes.json, lance npm run build

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const PORT = 4399;
const JSON_PATH = path.join(__dirname, 'src', 'data', 'terrain-etapes.json');
const BUILD_CMD = 'npm run build';

const ALLOWED_ORIGINS = ['http://localhost:4321', 'http://localhost:4322', 'http://localhost:4320'];

const server = http.createServer(function(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/update-journal') {
    let body = '';
    req.on('data', function(chunk) { body += chunk; });
    req.on('end', function() {
      try {
        const data = JSON.parse(body);
        const nbJournal = Array.isArray(data.journal) ? data.journal.length : 0;

        // Écrire le fichier JSON source
        fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf8');
        console.log('[API] terrain-etapes.json mis à jour — ' + nbJournal + ' entrée(s) journal');

        // Lancer le build
        console.log('[API] Build en cours...');
        exec(BUILD_CMD, { cwd: __dirname }, function(err, stdout, stderr) {
          if (err) {
            console.error('[API] Build échoué :', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: 'Build échoué : ' + err.message }));
            return;
          }
          console.log('[API] Build terminé ✅');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, nbJournal: nbJournal }));
        });

      } catch (e) {
        console.error('[API] Erreur JSON :', e.message);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', function() {
  console.log('');
  console.log('  ✅ Admin API démarré sur http://localhost:' + PORT);
  console.log('  📄 JSON cible : ' + JSON_PATH);
  console.log('  🔨 Commande build : ' + BUILD_CMD);
  console.log('');
  console.log('  En attente de requêtes du panel admin...');
  console.log('');
});
