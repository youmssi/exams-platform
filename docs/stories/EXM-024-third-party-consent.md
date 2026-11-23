### EXM-024 — Consentement des camarades par email

**Type :** feature · **Dépendances :** EXM-004 · **Taille :** S

#### Pourquoi
Le titulaire saisit les identifiants d'autres personnes. Une case à cocher ne prouve pas leur accord.

#### Décisions d'implémentation
- Lien à usage unique (seule son empreinte SHA-256 est gardée), valable 14 jours, renvoyable par le titulaire toutes les 10 minutes.
- Page publique `/consent?token=…`, sans compte : qui demande, pour qui, à quoi servent les données, puis « J'accepte » ou « Je refuse » (confirmation avant de refuser).
- Refus : les données sont supprimées ; si une opération passée y fait encore référence, elles sont anonymisées.
- Changer l'email d'un camarade redemande son accord.
- Les camarades ajoutés avant cette story gardent l'accord attesté par le titulaire (migration).
- L'email est dans la langue du titulaire, avec un seul bouton d'action.

#### Critères d'acceptation
- [ ] À l'ajout d'un camarade, un email lui demande de confirmer en un clic.
- [ ] Aucune demande ne peut être publiée pour lui avant sa confirmation ; son statut est visible pour le titulaire.
- [ ] Le camarade peut refuser : ses données sont alors supprimées.
