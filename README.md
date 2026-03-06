# OceanPhenix.fr — Site Portfolio Professionnel

> **Stéphane Celton** · Data Product Manager · Business Intelligence · Gouvernance Data
> Site vitrine construit avec **Astro v4** · Hébergé sur **GitHub Pages** · Domaine custom `oceanphenix.fr`

---

## Stack technique

| Couche | Technologie |
| ------ | ----------- |
| Framework | [Astro v4](https://astro.build) (SSG) |
| CSS | Design tokens + CSS global scopé |
| JS | Vanilla JS (`public/js/main.js`) |
| CI/CD | GitHub Actions (`.github/workflows/deploy.yml`) |
| Hébergement | GitHub Pages |
| Domaine | `oceanphenix.fr` (DNS via o2switch) |
| Fonts | IBM Plex Sans + Roboto (Google Fonts) |
| Icons | Font Awesome 6.5 (CDN avec SRI hash) |

---

## Structure du projet

```text
src/
├── components/
│   ├── Nav.astro              # Navigation fixe — logo SVG inline + icônes FA
│   ├── Hero.astro             # Section introduction + tagline
│   ├── Platforms.astro        # 6 cartes projets
│   ├── CvSection.astro        # Business card corporate + téléchargement PDF
│   ├── Footer.astro           # Bio + date de mise à jour automatique
│   ├── CopyrightBar.astro     # Barre bas de page
│   ├── WelcomePopup.astro     # Popup 2026
│   ├── OceanBackground.astro  # Fond animé (3 vagues)
│   └── CguModal.astro         # Modal CGU
├── layouts/
│   └── BaseLayout.astro       # SEO (OG, Twitter Card, canonical) + imports CSS
├── pages/
│   ├── index.astro            # Page principale
│   ├── portfolio.astro        # Vitrine profil — photo, bio, tags, JSON-LD
│   ├── expertises.astro       # 6 domaines d'intervention
│   └── 404.astro              # Erreur 404
└── styles/
    ├── tokens.css             # Design tokens — branding OceanPhenix
    └── global.css             # Reset, layout, composants, animations

public/
├── Images/                    # Logos, photos
├── js/main.js                 # JS vanilla (popup, CGU, heure)
├── robots.txt
├── sitemap.xml                # /, /portfolio, /expertises
├── CNAME                      # Domaine custom GitHub Pages
└── .well-known/security.txt
```

---

## Pages

| Route | Description |
| ----- | ----------- |
| `/` | Page principale — Hero, Plateformes, CV |
| `/portfolio` | Vitrine profil — photo, bio, compétences, hashtags |
| `/expertises` | 6 domaines d'expertise |
| `/404` | Page d'erreur personnalisée |

---

## Architecture CSS

### `src/styles/tokens.css` — Design Tokens

Source de vérité de l'identité visuelle OceanPhenix.
Contient uniquement les CSS custom properties (`:root`) :

- Couleurs : `--accent-cyan: #00d9ff`, `--primary-dark: #0a1929`
- Typographies, espacements, radius, ombres, transitions

### `src/styles/global.css` — Styles Globaux

Reset CSS, animations, layout, styles composants. Consomme les variables de `tokens.css`.

```js
import '../styles/tokens.css';
import '../styles/global.css';
```

---

## Design System — Palette Corporate

| Élément | Style |
| ------- | ----- |
| Boutons demo | Ghost outlined (transparent, bordure subtile) |
| Cartes featured | Bordure teal discrète `rgba(45,160,130,0.45)` |
| Badges | Outlined, sans animation pulse |
| Hover cartes | `translateY(-4px)` + ombre douce |
| Logo nav | SVG inline phénix + vague, `currentColor` blanc |

---

## SEO

- **Open Graph** + **Twitter Card** sur toutes les pages
- **Canonical** URL sur chaque page
- **JSON-LD** `Person` schema sur `/portfolio`
- **Sitemap** : `/, /portfolio, /expertises`
- **Robots** meta : index/follow sur pages publiques

---

## Sécurité

### Headers meta

- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### Ressources externes

- Font Awesome chargé avec SRI integrity hash + `crossorigin="anonymous"`
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

| Point | Statut |
| ----- | ------ |
| Fichiers statiques uniquement | Compatible |
| Aucun serveur Node.js requis | Compatible |
| Domaine custom + DNS o2switch | Via enregistrements A + CNAME |
| CGI-bin | Dossier présent, réservé |

### DNS o2switch

| Type | Nom | Valeur |
| ---- | --- | ------ |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | stepstev.github.io |

---

## Développement local

```bash
npm install       # Installer les dépendances
npm run dev       # Dev server → http://localhost:4321
npm run build     # Build production → dist/
npm run preview   # Prévisualiser dist/
```

---

## Déploiement

Automatique à chaque push sur `main` via GitHub Actions :

```text
push main → deploy.yml → npm run build → GitHub Pages (oceanphenix.fr)
```

---

## Qualité code

- Zéro `style=""` inline
- Couleurs via variables CSS (pas de valeurs hardcodées)
- Séparation design tokens / styles globaux
- HTML sémantique, SEO meta complets
- Liens externes avec `rel="noopener noreferrer"`
- SRI hash sur Font Awesome
- Logo SVG inline (pas de dépendance image externe)
- Footer date de mise à jour auto au build

---

## Licence

PROPRIÉTAIRE — TOUS DROITS RÉSERVÉS

Toute reproduction sans autorisation écrite préalable est interdite.

| Élément | Statut |
| ------- | ------ |
| Code source | Stéphane Celton — usage privé uniquement |
| Concept & design | Protégé — reproduction interdite |
| Marque OceanPhenix™ | Marque déposée |

---

Stéphane Celton — [oceanphenix.fr](https://oceanphenix.fr)
