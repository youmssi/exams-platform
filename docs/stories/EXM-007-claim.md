### EXM-007 — Prendre une demande : un assistant, un client

**Type :** feature · **Dépendances :** EXM-006 · **Taille :** L

#### Pourquoi
La prise doit être instantanée et exclusive. Et un assistant qui ne fait rien ne doit jamais bloquer un candidat pendant que les places partent.

#### Comportement

| Où | Après |
|---|---|
| File | **Prendre** sur une demande |
| Opération (assistant) | Identifiants déchiffrés, copie en un geste, compte à rebours de 20 min, **Réservation effectuée**, **Libérer** |
| Opération (candidat) | « Un assistant s'occupe de votre demande », compte à rebours, **Me retirer** (et augmenter le bonus) |

#### Critères d'acceptation
- [ ] `operations/domain` : machine à états (prise, libération, retrait, échéance), testée pour chaque transition autorisée et interdite ; la réservation s'y ajoute avec EXM-008.
- [ ] Prise atomique (verrou optimiste) ; une seule opération active par assistant (index partiel).
- [ ] Assistant suspendu ou avec une opération active : prise refusée côté serveur ; la file est remplacée par « Terminez votre opération en cours ».
- [ ] Identifiants déchiffrés uniquement pour l'assistant de l'opération active ; chaque lecture est journalisée.
- [ ] Après 20 min (réglage de l'offre) sans réservation, la demande revient dans la file. Décision produit : l'échéance est stockée sur l'opération et appliquée à chaque lecture (comme la publication programmée) ; pas de service de tâches pour l'instant.
- [ ] Le candidat peut se retirer ; l'assistant est libéré sans avertissement.
- [ ] Le candidat ne peut pas annuler une demande en cours : il la retire d'abord à l'assistant.
- [ ] Chaque changement prévient en direct la file et les deux personnes concernées (canal Ably personnel) ; sans Ably, rafraîchissement toutes les 15 s.

#### Critères d'acceptation UX
- [ ] « Prendre » répond immédiatement (indication de chargement < 100 ms) et ouvre l'opération sans autre étape. [INT-04, PERF-05]
- [ ] Si la demande vient d'être prise par un autre : « Déjà prise par un autre assistant », et retour à la file mise à jour. [STATE-13, CONT-06]
- [ ] Le compte à rebours est visible, annoncé aux lecteurs d'écran à 5 min et à 1 min, et son issue est expliquée à l'avance. [A11Y-23, A11Y-13]
- [ ] Les identifiants sont masqués par défaut, affichés sur action, et copiables en un geste avec la confirmation « Copié ». [TRUST-18, INT-06]
- [ ] « Libérer » et « Me retirer » demandent une confirmation qui dit la conséquence (« La demande revient en tête de file »). [FLOW-19, CONT-10]
- [ ] Les deux parties voient la présence de l'autre et l'étape en cours. [COLLAB-05, FLOW-07]
- [ ] Recharger la page ou revenir plus tard retrouve l'opération exactement dans son état. [FLOW-10, IA-10]
- [ ] Prise refusée (suspendu, litige) : la raison est donnée, avec la marche à suivre. [STATE-19, FLOW-17]
- [ ] Tout est utilisable à 360 px et au clavier. [RESP-04, A11Y-02]

**Mesuré par :** `request_claimed`, `claim_timed_out`, `candidate_withdrew`. [MEAS-02, MEAS-06]

#### Composants shadcn
- `card` (opération), `input-group` + `button` (afficher / copier), `progress` (compte à rebours), `badge` (présence, étape), `alert`, `alert-dialog` (libérer, se retirer), `sonner`.

#### Hors périmètre
- Réservation et confirmation (EXM-008).
- Avertissement à l'assistant dont l'échéance passe, et refus de prise pendant un litige (EXM-010).
- Prise réservée aux assistants vérifiés (EXM-014).
- Augmenter le bonus après un retrait (EXM-008).
