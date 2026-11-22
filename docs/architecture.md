# Architecture technique

## 1. Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 16 (App Router, Cache Components, React Compiler, `proxy.ts`) | Full stack, déploiement Vercel natif |
| UI | Tailwind v4, shadcn sur **Base UI** (`base-nova`), lucide, sonner | Composants accessibles, maintenus, une seule API |
| Formulaires | TanStack Form + zod | Typage de bout en bout, validation partagée client/serveur |
| API | tRPC 11 + TanStack Query 5, superjson | Contrats typés, préchargement RSC, même modèle que Nodebase |
| État d'URL | nuqs | Filtres et onglets partageables |
| Langues | next-intl (fr par défaut, en) | Préfixe `as-needed` : `/` en français, `/en` en anglais |
| Base de données | Neon (Postgres) + Prisma 7 + `@prisma/adapter-neon` | Serverless, branches par environnement |
| Auth | Better Auth | Email + mot de passe, code par email, Google, Microsoft, plugin admin, 2FA, limite de tentatives |
| Minuteurs et tâches | Inngest | `step.sleepUntil` / `step.waitForEvent` pour les délais 20 min, 15 min, 5 min, 24 h |
| Temps réel et présence | Ably | File en direct et présence native |
| Fichiers | Cloudflare R2 (S3) | 10 Go gratuits, sans frais de sortie, URL signées |
| Emails | Resend + React Email | Vérification, codes, notifications |
| Appels HTTP sortants | ky | Client léger et typé |
| Qualité | Biome, Vitest, Playwright, Sentry | Lint/format, règles métier, parcours, erreurs |
| Hébergement | Vercel, domaine `exams.mrvin100.de` | |

## 2. Monolithe modulaire

```
src/
  app/[locale]/...        routes (pages minces : préchargent et composent)
  app/api/trpc|auth|inngest|webhooks
  modules/<module>/       code métier (voir AGENTS.md pour la structure)
  trpc/                   init, client, serveur, router racine
  i18n/                   routing, request, navigation
  messages/               fr.json, en.json
  components/ui/          composants shadcn (générés, non lintés)
  components/providers/   providers globaux
  server/                 infrastructure serveur : env (zod), db (Prisma), email (Resend)
  shared/                 utilitaires sans métier (formulaires, formatage)
  config/routes.ts        routes de l'app, routes publiques
  proxy.ts                locale (et protection des routes en EXM-002)
```

### Modules et dépendances

| Module | Rôle | Dépend de |
|---|---|---|
| `system` | Santé, utilitaires transverses | — |
| `identity` | Session, rôles, profil, consentements | — |
| `catalog` | Pays, centres, niveaux, sessions, réglages économiques, demandes d'ajout | identity |
| `beneficiaries` | Bénéficiaires, identifiants chiffrés | identity |
| `requests` | Demandes, brouillons, publication, bonus, file | catalog, beneficiaries |
| `operations` | Machine à états prise → clôture, minuteurs | requests, trust |
| `payments` | Déclarations et confirmations de dépôt | operations |
| `trust` | Avertissements, liste noire, litiges, signalements | identity |
| `presence` | Présence en ligne (Ably) | identity |
| `notifications` | Emails et notifications dans l'application | tous (via événements) |
| `admin` | Back-office, journal d'audit | tous |

Règles :
- Pas de dépendance circulaire. Un module qui doit réagir à un autre écoute un **événement Inngest** plutôt que de l'importer.
- Seul le `service` d'un module écrit dans ses tables. Les autres modules passent par son API publique.

## 3. Données (aperçu)

