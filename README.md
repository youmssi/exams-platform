# exams-platform

Plateforme de réservation d'examens de langue : les candidats publient leur demande, des assistants qui ont une session ouverte sur le site officiel la prennent, au **prix standard**, avec suivi en temps réel et règlement confirmé des deux côtés. Premier centre : Goethe-Institut Kamerun.

Production : <https://exams.mrvin100.de>

## Démarrer

Prérequis : Node.js 24 (≥ 22), npm.

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000 (fr) et /en
```

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run check` | Lint (Biome) + types + tests (Vitest) |
| `npm run build` | Build de production |
| `npm run lint:fix` | Corrige le format et l'ordre des imports |

## Documentation

| Document | Contenu |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Règles du dépôt : architecture, Git, composants, principes |
| [`docs/product/spec.md`](docs/product/spec.md) | Spécification produit du MVP |
| [`docs/architecture.md`](docs/architecture.md) | Architecture technique, données, minuteurs, temps réel |
| [`docs/ux/ux-design-requirements.md`](docs/ux/ux-design-requirements.md) | Flux critiques, Définition de Fini UX |
| [`docs/ui/component-map.md`](docs/ui/component-map.md) | Inventaire shadcn et composants par workflow |
| [`docs/stories/`](docs/stories/README.md) | Backlog et stories |

## Premier administrateur

1. Se connecter une première fois sur l'app (le compte est créé).
2. Dans la console Neon (branche `main`), exécuter : `UPDATE "user" SET role = 'admin' WHERE email = '<email>';`
3. Dans « Mon compte » : définir un mot de passe si besoin, puis activer la vérification en deux étapes.
4. Se reconnecter avec mot de passe + code de l'application : le menu « Administration » apparaît.

## Workflow

`exm-<code>-<titre>` → `develop` → `main` (production). Détails dans [`AGENTS.md`](AGENTS.md).
