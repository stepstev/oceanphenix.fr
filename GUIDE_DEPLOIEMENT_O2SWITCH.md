# 🚀 GUIDE DE MISE EN PRODUCTION O2SWITCH
## OceanPhenix - Déploiement sécurisé

---

## ✅ ÉTAPE 1 : PRÉPARATION DES FICHIERS

### Fichiers créés/modifiés :

- ✅ `.well-known/security.txt` (nouveau emplacement conforme RFC 9116)
- ✅ `404.html` (page d'erreur personnalisée)
- ✅ `403.html` (accès interdit personnalisé)
- ✅ `500.html` (erreur serveur personnalisée)
- ✅ `sitemap.xml` (dates mises à jour 2026)
- ✅ `index.html` (contrastes corrigés lignes 668 et 803)
- ✅ `.htaccess_SECURISE_V3` (nouvelle version sécurisée)

### Fichiers à supprimer après upload :

- ⚠️ `security.txt` (ancienne version à la racine)
- ⚠️ `.htaccess` (remplacer par `.htaccess_SECURISE_V3`)

---

## 📦 ÉTAPE 2 : UPLOAD VIA FTP/SFTP O2SWITCH

### Connexion FTP O2Switch :

```
Hôte: ftp.oceanphenix.fr (ou IP fournie par O2Switch)
Port: 21 (FTP) ou 22 (SFTP recommandé)
Utilisateur: [votre-login-cpanel]
Mot de passe: [votre-mot-de-passe]
```

### Ordre d'upload :

1. **Sauvegarder l'ancien .htaccess**
   ```bash
   # Depuis FileZilla ou WinSCP, télécharger .htaccess actuel
   # Le renommer en .htaccess.backup
   ```

2. **Uploader les nouveaux fichiers**
   ```
   / (racine)
   ├── 404.html
   ├── 403.html
   ├── 500.html
   ├── sitemap.xml (remplacer)
   ├── index.html (remplacer)
   └── .well-known/
       └── security.txt
   ```

3. **Renommer .htaccess_SECURISE_V3 en .htaccess**
   - Via FileZilla : Clic droit > Renommer
   - Écraser l'ancien .htaccess

4. **Supprimer l'ancien security.txt à la racine**

---

## 🧪 ÉTAPE 3 : TESTS POST-DÉPLOIEMENT

### 3.1 Test fonctionnel basique

```bash
# Ouvrir dans le navigateur
https://oceanphenix.fr/
```

**Vérifier :**
- ✅ Site se charge correctement
- ✅ Pas d'erreur 500 (problème .htaccess)
- ✅ Redirection HTTP → HTTPS fonctionne
- ✅ Redirection www → non-www fonctionne

### 3.2 Test des pages d'erreur

```bash
# Tester 404
https://oceanphenix.fr/page-inexistante
# Résultat attendu: Page 404 personnalisée avec design OceanPhenix

# Tester 403 (si fichier protégé existe)
https://oceanphenix.fr/.htaccess
# Résultat attendu: Page 403 personnalisée
```

### 3.3 Test security.txt

```bash
# Ouvrir dans le navigateur
https://oceanphenix.fr/.well-known/security.txt
```

**Résultat attendu :**
```
Contact: https://www.linkedin.com/in/stephane-celton
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: fr, en
Canonical: https://oceanphenix.fr/.well-known/security.txt
```

### 3.4 Validation security.txt

🔗 https://securitytxt.org/validator

- Coller l'URL : `https://oceanphenix.fr/.well-known/security.txt`
- Vérifier : ✅ Valid

---

## 🔒 ÉTAPE 4 : AUDIT SÉCURITÉ

### 4.1 Mozilla Observatory

🔗 https://observatory.mozilla.org/

1. Entrer : `oceanphenix.fr`
2. Lancer le scan
3. **Score attendu : A- à A+**

**Vérifications critiques :**
- ✅ Strict-Transport-Security : Present (max-age=63072000)
- ✅ Content-Security-Policy : Present
- ✅ X-Frame-Options : DENY
- ✅ X-Content-Type-Options : nosniff

### 4.2 Security Headers

🔗 https://securityheaders.com/

1. Entrer : `https://oceanphenix.fr`
2. Analyser
3. **Score attendu : A ou A+**

**En-têtes attendus :**
```
Strict-Transport-Security: ✅
Content-Security-Policy: ✅
X-Frame-Options: ✅
X-Content-Type-Options: ✅
Referrer-Policy: ✅
Permissions-Policy: ✅
```

### 4.3 SSL Labs

🔗 https://www.ssllabs.com/ssltest/

1. Entrer : `oceanphenix.fr`
2. Tester
3. **Score attendu : A+**

---

## ⚡ ÉTAPE 5 : TESTS PERFORMANCE

### 5.1 Google PageSpeed Insights

🔗 https://pagespeed.web.dev/

1. Entrer : `https://oceanphenix.fr`
2. Analyser Desktop + Mobile
3. **Scores attendus :**
   - Performance : 90-100
   - Accessibility : 95-100
   - Best Practices : 95-100
   - SEO : 95-100

### 5.2 GTmetrix

🔗 https://gtmetrix.com/

1. Entrer : `https://oceanphenix.fr`
2. **Grades attendus :**
   - Performance : A
   - Structure : A

---

## 🔍 ÉTAPE 6 : VÉRIFICATIONS FINALES

### Checklist complète :

- [ ] Site accessible en HTTPS
- [ ] Redirection HTTP → HTTPS active
- [ ] Redirection www → non-www active
- [ ] Pages d'erreur personnalisées (404, 403, 500)
- [ ] security.txt accessible et valide
- [ ] sitemap.xml avec dates 2026
- [ ] Headers de sécurité présents (vérifier avec F12 > Network)
- [ ] Compression Gzip active (vérifier avec F12)
- [ ] Cache navigateur actif (vérifier Cache-Control)
- [ ] Aucune erreur 500 dans les logs Apache
- [ ] Aucune erreur Console JavaScript (F12)
- [ ] Tous les liens fonctionnent
- [ ] Images chargent correctement
- [ ] CSS/JS chargent correctement
- [ ] Popup 2026 fonctionne
- [ ] Navigation mobile responsive

---

## 🛠️ DÉPANNAGE

### Erreur 500 après upload .htaccess

**Cause probable :** Syntaxe .htaccess incompatible ou module Apache manquant

**Solution :**
1. Restaurer ancien .htaccess
2. Contacter support O2Switch pour vérifier modules actifs :
   - mod_rewrite
   - mod_headers
   - mod_deflate
   - mod_expires

### Headers de sécurité absents

**Cause probable :** mod_headers non actif

**Solution :**
1. Vérifier dans cPanel > "Select PHP Version" > Extensions
2. Contacter support O2Switch si mod_headers manquant

### security.txt inaccessible

**Cause probable :** Dossier .well-known non créé ou permissions incorrectes

**Solution :**
```bash
# Via SSH ou File Manager cPanel
mkdir -p .well-known
chmod 755 .well-known
chmod 644 .well-known/security.txt
```

### Site lent après upload

**Cause probable :** Compression Gzip non activée

**Solution :**
1. Vérifier .htaccess section GZIP
2. Tester avec : https://checkgzipcompression.com/

---

## 📞 SUPPORT O2SWITCH

En cas de problème :

- **Ticket support :** cPanel > "Support" > "Open Ticket"
- **Email :** support@o2switch.fr
- **Téléphone :** +33 4 44 44 60 40
- **Horaires :** 24/7

**Informations à fournir au support :**
- Domaine : oceanphenix.fr
- Problème rencontré
- Fichiers modifiés (lister)
- Logs erreurs (depuis cPanel > Metrics > Errors)

---

## ✨ APRÈS DÉPLOIEMENT

### Suivi recommandé :

1. **Hebdomadaire (1 mois)**
   - Vérifier logs Apache (erreurs 404, 500)
   - Surveiller temps de réponse
   - Vérifier certificat SSL valide

2. **Mensuel**
   - Rescan Mozilla Observatory
   - Rescan Security Headers
   - Mise à jour security.txt si besoin

3. **Trimestriel**
   - Audit Lighthouse complet
   - Vérification HSTS preload : https://hstspreload.org/
   - Mise à jour sitemap.xml

---

## 🎉 FÉLICITATIONS !

Si tous les tests passent, votre site est :
- ✅ Sécurisé niveau A/A+
- ✅ Optimisé performance
- ✅ Conforme RGPD/WCAG
- ✅ Prêt pour la production

**Score attendu global : 95-100/100**

---

**Dernière mise à jour :** 23 février 2026
**Version guide :** 1.0
