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
| Assistants à vérifier | Pièce d'identité, numéro Mobile Money, valider / refuser avec motif |
| Catalogue | EXM-003 ; demandes d'ajout ; sessions à valider |
| Signalements | File à traiter |
| Journal d'audit | Toutes les actions admin |

#### Décisions d'implémentation
- Console dans l'app, groupe « Admin » du menu et entrée « Console admin » du menu du compte, réservée aux admins avec session 2FA (comme avant).
- Déjà livrés par leurs stories : Catalogue (EXM-003), Commissions (EXM-009), Litiges (EXM-010), Sessions (EXM-023), Assistants à vérifier (EXM-014). Cette story ajoute la vue d'ensemble, les opérations, les utilisateurs, les signalements (avec les demandes d'ajout) et le journal.
- Vue d'ensemble rafraîchie toutes les 30 s avec l'heure affichée, plutôt qu'un canal `admin:live` : moins de connexions Ably, même lisibilité.
- Suppression : par Better Auth ; si des opérations passées y font référence, le compte est anonymisé et banni. Export JSON sans mot de passe du centre, journalisé.

#### Critères d'acceptation
- [ ] Accès `adminProcedure` uniquement, avec 2FA obligatoire.
- [ ] Bannir et révoquer passent par le plugin admin de Better Auth.
- [ ] Chaque action admin écrit une entrée dans `AuditLog` (acteur, cible, avant/après).
- [ ] Canal Ably `admin:live`.
- [ ] Suppression de compte et export des données d'un utilisateur, à sa demande.

#### Décisions d'implémentation
- Console dans l'app, groupe « Admin » du menu et entrée « Console admin » du menu du compte, réservée aux admins avec session 2FA (comme avant).
- Déjà livrés par leurs stories : Catalogue (EXM-003), Commissions (EXM-009), Litiges (EXM-010), Sessions (EXM-023), Assistants à vérifier (EXM-014). Cette story ajoute la vue d'ensemble, les opérations, les utilisateurs, les signalements (avec les demandes d'ajout) et le journal.
- Vue d'ensemble rafraîchie toutes les 30 s avec l'heure affichée, plutôt qu'un canal `admin:live` : moins de connexions Ably, même lisibilité.
- Suppression : par Better Auth ; si des opérations passées y font référence, le compte est anonymisé et banni. Export JSON sans mot de passe du centre, journalisé.

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
