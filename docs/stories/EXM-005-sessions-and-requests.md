### EXM-005 — Sessions et publication des demandes

**Type :** feature · **Dépendances :** EXM-003, EXM-004 · **Taille :** L

#### Pourquoi
Le jour J, tout se joue en minutes. Le candidat doit avoir préparé sa demande à l'avance, pour qu'elle parte d'elle-même à l'ouverture des inscriptions, sans qu'il ressaisisse rien.

#### Comportement

| Où | Après |
|---|---|
| Sessions | Liste par centre et niveau ; « Créer une session » si elle manque ; « Confirmer » / « Signaler » |
| Publier | Bénéficiaire(s) → récapitulatif (total, répartition, bonus) → **Publier** (ou **Programmer** avant l'ouverture) |
| Mes demandes | Une ligne par bénéficiaire avec son statut |
| Demander un ajout | Nouveau centre, niveau ou pays : ce qui manque, lien officiel, date |

#### Critères d'acceptation
- [ ] Création de session par tout utilisateur vérifié ; doublon (offre + date) refusé avec un lien vers la session existante.
- [ ] Statut « non vérifiée » → « confirmée » après 3 confirmations distinctes ou validation admin.
- [ ] Une seule demande active par bénéficiaire et par session.
- [ ] Prix figé à la publication (`priceSnapshot`) ; bonus validé par `catalog/domain`.
- [ ] Avant `registrationOpensAt` : brouillon, publié automatiquement par une tâche Inngest.
- [ ] Publication groupée : N bénéficiaires ⇒ N demandes, dans une seule transaction.
- [ ] Annulation possible tant que la demande n'est pas prise.

#### Critères d'acceptation UX
- [ ] Publier prend au plus 4 étapes et ne redemande aucune information déjà enregistrée. [FLOW-02, FORM-22]
- [ ] Le total et sa répartition sont visibles avant le bouton « Publier », en FCFA. [COMM-01, TRUST-07, CONT-20]
- [ ] Le bonus est replié par défaut, avec des paliers prédéfinis jusqu'au plafond (pas de saisie libre). [FLOW-05, FORM-08]
- [ ] Le bouton dit le résultat : « Publier 3 demandes — 9 000 FCFA » ou « Programmer pour le 12 mars à 09:00 (heure de Douala) ». [FORM-14, I18N-13]
- [ ] Une session non vérifiée est signalée par un badge avec une explication, sans bloquer l'utilisateur. [TRUST-19, CONT-11]
- [ ] Doublon détecté : le message propose « Rejoindre cette session » en un clic. [STATE-08, FLOW-15]
- [ ] Après publication : confirmation précise (« 3 demandes publiées ») et lien vers le suivi. [CONT-09, FLOW-20]
- [ ] Aucune session : état vide avec « Créer la session » et « Demander un nouveau centre ». [STATE-02, STATE-03]
- [ ] Les dates sont choisies dans un calendrier, sans format à deviner. [FORM-20]
- [ ] La publication groupée montre sa progression et dit précisément ce qui a échoué en cas d'échec. [INT-05, STATE-09]
- [ ] Tout est utilisable à 360 px, avec l'action principale en bas à portée de pouce. [RESP-04, RESP-06]

**Mesuré par :** `request_published` (groupe, bonus), `session_created`. [MEAS-02]

#### Composants shadcn
- Sessions : `combobox` (centre/niveau), `item`, `badge`, `empty`, `skeleton`.
- Créer une session : `dialog`/`drawer`, `select`, `date-picker`, `field`.
- Publier : `checkbox` (bénéficiaires), `card` (récapitulatif), `collapsible` + `toggle-group` (bonus), `button`, `progress`.
- Demander un ajout, signaler : `dialog`, `radio-group`, `textarea`.

#### Hors périmètre
File publique et prise (EXM-006, EXM-007).
