# PRO POLICE — Site V2

## Structure du projet

```
propolice-site/
├── index.html              # Page principale
├── script.js               # Scripts (simulateurs, filtres, UX)
├── styles.css              # Styles complets
├── fiche-discipline.html   # Fiche procédure disciplinaire
├── fiche-mutation.html     # Fiche mutation & mobilité
├── assets/
│   ├── logo.svg            # Logo PRO POLICE
│   └── favicon.svg         # Favicon
├── js/bdd/
│   ├── bdd_CEA.js          # Corps d'Encadrement et d'Application
│   ├── bdd_CRS.js          # Compagnies Républicaines de Sécurité
│   ├── bdd_ADMIN.js        # Personnels Administratifs
│   ├── bdd_PTS.js          # Personnels Techniques & Scientifiques
│   ├── bdd_ADJOINTS.js     # Policiers Adjoints
│   ├── bdd_RESERVISTES.js  # Réservistes
│   └── bdd_RETRAITE.js     # Retraite
├── content/
│   ├── data/
│   │   ├── site.json       # Configuration du site
│   │   ├── articles.json   # Articles & actualités
│   │   └── resources.json  # Ressources & fiches
│   ├── articles/           # Articles complets (Markdown)
│   └── pages/              # Pages simples (Markdown)
└── admin/
    ├── index.html          # Interface Decap CMS
    └── config.yml          # Configuration CMS
```

## Déploiement GitHub Pages

1. Pusher tous les fichiers sur le repo `SparkProPol/propolice-site`
2. Aller dans Settings > Pages > Source: Deploy from branch `main`
3. Le site sera disponible sur `sparkpropol.github.io/propolice-site/`

## Architecture des accès

- **80% Public** : Ressources libres, simulateurs, actualités
- **17% Adhérents** : Modèles avancés, vidéos pro, téléchargements
- **3% Staff/Délégués** : PRO POLICE UNIVERSITÉ + MENTORAT

## Niveaux délégués

- N1 : Délégué de Brigade
- N2 : Délégué de Service  
- N3 : Délégué Jour & Nuit
- N4 : Représentant Départemental
- N5 : Représentant Régional (post-élections 2026)
