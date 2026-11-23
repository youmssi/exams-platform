### EXM-022 — Report des demandes non réservées

**Type :** feature · **Dépendances :** EXM-005, EXM-008 · **Taille :** M

#### Pourquoi
Environ 140 places par date : beaucoup de demandes ne seront pas réservées. Le candidat ne doit pas tout ressaisir pour la session suivante.

#### Décisions produit
- À la publication, case « Si elle n'est pas réservée, la reporter automatiquement à la prochaine session », cochée par défaut.
- Sinon, bouton « Reporter à la prochaine session » en un geste.
- Le report garde bénéficiaire, modules et bonus ; le prix est celui du catalogue au moment du report.

#### Décisions d'implémentation
- Une session est passée le lendemain de sa date d'examen. Vérifié à la lecture de « Mes demandes » et par la tâche quotidienne (EXM-023).
- Report automatique seulement vers une session **confirmée** ; le bonus est gardé, ramené au plus haut bonus permis par l'offre si ses règles ont changé.
- Le report manuel s'applique aux demandes « Non réservées » : un geste s'il n'y a qu'une session, un choix sinon.
- La nouvelle demande garde le lien vers l'ancienne (« Reportée ») et peut être annulée comme toute demande ouverte.

#### Critères d'acceptation
- [ ] Une demande ouverte dont la session est passée devient « Non réservée ».
- [ ] Report automatique dès qu'une session plus tardive du même centre et niveau existe ; le candidat le voit dans l'app et peut annuler.
- [ ] Report manuel vers la prochaine session disponible, ou choix de la session s'il y en a plusieurs.
