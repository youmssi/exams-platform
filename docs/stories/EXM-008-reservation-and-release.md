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
- [ ] Libération de l'assistant après 15 min si le candidat est en ligne au moment de la réservation, 5 min sinon (réglages de l'offre, présence lue côté serveur) ; échéance stockée et appliquée à la lecture, comme pour la prise (décision EXM-007). L'opération reste « à confirmer » pour le candidat.
- [ ] La demande quitte définitivement la file dès la réservation déclarée.
- [ ] **Identifiants refusés** (assistant) : l'opération se termine sans pénalité, la demande est suspendue (« Identifiants à corriger ») et repart dans la file dès que le mot de passe du bénéficiaire est mis à jour.
- [ ] **J'ai été inscrit autrement** (candidat) : clôt une demande sans opération en cours.
- [ ] **Téléphone masqué** : l'assistant l'affiche sur action, chaque lecture est journalisée (comme le mot de passe).
- [ ] **Frais du centre** : délai de paiement réglable par offre (jours, 0 = non affiché) ; après confirmation, échéance et compte à rebours dans l'app uniquement, sans email.
- [ ] À la confirmation : assistant libéré, opération « à payer », minuteur de paiement démarré (EXM-009).
- [ ] « Je n'ai pas reçu le mail » n'ouvre le litige qu'avec les 5 cases cochées (spec §6.4) ; litige créé en EXM-010.
- [ ] Le candidat revenu plus tard retrouve l'opération « à confirmer » et peut confirmer ou contester.

#### Critères d'acceptation UX
- [ ] Le candidat voit en premier l'adresse email exacte à vérifier, puis les deux choix. [FLOW-05, CONT-16]
- [ ] « Je n'ai pas reçu le mail » ouvre une liste de vérification (boîte de réception de l'adresse soumise, spams, onglets, compte du centre, avertissement) ; le bouton reste désactivé jusqu'à ce que tout soit coché, et la raison est affichée. [FLOW-19, TRUST-14, INT-15]
- [ ] L'avertissement sur le litige abusif est factuel, sans culpabiliser. [TRUST-05, CONT-07]
- [ ] Le rappel des frais du centre indique l'échéance avec son fuseau horaire. [I18N-13, CONT-20]
- [ ] L'assistant voit le délai restant avant sa libération automatique, puis un message clair une fois libéré : « Vous pouvez prendre une nouvelle demande ». [A11Y-23, FLOW-20]
- [ ] L'accessibilité du dialogue est complète : focus piégé, retour du focus, Échap. [INT-11, A11Y-06]

**Mesuré par :** `reservation_declared`, `mail_confirmed`, `auto_released`. [MEAS-02]

#### Composants shadcn
- `card`, `button`, `progress` (délai), `alert` (frais du centre).
- Liste de vérification : `alert-dialog` + `FieldSet` + `checkbox`.

#### Hors périmètre
- Paiement (EXM-009) et traitement du litige (EXM-010) : « Je n'ai pas reçu le mail » marque l'opération « contestée » pour l'admin.
- Capture de confirmation : avec le stockage de fichiers (EXM-014).
