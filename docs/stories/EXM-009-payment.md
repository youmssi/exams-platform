### EXM-009 — Règlement : deux dépôts, confirmations et échéance

**Type :** feature · **Dépendances :** EXM-008 · **Taille :** M

#### Pourquoi
La plateforme ne touche pas l'argent, mais elle doit rendre le règlement évident et traçable, jusqu'à ce que chaque bénéficiaire ait confirmé avoir reçu son dû.

#### Comportement

| Où | Après |
|---|---|
| Candidat | Deux cartes : part assistant (compte de dépôt, montant, référence) et commission (compte plateforme) ; **J'ai envoyé** sur chacune |
| Assistant | **Reçu** / **Pas reçu** pour sa part |
| Admin | **Reçu** / **Pas reçu** pour la commission |

#### Critères d'acceptation
- [ ] Les montants viennent de `priceSnapshot` (jamais recalculés).
- [ ] Clôture seulement quand les deux dépôts sont confirmés ; « pas reçu » ⇒ retour « à payer » et notification au candidat.
- [ ] Inngest `payment-deadline` : rappels à H+1 et H+12 ; à 24 h (réglage de l'offre) sans clôture ⇒ liste noire + suspension.
- [ ] À la clôture : identifiants du bénéficiaire effacés ; historique conservé.
- [ ] Pour un groupe, chaque opération se règle séparément ; le titulaire voit un total à payer.

#### Critères d'acceptation UX
- [ ] Chaque carte affiche le montant en FCFA, le destinataire, la référence et l'échéance, avec la copie en un geste du numéro et de la référence. [CONT-20, COMM-10]
- [ ] L'état de chaque dépôt est lisible sans la couleur : « À envoyer », « Envoyé, en attente de confirmation », « Reçu ». [COMM-17, A11Y-16]
- [ ] « Pas reçu » dit au candidat quoi faire (vérifier le numéro, renvoyer) et ne l'accuse pas. [CONT-06, CONT-07]
- [ ] L'échéance des 24 h et sa conséquence sont annoncées dès l'ouverture du règlement, sans fausse urgence. [TRUST-06, A11Y-23]
- [ ] La clôture affiche un résumé (montants, dates) et le conseil de changer le mot de passe du centre. [FLOW-20, COMM-10]
- [ ] Les rappels mènent directement à la carte à payer. [NOTIF-10]
- [ ] Tout est utilisable à 360 px, avec les deux cartes empilées et l'action de chacune visible. [RESP-04, RESP-06]

**Mesuré par :** `payment_declared`, `payment_confirmed`, `payment_rejected`, `operation_closed`, `operation_unpaid`. [MEAS-02]

#### Composants shadcn
- `card` × 2, `item`, `input-group` + `button` (copier), `badge` (état), `alert-dialog` (pas reçu), `sonner`.

#### Hors périmètre
Paiement intégré (Mobile Money), séquestre.
