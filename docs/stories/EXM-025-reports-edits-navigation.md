### EXM-025 — Signalements, modification des demandes et navigation par rôle

**Type :** feature · **Dépendances :** EXM-008 · **Taille :** M

#### Pourquoi
- Un assistant bloqué pour une raison autre que les identifiants n'avait que le litige.
- Un candidat ne pouvait pas ajuster une demande sans l'annuler.
- « Accueil » et « Opération » répétaient ce que montraient déjà les autres pages.

#### Décisions produit
- « Signaler un problème » remplace « Identifiants refusés ». Raisons fixes : identifiants refusés, informations incorrectes, compte bloqué ou à vérifier, autre (note courte, visible du seul candidat). Aucune pénalité ; chaque signalement est journalisé pour l'admin.
- La demande signalée devient « À corriger » avec la raison. Elle revient dans la file quand le candidat corrige le profil ou indique « C'est réglé ».
- « Modifier » une demande ouverte que personne ne traite : modules, et bonus à la hausse seulement. Le prix standard reste celui de la publication.
- Une page par rôle :
  - candidat : Sessions (avec l'étape de profil en tête), Mes demandes, Bénéficiaires ;
  - assistant : File, qui affiche l'opération en cours quand il y en a une ;
  - `/home` redirige vers la page du rôle.

#### Critères d'acceptation
- [ ] Le signalement n'est possible que pendant une prise en cours ; la note est obligatoire pour « Autre » (140 caractères au plus).
- [ ] Une demande « À corriger » n'apparaît pas dans la file.
- [ ] « Modifier » est refusé côté serveur si quelqu'un traite la demande, si le bonus baisse ou si un module est inconnu ; verrou optimiste.
- [ ] Plus de page « Opération » ni d'« Accueil » dans les menus.

#### Critères d'acceptation UX
- [ ] Les boutons reflètent l'état : « Publiée » désactivée, actions absentes quand le workflow ne les permet pas. [STATE-19, FLOW-17]
- [ ] Une page, une action principale. [FLOW-02, IA-01]
