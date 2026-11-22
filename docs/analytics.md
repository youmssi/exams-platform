# Mesure d'audience

Outil : **Umami** (instance auto-hébergée), sans cookie. Le script n'est chargé qu'en production (`NEXT_PUBLIC_UMAMI_*` définies uniquement pour l'environnement Production de Vercel) et ne compte que le domaine `exams.mrvin100.de`.

## Convention

- Noms en `snake_case`, au format `<objet>_<verbe au passé>` : `auth_started`, `request_published`.
- Un seul point d'entrée : `track()` dans `src/shared/analytics.ts`, typé. Un nouvel événement s'ajoute d'abord au type `AnalyticsEvent`.
- Aucune donnée personnelle dans les événements (pas d'email, de nom ni d'identifiant de centre).

## Événements

| Événement | Données | Story |
|---|---|---|
| `auth_started` | `method` : `code`, `password`, `google`, `microsoft` | EXM-002 |
| `auth_completed` | `method` : `code`, `password` | EXM-002 |
| `request_published` | `count` (demandes), `bonus` (montant) | EXM-005 |
| `request_claimed` | `bonus` (montant) | EXM-007 |
| `operation_released` | — | EXM-007 |
| `candidate_withdrew` | — | EXM-007 |

Les connexions Google et Microsoft se terminent après une redirection : elles sont comptées par les visites de `/home` qui suivent un `auth_started`.
