# AGENTS.md

Règles du dépôt pour toute personne ou tout agent qui y travaille. À lire avant chaque story.

## Le produit en une phrase

Une plateforme qui met en relation des **candidats** qui veulent une place d'examen (ex. Goethe B1) et des **assistants** qui ont ouvert une session sur le site officiel, à **prix standard**, avec suivi en temps réel et règlement confirmé des deux côtés. Spécification complète : [`docs/product/spec.md`](docs/product/spec.md).

## Stack

Next.js 16 (App Router, Cache Components, React Compiler) · React 19 · TypeScript strict · Tailwind v4 · shadcn sur **Base UI** · TanStack Form · TanStack Query · tRPC 11 · zod 4 · nuqs · next-intl (fr, en) · Prisma sur **Neon** · Better Auth · Inngest · Ably · Cloudflare R2 · Resend · Sentry · Vitest · Playwright · Biome. Détails et raisons : [`docs/architecture.md`](docs/architecture.md).

## Architecture : monolithe modulaire

- Le code métier vit dans `src/modules/<module>/`. Chaque module expose **uniquement** deux points d'entrée : `index.ts` (API serveur, utilisable par les pages) et, si besoin, `client.ts` (ce que les composants client peuvent importer).
- Hors d'un module, on importe `@/modules/<module>` ou `@/modules/<module>/client`, jamais un fichier interne. Biome bloque les imports internes (`noRestrictedImports`).
- Dans un module, on utilise des imports relatifs.
- Les règles métier pures vont dans `domain/` et sont testées avec Vitest. Elles ne dépendent ni de Prisma, ni de Next, ni de React.
- Aucune valeur métier en dur (prix, délais, commission, plafond) : elles viennent du catalogue (`Centre × Niveau`) ou de la configuration.
- Montants en entiers dans l'unité de la devise (XAF : 3000 = 3 000 FCFA).
- Tout texte visible passe par next-intl (`src/messages/fr.json`, `en.json`). Aucun texte en dur dans les composants.

Structure d'un module :

```
src/modules/<module>/
  index.ts          API publique serveur (router, gardes, composants pour les pages)
  client.ts         API publique client (optionnelle)
  domain/           règles pures + tests (*.test.ts)
  server/           router.ts (tRPC), service.ts, repository.ts
  ui/               composants React du module
  hooks/            hooks client (TanStack Query)
  schemas.ts        schémas zod partagés client/serveur
  params.ts         paramètres d'URL (nuqs)
```

## Workflow Git

| Branche | Rôle |
|---|---|
| `main` | Production. On n'y fusionne que `develop`, à la fin d'une release. |
| `develop` | Intégration. Chaque story y est fusionnée une fois terminée. |
| `exm-<code>-<titre>` | Une branche par story, ex. `exm-001-project-setup`. |

1. Avant de créer une branche : `git checkout develop && git pull origin develop`.
2. `git checkout -b exm-<code>-<titre-en-kebab-case>`.
3. Commits au format `EXM-<code>: <description courte en minuscules>`, ex. `EXM-003: add exam catalog pricing`.
4. Avant de fusionner : `npm run check` et `npm run build` passent.
5. Ouvrir une PR vers `develop` avec le modèle `.github/pull_request_template.md`.
6. Quand toutes les stories d'une release sont dans `develop`, fusionner `develop` dans `main`.

**Aucune mention d'IA (règle critique)** : pas de `Co-Authored-By`, pas de `Generated with`, pas de lien de session, pas de « assisté par », dans le code, les commits, les PR, les commentaires ou la documentation. L'auteur des commits est le propriétaire du dépôt (identité Git configurée localement). Les messages de commit sont propres : une ligne `EXM-<code>: <description>`, et un corps seulement s'il apporte une explication utile.

## Composants d'interface (règle critique)

