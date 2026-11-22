### EXM-023 — Aide automatique pour les dates de session

**Type :** feature · **Dépendances :** EXM-005 · **Taille :** M

#### Pourquoi
Les dates paraissent sur le site officiel du centre ; les saisir à la main est lent et source d'erreurs.

#### Décisions produit
- La saisie manuelle par tous (candidats et assistants), confirmée par 3 personnes ou l'admin, reste la règle.
- Un job quotidien lit la page officielle des dates de chaque centre (lien du catalogue) et propose les nouvelles dates « à confirmer ».
- Si la page change de format, le job s'arrête proprement et signale l'erreur à l'admin ; le manuel suffit.

#### Critères d'acceptation
- [ ] Une session proposée par le job n'est jamais dupliquée et reste « à confirmer » jusqu'à validation.
- [ ] Les demandes en report automatique (EXM-022) rejoignent la nouvelle session une fois confirmée.
- [ ] Les conditions d'utilisation du site du centre sont vérifiées avant activation pour chaque centre.
