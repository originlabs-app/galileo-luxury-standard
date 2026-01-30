# Phase 1: Governance Foundation - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Établir une gouvernance neutre et indépendante qui empêche le contrôle par une seule organisation et permet à des marques de luxe concurrentes de collaborer sur un standard commun. Livrable : charte de gouvernance, processus RFC, documentation licence, politique de versionnage.

</domain>

<decisions>
## Implementation Decisions

### Structure de décision
- **Modèle hybride** : TSC (Comité Technique) pour les décisions techniques, vote des membres pour les décisions stratégiques
- **Composition TSC méritocratique** : autorité gagnée par la contribution réelle au code/specs (modèle Apache/Linux Foundation)
- **Phase de transition** : noyau initial nommé par les fondateurs (3-5 marques pilotes), puis ouverture progressive aux contributeurs méritants
- **Veto uniquement sur breaking changes** : protège les adopteurs contre l'obsolescence forcée, exercé par le TSC
- **Transparence hybride** : délibérations privées (protège la parole des marques concurrentes), mais décisions et rationale toujours publiés

### Processus de contribution
- **Template RFC Standard** : structuré mais accessible (motivation, solution, alternatives, impact conformité, backward compatibility)
- **Contribution ouverte à tous** : n'importe qui peut soumettre une RFC (Open Contribution), le TSC filtre par le mérite
- **Périodes de review variables** : Mineurs 2 semaines, Majeurs 30 jours, Breaking changes 60 jours
- **Langue officielle** : anglais (seule version faisant foi), traductions communautaires encouragées pour l'accessibilité

### Modèle de membership
- **Trois niveaux** : Observers (gratuit), Members (payant), Founding Partners (engagement initial)
- **Cotisations selon taille** : barème basé sur le CA pour assurer l'accessibilité aux PME et artisans
- **Founding Partners** : fenêtre fermée (période de lancement uniquement), engagement financier et en ressources humaines (FTEs pour le TSC)
- **Droits Observers** : accès specs, participation RFC, observation meetings, usage commercial gratuit (Apache 2.0)

### Politique de versionnage
- **Semver strict** : MAJOR.MINOR.PATCH — breaking = MAJOR, features = MINOR, fixes = PATCH
- **Dépréciation sunset 10 ans** : adapté au temps long du luxe (vs 24 mois standard logiciel)
- **Releases semestrielles** : prévisibilité pour l'intégration ERP, temps pour le consensus RFC
- **Hotfixes sécurité 72h** : fenêtre de coordination avec les adopteurs avant publication publique

### Claude's Discretion
- Format exact des templates RFC (sections, longueur)
- Structure détaillée de la charte (articles, annexes)
- Design visuel des documents de gouvernance
- Détails du processus d'élection/cooptation au TSC

</decisions>

<specifics>
## Specific Ideas

- S'inspirer explicitement du modèle **Linux Foundation / Hyperledger** pour la structure de gouvernance
- Éviter le "syndrome TradeLens" : perception de club fermé, déséquilibre de pouvoir, manque de consensus sur les standards de données
- La gouvernance doit incarner les principes d'Elinor Ostrom sur les "biens communs numériques" : règles claires, mécanismes de décision inclusifs, confiance entre concurrents
- Le standard est une "North Star" stable, pas un produit qui change au gré des modes
- Les 10 ans de sunset correspondent au cycle de vie d'un produit de luxe (montres transmises sur plusieurs générations)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-governance-foundation*
*Context gathered: 2026-01-30*
