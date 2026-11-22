### EXM-022 — Report des demandes non réservées

**Type :** feature · **Dépendances :** EXM-005, EXM-008 · **Taille :** M

#### Pourquoi
Environ 140 places par date : beaucoup de demandes ne seront pas réservées. Le candidat ne doit pas tout ressaisir pour la session suivante.

#### Décisions produit
- À la publication, case « Si elle n'est pas réservée, la reporter automatiquement à la prochaine session », cochée par défaut.
- Sinon, bouton « Reporter à la prochaine session » en un geste.
- Le report garde bénéficiaire, modules et bonus ; le prix est celui du catalogue au moment du report.

#### Critères d'acceptation
- [ ] Une demande ouverte dont la session est passée devient « Non réservée ».
- [ ] Report automatique dès qu'une session plus tardive du même centre et niveau existe ; le candidat le voit dans l'app et peut annuler.
- [ ] Report manuel vers la prochaine session disponible, ou choix de la session s'il y en a plusieurs.
