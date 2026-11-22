### EXM-012 — Back-office

**Type :** feature · **Dépendances :** EXM-010 · **Taille :** L

#### Pourquoi
L'admin n'intervient qu'aux moments critiques. Il doit tout voir en temps réel et agir vite, avec des actions sûres et traçables.

#### Comportement

| Où | Après |
|---|---|
| Vue d'ensemble | Indicateurs (publiées, prises, à payer, litiges, impayés), activité en direct |
| Opérations | Liste filtrable, fiche avec l'historique complet |
| Litiges | Preuves, chronologie, décision |
| Utilisateurs | Rôles, avertissements, suspendre, bannir, révoquer les sessions |
| Catalogue | EXM-003 ; demandes d'ajout ; sessions à valider |
| Signalements | File à traiter |
| Journal d'audit | Toutes les actions admin |

#### Critères d'acceptation
- [ ] Accès `adminProcedure` uniquement, avec 2FA obligatoire.
- [ ] Bannir et révoquer passent par le plugin admin de Better Auth.
- [ ] Chaque action admin écrit une entrée dans `AuditLog` (acteur, cible, avant/après).
- [ ] Canal Ably `admin:live`.
- [ ] Suppression de compte et export des données d'un utilisateur, à sa demande.

#### Critères d'acceptation UX
- [ ] La console est séparée de l'app et accessible depuis le menu du compte pour les admins seulement. [ADMIN-01, IA-01]
- [ ] Chaque indicateur a un contexte (période, évolution) et mène à la liste filtrée. [DATA-16, DATA-17]
- [ ] Les filtres sont visibles, leur état est clair et conservé dans l'URL. [DATA-11, DATA-13]
- [ ] Bannir, suspendre et révoquer demandent une confirmation qui nomme l'utilisateur et la conséquence. [ADMIN-09, CONT-10]
- [ ] La fiche d'un litige réunit, sur un seul écran, la chronologie, les preuves, la liste de vérification cochée et les historiques des deux parties. [FLOW-06, DATA-17]
- [ ] Le rôle et les permissions effectives d'un utilisateur sont visibles. [ADMIN-05]
- [ ] Les tableaux restent utilisables au clavier, avec des actions de ligne accessibles. [DATA-06, A11Y-02]
- [ ] L'activité en direct n'interrompt pas la lecture et affiche l'heure de la dernière mise à jour. [DATA-25, DATA-18]

**Mesuré par :** délai moyen de décision d'un litige. [MEAS-01]

#### Composants shadcn
- Block `dashboard-01` (cartes KPI, `chart`, `data-table`), `sidebar`, `tabs`, `sheet` (fiches), `alert-dialog` (actions destructives), `command` (recherche d'utilisateur), `badge`, `attachment` (preuves).

#### Hors périmètre
Statistiques avancées et exports comptables.
