### EXM-001 — Mise en place du projet

**Type :** chore · **Dépendances :** aucune · **Taille :** M

#### Pourquoi
Toutes les stories suivantes ont besoin d'une base commune : stack, architecture modulaire, langues, conventions et vérifications automatiques.

#### Comportement

| Où | Après |
|---|---|
| `/` et `/en` | Page d'accueil minimale traduite, avec une action principale |
| `/api/trpc/system.health` | Répond `{ status: "ok" }` |
| CI | Lint, types, tests et build sur chaque PR |

#### Critères d'acceptation
- [ ] Next.js 16, TypeScript strict, Tailwind v4, shadcn sur Base UI, Biome.
- [ ] next-intl : français par défaut sans préfixe, anglais sous `/en`.
- [ ] tRPC + TanStack Query branchés, avec préchargement côté serveur.
- [ ] Structure `src/modules/*` ; Biome refuse un import interne d'un autre module.
- [ ] `AGENTS.md`, `docs/` (spec, architecture, exigences UX, carte des composants, stories), modèle de PR, CI, `.mcp.json`, skill ux-expert.
- [ ] Aucun code mort : seules les dépendances et les composants utilisés sont installés.
- [ ] `npm run check` et `npm run build` passent.

#### Critères d'acceptation UX
- [ ] La page d'accueil a un seul titre, une phrase de valeur et une seule action principale. [LAY-01, CONT-16]
- [ ] `<html lang>` suit la langue de l'URL. [I18N-18]
- [ ] Le thème clair et le thème sombre n'utilisent que les tokens du thème. [DS-01, COL-01]
- [ ] Le contenu reste lisible et sans défilement horizontal à 320 px. [RESP-04]
- [ ] Le bouton principal fait au moins 24×24 px et a un focus visible. [A11Y-20, A11Y-02]

#### Composants shadcn
- Accueil : `button`. Providers : `sonner`.
- Rien d'autre n'est installé : chaque story ajoute ses composants (`npx shadcn@latest add …`).

#### Hors périmètre
Auth (EXM-002), landing page marketing.
