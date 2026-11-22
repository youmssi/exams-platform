# Exigences UX — Exams (MVP)

Produit par le skill ux-expert v1.1.0 en mode Design. Les identifiants entre crochets sont des critères du catalogue (`.claude/skills/ux-expert/criteria/`). Les critères par story sont dans `docs/stories/`.

## 1. Cadre et contexte

**En une phrase :** permettre à un candidat d'obtenir sa place d'examen au prix standard, et à un assistant d'être payé pour l'avoir réservée, sans jamais se connaître ni se bloquer l'un l'autre.

- **Type de produit :** `web-app` (responsive, téléphone d'abord).
- **Langues :** français (défaut), anglais. **Fuseau :** Africa/Douala, affiché explicitement. **Devise :** XAF, sans décimales.
- **Contraintes :** connexion mobile parfois instable ; usage surtout sur téléphone Android ; jour d'ouverture = pic de trafic de quelques minutes ; identifiants tiers sensibles.

### Segments et jobs (classés)

| # | Segment | Job | Réussite |
|---|---|---|---|
| 1 | Candidat | « Obtenir ma place B1/B2 au juste prix sans courir après quelqu'un sur WhatsApp » | Mail de confirmation du centre reçu, payé au prix affiché |
| 2 | Assistant | « Utiliser ma session ouverte pour réserver quelqu'un tout de suite et être payé » | Demande prise en moins de 10 s, paiement confirmé |
| 3 | Titulaire de groupe | « Inscrire mes camarades en une fois et suivre chacun » | Toutes les demandes publiées en moins de 2 min |
| 4 | Admin | « Intervenir seulement quand ça coince » | Litige tranché avec toutes les preuves sur un écran |

### Indicateurs

- Délai publication → prise (médiane) ; délai prise → réservation ; taux de clôture ; taux de litiges ; taux d'impayés. [MEAS-01, MEAS-02]

### Principes de simplicité

1. **Un écran, un objectif, une action principale.** [FLOW-02, LAY-01]
2. **Ne jamais redemander** une information déjà donnée : profil bénéficiaire saisi une fois. [FORM-22, FLOW-03]
3. **Le statut répond toujours à « où en est-on et que dois-je faire ? »** [FLOW-07, FLOW-20]
4. **Personne n'attend personne :** chaque attente a un délai visible et une issue automatique. [FLOW-10, A11Y-23]
5. **Le prix total est connu avant tout engagement.** [COMM-01, TRUST-07]

## 2. Flux critiques (étapes proposées)

### F1 — Candidat : première demande

| # | Étape | Champs | Décisions |
|---|---|---|---|
| 1 | Connexion (Google, Microsoft ou code par email) | 0–1 | 1 |
| 2 | Choisir la session (liste par centre et niveau) | 0 | 1 |
| 3 | Bénéficiaire : « Moi » pré-rempli ; identifiants du centre | 2 | 0 |
| 4 | Récapitulatif : total, bonus facultatif, consentement → **Publier** | 1 case | 1 |

Cible : **4 étapes, ≤ 5 champs, < 2 min**. Optimisations : l'inscription est différée jusqu'au moment de publier [ONB-04, COMM-02] ; le nom vient du compte Google ou Microsoft [FORM-08] ; le bonus est replié par défaut [FLOW-05].

### F2 — Assistant : prendre et réserver

| # | Étape | Champs | Décisions |
|---|---|---|---|
| 1 | File de la session (temps réel) | 0 | 1 |
| 2 | **Prendre** (atomique) → identifiants affichés, copie en un geste, compte à rebours 20 min | 0 | 0 |
| 3 | **Réservation effectuée** (capture facultative) | 0–1 | 1 |
| 4 | En attente de confirmation (délai visible) → libéré | 0 | 0 |

Cible : **prise en un tap**, délai file → identifiants < 1 s.

### F3 — Candidat : confirmer et régler

| # | Étape | Décisions |
|---|---|---|
| 1 | Notification « Réservation effectuée » → lien direct vers l'opération [NOTIF-10] | 0 |
| 2 | **J'ai reçu le mail** / Je n'ai pas reçu le mail | 1 |
| 3 | Deux dépôts affichés (montant, compte, référence) → **J'ai envoyé** pour chacun | 2 |
| 4 | Clôturée : résumé + conseil de changer de mot de passe | 0 |

### F4 — Litige « mail non reçu »

Liste de vérification obligatoire (5 cases) → ouverture → preuve demandée à l'assistant → décision admin notifiée aux deux. [FLOW-19, TRUST-14]

### F5 — Groupe

Ajouter un bénéficiaire (nom, email, identifiants, attestation d'accord) → sélectionner plusieurs bénéficiaires → **Publier N demandes** → tableau de suivi par bénéficiaire. [FORM-22, DATA-01]

## 3. Décisions produit

Toutes tranchées avec le porteur du projet (voir `docs/product/spec.md`), dont les deux dernières :

- **Vérification d'identité des assistants :** pièce d'identité + numéro Mobile Money, validés par l'admin avant la première prise. L'anonymat vis-à-vis du candidat n'est acceptable que si la plateforme peut identifier l'assistant. [ONB-06, TRUST-20] → EXM-002 (statut « assistant vérifié ») et EXM-012 (validation).
- **Notifications urgentes :** email + notification dans l'application au MVP ; WhatsApp ou SMS en v2. [NOTIF-02] → EXM-011.

### Stories manquantes repérées

- Réinitialisation de mot de passe et récupération de compte [TRUST-16] → EXM-002.
- Suppression de compte et export des données [TRUST-10] → EXM-012.
- Page « Comment ça marche » et conditions d'utilisation lisibles [TRUST-20, HELP-01] → EXM-013.

## 4. Définition de Fini UX (chaque PR)

- [ ] Tous les états sont faits pour chaque écran modifié : vide, chargement, erreur avec issue, aucun droit. [STATE-02, STATE-04, STATE-07, STATE-08, STATE-19]
- [ ] Tout se fait au clavier, avec un focus visible et logique ; le focus est géré à l'ouverture et à la fermeture des dialogues. [A11Y-02, A11Y-05, A11Y-06]
- [ ] Les statuts et minuteurs sont annoncés aux lecteurs d'écran. [A11Y-13]
- [ ] Contraste ≥ 4.5:1 pour le texte et ≥ 3:1 pour les éléments d'interface ; cibles ≥ 24×24 px. [A11Y-15, A11Y-20]
- [ ] Formulaires : libellés visibles, validation au bon moment, erreur à côté du champ, saisie conservée. [FORM-02, FORM-09, FORM-10, FORM-12, A11Y-24]
- [ ] Tout délai est visible, et son expiration a une issue claire. [A11Y-23]
- [ ] Les écrans fonctionnent à 360 px, avec l'action principale à portée de pouce et des cibles tactiles suffisantes. [RESP-04, RESP-07]
- [ ] Textes en fr et en ; la mise en page tient avec des textes plus longs ; heures affichées avec leur fuseau. [I18N-07, I18N-13, I18N-18]
- [ ] Retour immédiat à chaque action ; toasts sans perte d'information ; boutons désactivés expliqués. [INT-04, INT-14, INT-15, PERF-05]
- [ ] Les mises à jour en temps réel ne déplacent pas ce que l'utilisateur est en train de toucher. [DATA-25]
- [ ] Uniquement des tokens du thème, pas de couleurs en dur. [DS-01, COL-01]
- [ ] Événements du parcours instrumentés avec des noms cohérents. [MEAS-02]
- [ ] Données sensibles masquées par défaut et révélées sur action explicite. [TRUST-18]

## 5. Traçabilité (critère → stories)

| Critères | Stories |
|---|---|
| FLOW-02, FLOW-03, FORM-22 | EXM-004, EXM-005 |
| COMM-01, TRUST-07, CONT-20 | EXM-003, EXM-005, EXM-009 |
| TRUST-15, TRUST-16, FORM-16, FORM-17, FORM-18, ONB-05 | EXM-002 |
| TRUST-18, TRUST-11 | EXM-004, EXM-007 |
| DATA-25, COLLAB-05, STATE-13 | EXM-006, EXM-007 |
| A11Y-23, FLOW-10 | EXM-007, EXM-008, EXM-009 |
| FLOW-19, TRUST-14, CONT-10 | EXM-008, EXM-010 |
| NOTIF-02, NOTIF-10, NOTIF-14, NOTIF-18, CONT-18 | EXM-011 |
| ADMIN-01, ADMIN-05, ADMIN-09, DATA-11 | EXM-012 |
| IA-01, IA-02, IA-15 | EXM-001, EXM-013 |
