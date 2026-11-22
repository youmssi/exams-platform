### EXM-019 — Landing page marketing

**Type :** feature · **Dépendances :** EXM-001, EXM-003 · **Taille :** M

#### Pourquoi

La page d’accueil actuelle est une page minimale. Une landing publique doit expliquer la mise en relation candidat-assistant, rassurer sur le prix standard et la protection des données, puis guider vers l’inscription sans inventer de preuve sociale.

#### Comportement

| Section | Après |
|---|---|
| Navigation | Accès aux sections de la landing, connexion et action principale adaptées à la session |
| Hero | Proposition de valeur claire, illustration du parcours et CTA principal |
| Bénéfices et fonctionnement | Parcours type candidat-assistant en trois étapes, sans témoignages fictifs ni indicateurs inventés |
| Confiance | Présentation exacte du prix standard, des confirmations et de la confidentialité, sans promesse non implémentée |
| Prix | Tarifs issus des offres actives du catalogue; état vide explicite si aucune offre n’est active |
| CTA et pied de page | Accès à l’inscription, aux conditions et à la confidentialité |

La composition, la hiérarchie et le rythme visuel reprennent le template Optimus partagé; seul le contenu SaaS est remplacé par des informations exactes sur Exams. Tous les textes visibles existent en français et en anglais.

L’animation React Bits **Blur Text** est réservée au titre du hero. Elle ne doit pas retarder l’affichage du titre, gêner la lecture ou s’exécuter si l’utilisateur préfère réduire les animations. Les autres sections restent sobres afin de préserver le chargement et la lisibilité.

#### Critères d’acceptation

- [ ] Le parcours candidat-assistant, les bénéfices, la sécurité, les prix et les CTA sont cohérents avec `docs/product/spec.md`; aucune donnée, preuve sociale ou promesse n’est inventée.
- [ ] La navigation distingue une seule action principale par vue; le hero présente le titre, la proposition de valeur et le CTA avant les contenus secondaires. [LAY-01, LAY-02, LAY-14]
- [ ] Le parcours illustré remplace les témoignages non vérifiés. Les tarifs affichés proviennent uniquement du catalogue actif et respectent les montants configurés. [COMM-01, TRUST-07, CONT-16]
- [ ] La structure et le rythme visuel suivent le template Optimus fourni, adaptés au produit et sans reprendre ses marques, chiffres ou affirmations SaaS.
- [ ] Le titre animé reste accessible au clavier et aux technologies d’assistance, a un état initial lisible et respecte `prefers-reduced-motion`. [A11Y-02, A11Y-04, A11Y-15, PERF-05]
- [ ] Aucun débordement horizontal; contenu et CTA restent hiérarchisés à 360 px et sur grand écran. Les cibles tactiles sont suffisamment espacées. [RESP-02, RESP-04, RESP-07]
- [ ] Les couleurs utilisent les tokens du thème; les contrastes du texte et des contrôles sont conformes. [DS-01, COL-01, A11Y-15]
- [ ] Le français et l’anglais sont complets et la page conserve les routes publiques/localisées existantes. [I18N-07, I18N-18]

#### Composants shadcn

- Navigation : liens sémantiques dans `nav`; `button` pour l’action.
- Hero : `button`, `badge`, `card` pour l’illustration du parcours.
- Bénéfices : `card`.
- Parcours : `card`, `alert`.
- Prix : `card`, `badge`, `separator`, `button`.
- Confiance : `card`.
- Prix : `card`, `badge`, `separator`, `button`.
- Pied de page : liens sémantiques.

Les composants viennent du registre Base UI déjà installé; composer les primitives plutôt que créer des cartes ou badges maison.

#### Référence d’animation

- [React Bits — Blur Text](https://reactbits.dev/text-animations/blur-text), composant gratuit, déclenché une fois à l’apparition du hero. Charger l’animation au niveau client minimal; conserver le titre statique lisible si le mouvement est réduit ou indisponible.

#### Vérifications

- [ ] `npm run check` passe.
- [ ] `npm run build` passe.
- [ ] Captures et contrôle navigateur à 360 px et bureau; aucun débordement ni contenu masqué.
- [ ] Revue UX du diff : aucun P0, P1 traités ou suivis.

#### Hors périmètre

- Authentification, opérations, paiements, intégration d’avis ou preuve sociale réelle.
