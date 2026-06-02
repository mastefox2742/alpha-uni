# Politique de Sécurité — UniGest

## Versions supportées

| Version | Support sécurité |
|---------|-----------------|
| main    | ✅ Supportée     |
| develop | ⚠️ Beta          |

## Signaler une vulnérabilité

**Ne pas créer de GitHub Issue publique pour les vulnérabilités de sécurité.**

### Procédure de divulgation responsable

1. **Email** : security@unigest.fr (ou le maintainer principal)
2. **Objet** : `[SECURITY] Description courte`
3. **Contenu** :
   - Description de la vulnérabilité
   - Étapes de reproduction
   - Impact potentiel
   - Version(s) affectée(s)

### Délais de réponse

| Priorité | Délai de réponse | Délai de correction |
|----------|-----------------|---------------------|
| Critique (CVSS 9-10) | 24h | 48h |
| Haute (CVSS 7-8.9) | 48h | 7 jours |
| Moyenne (CVSS 4-6.9) | 72h | 30 jours |
| Basse (CVSS < 4) | 7 jours | Prochain sprint |

### Ce que nous faisons avec le rapport

1. Accusé de réception sous 24h
2. Évaluation du score CVSS
3. Correction en privé
4. Notification RGPD si données utilisateurs exposées (délai 72h légal)
5. Publication d'un security advisory après correction
6. Crédit au chercheur dans le changelog

## Scope — Ce qui est dans le périmètre

- `packages/web` — Application Next.js
- `packages/api` — API Express
- `packages/mobile` — Application Expo
- Base de données Supabase (migrations + RLS)
- Fichiers de configuration (CI/CD, Docker, etc.)

## Scope — Hors périmètre

- Attaques nécessitant un accès physique
- Attaques de type social engineering
- Vulnérabilités dans les dépendances tierces non exploitables
- Rate limiting contournable uniquement avec des proxies rotatifs massifs

## Mesures de sécurité en place

- ✅ Rate limiting (5/min login, 100/min API)
- ✅ Validation Zod sur toutes les routes mutables
- ✅ Row Level Security (RLS) Supabase sur 30+ tables
- ✅ JWT validé côté serveur (jamais côté client)
- ✅ RBAC 4 niveaux (student/teacher/secretary/admin)
- ✅ Headers sécurité (CSP, HSTS, X-Frame-Options)
- ✅ CORS restreint aux domaines déclarés
- ✅ Documents en URLs signées TTL 1h (pas d'URL publique)
- ✅ Scan secrets pré-commit (Husky)
- ✅ CI/CD avec SAST (Semgrep + CodeQL)
- ✅ Dependabot hebdomadaire
- ✅ Endpoints RGPD (export, effacement, rectification)

## Contact

Maintainer principal : voir `package.json`
