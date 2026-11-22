### EXM-004 — Bénéficiaires et identifiants chiffrés

**Type :** feature · **Dépendances :** EXM-002 · **Taille :** M

#### Pourquoi
Saisir une seule fois les informations du compte du centre rend la publication instantanée le jour J. Le compte groupe permet d'aider ses camarades sans exposer leurs données sur WhatsApp.

#### Comportement

| Où | Après |
|---|---|
| Mes bénéficiaires | « Moi » créé par défaut ; jusqu'à 5 bénéficiaires ; ajout, modification, suppression |
| Fiche | Nom, email du compte du centre, identifiant et mot de passe du centre (masqués) |

#### Critères d'acceptation
- [ ] Mot de passe du centre chiffré en AES-256-GCM (`src/server/crypto.ts`, format versionné `v1:` pour la rotation de clé), jamais renvoyé au propriétaire : l'API indique seulement s'il est enregistré.
- [ ] Limite de 5 bénéficiaires vérifiée côté serveur.
- [ ] Un tiers ne peut être ajouté qu'avec l'attestation d'accord (horodatée).
- [ ] Suppression impossible si une demande du bénéficiaire est en cours — vérifiée en EXM-005, quand les demandes existent.
- [ ] « Moi » est créé automatiquement à partir du compte et ne peut pas être supprimé (index unique partiel en base).

#### Critères d'acceptation UX
- [ ] Le formulaire tient en un seul écran, avec 4 champs ; le nom et l'email sont pré-remplis pour « Moi ». [FORM-01, FORM-08, FLOW-03]
- [ ] Le mot de passe est masqué par défaut et peut être affiché ; une fois enregistré, il apparaît comme « •••• enregistré » avec « Remplacer ». [TRUST-18, FORM-16]
- [ ] Une note au moment de la saisie explique qui verra ces identifiants, quand, et quand ils seront effacés. [TRUST-11, TRUST-13]
- [ ] La case d'accord pour un tiers n'est pas pré-cochée et dit exactement ce qu'elle engage. [TRUST-01, CONT-14]
- [ ] À la limite de 5, le bouton d'ajout est désactivé et le message dit pourquoi. [INT-15, STATE-21]
- [ ] La suppression dit qui est supprimé et ce qui est perdu ; elle est bloquée avec la raison si une demande est en cours. [CONT-10, STATE-18]
- [ ] État vide : « Ajoutez un camarade pour réserver pour lui ». [STATE-02, CONT-08]
- [ ] Les noms longs ou composés s'affichent sans casser la mise en page. [STATE-14, I18N-17]
- [ ] Tout est faisable au clavier, avec des libellés lus par les lecteurs d'écran, à 360 px. [A11Y-02, A11Y-24, RESP-04]

#### Composants shadcn
- Liste : `item` (avatar, nom, actions), `badge` (« Moi »), `empty`.
- Ajout / modification : `dialog` (bureau) / `drawer` (téléphone), `field`, `input`, `input-group` (afficher le mot de passe), `checkbox` (accord), `alert` (qui voit quoi).
- Suppression : `alert-dialog`.

#### Hors périmètre
Publication (EXM-005).
