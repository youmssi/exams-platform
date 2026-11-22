### EXM-006 — File publique en temps réel et présence

**Type :** feature · **Dépendances :** EXM-005 · **Taille :** M

#### Pourquoi
C'est la réponse au problème n° 2 : une demande prise doit disparaître pour tout le monde, à l'instant même, pour qu'aucun assistant ne gaspille sa session.

#### Comportement

| Où | Après |
|---|---|
| File (assistant) | Demandes publiées par session, anonymisées, triées par bonus puis ancienneté, avec la présence du candidat |
| Partout | Indicateur en ligne / hors ligne pendant une opération |

#### Critères d'acceptation
- [ ] Canaux Ably préfixés par environnement (`<env>:queue`, `<env>:presence`), avec des jetons courts à capacités limitées émis par le serveur : le candidat annonce sa présence, l'assistant écoute. Le candidat est identifié par une clé opaque (HMAC), jamais par son identifiant.
- [ ] Une demande prise ou annulée disparaît en moins d'une seconde chez tous les assistants connectés.
- [ ] Sans connexion temps réel, la file se rafraîchit au retour sur l'onglet et toutes les 15 s.
- [ ] La file n'est visible qu'en rôle assistant (vérifié côté serveur) et n'affiche jamais les demandes de l'assistant lui-même.

#### Critères d'acceptation UX
- [ ] Chaque ligne répond à « vaut-elle la peine, et puis-je la prendre ? » : niveau, module, montant pour l'assistant, bonus, ancienneté, présence. [DATA-01, DATA-02]
- [ ] Les arrivées et départs en temps réel ne déplacent pas la ligne que l'assistant est en train de toucher ; les nouvelles demandes s'annoncent par « N nouvelles demandes ». [DATA-25, A11Y-13]
- [ ] La présence est indiquée par un texte (« en ligne ») en plus de la couleur. [A11Y-16, COLLAB-05]
- [ ] File vide : « Aucune demande pour cette session pour l'instant », avec la mise à jour automatique indiquée. [STATE-02, DATA-18]
- [ ] Connexion perdue : bandeau « Hors ligne — la file n'est plus à jour » et reprise automatique. [STATE-11, STATE-22]
- [ ] Assistant occupé : la file est remplacée par « Terminez votre opération en cours », avec un lien vers elle. [STATE-19, FLOW-17]
- [ ] Le chargement a la forme des lignes (squelettes), sans saut de mise en page. [STATE-04]
- [ ] La liste est lisible et utilisable à 360 px, sans tableau horizontal. [RESP-15]

**Mesuré par :** `queue_viewed`, délai publication → prise. [MEAS-02]

#### Composants shadcn
- `tabs` (sessions), `item` (demandes), `badge` (bonus, présence, liste noire), `empty`, `skeleton`, `alert` (hors ligne), `button`.

#### Hors périmètre
- Prise, et file masquée pendant une opération active (EXM-007).
- Comptes en liste noire marqués et non prenables (EXM-010).
- Signal temps réel quand une demande programmée devient visible : la file se rafraîchit toutes les 60 s en direct (15 s sans connexion temps réel) ; un événement Inngest viendra avec EXM-007.
