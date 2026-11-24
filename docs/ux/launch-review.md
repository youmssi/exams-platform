# Revue UX de lancement — Release 1 (MVP)

Mode : porte de lancement (ux-expert, `references/severity-and-scoring.md` §7). Date : 23 novembre 2026.

## Verdict

**No-Go pour l'annonce publique, Go pour une mise en production discrète (soft launch).**

Aucun P0 connu. Mais plusieurs parcours critiques n'ont pas encore été vérifiés de bout en bout : ils demandent une session admin 2FA, un vrai navigateur pour l'envoi de fichiers ou une boîte mail réelle. La règle de la porte interdit un Go tant qu'ils ne le sont pas. Les conditions ci-dessous lèvent le No-Go.

## Parcours vérifiés de bout en bout (preview `develop`, deux comptes, 360 px et bureau)

| Parcours | Résultat |
|---|---|
| Publier une demande (bénéficiaire complet, bouton désactivé quand déjà publiée) | OK |
| Prendre une demande, opération affichée dans la File (correctif du canal temps réel) | OK |
| Signaler un problème → « À corriger » avec raison → « C'est réglé » → retour dans la file | OK |
| Modifier une demande ouverte (bonus à la hausse) | OK |
| Réservation déclarée → liste de vérification → mail confirmé | OK |
| Dépôt de l'assistant : déclaré → « À confirmer » → reçu | OK |
| Litige ouvert → étape 2 sur 4 → assistant bloqué avec la raison → carte de preuve | OK (envoi du fichier non testé, voir C3) |
| Signaler une session, liste noire, « 0 sur 3 » dans Mon compte | OK |
| Image de partage fr/en | OK |

## Conditions (propriétaire : porteur du projet)

| # | Condition | Critères |
|---|---|---|
| C1 | Activer la 2FA du compte admin, puis valider la pièce d'un assistant de test dans « Admin › Assistants » | TRUST-19, ADMIN-09 |
| C2 | Renseigner le compte Mobile Money de la plateforme (Admin › Catalogue › Pays), puis confirmer une commission : l'opération doit passer « Réglée » | FLOW-20, COMM-10 |
| C3 | Sur un vrai téléphone : envoyer une preuve de litige et une pièce d'identité (progression, réessai) | FORM-19, INT-05 |
| C4 | Décider un litige dans « Admin › Litiges » et vérifier la notification des deux parties | FLOW-07, NOTIF-18 |
| C5 | Ajouter un camarade avec une vraie adresse : email reçu, accord, puis publication possible | TRUST-11 |
| C6 | Ajouter `CRON_SECRET` dans Vercel (Production) : la tâche quotidienne (dates, report) répond 200 | — |
| C7 | Créer le projet Sentry et ajouter `NEXT_PUBLIC_SENTRY_DSN` (Production) | — |

## P1 à suivre (pas bloquants)

- Parcours connectés F1 à F5 en Playwright : demandent des comptes de test et la lecture des codes OTP en CI. Les tests de fumée publics tournent déjà sur chaque preview (secret `VERCEL_AUTOMATION_BYPASS_SECRET` requis si la preview est protégée).
- Rappels de paiement H+1 / H+12 : livrés par EXM-026 (tâche horaire GitHub Actions, secret `CRON_SECRET` à ajouter aussi dans GitHub).
- Lecture automatique des dates : à activer centre par centre après vérification des conditions du site officiel.
