### EXM-002 — Connexion et comptes

**Type :** feature · **Dépendances :** EXM-001 · **Taille :** L

#### Pourquoi
Chaque action engage la responsabilité de quelqu'un (paiement, sanction). Il faut un compte, mais sa création ne doit pas être un obstacle le jour de l'ouverture.

#### Comportement

| Où | Après |
|---|---|
| `/connexion` | Google, Microsoft, ou email (code à 6 chiffres ou mot de passe) |
| Première connexion | Choix du rôle de départ (candidat ou assistant), modifiable ensuite ; acceptation des CGU |
| Menu du compte | Langue, rôle actif, appareils connectés, déconnexion |

#### Critères d'acceptation
- [ ] Prisma sur Neon ; schéma Better Auth (user, session, account, verification) avec un champ de rôle.
- [ ] Better Auth : email + mot de passe avec vérification, code par email, Google, Microsoft, plugin admin, 2FA obligatoire pour le rôle admin, limite de tentatives.
- [ ] Emails transactionnels via Resend (code, vérification, réinitialisation), en fr et en.
- [ ] `protectedProcedure`, `assistantProcedure`, `adminProcedure` dans tRPC.
- [ ] `proxy.ts` redirige un visiteur non connecté vers la connexion, puis le renvoie à la page demandée.
- [ ] Un compte banni ne peut ni se connecter ni appeler l'API.
- [ ] Devenir assistant : envoi de la pièce d'identité (R2, privé) et du numéro Mobile Money ; statut « en attente de vérification » jusqu'à validation par l'admin (EXM-012). Sans validation, la file est visible mais la prise est refusée.

#### Critères d'acceptation UX
- [ ] Les boutons Google et Microsoft sont en premier ; l'email est une alternative sur le même écran, sans page supplémentaire. [ONB-05, FLOW-02]
- [ ] Le code par email accepte le collage et le remplissage automatique ; un nouveau code est disponible après 30 s, avec le compte à rebours visible. [FORM-17]
- [ ] Le mot de passe peut être affiché, n'a pas de règles de composition cachées, et autorise les gestionnaires de mots de passe. [FORM-16, FORM-18]
- [ ] « Mot de passe oublié » est accessible depuis l'écran de connexion et ne révèle pas si l'email existe. [TRUST-16]
- [ ] Après connexion, l'utilisateur revient exactement où il était. [FLOW-11]
- [ ] Les erreurs disent quoi faire (« Code expiré : demandez-en un nouveau »), sans effacer l'email saisi. [CONT-06, FORM-12]
- [ ] Trop de tentatives : message clair avec le temps d'attente. [STATE-21]
- [ ] Session expirée : reconnexion sans perte du formulaire en cours. [STATE-12]
- [ ] Les CGU sont résumées en 3 points lisibles, avec le lien vers le texte complet ; la case n'est pas pré-cochée. [TRUST-01, TRUST-20, CONT-14]
- [ ] L'utilisateur voit ses appareils connectés et peut les déconnecter. [TRUST-17]
- [ ] L'assistant en attente de vérification voit son statut, ce qui est vérifié et le délai habituel ; le bouton « Prendre » est désactivé avec la raison. [TRUST-19, INT-15]
- [ ] Le parcours est entièrement faisable au clavier et au lecteur d'écran, à 360 px. [A11Y-02, A11Y-24, RESP-04]

**Mesuré par :** `auth_started`, `auth_completed` (méthode). [MEAS-02]

#### Composants shadcn
- Connexion : block `login-05` (email seul) + boutons sociaux de `signup-05` ; `field`, `input`, `input-otp`, `button`, `separator`.
- Formulaires : `src/shared/form` (`createFormHook` + `Field`), créé dans cette story.
- Premier accès : `radio-group` en cartes (`FieldLabel` + `Field`), `checkbox` (CGU).
- Coque de l'app : block `sidebar-07` ; menu du compte `avatar` + `dropdown-menu` ; appareils `item` + `alert-dialog`.
- Vérification assistant : `field`, `input`, `attachment` (pièce d'identité), `badge` (statut).

#### Hors périmètre
Écran de validation des assistants côté admin (EXM-012).
