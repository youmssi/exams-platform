### EXM-003 — Catalogue et réglages économiques

**Type :** feature · **Dépendances :** EXM-002 · **Taille :** M

#### Pourquoi
Le prix standard est le cœur du produit. Il doit être fixé par l'admin, par centre et par niveau, et modifiable sans toucher au code. C'est aussi ce qui permet d'ajouter un pays ou un centre sans développement.

#### Comportement

| Où | Après |
|---|---|
| Admin › Catalogue | Pays, centres, niveaux (offres) ; pour chaque niveau : prix, commission (%) et minimum, pas et plafond du bonus, délais |
| Partout | Prix affiché avec sa répartition, calculée par une seule fonction |

#### Critères d'acceptation
- [ ] Modèles `Country`, `Center`, `Offer` ; données de départ : Cameroun, Goethe-Institut Yaoundé, B1, B2.
- [ ] `domain/pricing.ts` : `total = prix + bonus`, `commission = max(arrondi(total × taux), minimum)`, `assistant = total − commission`. Testé, y compris pour le minimum et les arrondis.
- [ ] Bonus valide seulement par multiples du pas et ≤ plafond.
- [ ] Modifier un réglage n'affecte pas les demandes déjà publiées (instantané du prix).
- [ ] Chaque modification est enregistrée dans le journal d'audit.
- [ ] `adminProcedure` : rôle admin **et** session ouverte avec mot de passe + application d'authentification (TOTP, décision produit). Un code par email ne compte pas comme second facteur. L'admin sans 2FA est guidé vers son activation depuis « Mon compte » (QR code, clé manuelle, codes de secours).

#### Critères d'acceptation UX
- [ ] Le prix affiche toujours la devise et ne montre pas de décimales en XAF (« 3 000 FCFA »). [CONT-20]
- [ ] L'admin voit un aperçu de la répartition (assistant / plateforme) pendant qu'il modifie le prix ou la commission. [COMM-13, ADMIN-10]
- [ ] Un changement de prix indique « s'applique aux nouvelles demandes uniquement » avant l'enregistrement. [ADMIN-10, STATE-18]
- [ ] Les champs refusent les valeurs impossibles avec un message à côté du champ. [FORM-10, FORM-09]
- [ ] Catalogue vide : un état explique comment créer le premier pays. [STATE-02, CONT-08]

#### Composants shadcn
- Liste admin : `data-table`, `badge`, `switch` (actif).
- Édition : `sheet`, `field`, `input-group` (suffixes « FCFA », « % », « min »).
- Aperçu de la répartition : `card` + `item`. Catalogue vide : `empty`.

#### Hors périmètre
Sessions d'examen (EXM-005), demandes d'ajout (EXM-005).
