### EXM-013 — Déploiement, pages système et lancement

**Type :** chore · **Dépendances :** EXM-001 à EXM-012 · **Taille :** M

#### Pourquoi
La mise en production doit être sûre, observable et compréhensible pour un nouvel utilisateur dès la première visite.

#### Comportement

| Où | Après |
|---|---|
| `exams.mrvin100.de` | Production depuis `main` ; preview par PR, avec une branche Neon par preview |
| 404, erreur | Pages utiles, avec une issue |
| Comment ça marche | Les 4 étapes et la FAQ (prix, délais, litiges, sanctions) |
| CGU, confidentialité | Textes complets en fr et en |

#### Critères d'acceptation
- [ ] Projet Vercel relié au dépôt, avec le domaine et toutes les variables d'environnement ; Neon, Inngest, Ably, R2, Resend et Sentry en production.
- [ ] Sentry branché (client, serveur, tâches Inngest), avec alertes sur les erreurs du parcours critique.
- [ ] Tests Playwright des parcours F1 à F5 à 360 px et en bureau, dans la CI.
- [ ] Revue UX de lancement (ux-expert) : verdict Go, ou Conditional Go avec chaque condition attribuée et datée.

#### Critères d'acceptation UX
- [ ] La page 404 propose l'accueil et « Mes demandes ». [IA-15, STATE-20]
- [ ] La page d'erreur explique, propose de réessayer et ne perd pas la navigation. [STATE-07, STATE-08]
- [ ] « Comment ça marche » explique le prix, les délais et les sanctions en langage simple, en moins de 2 minutes de lecture. [HELP-01, CONT-14, TRUST-20]
- [ ] Les engagements affichés correspondent au comportement réel (délais, prix). [ONB-19]
- [ ] Les textes légaux sont accessibles depuis chaque écran de consentement. [TRUST-11]

#### Composants shadcn
- `empty`, `button`, `accordion` (FAQ), `typography`, `card`.

#### Hors périmètre
Landing page marketing.
