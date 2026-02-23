# 🌊 OceanPhenix

[![Sécurité](https://img.shields.io/badge/Sécurité-A+-brightgreen)](https://observatory.mozilla.org/)
[![Performance](https://img.shields.io/badge/Performance-94%2F100-success)](https://pagespeed.web.dev/)
[![Hébergement](https://img.shields.io/badge/Hébergement-O2Switch%20🇫🇷-blue)](https://www.o2switch.fr/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./cgu.html)

> **Site vitrine professionnel** - Stéphane Celton, Data Product Manager & Innovation Tech

Site web moderne, sécurisé et optimisé présentant mes expertises en Data Product Management, BI, IA et innovation technologique.

🔗 **Site en ligne** : [oceanphenix.fr](https://oceanphenix.fr)

---

## 🎯 Caractéristiques principales

### 🛡️ Sécurité niveau A+
- ✅ **Headers de sécurité optimisés** (CSP, HSTS, X-Frame-Options)
- ✅ **security.txt** conforme RFC 9116
- ✅ **Certificat SSL/TLS** avec HSTS preload
- ✅ **Score Mozilla Observatory** : A/A+
- ✅ **Protection anti-hotlinking** et blocage bots malveillants

### ⚡ Performance optimisée
- ✅ **Score Lighthouse** : 94+/100
- ✅ **Compression Gzip/Brotli** active
- ✅ **Cache navigateur** optimisé (images 2 ans, CSS/JS 1 mois)
- ✅ **CSS critique inline** + lazy loading
- ✅ **Architecture 100% statique** (HTML/CSS/JS)

### ♿ Accessibilité WCAG AA
- ✅ **Contrastes conformes** WCAG 2.1 niveau AA
- ✅ **Navigation clavier** complète
- ✅ **Structure sémantique** HTML5
- ✅ **Textes alternatifs** sur toutes les images

### 🇫🇷 Hébergement souverain
- ✅ **O2Switch France** (Clermont-Ferrand)
- ✅ **Serveurs Apache 2.4** optimisés
- ✅ **Support 24/7** en français
- ✅ **99.9% uptime** garanti

---

## 📁 Structure du projet

```
oceanphenix.fr/
├── index.html                      # Page principale
├── cgu.html                        # Conditions générales d'utilisation
├── 404.html                        # Page erreur 404 personnalisée
├── 403.html                        # Page erreur 403 personnalisée
├── 500.html                        # Page erreur 500 personnalisée
├── .htaccess                       # Configuration Apache sécurisée
├── .htaccess_SECURISE_V3          # Version sécurité A+ (backup)
├── sitemap.xml                     # Plan du site pour SEO
├── robots.txt                      # Instructions robots d'indexation
├── .well-known/
│   └── security.txt               # Contact sécurité (RFC 9116)
├── css/
│   ├── critical.css               # CSS critique inline
│   └── main.css                   # CSS principal (defer)
├── js/
│   └── main.js                    # JavaScript principal
├── Images/
│   ├── 2026_.png                  # Carte de vœux 2026
│   ├── ThinkinG.png               # Background hero
│   └── logos/                     # Logos et icônes
└── docs/
    ├── RAPPORT_SECURITE_O2SWITCH.md    # Audit sécurité complet
    └── GUIDE_DEPLOIEMENT_O2SWITCH.md   # Guide de déploiement
```

---

## 🚀 Installation & Déploiement

### Prérequis
- Serveur web **Apache 2.4+** ou **Nginx**
- **PHP 8.0+** (optionnel, pour fonctionnalités futures)
- **Certificat SSL/TLS** actif
- Modules Apache : `mod_rewrite`, `mod_headers`, `mod_deflate`, `mod_expires`

### Déploiement O2Switch (recommandé)

1. **Connexion FTP/SFTP**
   ```bash
   Hôte: ftp.oceanphenix.fr
   Port: 22 (SFTP recommandé)
   ```

2. **Upload des fichiers**
   - Uploader tous les fichiers vers `/public_html/` ou `/www/`
   - Vérifier les permissions (644 pour fichiers, 755 pour dossiers)

3. **Configuration SSL**
   - Activer SSL dans cPanel O2Switch
   - Vérifier HTTPS forcé via `.htaccess`

4. **Tests post-déploiement**
   - ✅ https://oceanphenix.fr (site accessible)
   - ✅ https://observatory.mozilla.org/ (scan sécurité)
   - ✅ https://pagespeed.web.dev/ (scan performance)

📖 **Guide complet** : [GUIDE_DEPLOIEMENT_O2SWITCH.md](./GUIDE_DEPLOIEMENT_O2SWITCH.md)

---

## 🔒 Sécurité

### Headers de sécurité implémentés

```apache
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()...
Cross-Origin-Opener-Policy: same-origin
```

### Fonctionnalités de sécurité
- 🔐 **HTTPS uniquement** (redirection HTTP → HTTPS)
- 🔐 **Protection fichiers sensibles** (.htaccess, .env, .git)
- 🔐 **Anti-hotlinking** images et médias
- 🔐 **Blocage bots malveillants** (nikto, sqlmap, scrapers)
- 🔐 **Pages d'erreur personnalisées** (404, 403, 500)

📊 **Rapport de sécurité** : [RAPPORT_SECURITE_O2SWITCH.md](./RAPPORT_SECURITE_O2SWITCH.md)

---

## 📈 Performance

### Optimisations appliquées

| Optimisation | Technique | Gain |
|--------------|-----------|------|
| **Images** | Cache 2 ans + immutable | -90% requêtes |
| **CSS/JS** | Cache 1 mois + minification | -60% bande passante |
| **HTML** | Compression Gzip niveau 6 | -70% taille |
| **Fonts** | Preconnect + WOFF2 | -500ms chargement |
| **CDN** | Cloudflare (Font Awesome) | -200ms latence |

### Scores actuels
- 🚀 **Lighthouse Performance** : 94/100
- 🚀 **First Contentful Paint** : < 1.2s
- 🚀 **Time to Interactive** : < 2.5s
- 🚀 **Cumulative Layout Shift** : < 0.1

---

## 🛠️ Technologies utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Variables CSS, Grid, Flexbox
- **JavaScript ES6+** - Vanilla JS (pas de framework)

### Fonts & Icons
- **IBM Plex Sans** - Typographie principale
- **Roboto** - Typographie secondaire
- **Font Awesome 6.5** - Icônes

### Infrastructure
- **O2Switch** - Hébergement France
- **Apache 2.4** - Serveur web
- **Let's Encrypt** - Certificat SSL/TLS gratuit

---

## 📝 Mentions légales

### Éditeur du site
- **Nom** : Stéphane Celton
- **Marque** : OceanPhenix™
- **Contact** : [LinkedIn - Stéphane Celton](https://www.linkedin.com/in/stephane-celton)

### Hébergement
- **Hébergeur** : o2switch SARL
- **Adresse** : 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France
- **Site web** : [www.o2switch.fr](https://www.o2switch.fr)

### Propriété intellectuelle
- **Marque** : OceanPhenix™ est une marque déposée
- **Domaine** : oceanphenix.fr est un nom de domaine protégé
- **Contenu** : Tous droits réservés © 2025-2026 Stéphane Celton

📄 **CGU complètes** : [cgu.html](./cgu.html)

---

## 🔗 Liens utiles

- 🌐 **Site principal** : [oceanphenix.fr](https://oceanphenix.fr)
- 👤 **Profil** : [stephanecelton.oceanphenix.fr](https://stephanecelton.oceanphenix.fr)
- 💼 **LinkedIn** : [linkedin.com/in/stephane-celton](https://www.linkedin.com/in/stephane-celton)
- 📊 **Dashboard** : [health.oceanphenix.fr](https://health.oceanphenix.fr)
- 🔒 **Sécurité** : [.well-known/security.txt](https://oceanphenix.fr/.well-known/security.txt)

---

## 📞 Support & Contact

### Signaler une vulnérabilité
Conformément à la politique de divulgation responsable, merci de contacter :
- 📧 **Contact sécurité** : Voir [security.txt](https://oceanphenix.fr/.well-known/security.txt)
- 💼 **LinkedIn** : [Stéphane Celton](https://www.linkedin.com/in/stephane-celton)

### Support technique O2Switch
- 📧 **Email** : support@o2switch.fr
- 📞 **Téléphone** : +33 4 44 44 60 40
- ⏰ **Disponibilité** : 24/7

---

## 📊 Changelog

### Version 4.0 (2026-02-23)
- ✨ Architecture 100% statique optimisée
- 🔒 Sécurité A+ (Mozilla Observatory)
- 🚀 Performance 94/100 (Lighthouse)
- 🇫🇷 Migration vers O2Switch France
- ♿ Conformité WCAG AA
- 📄 Pages d'erreur personnalisées
- 📝 CGU complètes
- 🎨 Popup 2026 festive avec carte de vœux

---

## 📜 License

**Propriétaire** - Tous droits réservés © 2025-2026 Stéphane Celton / OceanPhenix™

Ce site et son contenu sont protégés par le droit d'auteur et la propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans autorisation écrite préalable.

---

<div align="center">

**Développé avec ❤️ en France par Stéphane Celton**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Stéphane%20Celton-0077B5?logo=linkedin)](https://www.linkedin.com/in/stephane-celton)
[![Website](https://img.shields.io/badge/Website-oceanphenix.fr-00d9ff)](https://oceanphenix.fr)

</div>
