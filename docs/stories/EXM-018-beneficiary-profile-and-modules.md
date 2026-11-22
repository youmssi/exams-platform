### EXM-018 — Profil complet du bénéficiaire et choix des modules

**Type :** feature · **Dépendances :** EXM-004, EXM-005 · **Taille :** M

#### Pourquoi
- Pour inscrire un candidat, le centre demande le prénom et le nom séparément (« tels qu'ils doivent apparaître sur les documents officiels ») et la date de naissance. Les assistants ont aussi besoin du lieu de naissance et d'un téléphone.
- Un candidat peut repasser seulement certains modules (ex. B2 Lesen + Hören).
- Après une visite des conditions, un utilisateur connecté revenait sur l'accueil public sans chemin direct vers l'app.

#### Décisions produit
- Le prix du service est le même pour un examen complet ou partiel : l'assistant fait la même réservation.
- Obligatoires : prénom(s), nom(s), date et lieu de naissance, téléphone, email et mot de passe du compte du centre. Facultatifs : ville, quartier, numéro de participant.

#### Critères d'acceptation
- [ ] Le profil du bénéficiaire contient prénom(s), nom(s), date et lieu de naissance, téléphone, ville, quartier, numéro de participant, email et mot de passe du compte du centre (chiffré).
- [ ] Une demande ne se publie que pour un profil complet ; sinon la personne est grisée avec un lien « Compléter le profil ». Le serveur refuse aussi.
- [ ] La publication propose les modules du niveau, tous cochés par défaut (examen complet) ; au moins un module est requis ; le serveur refuse un module inconnu.
- [ ] « Mes demandes » affiche « Complet » ou la liste des modules.
- [ ] Une personne avec une demande en cours ne peut pas être supprimée (message clair) ; ses demandes annulées partent avec elle.
- [ ] Les noms existants sont conservés (dans « Nom(s) ») et les demandes existantes portent l'examen complet.
- [ ] Les liens vers les conditions et la confidentialité s'ouvrent dans un nouvel onglet depuis la connexion et l'accueil (onboarding).
- [ ] Connecté, l'accueil public propose « Continuer » vers l'app (qui renvoie vers l'onboarding s'il n'est pas terminé).

#### Critères d'acceptation UX
- [ ] Champs regroupés en trois blocs courts (identité, contact, compte du centre) ; facultatifs marqués. [FORM-01, FLOW-03]
- [ ] Types de saisie adaptés : date, téléphone, email. [FORM-05]
- [ ] Téléphone accepté avec ou sans espaces et indicatif. [FORM-07]
- [ ] Les modules par défaut couvrent le cas courant (examen complet). [FLOW-05]
- [ ] Consulter les conditions ne fait pas perdre la saisie en cours. [FLOW-09]