- **shadcn d'abord, toujours.** Avant de créer quoi que ce soit, consulter [`docs/ui/component-map.md`](docs/ui/component-map.md) (inventaire complet du registre Base UI, blocks et exemples) et la doc du composant. Le dépôt shadcn de référence se lit dans `apps/v4/registry/bases/base` et `apps/v4/content/docs`.
- Chaque story liste, **avant le développement**, les composants shadcn qu'elle utilise pour chaque écran.
- Aucun composant maison s'il existe un composant ou une composition shadcn. Exception : uniquement si rien ne couvre le besoin, justifiée dans la PR.
- On compose sans forker : `src/components/ui/*` n'est modifié que pour une variante utile partout (via `cva`), une seule fois.
- Un composant, un usage : `alert-dialog` pour confirmer, `dialog`/`drawer` pour une tâche, `sheet` pour un détail, `item` pour les listes côté utilisateur, `data-table` pour les listes admin, `sonner` pour les toasts.
- Formulaires : TanStack Form + `Field` shadcn, câblés une seule fois dans `src/shared/form` (`createFormHook`).

## Principes d'ingénierie

Niveau attendu : celui d'un architecte, d'un ingénieur front-end et d'un ingénieur back-end seniors.

- **DRY** : une règle, un calcul, un texte ou un schéma existe à un seul endroit (prix dans `catalog/domain`, transitions dans `operations/domain`, schémas zod partagés client/serveur).
- **Centraliser** la logique transverse (auth, erreurs, formulaires, formatage, accès aux données) plutôt que la recopier.
- **Simple d'abord** : la solution la plus simple qui respecte les règles. Pas d'abstraction spéculative.
- **Zéro code mort, zéro boilerplate inutile** : pas de fichier vide, de code commenté, d'export inutilisé ni de dépendance installée « pour plus tard ». Un module n'est créé que dans la story qui en a besoin.
- **Cohérence de bout en bout** : mêmes noms (glossaire ci-dessous), mêmes patterns, mêmes conventions dans tout le dépôt.
- **Typage strict** : pas de `any` sans justification ; les types viennent de zod, de Prisma ou de tRPC, jamais redéclarés à la main.
- Toute question de produit ou de conception qui n'est pas tranchée se pose au porteur du projet, **avec des options**, avant d'implémenter.

### Glossaire (code ↔ produit)

| Code | Produit |
|---|---|
| `Offer` | Niveau d'un centre (ex. Goethe Yaoundé B1) avec ses réglages |
| `ExamSession` | Session d'examen (date) |
| `Beneficiary` | Bénéficiaire |
| `Request` | Demande |
| `Operation` | Opération (de la prise à la clôture) |
| `PaymentDeclaration` | Dépôt déclaré |
| `Strike` | Avertissement |
| `Dispute` | Litige |

## UX (skill ux-expert)

Le skill est installé dans `.claude/skills/ux-expert` (v1.1.0) et le serveur MCP est déclaré dans `.mcp.json`.

- **Avant d'écrire une story** : mode Design. Coller son bloc « Critères d'acceptation UX » dans la story et transformer ses `[INTERACTIVE STEP]` en décisions produit.
- **Chaque PR qui touche l'interface** : revue UX du diff. Un P0 bloque la fusion ; un P1 est corrigé dans la PR ou devient une story.
- **Avant chaque release** : porte de lancement (Go / Conditional Go / No-Go).
- Citer les identifiants de critères (ex. `FORM-09`) dans les stories et les PR.
- Principe directeur : **l'expérience la plus simple possible**. Chaque écran a un seul objectif clair et une seule action principale.
- **Peu de texte** : un titre, au plus une phrase courte sous le titre, des aides de champ de quelques mots. Si une explication est longue, elle va dans l'aide (FAQ), pas sur l'écran.

## Commandes

```bash
npm run dev         # serveur de développement
npm run check       # lint + types + tests
npm run build       # build de production
npm run lint:fix    # corrige le format et les imports
```

## Sécurité

- Identifiants des centres d'examen : chiffrés (AES-256-GCM), visibles uniquement par l'assistant qui a pris la demande, effacés à la clôture.
- Jamais de secret dans le code ou dans `.env.example`.
- Toute action critique est vérifiée côté serveur (rôle, statut de l'opération, propriétaire) ; l'interface ne fait jamais foi.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
