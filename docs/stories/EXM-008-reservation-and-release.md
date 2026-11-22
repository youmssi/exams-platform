### EXM-008 — Réservation, confirmation du mail et libération

**Type :** feature · **Dépendances :** EXM-007 · **Taille :** M

#### Pourquoi
Le mail du centre est la seule preuve impossible à falsifier pour l'assistant. Mais attendre le candidat ne doit jamais bloquer l'assistant.

#### Comportement

| Où | Après |
|---|---|
| Assistant | **Réservation effectuée** (capture facultative) → « En attente de confirmation » → libéré |
| Candidat | **J'ai reçu le mail** / **Je n'ai pas reçu le mail** ; rappel de payer les frais au centre dans le délai officiel |

#### Critères d'acceptation
- [ ] Inngest `release-assistant` : 15 min si le candidat est en ligne, 5 min s'il est hors ligne (réglages de l'offre) ; à l'expiration, l'assistant est libéré et l'opération passe « à confirmer ».
- [ ] À la confirmation : assistant libéré, opération « à payer », minuteur de paiement démarré (EXM-009).
- [ ] « Je n'ai pas reçu le mail » n'ouvre le litige qu'avec les 5 cases cochées (spec §6.4) ; litige créé en EXM-010.
- [ ] Le candidat revenu plus tard retrouve l'opération « à confirmer » et peut confirmer ou contester.

#### Critères d'acceptation UX
- [ ] Le candidat voit en premier l'adresse email exacte à vérifier, puis les deux choix. [FLOW-05, CONT-16]
- [ ] « Je n'ai pas reçu le mail » ouvre une liste de vérification (boîte de réception de l'adresse soumise, spams, onglets, compte du centre, avertissement) ; le bouton reste désactivé jusqu'à ce que tout soit coché, et la raison est affichée. [FLOW-19, TRUST-14, INT-15]
- [ ] L'avertissement sur le litige abusif est factuel, sans culpabiliser. [TRUST-05, CONT-07]
- [ ] Le rappel des frais du centre indique l'échéance avec son fuseau horaire. [I18N-13, CONT-20]
- [ ] L'assistant voit le délai restant avant sa libération automatique, puis un message clair une fois libéré : « Vous pouvez prendre une nouvelle demande ». [A11Y-23, FLOW-20]
- [ ] La capture facultative accepte le collage ou le dépôt d'une image, avec le format et la taille indiqués. [FORM-19]
- [ ] L'accessibilité du dialogue est complète : focus piégé, retour du focus, Échap. [INT-11, A11Y-06]

**Mesuré par :** `reservation_declared`, `mail_confirmed`, `auto_released`. [MEAS-02]

#### Composants shadcn
- `card`, `button`, `progress` (délai), `attachment` (capture), `alert` (frais du centre).
- Liste de vérification : `alert-dialog` + `FieldSet` + `checkbox`.

#### Hors périmètre
Paiement (EXM-009), traitement du litige (EXM-010).
