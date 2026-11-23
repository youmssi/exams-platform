### EXM-010 — Confiance : litiges, avertissements, liste noire, signalements

**Type :** feature · **Dépendances :** EXM-008, EXM-009 · **Taille :** L

#### Pourquoi
Sans conséquences, la mise en relation reproduit les abus actuels. Il faut des règles connues de tous, appliquées automatiquement et arbitrées par un humain seulement en cas de litige.

#### Comportement

| Où | Après |
|---|---|
| Litige (candidat) | Ouvert depuis EXM-008 ; statut et décision visibles |
| Litige (assistant) | Preuve demandée (capture) avec un délai ; envoi sur R2 |
| Liste noire | Visible des assistants, sans données sensibles |
| Signaler | Sur une session, une demande ou un utilisateur : catégorie + message |
| Mon compte | Avertissements reçus, avec leur raison |

#### Décisions d'implémentation
- Fichiers : Vercel Blob en accès **privé** au lieu de R2 (relié au projet, sans clé à manipuler). Envoi direct depuis le navigateur avec progression ; `/api/files` délivre le jeton d'envoi seulement à l'assistant du litige et relit l'image pour l'admin et les deux parties.
- Délais (preuve, prise, règlement) vérifiés à la lecture, comme ailleurs. Preuve non envoyée à temps ⇒ le litige passe « en examen ».
- Liste noire **dérivée** des règlements impayés (pas de table à synchroniser) : levée dès le règlement confirmé. Identifiant public `U-XXXXXX`, niveau, date.
- Suspension posée au 3e avertissement actif ; l'admin la lève, les avertissements en cours cessent alors de compter.
- L'écran de décision des litiges est livré ici (fiche unique : chronologie, preuve, parties) pour ne laisser aucun service sans écran ; le reste du back-office reste en EXM-012.
- Règles chiffrées dans `src/config/trust.ts`.

#### Critères d'acceptation
- [ ] Modèles `Dispute`, `Strike`, `Blacklist`, `Report` ; règles de sanction dans `trust/domain` (spec §9), testées.
- [ ] 3 avertissements ⇒ suspension automatique (levée par l'admin) ; un litige ouvert bloque les prises de l'assistant.
- [ ] Preuve : envoi par URL signée R2 (bucket privé, 5 Mo max, images seulement), lecture réservée à l'admin et aux parties.
- [ ] Décision admin ⇒ opération « à payer » ou « annulée », plus les sanctions prévues ; les deux parties sont notifiées.
- [ ] Levée de la liste noire au règlement confirmé.

#### Critères d'acceptation UX
- [ ] Chaque sanction dit sa raison, l'opération concernée et comment la lever ou la contester. [TRUST-19, CONT-06]
- [ ] Le compteur d'avertissements est visible dans « Mon compte » avant la suspension (« 2 sur 3 »). [ADMIN-16, TRUST-19]
- [ ] L'envoi de la preuve indique le format, la taille et la progression, et permet de réessayer en cas d'échec. [FORM-19, INT-05, STATE-08]
- [ ] La liste noire ne montre aucune donnée personnelle : identifiant public, niveau, date seulement. [TRUST-13, TRUST-18]
- [ ] Signaler prend au plus 2 choix et 1 message facultatif, puis confirme la réception et la suite. [FORM-01, CONT-09]
- [ ] Le statut du litige suit des étapes nommées (ouvert → preuve demandée → en examen → décidé). [FLOW-07, COMM-17]

**Mesuré par :** `dispute_opened`, `dispute_decided` (issue), `strike_issued`, `report_sent`. [MEAS-02]

#### Composants shadcn
- `attachment` (preuve), `textarea`, `badge` (statut), `item` (liste noire, avertissements), `dialog` + `radio-group` (signaler), `alert`.

#### Hors périmètre
Écran de décision admin (EXM-012).
