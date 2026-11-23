### EXM-011 — Notifications

**Type :** feature · **Dépendances :** EXM-007 · **Taille :** M

#### Pourquoi
Les délais (15 min, 24 h) supposent que chacun soit prévenu au bon moment, avec un lien qui mène droit à l'action.

#### Comportement

| Événement | Destinataire | Canal |
|---|---|---|
| Demande prise / remise en file | Candidat | in-app + email |
| Réservation effectuée | Candidat | in-app + email |
| Libéré | Assistant | in-app |
| Paiement à faire / rappels H+1, H+12 | Candidat | in-app + email |
| Dépôt déclaré / non reçu | Assistant / candidat | in-app + email |
| Litige : preuve demandée, décision | Les deux | in-app + email |
| Avertissement, suspension | Concerné | in-app + email |

#### Décisions d'implémentation
- Pas d'Inngest : chaque action enregistre ses notifications après la réponse (`after()`), le module `notifications` est le seul à envoyer les emails produit. Les emails de compte (code de connexion, accord d'un camarade) restent dans leur module.
- Emails réduits au nécessaire (coût d'envoi) :
  - critiques, jamais coupés : dépôt non reçu, litige (preuve demandée, décision), avertissement et suspension ;
  - de suivi, coupables en un interrupteur : réservation déclarée, demande à corriger, dépôt déclaré à l'assistant ;
  - le reste n'est que dans l'application (centre de notifications, temps réel par le canal personnel Ably).
- Rappels de paiement H+1 / H+12 : l'échéance est affichée en permanence sur la carte de règlement ; des rappels horaires demanderaient une tâche horaire (Vercel Pro ou file d'attente), reportée.
- Langue des emails : la dernière langue utilisée par le destinataire (`User.locale`).
- Le canal personnel est ouvert une seule fois par `RealtimeProvider`, partagé par la cloche et les pages.

#### Critères d'acceptation
- [ ] Module `notifications` qui écoute les événements Inngest ; aucun autre module n'envoie d'email directement.
- [ ] Modèles d'emails React Email, en fr et en, dans la langue du destinataire.
- [ ] Centre de notifications : non lues, tout marquer comme lu, temps réel par Ably.
- [ ] Préférences : les emails non critiques peuvent être coupés ; les emails transactionnels critiques (paiement, litige, sanction) ne le peuvent pas.

#### Critères d'acceptation UX
- [ ] Chaque notification dit ce qui s'est passé et ce qu'il faut faire, avec l'échéance s'il y en a une. [NOTIF-18, CONT-17]
- [ ] Chaque lien mène directement à l'opération concernée, même après reconnexion. [NOTIF-10, FLOW-11]
- [ ] L'urgence correspond au canal : seuls les événements avec délai envoient un email immédiat. [NOTIF-02, NOTIF-12]
- [ ] Les emails ont un objet explicite, un seul bouton d'action et aucun identifiant du centre. [CONT-18, TRUST-18]
- [ ] Les préférences sont réglables par type et par canal, et précisent ce qui ne peut pas être coupé. [NOTIF-05, NOTIF-06]
- [ ] Centre vide : « Rien de nouveau ». Le nombre de non lues est annoncé aux lecteurs d'écran. [STATE-02, A11Y-13]
- [ ] Les rappels ne sont jamais envoyés après la clôture de l'opération. [NOTIF-09, TRUST-21]

**Mesuré par :** taux de clic par type de notification. [MEAS-02]

#### Composants shadcn
- `popover` (bureau) / `sheet` (téléphone), `item`, `badge` (non lues), `empty`, `switch` (préférences), `field`.

#### Hors périmètre
WhatsApp et SMS (v2).
