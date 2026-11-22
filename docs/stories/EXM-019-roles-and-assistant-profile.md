### EXM-019 — Rôles visibles et profil assistant

**Type :** feature · **Dépendances :** EXM-002, EXM-007 · **Taille :** M

#### Pourquoi
- Passer de candidat à assistant était caché dans « Mon compte ».
- Rien n'indiquait ce qu'il faut renseigner avant d'agir dans chaque rôle.
- Un assistant n'avait aucun moyen de donner son téléphone ni son compte Mobile Money.
- Le site s'affichait en anglais quand le navigateur était en anglais.

#### Décisions produit
- Un compte, deux rôles : le même utilisateur peut être candidat et assistant. Chaque rôle a son menu, son accueil et ses droits, vérifiés côté serveur à chaque action.
- Profil candidat = le bénéficiaire « Moi », complet. Il est requis pour publier pour soi.
- Profil assistant = téléphone + compte Mobile Money (opérateur, numéro, nom du titulaire). Il est requis pour prendre une demande.
- La pièce d'identité et la validation par un administrateur viennent avec EXM-014.
- Les opérateurs Mobile Money sont un réglage du pays, modifiable dans le catalogue ; pour le Cameroun : MTN Mobile Money, Orange Money.
- Français par défaut ; l'anglais seulement sur choix explicite.

#### Critères d'acceptation
- [ ] Un sélecteur « Candidat | Assistant » est toujours visible en haut de l'app ; un geste change de rôle et ouvre l'accueil de ce rôle.
- [ ] L'accueil de chaque rôle montre la prochaine étape : compléter le profil du rôle, puis l'action principale (sessions ou file).
- [ ] « Mon compte » présente les deux profils avec leur statut (prêt, à compléter) et un accès direct pour les compléter.
- [ ] Prise refusée côté serveur sans profil assistant ; la file explique quoi compléter.
- [ ] Les opérateurs proposés sont ceux du pays ; le serveur refuse un opérateur inconnu.
- [ ] Le site s'ouvre en français quelle que soit la langue du navigateur.

#### Critères d'acceptation UX
- [ ] Le changement de rôle est visible sans ouvrir de menu. [IA-01, NAV-01]
- [ ] Chaque écran d'accueil a une seule action principale. [FLOW-02]
- [ ] Ce qui manque est dit avant que l'action soit refusée. [STATE-19, FLOW-17]

#### Composants shadcn
`toggle-group` (rôle), `item` + `badge` (profils), `empty` (accueil, file), `field` (formulaire), `responsive-dialog`.
