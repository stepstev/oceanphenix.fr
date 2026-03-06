# OceanPhenix.fr — Site Portfolio Professionnel

> **Stéphane Celton** · Data Product Manager · Business Intelligence · Gouvernance Data  
> Site vitrine construit avec **Astro v4** · Hébergé sur **GitHub Pages** · Domaine custom `oceanphenix.fr`

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | [Astro v4](https://astro.build) (SSG — Static Site Generation) |
| CSS | Design tokens + CSS global scopé |
| JS | Vanilla JS (`public/js/main.js`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| Hébergement | GitHub Pages |
| Domaine | `oceanphenix.fr` (DNS via o2switch) |
| Fonts | IBM Plex Sans + Roboto (Google Fonts) |
| Icons | Font Awesome 6.5 (CDN avec SRI hash) |

---

## Structure du projet

```
src/
├── components/
│   ├── Nav.astro              # Navigation fixe — logo SVG inline + icônes FA
│   ├── Hero.astro             # Section introduction + tagline + texte origine OceanPhenix
│   ├── Platforms.astro        # 6 cartes projets (Portfolio, TMDL, LinkedIn, RAG V10, RAG 2026, GitHub)
│   ├── CvSection.astro        # Business card corporate + téléchargement PDF
│   ├── Footer.astro           # Bio + date de mise à jour automatique
│   ├── CopyrightBar.astro     # Barre bas de page + heure chargement
│   ├── WelcomePopup.astro     # Popup 2026 + bouton étoile
│   ├── OceanBackground.astro  # Fond animé (3 vagues)
│   └── CguModal.astro         # Modal CGU complète
├── layouts/
│   └── BaseLayout.astro       # <head> SEO (OG, Twitter Card, canonical) + imports CSS
├── pages/
│   ├── index.astro            # Page principale
│   ├── portfolio.astro        # Vitrine profil — photo, bio, tags, hashtags, JSON-LD
│   ├── expertises.astro       # 6 domaines d'intervention + secteurs + CTAs
│   └── 404.astro              # Erreur 404 personnalisée
└── styles/
    ├── tokens.css             # Design tokens — branding OceanPhenix
    └── global.css             # Reset, layout, composants, animations

public/
├── Images/                    # Logos, photos (moi_detour.png…)
├── js/main.js                 # JS vanilla (popup, CGU, heure)
├── robots.txt                 # SEO crawling rules
├── sitemap.xml                # SEO sitemap (/, /portfolio, /expertises)
├── CNAME                      # Domaine custom GitHub Pages
└── .well-known/security.txt   # Security contact (RFC 9116)
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Page principale — Hero, Plateformes, CV |
| `/portfolio` | Vitrine profil professionnel — photo, bio, compétences, hashtags |
| `/expertises` | 6 domaines d'expertise — Data, BI, Gouvernance, IA, Pilotage |
| `/404` | Page d'erreur personnalisée |

---

## Architecture CSS

### `src/styles/tokens.css` — Design Tokens (Branding)

Source de vérité de l'identité visuelle OceanPhenix. Contient **uniquement** les CSS custom properties (`:root`) :
- Couleurs · `--accent-cyan: #00d9ff`, `--primary-dark: #0a1929`…
- Typographies, espacements, radius, ombres, transitions

> **Modifier ce fichier pour changer le branding.**

### `src/styles/global.css` — Styles Globaux

Reset CSS, animations, layout, styles de tous les composants. Consomme les variables de `tokens.css`.

```js
import '../styles/tokens.css';  // Design tokens (branding)
import '../styles/global.css';  // Styles globaux + composants
```

---

## Design System — Palette Corporate

Style sobre et professionnel, sans effets néon.

| Élément | Style |
|---------|-------|
| Boutons demo | Ghost outlined (transparent, bordure subtile) |
| Cartes featured | Bordure teal discrète `rgba(45,160,130,0.45)` |
| Badges | Outlined, sans animation pulse |
| Hover cartes | `translateY(-4px)` + ombre douce |
| Logo nav | SVG inline phénix + vague, `currentColor` blanc |

---

## SEO

- **Open Graph** + **Twitter Card** sur toutes les pages (via `BaseLayout.astro`)
- **Canonical** URL sur chaque page
- **JSON-LD** `Person` schema sur `/portfolio`
- **Sitemap** : `/, /portfolio, /expertises`
- **Robots** meta : index/follow sur pages publiques

---

## Sécurité

### Headers meta (BaseLayout.astro)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### Ressources externes
- Font Awesome chargé avec **SRI integrity hash** + `crossorigin="anonymous"`
- Google Fonts avec `crossorigin="anonymous"` + `rel="preconnect"`
- Aucun cookie tiers, aucun tracker

### Fichiers
- `robots.txt` : `Disallow: /*.md`
- `/.well-known/security.txt` : contact sécurité conforme RFC 9116

### Code
- Zéro `style=""` inline
- Zéro valeur CSS hardcodée — tout via design tokens
- `rel="noopener noreferrer"` sur tous les liens externes
- SRI hash sur Font Awesome

---

## Compatibilité O2switch

Le site est un **SSG pur** — Astro génère des fichiers HTML/CSS/JS statiques dans `dist/`.

| Point | Statut |
|-------|--------|
| Fichiers statiques uniquement | ✅ Compatible |
| Aucun serveur Node.js requis | ✅ Compatible |
| Aucun `.htaccess` requis | ✅ (géré côté GitHub Pages) |
| Domaine custom + DNS o2switch | ✅ Via enregistrements A + CNAME |
| CGI-bin | ✅ Dossier présent, réservé |

> Le build `dist/` peut être déployé sur n'importe quel hébergeur statique (o2switch FTP, GitHub Pages, Netlify, Cloudflare Pages…).

### DNS o2switch

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | stepstev.github.io |

---

## Développement local

```bash
npm install          # Installer les dépendances
npm run dev          # Dev server → http://localhost:4321
npm run build        # Build production → dist/
npm run preview      # Prévisualiser dist/
```

---

## Déploiement

Automatique à chaque push sur `main` via GitHub Actions :

```
push main → deploy.yml → npm run build → GitHub Pages (oceanphenix.fr)
```

**Prérequis GitHub :** repo public · Settings → Pages → Source → **GitHub Actions**

---

## Qualité code

- ✅ Zéro `style=""` inline
- ✅ Couleurs via variables CSS (pas de valeurs hardcodées)
- ✅ Séparation design tokens / styles globaux
- ✅ HTML sémantique, SEO meta complets
- ✅ Liens externes avec `rel="noopener noreferrer"`
- ✅ SRI hash sur Font Awesome
- ✅ Aucune dépendance inutile (MDX retiré — aucun fichier `.mdx` dans le projet)
- ✅ Logo SVG inline (pas de dépendance image externe)
- ✅ Footer date de mise à jour auto (`new Date()` au build)

---

## Licence

> **PROPRIÉTAIRE — TOUS DROITS RÉSERVÉS**

**Toute reproduction, copie, imitation ou réutilisation du concept, du design ou du code est strictement interdite** sans autorisation écrite préalable de l'auteur.

| Élément | Statut |
|---|---|
| Code source | © Stéphane Celton — usage privé uniquement |
| Concept & design | Protégé — reproduction interdite |
| Marque OceanPhenix™ | Marque déposée |

---

## Auteur

**Stéphane Celton**

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Framework | [Astro v4](https://astro.build) (SSG — Static Site Generation) |
| CSS | Design tokens + CSS global scopé |
| JS | Vanilla JS (`public/js/main.js`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| Hébergement | GitHub Pages |
| Domaine | `oceanphenix.fr` (DNS via o2switch) |
| Fonts | IBM Plex Sans + Roboto (Google Fonts) |
| Icons | Font Awesome 6.5 (CDN avec SRI hash) |

---

## Structure du projet

```
src/
├── components/
│   ├── Nav.astro              # Navigation fixe
│   ├── Hero.astro             # Section introduction
│   ├── Platforms.astro        # 4 cartes (RAG-IA, RAG 2026, Portfolio, LinkedIn)
│   ├── CvSection.astro        # Business card + téléchargement
│   ├── Footer.astro           # Bio Stéphane Celton
│   ├── CopyrightBar.astro     # Barre bas de page + heure chargement
│   ├── WelcomePopup.astro     # Popup 2026 + bouton étoile
│   ├── OceanBackground.astro  # Fond animé (3 vagues)
│   └── CguModal.astro         # Modal CGU complète
├── layouts/
│   └── BaseLayout.astro       # <head> SEO + imports CSS + wrapper
├── pages/
│   ├── index.astro            # Page principale
│   ├── rag-2026.astro         # Page démo RAG Platform 2026 Public
│   └── 404.astro              # Erreur 404 personnalisée
└── styles/
    ├── tokens.css             # Design tokens — branding OceanPhenix
    └── global.css             # Reset, layout, composants, animations

public/
├── Images/                    # Logos, photos
├── js/main.js                 # JS vanilla (popup, CGU, heure)
├── robots.txt                 # SEO crawling rules
├── sitemap.xml                # SEO sitemap
├── CNAME                      # Domaine custom GitHub Pages
└── .well-known/security.txt   # Security contact (RFC 9116)
```

---

## Architecture CSS

### `src/styles/tokens.css` — Design Tokens (Branding)

Source de vérité de l'identité visuelle OceanPhenix. Contient **uniquement** les CSS custom properties (`:root`) :
- Couleurs · `--accent-cyan: #00d9ff`, `--primary-dark: #0a1929`…
- Typographies, espacements, radius, ombres, transitions

> **Modifier ce fichier pour changer le branding.**

### `src/styles/global.css` — Styles Globaux

Reset CSS, animations, layout, styles de tous les composants. Consomme les variables de `tokens.css`.

```js
import '../styles/tokens.css';  // Design tokens (branding)
import '../styles/global.css';  // Styles globaux + composants
```

---

## Sécurité

### Headers meta (BaseLayout.astro)
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### Ressources externes
- Font Awesome chargé avec **SRI integrity hash** + `crossorigin="anonymous"`
- Google Fonts avec `crossorigin="anonymous"` + `rel="preconnect"`
- Aucun cookie tiers, aucun tracker

### Fichiers
- `robots.txt` : `Disallow: /*.md`
- `/.well-known/security.txt` : contact sécurité conforme RFC 9116

### Code
- Zéro `style=""` inline
- Zéro valeur CSS hardcodée — tout via design tokens
- `rel="noopener noreferrer"` sur tous les liens externes

---

## Compatibilité O2switch

Le site est un **SSG pur** — Astro génère des fichiers HTML/CSS/JS statiques dans `dist/`.

| Point | Statut |
|-------|--------|
| Fichiers statiques uniquement | ✅ Compatible |
| Aucun serveur Node.js requis | ✅ Compatible |
| Aucun `.htaccess` requis | ✅ (géré côté GitHub Pages) |
| Domaine custom + DNS o2switch | ✅ Via enregistrements A + CNAME |
| CGI-bin | ✅ Dossier présent, réservé |

> Le build `dist/` peut être déployé sur n'importe quel hébergeur statique (o2switch FTP, GitHub Pages, Netlify, Cloudflare Pages…).

### DNS o2switch

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | stepstev.github.io |

---

## Développement local

```bash
npm install          # Installer les dépendances
npm run dev          # Dev server → http://localhost:4321
npm run build        # Build production → dist/
npm run preview      # Prévisualiser dist/
```

---

## Déploiement

Automatique à chaque push sur `main` via GitHub Actions :

```
push main → deploy.yml → npm run build → GitHub Pages (oceanphenix.fr)
```

**Prérequis GitHub :** repo public · Settings → Pages → Source → **GitHub Actions**

---

## Qualité code

- ✅ Zéro `style=""` inline
- ✅ Couleurs via variables CSS (pas de valeurs hardcodées)
- ✅ Séparation design tokens / styles globaux
- ✅ HTML sémantique, SEO meta complets
- ✅ Liens externes avec `rel="noopener noreferrer"`
- ✅ SRI hash sur Font Awesome
- ✅ Aucune dépendance inutile (MDX retiré — aucun fichier `.mdx` dans le projet)

---

## Licence

> **PROPRIÉTAIRE — TOUS DROITS RÉSERVÉS**

**Toute reproduction, copie, imitation ou réutilisation du concept, du design ou du code est strictement interdite** sans autorisation écrite préalable de l'auteur.

| Élément | Statut |
|---|---|
| Code source | © Stéphane Celton — usage privé uniquement |
| Concept & design | Protégé — reproduction interdite |
| Marque OceanPhenix™ | Marque déposée |

---

## Auteur

**Stéphane Celton**  
[linkedin.com/in/stephane-celton](https://www.linkedin.com/in/stephane-celton) · [stephanecelton.oceanphenix.fr](https://stephanecelton.oceanphenix.fr)

*© 2025–2026 OceanPhenix™ — Tous droits réservés. Reproduction interdite.*