```
Country(id, code, name, currency, timeZone)
Center(id, countryId, name, officialUrl, active)
Offer(id, centerId, level, modules[], standardPrice, commissionRate, commissionMin,
      bonusStep, bonusCap, claimTimeoutMin, confirmOnlineMin, confirmOfflineMin,
      paymentDeadlineH, active)
ExamSession(id, offerId, examDate, registrationOpensAt, officialUrl, status,
            createdById, confirmations)
Beneficiary(id, ownerId, fullName, email, credentialsCipher, consentAt)
Request(id, sessionId, beneficiaryId, ownerId, priceSnapshot, bonus, status,
        publishedAt, version)
Operation(id, requestId, assistantId, status, claimedAt, reservedAt, releasedAt,
          closedAt, proofKey, version)
PaymentDeclaration(id, operationId, recipient[ASSISTANT|PLATFORM], amount,
                   declaredAt, confirmedAt, rejectedAt)
Strike(id, userId, reason, operationId, createdAt)
Blacklist(id, userId, reason, operationId, createdAt, liftedAt)
Dispute(id, operationId, openedById, checklist, status, decision, decidedById)
Report(id, reporterId, kind, targetType, targetId, message, status)
CatalogRequest(id, requesterId, kind, details, officialUrl, status)
AuditLog(id, actorId, action, target, data, createdAt)
```

- `priceSnapshot` fige prix, commission et bonus au moment de la publication.
- `version` sert au **verrou optimiste** : chaque transition fait `UPDATE ... WHERE id = ? AND status = ? AND version = ?`. Zéro ligne modifiée ⇒ conflit (« Déjà prise »).
- Contrainte d'unicité : un assistant n'a qu'une opération active (index partiel sur `assistantId` pour les statuts actifs).
- Contrainte d'unicité : `ExamSession(offerId, examDate)`.

## 4. Machine à états

- Les transitions sont définies dans `modules/operations/domain/` (fonction pure `transition(state, event) → state | error`), testées exhaustivement.
- Le service applique la transition dans une transaction avec verrou optimiste, puis publie l'événement Inngest (`operation/claimed`, `operation/reserved`, …) et le message Ably.

## 5. Minuteurs (Inngest)

| Fonction | Déclencheur | Attente | Effet |
|---|---|---|---|
| `publish-drafts` | cron chaque minute | `registrationOpensAt` atteint | brouillons → publiées |
| `claim-timeout` | `operation/claimed` | `waitForEvent(operation/reserved, 20 min)` | remise en file + avertissement |
| `release-assistant` | `operation/reserved` | `waitForEvent(operation/confirmed, 15 ou 5 min)` | assistant libéré, statut « à confirmer » |
| `payment-deadline` | `operation/confirmed` | rappels H+1, H+12, échéance 24 h | liste noire + suspension |

Les délais viennent de `Offer`. Chaque fonction relit l'état avant d'agir (idempotence).

## 6. Temps réel (Ably)

| Canal | Contenu | Qui |
|---|---|---|
| `queue:<offerId>` | publiée, prise, remise en file | assistants |
| `operation:<id>` | changements de statut | candidat + assistant de l'opération |
| présence `operation:<id>` | en ligne / hors ligne | candidat + assistant |
| `admin:live` | tous les événements | admins |

- Jetons Ably émis par le serveur avec des capacités limitées au canal autorisé.
- Le client reste correct sans temps réel : TanStack Query refait la requête au retour du focus.

## 7. Sécurité

- Identifiants du centre : AES-256-GCM, clé `CREDENTIALS_ENCRYPTION_KEY` (rotation prévue), déchiffrés seulement pour l'assistant de l'opération active, effacés à la clôture.
- Autorisation dans chaque procédure tRPC : `protectedProcedure`, `assistantProcedure`, `adminProcedure`, plus la vérification du propriétaire et du statut.
- Better Auth : vérification d'email, limite de tentatives, 2FA obligatoire pour les admins, bannissement et révocation des sessions par le plugin admin.
- Preuves de litige sur R2 : bucket privé, envoi par URL signée (5 min), lecture par URL signée réservée à l'admin et aux parties.

## 8. Environnements

| Env | Branche Git | Base Neon | URL |
|---|---|---|---|
| Local | toute | branche Neon `dev` | `localhost:3000` |
| Preview | PR | branche Neon par preview | URL Vercel de preview |
| Production | `main` | branche `main` | `exams.mrvin100.de` |

## 9. Tests

- **Vitest** : règles pures (`domain/`), calcul des prix, machine à états, éligibilité d'un assistant.
- **Playwright** : parcours critiques (publier, prendre, réserver, confirmer, payer, litige) à 360 px et en bureau.
- CI : lint, types, tests, build sur chaque PR vers `develop` et `main`.
