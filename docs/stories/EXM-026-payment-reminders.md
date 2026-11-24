### EXM-026 — Rappels de paiement H+1 et H+12

**Type :** feature · **Dépendances :** EXM-009, EXM-011 · **Taille :** S

#### Pourquoi
Le règlement a une échéance (24 h par défaut) dont le dépassement suspend le compte. Un candidat qui oublie doit être prévenu à temps, sans relance inutile.

#### Décisions
- Vercel Hobby ne planifie qu'une tâche par jour : une tâche GitHub Actions horaire appelle `/api/cron/hourly`, protégée par le même `CRON_SECRET` (secret du dépôt). Sans secret, la tâche est ignorée.
- Heures des rappels dans `src/config/payments.ts` (1 h et 12 h après la confirmation).

#### Critères d'acceptation
- [x] Un rappel n'est envoyé que s'il reste un dépôt « à envoyer » et que l'opération n'est ni clôturée ni impayée. [NOTIF-09]
- [x] Chaque rappel part une seule fois, dans l'ordre (compteur à verrou optimiste).
- [x] Le rappel est critique (email toujours envoyé) et mène à « Mes demandes ». [NOTIF-10, NOTIF-12]
- [x] La règle est pure et testée.
