# OceanPhenix.fr — Site Portfolio Professionnel

> **Stéphane Celton** · Data Product Manager · Senior Data Analyst BI · Production Engineer  
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
| Icons | Font Awesome 6.5 |

---

## Structure du projet

```
src/
├── components/
│   ├── Nav.astro              # Navigation fixe
│   ├── Hero.astro             # Section introduction
│   ├── Platforms.astro        # 3 cartes (RAG-IA, Portfolio, LinkedIn)
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
└── .well-known/security.txt   # Security contact
```

---

## Architecture CSS

Séparation en 2 couches selon les best practices Astro :

### `src/styles/tokens.css` — Design Tokens (Branding)

Source de vérité de l'identité visuelle OceanPhenix. Contient **uniquement** les CSS custom properties (`:root`) :

- Couleurs · `--accent-cyan: #00d9ff`, `--primary-dark: #0a1929`…
- Typographies · `--font-primary`, `--font-secondary`
- Espacements · `--spacing-xs` → `--spacing-xxl`
- Radius, ombres, transitions

> **Modifier ce fichier pour changer le branding.**

### `src/styles/global.css` — Styles Globaux

Reset CSS, animations, layout, styles de tous les composants. Consomme les variables de `tokens.css`.

Les deux sont importés dans `BaseLayout.astro` :

```js
import '../styles/tokens.css';  // Design tokens (branding)
import '../styles/global.css';  // Styles globaux + composants
```

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

**Prérequis GitHub :**
- Repo public
- Settings → Pages → Source → **GitHub Actions**

**DNS o2switch :**

| Type | Nom | Valeur |
|------|-----|--------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | stepstev.github.io |

---

## Qualité code

- ✅ Zéro `style=""` inline (Sonar `no-inline-styles`)
- ✅ Couleurs via variables CSS (pas de valeurs hardcodées)
- ✅ Séparation design tokens / styles globaux
- ✅ Assets dans `public/` (chemins `/Images/`, `/js/`)
- ✅ HTML sémantique, SEO meta complets

---

## Licence

> **PROPRIÉTAIRE — TOUS DROITS RÉSERVÉS**

Ce projet est soumis à une licence propriétaire exclusive.  
**Toute reproduction, copie, imitation ou réutilisation du concept, du design ou du code est strictement interdite** sans autorisation écrite préalable de l'auteur.

Voir le fichier [`LICENSE`](./LICENSE) pour le texte complet.

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
