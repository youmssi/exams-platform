### EXM-014 — Vérification des assistants

**Type :** feature · **Dépendances :** EXM-002 · **Taille :** M · **À livrer avant :** EXM-007

#### Pourquoi
L'assistant reste anonyme pour le candidat, mais la plateforme doit pouvoir l'identifier en cas de litige (décision produit : pièce d'identité + numéro Mobile Money, validés par l'admin avant la première prise).

#### Comportement

| Où | Après |
|---|---|
| Mon compte › Devenir assistant | Numéro Mobile Money + photo de la pièce d'identité → « en attente de vérification » |
| File (EXM-006) | Visible, mais « Prendre » est désactivé tant que le compte n'est pas vérifié |
| Admin (EXM-012) | Liste des assistants à vérifier : valider, ou refuser avec un motif |

#### Décisions d'implémentation
- Pièce sur Vercel Blob privé (comme les preuves, EXM-010) : l'assistant n'écrit que son dossier `identity/<son id>/`, seuls les admins relisent.
- `assistantProcedure` reste « rôle assistant actif » : un assistant non vérifié voit la file (critère UX) ; la vérification est exigée au moment de prendre (`notVerified`), avec la raison affichée au-dessus de la file.
- Les profils existants passent « à envoyer » : chaque assistant envoie sa pièce une fois, l'admin la valide dans « Admin › Assistants ».
- Validation ou refus notifiés à l'assistant (dans l'app, et par email s'il garde les emails de suivi).

#### Critères d'acceptation
- [ ] Modèle `AssistantProfile` (utilisateur, numéro Mobile Money, clé de la pièce sur R2, statut `PENDING | VERIFIED | REJECTED`, motif, dates).
- [ ] Envoi de la pièce par URL signée R2 (bucket privé, images seulement, 5 Mo max), lisible uniquement par l'admin.
- [ ] `assistantProcedure` : rôle actif assistant **et** statut `VERIFIED`.
- [ ] Un refus indique le motif et permet un nouvel envoi.

#### Décisions d'implémentation
- Pièce sur Vercel Blob privé (comme les preuves, EXM-010) : l'assistant n'écrit que son dossier `identity/<son id>/`, seuls les admins relisent.
- `assistantProcedure` reste « rôle assistant actif » : un assistant non vérifié voit la file (critère UX) ; la vérification est exigée au moment de prendre (`notVerified`), avec la raison affichée au-dessus de la file.
- Les profils existants passent « à envoyer » : chaque assistant envoie sa pièce une fois, l'admin la valide dans « Admin › Assistants ».
- Validation ou refus notifiés à l'assistant (dans l'app, et par email s'il garde les emails de suivi).

#### Critères d'acceptation UX
- [ ] L'assistant voit son statut, ce qui est vérifié, pourquoi, et le délai habituel. [TRUST-19, TRUST-11]
- [ ] « Prendre » est désactivé avec la raison tant que le compte n'est pas vérifié. [INT-15, STATE-19]
- [ ] L'envoi de la pièce indique le format, la taille et la progression, et permet de réessayer. [FORM-19, INT-05]
- [ ] Le numéro accepte les formats courants (espaces, indicatif +237). [FORM-07, I18N-17]
- [ ] Un refus dit quoi corriger, sans culpabiliser. [CONT-06, CONT-07]

#### Composants shadcn
- `card`, `field`, `input`, `attachment` (pièce d'identité), `badge` (statut), `alert`.

#### Hors périmètre
Écran admin de validation (EXM-012).
