### EXM-023 — Aide automatique pour les dates de session

**Type :** feature · **Dépendances :** EXM-005 · **Taille :** M

#### Pourquoi
Les dates paraissent sur le site officiel du centre ; les saisir à la main est lent et source d'erreurs.

#### Décisions produit
- La saisie manuelle par tous (candidats et assistants), confirmée par 3 personnes ou l'admin, reste la règle.
- Un job quotidien lit la page officielle des dates de chaque centre (lien du catalogue) et propose les nouvelles dates « à confirmer ».
- Si la page change de format, le job s'arrête proprement et signale l'erreur à l'admin ; le manuel suffit.

#### Décisions d'implémentation
- Le job ne crée pas de session : il **propose** des dates (« Dates détectées »). L'heure d'ouverture des inscriptions ne se déduit pas sûrement d'une page ; l'admin la saisit en créant la session, qui est alors confirmée.
- Lecture du texte de la page, sans dépendre de sa mise en page : une date appartient au niveau mentionné juste avant elle (formats numériques, mois en français, allemand, anglais). Règles pures testées.
- Activation par centre (`autoDates`), à cocher par l'admin après vérification des conditions du site. Une page illisible ou sans date arrête la lecture de ce centre et s'affiche dans « Admin › Sessions ».
- Tâche quotidienne Vercel Cron (`/api/cron/daily`, 04:17 UTC) protégée par `CRON_SECRET` ; elle lance aussi le report des demandes (EXM-022) pour les comptes inactifs.
- L'admin peut aussi valider directement une session ajoutée par un utilisateur.

#### Critères d'acceptation
- [ ] Une session proposée par le job n'est jamais dupliquée et reste « à confirmer » jusqu'à validation.
- [ ] Les demandes en report automatique (EXM-022) rejoignent la nouvelle session une fois confirmée.
- [ ] Les conditions d'utilisation du site du centre sont vérifiées avant activation pour chaque centre.
