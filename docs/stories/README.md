# Backlog — MVP

Chaque story vit dans sa branche `exm-<code>-<titre>`, part de `develop` et y revient par PR. Les critères UX viennent du skill ux-expert (mode Design) ; leurs IDs sont dans `.claude/skills/ux-expert/criteria/`. Les composants de chaque écran sont choisis dans [`docs/ui/component-map.md`](../ui/component-map.md).

| Code | Story | Dépend de | Taille |
|---|---|---|---|
| [EXM-001](EXM-001-project-setup.md) | Mise en place du projet | — | M |
| [EXM-002](EXM-002-auth.md) | Connexion et comptes | 001 | L |
| [EXM-003](EXM-003-catalog.md) | Catalogue et réglages économiques | 002 | M |
| [EXM-004](EXM-004-beneficiaries.md) | Bénéficiaires et identifiants chiffrés | 002 | M |
| [EXM-014](EXM-014-assistant-verification.md) | Vérification des assistants | 002 | M |
| [EXM-015](EXM-015-brand-and-analytics.md) | Identité visuelle, partage et mesure d'audience | 002 | S |
| [EXM-005](EXM-005-sessions-and-requests.md) | Sessions et publication des demandes | 003, 004 | L |
| [EXM-006](EXM-006-live-queue.md) | File publique en temps réel et présence | 005 | M |
| [EXM-007](EXM-007-claim.md) | Prendre une demande : un assistant, un client | 006 | L |
| [EXM-008](EXM-008-reservation-and-release.md) | Réservation, confirmation et libération | 007 | M |
| [EXM-009](EXM-009-payment.md) | Règlement : deux dépôts et échéance | 008 | M |
| [EXM-010](EXM-010-trust.md) | Litiges, avertissements, liste noire, signalements | 008, 009 | L |
| [EXM-011](EXM-011-notifications.md) | Notifications | 007 | M |
| [EXM-012](EXM-012-admin.md) | Back-office | 010 | L |
| [EXM-013](EXM-013-launch.md) | Déploiement, pages système et lancement | 001–012 | M |

Release 1 (MVP) = EXM-001 à EXM-015, puis fusion de `develop` dans `main`.
