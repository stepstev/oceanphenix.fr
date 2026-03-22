# Déploiement — OceanPhenix / TourData 2026
## Hébergement : O2Switch (mutualisé, cPanel, Apache + PHP)
## URL de production : `https://www.tourdata2026.oceanphenix.fr`

---

## 1. Première installation (une seule fois)

### 1.1 Accès FTP

Dans **cPanel → Comptes FTP** (ou utiliser FileZilla) :

| Paramètre | Valeur |
|---|---|
| Hôte | `ftp.oceanphenix.fr` (ou IP fournie par O2Switch) |
| Port | `21` (FTP) ou `22` (SFTP recommandé) |
| Identifiant | votre login cPanel |
| Répertoire distant | `/www/tourdata2026.oceanphenix.fr/` (dossier du sous-domaine) |

> Sur O2Switch, chaque sous-domaine a son propre dossier dans `~/www/` ou `~/public_html/`.
> Vérifier le chemin exact dans **cPanel → Sous-domaines**.

### 1.2 Créer `strava-env.php` sur le serveur

Via **cPanel → Gestionnaire de fichiers** ou FTP, créer ce fichier **uniquement sur le serveur** :

**Chemin** : `www/tourdata2026.oceanphenix.fr/api/strava-env.php`

```php
<?php
$STRAVA_CLIENT_ID     = '213901';
$STRAVA_CLIENT_SECRET = 'f0e301f4e8e195e2b66628204fc7da1adfe22fdc';
$STRAVA_REFRESH_TOKEN = 'fe65e09336f38c60c1039816bb9924876dc39623';
$STRAVA_CRON_SECRET   = 'op-cron-strava-2026-oceanphenix';
```

> **Ne jamais committer ce fichier** — il est exclu du repo par `.gitignore`.
> Le `.htaccess` de `api/` bloque l'accès direct (→ 403).

### 1.3 Permissions des fichiers PHP

Via **cPanel → Gestionnaire de fichiers**, vérifier :

| Fichier | Permission |
|---|---|
| `api/strava.php` | `644` |
| `api/strava-env.php` | `600` (lecture seule owner) |

### 1.4 Cron de refresh Strava (optionnel)

Le cache se rafraîchit automatiquement à la première requête après 10 min.
Pour un refresh proactif, ajouter dans **cPanel → Tâches planifiées (Cron Jobs)** :

```
*/15 * * * *   curl -s "https://www.tourdata2026.oceanphenix.fr/api/strava.php?force=1&secret=op-cron-strava-2026-oceanphenix" > /dev/null
```

---

## 2. Mise à jour du site (déploiement courant)

### 2.1 Build local

```bash
npm run build
```

Le dossier `dist/` est généré. **Ne pas uploader `node_modules/`, `src/`, `.git/`**.

### 2.2 Upload FTP

Uploader le **contenu** de `dist/` → `www/tourdata2026.oceanphenix.fr/` (écraser les fichiers existants).

```
dist/
├── index.html          → .../index.html
├── assets/             → .../assets/
├── terrain/            → .../terrain/
├── strava/             → .../strava/
├── api/strava.php      → .../api/strava.php       ← uploader
├── api/.htaccess       → .../api/.htaccess         ← uploader
├── api/strava-mock.json→ .../api/strava-mock.json  ← uploader
├── .htaccess           → .../.htaccess             ← uploader
└── ...
```

> `api/strava-env.php` et `api/strava-cache.json` ne sont PAS dans `dist/` — ne pas les écraser.

### 2.3 FileZilla — astuce

**Édition → Paramètres → Transferts → activer "Écraser les fichiers existants"**.
Glisser le contenu de `dist/` dans le volet droit sur le dossier du sous-domaine.

---

## 3. Vérifications post-déploiement

| URL | Résultat attendu |
|---|---|
| `https://www.tourdata2026.oceanphenix.fr/` | Redirect 301 → `/terrain/` |
| `https://www.tourdata2026.oceanphenix.fr/terrain/` | Page terrain charge correctement |
| `https://www.tourdata2026.oceanphenix.fr/strava` | Point vert, données réelles (pas de `mock`) |
| `https://www.tourdata2026.oceanphenix.fr/api/strava.php` | JSON avec données Strava |
| `https://www.tourdata2026.oceanphenix.fr/api/strava-env.php` | **403 Forbidden** ← obligatoire |
| `https://www.tourdata2026.oceanphenix.fr/api/strava-cache.json` | **403 Forbidden** ← obligatoire |
| `http://www.tourdata2026.oceanphenix.fr/` | Redirect 301 → `https://` |

---

## 4. Tag activités Strava

Ajouter `#Tourdata2026` dans le titre de l'activité sur Strava (web ou app).
Effectif au prochain chargement de la page (cache 10 min max, ou 15 min si cron actif).

---

## 5. Résolution de problèmes courants

| Symptôme | Cause probable | Solution |
|---|---|---|
| Page `/strava` affiche "mock" | `strava-env.php` absent | Créer le fichier via cPanel (§ 1.2) |
| `strava-env.php` retourne 200 au lieu de 403 | `.htaccess` api/ non uploadé | Uploader `dist/api/.htaccess` |
| CSS/JS non chargés après update | Hash assets changé | Vider le cache navigateur (Ctrl+Shift+R) |
| Erreur 500 sur PHP | Permission incorrecte | Mettre `644` sur les `.php` |
| HTTPS non forcé | `.htaccess` racine manquant | Uploader `dist/.htaccess` |
| Erreur CORS sur `/api/strava.php` | Origine non listée | Ajouter l'URL dans `$allowedOrigins` dans `strava.php` |
