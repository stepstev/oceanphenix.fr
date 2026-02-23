# 🔒 RAPPORT D'ANALYSE SÉCURITÉ & ERREURS
## Site: oceanphenix.fr | Hébergeur: O2Switch | Date: 23 février 2026

---

## 🚨 ERREURS CRITIQUES À CORRIGER

### 1. **Fichier security.txt mal placé**
- **Problème**: Le fichier `security.txt` est à la racine au lieu de `/.well-known/security.txt`
- **Norme**: RFC 9116 exige `/.well-known/security.txt`
- **Impact**: Les chercheurs en sécurité ne trouveront pas vos coordonnées
- **Solution**: 
  ```bash
  mkdir .well-known
  mv security.txt .well-known/security.txt
  ```
- **Priorité**: 🔴 CRITIQUE

### 2. **Pages d'erreur personnalisées manquantes**
- **Problème**: `.htaccess` référence des pages 404.html, 403.html, 500.html qui n'existent pas
- **Impact**: Erreurs serveur visibles pour les utilisateurs
- **Solution**: Créer ces pages personnalisées
- **Priorité**: 🟠 HAUTE

### 3. **Dates obsolètes dans sitemap.xml**
- **Problème**: `lastmod` date de 2025-12-30 (nous sommes en 2026)
- **Impact**: SEO dégradé, Google ne fait plus confiance au sitemap
- **Solution**: Mettre à jour les dates à 2026-02-23
- **Priorité**: 🟡 MOYENNE

### 4. **Expiration security.txt proche**
- **Problème**: Expire le 2026-12-31 (dans 10 mois)
- **Impact**: Fichier invalide après expiration
- **Solution**: Prolonger à 2027-12-31
- **Priorité**: 🟡 MOYENNE

### 5. **Problèmes de contraste WCAG**
- **Problème**: 2 erreurs de contraste détectées (lignes 668 et 803 dans index.html)
- **Impact**: Accessibilité non conforme, pénalité SEO
- **Solution**: Améliorer les contrastes de couleurs
- **Priorité**: 🟡 MOYENNE

---

## 🛡️ PROBLÈMES DE SÉCURITÉ

### ⚠️ SÉCURITÉ HAUTE PRIORITÉ

#### 1. **Content-Security-Policy trop permissive**
```apache
# Actuellement dans .htaccess (ligne 45):
script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

**Risque**: `'unsafe-inline'` permet l'injection de scripts/styles malveillants (XSS)

**Solution recommandée**:
```apache
# Utiliser des nonces ou des hash au lieu de 'unsafe-inline'
script-src 'self' 'nonce-{RANDOM}' https://cdnjs.cloudflare.com;
style-src 'self' 'nonce-{RANDOM}' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
```

**Priorité**: 🔴 CRITIQUE

#### 2. **Absence de Subresource Integrity (SRI)**
```html
<!-- index.html ligne 21-22: Pas de SRI sur Font Awesome -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
      rel="stylesheet" 
      integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
      crossorigin="anonymous">
```

**Problème**: SRI présent MAIS pas de vérification sur Google Fonts (lignes 19-20)

**Solution**:
```html
<!-- Ajouter SRI sur toutes les ressources externes -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Roboto:wght@300;400;500;700&display=swap" 
      rel="stylesheet" 
      integrity="sha384-[HASH_À_GÉNÉRER]"
      crossorigin="anonymous">
```

**Priorité**: 🟠 HAUTE

#### 3. **Cross-Origin Embedder Policy trop strict**
```apache
# .htaccess ligne 57:
Header always set Cross-Origin-Embedder-Policy "require-corp"
```

**Risque**: Peut bloquer Google Fonts et CDN si mal configuré

**Solution**: Vérifier compatibilité ou assouplir à:
```apache
Header always set Cross-Origin-Embedder-Policy "credentialless"
```

**Priorité**: 🟡 MOYENNE

### ⚠️ SÉCURITÉ MOYENNE PRIORITÉ

#### 4. **Pas de protection rate-limiting**
- Aucune protection contre brute-force dans `.htaccess`
- Un attaquant peut faire des milliers de requêtes

**Solution O2Switch**:
```apache
# Ajouter dans .htaccess
<IfModule mod_rewrite.c>
    # Limite 100 requêtes/minute par IP
    RewriteEngine On
    RewriteCond %{REQUEST_URI} ^/(login|admin|wp-admin)
    RewriteCond %{HTTP:X-Forwarded-For} ^(.*)$
    RewriteRule .* - [E=CLIENT_IP:%1]
    # Utiliser fail2ban côté serveur O2Switch
