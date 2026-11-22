### EXM-015 — Identité visuelle, aperçu de partage et mesure d'audience

**Type :** feature · **Dépendances :** EXM-002 · **Taille :** S

#### Pourquoi
Un lien partagé sur WhatsApp doit inspirer confiance au premier coup d'œil, et on doit savoir où les candidats décrochent dans les parcours.

#### Comportement

| Où | Après |
|---|---|
| Onglet du navigateur, écran d'accueil iOS | Logo Exams (favicon SVG, icône Apple 180 px) |
| Lien partagé | Image 1200 × 630 en fr ou en, titre et description |
| App | Logo dans la barre latérale, l'écran de connexion et l'accueil |
| Production | Umami compte les visites et les événements des parcours |

#### Critères d'acceptation
- [ ] Logo original, sur la palette `neutral` de shadcn : cadre ouvert (clin d'œil au cadre du logo du Goethe-Institut, sans le reprendre) autour d'une coche « réservé ». Il ne reprend ni le nom ni la marque d'un centre.
- [ ] Une seule source du tracé (`src/components/brand/mark.ts`) ; un test garantit que `src/app/icon.svg` est identique.
- [ ] Image Open Graph générée (`opengraph-image`, Geist embarquée) et balises `twitter:card` en `summary_large_image`.
- [ ] Umami chargé uniquement si `NEXT_PUBLIC_UMAMI_*` sont définies (production), limité au domaine de production.
- [ ] `track()` typé, seul point d'envoi des événements ; aucune donnée personnelle.

#### Critères d'acceptation UX
- [ ] Le logo suit le thème clair et le thème sombre (tokens `primary`). [DS-01, COL-01]
- [ ] L'image de partage reste lisible en vignette : titre ≥ 60 px, contraste du texte secondaire ≥ 4.5:1. [A11Y-15]
- [ ] Le logo de l'écran de connexion ramène à l'accueil et porte un nom accessible. [IA-07, A11Y-24]
- [ ] Les événements suivent une convention unique (`<objet>_<verbe au passé>`). [MEAS-04, MEAS-02]

#### Composants shadcn
- Aucun nouveau composant : le logo est un SVG.

#### Hors périmètre
Landing page marketing.
