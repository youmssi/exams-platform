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
| Délais | Échéances en base, vérifiées à la lecture (+ Vercel Cron pour les tâches quotidiennes) | Aucun service de plus ; chaque lecture applique les délais échus |
| Temps réel et présence | Ably | File en direct et présence native |
| Fichiers | Vercel Blob, magasin **privé** | Relié au projet sans secret à manipuler, envoi direct depuis le navigateur avec progression |
| Emails | Resend + React Email | Vérification, codes, notifications |
| Appels HTTP sortants | ky | Client léger et typé |
| Qualité | Biome, Vitest, Playwright, Sentry | Lint/format, règles métier, parcours, erreurs |
| Hébergement | Vercel, domaine `exams.mrvin100.de` | |

## 2. Monolithe modulaire

```
src/
  app/[locale]/...        routes (pages minces : préchargent et composent)
  app/api/trpc|auth|files|realtime|cron
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
| `realtime` | Canaux Ably, présence, jetons | identity |
| `notifications` | Notifications dans l'application et emails produit | realtime |
| `trust` | Avertissements, suspension, signalements | notifications |
| `catalog` | Pays, centres, niveaux, sessions, réglages économiques, demandes d'ajout | identity |
| `beneficiaries` | Bénéficiaires, identifiants chiffrés | identity |
| `assistants` | Profil assistant (Mobile Money), vérification | catalog |
| `operations` | Prise → réservation → règlement → clôture, litiges, liste noire | assistants, beneficiaries, catalog, realtime, trust |
| `requests` | Demandes, publication, bonus, file | operations, catalog, beneficiaries, realtime, trust |
| `landing-page` | Page d'accueil publique | catalog |

Règles :
- Pas de dépendance circulaire : un module bas niveau (ex. `trust`) n'importe jamais un module qui l'utilise (ex. `operations`).
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
- Le service applique la transition dans une transaction avec verrou optimiste, puis publie le message Ably après la réponse (`after()`).

## 5. Délais (échéances en base)

Chaque délai est une date en base, appliquée par la première lecture qui la trouve échue (idempotent : `UPDATE ... WHERE statut = ? AND échéance <= now()`).

| Échéance | Champ | Effet |
|---|---|---|
| Publication | `Request.publishAt` | visible dans la file à l'ouverture des inscriptions |
| Prise | `Operation.deadlineAt` | remise en file + avertissement à l'assistant |
| Libération | `Operation.releaseAt` | assistant libre, demande « à confirmer » |
| Règlement | `Operation.paymentDueAt` | « impayée » : liste noire + blocage |
| Preuve de litige | `Dispute.proofDueAt` | passage en examen par l'admin |

Les durées viennent de `Offer` ou de `src/config`. Les tâches qui ne dépendent d'aucune lecture tournent planifiées, protégées par `CRON_SECRET` : dates de session et report (Vercel Cron, quotidien, `/api/cron/daily`), rappels de paiement (GitHub Actions, horaire, `/api/cron/hourly`).

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
- Better Auth : limite de tentatives, bannissement et révocation des sessions par le plugin admin.
- Admins : 2FA par application d'authentification (TOTP) obligatoire. Une session n'est « admin » que si elle a été ouverte par mot de passe + code TOTP ou code de secours (`session.secondFactorAt`, posé à la création de la session). Le code par email et Google/Microsoft ouvrent une session normale, sans accès admin.
- Fichiers privés (preuves de litige, pièces d'identité) sur Vercel Blob en accès privé. Chemin `<type>/<propriétaire>/<nom>` : `/api/files` délivre un jeton d'envoi seulement à qui a le droit d'écrire ce chemin (images, 5 Mo max), puis relit le fichier pour l'admin et les parties uniquement.

## 8. Environnements

| Env | Branche Git | Base Neon | URL |
|---|---|---|---|
| Local | toute | branche Neon `dev` | `localhost:3000` |
| Preview | PR | branche Neon par preview | URL Vercel de preview |
| Production | `main` | branche `main` | `exams.mrvin100.de` |

## 9. Migrations

- Créées en local avec `npm run db:migrate` (branche Neon `dev`).
- Appliquées automatiquement par Vercel au déploiement (`vercel-build` : `prisma migrate deploy && next build`) : `dev` pour les previews, `main` pour la production.
- La CI ne touche à aucune base : elle construit l'app avec des variables factices.

## 10. Tests

- **Vitest** : règles pures (`domain/`), calcul des prix, machine à états, éligibilité d'un assistant.
- **Playwright** : parcours critiques (publier, prendre, réserver, confirmer, payer, litige) à 360 px et en bureau.
- CI : lint, types, tests, build sur chaque PR vers `develop` et `main`.