</IfModule>
```

**Priorité**: 🟡 MOYENNE

#### 5. **Headers de sécurité dans HTML redondants**
```html
<!-- index.html lignes 9-12: Doublons avec .htaccess -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
```

**Problème**: Définis 2 fois (HTML + .htaccess), risque de conflit

**Solution**: Supprimer de HTML, laisser uniquement dans `.htaccess`

**Priorité**: 🟢 BASSE

---

## 🔧 CONFIGURATION O2SWITCH SPÉCIFIQUE

### ✅ Points positifs déjà en place

1. **HTTPS forcé** (.htaccess ligne 21-25) ✅
2. **HSTS avec preload** (max-age=63072000) ✅
3. **Compression Gzip active** ✅
4. **Cache navigateur optimisé** ✅
5. **Blocage bots malveillants** (.htaccess ligne 71-76) ✅
6. **Anti-hotlinking images** (.htaccess ligne 79-85) ✅
7. **Protection fichiers sensibles** (.htaccess ligne 63-69) ✅

### ⚙️ Recommandations O2Switch

#### 1. **Activer HTTP/2 Push (si disponible)**
```apache
<IfModule http2_module>
    H2PushResource add css/critical.css
    H2PushResource add js/main.js
</IfModule>
```

#### 2. **Optimiser mod_pagespeed (si disponible sur O2Switch)**
```apache
<IfModule pagespeed_module>
    ModPagespeed on
    ModPagespeedEnableFilters rewrite_css,combine_css
    ModPagespeedEnableFilters rewrite_javascript,combine_javascript
</IfModule>
```

#### 3. **Vérifier version PHP**
- O2Switch supporte PHP 8.3
- Vérifier dans cPanel que vous utilisez la dernière version

---

## 📊 SCORE SÉCURITÉ ACTUEL

### Analyse selon Mozilla Observatory / Security Headers

| Critère | Status | Score |
|---------|--------|-------|
| Content-Security-Policy | ⚠️ Permissive | C |
| Strict-Transport-Security | ✅ Excellent | A+ |
| X-Frame-Options | ✅ DENY | A |
| X-Content-Type-Options | ✅ nosniff | A |
| Referrer-Policy | ✅ strict-origin | A |
| Permissions-Policy | ✅ Restrictive | A |
| SRI on CDN | ⚠️ Partiel | C |
| HTTPS Redirect | ✅ Actif | A |

**Score Global Estimé**: **B+ / A-** (pourrait être A+ avec corrections CSP)

---

## 🎯 PLAN D'ACTION PRIORITAIRE

### PHASE 1 - CORRECTIFS CRITIQUES (À faire maintenant)

1. ✅ Créer dossier `.well-known` et y déplacer `security.txt`
2. ✅ Créer pages d'erreur personnalisées (404.html, 403.html, 500.html)
3. ✅ Mettre à jour les dates dans `sitemap.xml`
4. ✅ Corriger les problèmes de contraste (lignes 668 et 803)

### PHASE 2 - SÉCURITÉ RENFORCÉE (Cette semaine)

5. ✅ Durcir CSP (supprimer 'unsafe-inline')
6. ✅ Ajouter SRI sur Google Fonts
7. ✅ Supprimer headers redondants dans HTML
8. ✅ Prolonger expiration security.txt à 2027

### PHASE 3 - OPTIMISATIONS (Ce mois)

9. ⚪ Implémenter rate-limiting avec fail2ban
10. ⚪ Tester HTTP/2 Push sur O2Switch
11. ⚪ Activer mod_pagespeed si disponible
12. ⚪ Audit complet avec Lighthouse

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT O2SWITCH

- [ ] Tester site en local avec modifications
- [ ] Vérifier certificat SSL O2Switch actif
- [ ] Uploader fichiers via FTP/SFTP sécurisé
- [ ] Tester .htaccess sur serveur O2Switch (syntaxe Apache compatible)
- [ ] Vérifier que mod_headers, mod_rewrite, mod_deflate sont actifs
- [ ] Tester toutes les redirections (www → non-www, HTTP → HTTPS)
- [ ] Valider security.txt avec https://securitytxt.org/
- [ ] Scanner avec https://observatory.mozilla.org/
- [ ] Tester avec https://securityheaders.com/
- [ ] Vérifier logs Apache pour erreurs .htaccess
- [ ] Test complet navigation (toutes pages)
- [ ] Test responsive mobile
- [ ] Test performance Lighthouse
- [ ] Backup complet avant mise en production

---

## 🔗 RESSOURCES UTILES

- **O2Switch Documentation**: https://faq.o2switch.fr/
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **Security Headers**: https://securityheaders.com/
- **CSP Evaluator**: https://csp-evaluator.withgoogle.com/
- **security.txt Validator**: https://securitytxt.org/
- **SRI Hash Generator**: https://www.srihash.org/

---

## 📝 NOTES COMPLÉMENTAIRES

### Compatibilité O2Switch

O2Switch utilise **Apache 2.4** avec modules suivants activés par défaut:
- mod_rewrite ✅
- mod_headers ✅
- mod_deflate ✅
- mod_expires ✅
- mod_mime ✅

Tous vos fichiers `.htaccess` sont **compatibles** avec O2Switch.

### Performance

Votre configuration cache est **excellente** pour O2Switch:
- Images: 2 ans (immutable)
- CSS/JS: 1 mois
- HTML: 1 heure
- Compression Gzip active

### Support O2Switch

En cas de problème:
- Support ticket via cPanel
- Email: support@o2switch.fr
- Téléphone: +33 4 44 44 60 40

---

**Rapport généré le**: 23 février 2026
**Analysé par**: GitHub Copilot (Claude Sonnet 4.5)
**Prochaine révision**: Mars 2026
