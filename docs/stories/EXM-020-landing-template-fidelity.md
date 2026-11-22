### EXM-020 — Landing fidèle au template Optimus

**Type :** feature · **Dépendances :** EXM-019 · **Taille :** M

#### Pourquoi
La première landing (EXM-019) reprenait l'esprit du template ; elle doit en reprendre le visuel section par section, avec un contenu exact sur Exams.

#### Décisions produit
- Identité du template (Instrument Serif / Sans, JetBrains Mono, palette blanc cassé) limitée à la landing ; l'app garde sa charte.
- Témoignages → FAQ ; métriques → règles de la plateforme en chiffres ; intégrations → Mobile Money. Aucun faux chiffre ni faux avis.
- Fonctions annoncées mais pas encore livrées : badge « Bientôt », retiré quand la story est livrée.
- Animations du template + React Bits : Blur Text sur le titre du hero (EXM-019), Shiny Text, Spotlight Card.

#### Critères d'acceptation
- [ ] Module `src/modules/landing-page`, une section par fichier, dans l'ordre et la mise en page du template.
- [ ] Centres, niveaux, prix (part assistant / plateforme, plafond du bonus) et délais viennent du catalogue, mis en cache et expirés par les modifications de l'admin ; lus à la requête, jamais au build.
- [ ] Un utilisateur connecté voit « Continuer » au lieu de « Commencer ».
- [ ] Animations en pause hors écran, image fixe si l'utilisateur préfère réduire les animations.
- [ ] Aucun débordement horizontal à 360 px et sur grand écran ; aucune erreur console.

#### Critères d'acceptation UX
- [ ] Une action principale par vue ; titre, proposition de valeur et CTA avant le reste. [LAY-01, LAY-02, LAY-14]
- [ ] Aucune preuve sociale inventée ; tarifs issus du catalogue. [COMM-01, TRUST-07, CONT-16]
- [ ] Mouvement réduit respecté. [A11Y-15, PERF-05]
