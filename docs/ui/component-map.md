# Composants : inventaire shadcn et correspondance par workflow

Source : registre shadcn `bases/base` (style `base-nova`, Base UI), cloné et inventorié avant la conception. **Règle : on ne crée aucun composant d'interface qui existe déjà dans shadcn.** On installe avec `npx shadcn@latest add <nom>`, on compose, on ne réécrit pas.

## 1. Inventaire (base-nova)

| Famille | Composants |
|---|---|
| Actions | `button`, `button-group`, `toggle`, `toggle-group`, `dropdown-menu`, `context-menu`, `menubar`, `kbd` |
| Formulaires | `field` (FieldSet, FieldGroup, FieldLabel, FieldDescription, FieldError), `input`, `input-group`, `input-otp`, `textarea`, `checkbox`, `radio-group`, `switch`, `slider`, `select`, `native-select`, `combobox`, `calendar`, `date-picker`, `label` |
| Affichage | `card`, `item`, `badge`, `avatar`, `table`, `data-table` (TanStack Table), `chart`, `typography`, `separator`, `aspect-ratio`, `carousel`, `code-block`, `attachment` |
| États et retours | `empty`, `skeleton`, `spinner`, `progress`, `alert`, `sonner` (toasts), `toast`, `tooltip`, `hover-card` |
| Surcouches | `dialog`, `alert-dialog`, `sheet`, `drawer`, `popover`, `command` |
| Navigation et mise en page | `sidebar`, `navigation-menu`, `breadcrumb`, `tabs`, `pagination`, `accordion`, `collapsible`, `scroll-area`, `resizable`, `direction` |
| Conversation et IA | `message`, `message-scroller`, `bubble`, `marker`, `trace`, `questionnaire` (non utilisés au MVP) |
| Blocks | `login-01…05`, `signup-01…05`, `dashboard-01`, `sidebar-01…16` |

**Choix uniques** (une seule façon de faire dans tout le projet) :
- Toasts : `sonner` (déjà installé, utilisé par le guide TanStack Form). `toast` n'est pas installé.
- Liste déroulante : `select` pour ≤ 7 options ; `combobox` pour une liste longue avec recherche. `native-select` n'est pas utilisé.
- Surcouche : `dialog` sur bureau, `drawer` sur téléphone, pour la même action (via `useIsMobile`). Les confirmations destructives passent toujours par `alert-dialog`.
- Tableau : `data-table` pour les listes admin (tri, filtres, pagination) ; `item` pour les listes côté utilisateur (file, bénéficiaires, opérations) : plus lisible sur téléphone.

## 2. Formulaires (TanStack Form + Field)

Pattern officiel shadcn : `form.Field` (TanStack) + `<Field>` / `<FieldLabel>` / `<FieldDescription>` / `<FieldError>`, avec validation zod partagée avec le serveur.

Pour ne pas répéter ce câblage dans chaque formulaire, on le centralise **une seule fois** avec `createFormHook` de TanStack Form dans `src/shared/form/` :
- `useAppForm` et des champs pré-liés (`TextField`, `PasswordField`, `CheckboxField`, `SelectField`, `OtpField`, `SubmitButton`) ;
- chacun n'est qu'une **composition** de primitives shadcn (`Field` + `Input`/`Checkbox`/`Select`/`InputOTP` + `FieldError`), sans style propre.

## 3. Correspondance par workflow

| Story | Écran / besoin | Composants |
|---|---|---|
| EXM-001 | Accueil, providers | `button`, `sonner`, `typography` |
| EXM-001 | Coque de l'app | `sidebar` (block `sidebar-07`, réduit en icônes) sur bureau ; `sheet` (fourni par `sidebar`) sur téléphone ; `breadcrumb` ; `avatar` + `dropdown-menu` pour le compte |
| EXM-002 | Connexion / inscription | block `login-05` (email seul) adapté avec les boutons sociaux de `signup-05` ; `field`, `input`, `input-otp`, `button`, `separator` |
| EXM-002 | Choix du rôle à la 1ʳᵉ connexion | `radio-group` (variante en cartes de `field` : `FieldLabel` + `Field orientation="horizontal"`), `checkbox` (CGU) |
| EXM-002 | Appareils connectés | `item` + `button` ; `alert-dialog` pour « déconnecter » |
| EXM-003 | Catalogue admin | `data-table`, `sheet` (édition), `field`, `input-group` (suffixe « FCFA », « % », « min »), `switch` (actif), `badge` |
| EXM-003 | Aperçu de répartition | `card` + `item` |
| EXM-004 | Liste des bénéficiaires | `item` (avatar, nom, actions), `empty`, `badge` (« Moi ») |
| EXM-004 | Ajout / modification | `dialog`/`drawer`, `field`, `input`, `input-group` (afficher/masquer le mot de passe), `checkbox` (accord du tiers), `alert` (qui voit quoi) |
| EXM-004 | Suppression | `alert-dialog` |
| EXM-005 | Choisir une session | `combobox` (centre/niveau), `item` (sessions), `badge` (non vérifiée / confirmée), `empty` |
| EXM-005 | Créer une session | `dialog`/`drawer`, `select` (offre), `date-picker`, `field` |
| EXM-005 | Publier une demande | `card` (récapitulatif), `toggle-group` (bonus par paliers), `checkbox` (bénéficiaires multiples), `button`, `progress` (publication groupée) |
| EXM-005 | Demander un ajout / signaler | `dialog`, `radio-group`, `textarea` |
| EXM-006 | File publique | `item` (demande anonymisée), `badge` (bonus, liste noire), `tabs` (par session), `empty`, `skeleton` |
| EXM-006 | Présence | `badge` (point en ligne / hors ligne) + texte |
| EXM-007 | Demande prise | `card`, `input-group` + `button` (copier l'identifiant), `progress` (compte à rebours), `alert`, `button` |
| EXM-008 | Réservation / confirmation | `card`, `button`, `attachment` (capture facultative), `progress` (délai) |
| EXM-008 | « Je n'ai pas reçu le mail » | `alert-dialog` contenant une liste de `checkbox` dans un `FieldSet` |
| EXM-009 | Règlement | `card` × 2 (assistant, plateforme), `item`, `input-group` + copier (numéro, référence), `badge` (statut), `button` |
| EXM-010 | Litige | `attachment` (preuve), `textarea`, `badge` ; admin : `sheet` + `tabs` (preuves, historique, décision) |
| EXM-011 | Centre de notifications | `popover` (bureau) / `sheet` (téléphone), `item`, `badge` (non lues), `empty` |
| EXM-012 | Back-office | block `dashboard-01` (cartes KPI + `chart` + `data-table`), `sidebar`, `tabs`, `alert-dialog` (bannir, révoquer), `command` (recherche d'utilisateur) |
| EXM-013 | 404, erreur, aide | `empty`, `button`, `accordion` (FAQ « Comment ça marche ») |

## 4. Règles d'usage

1. **Vérifier avant de créer.** Avant toute interface, consulter cet inventaire et la doc du composant (exemples compris). Un composant maison n'est accepté que si aucun composant ni aucune composition shadcn ne couvre le besoin, et la PR doit dire pourquoi.
2. **Composer, ne pas forker.** On ne modifie pas `src/components/ui/*` pour un besoin local. Une variante utile partout se fait par `cva` dans le composant shadcn, une seule fois.
3. **Composants métier** (`modules/*/ui`) : uniquement des assemblages de composants shadcn avec des données ; aucun style ad hoc en dehors des utilitaires Tailwind et des tokens.
4. **Un usage par composant**, selon sa raison d'être : `alert-dialog` pour une confirmation, `dialog` pour une tâche, `sheet` pour un détail latéral, `popover` pour un contenu léger, `tooltip` seulement pour un complément (jamais une information indispensable).
5. **Les états d'abord** : chaque liste a ses variantes `skeleton` (chargement) et `empty` (vide et aucun résultat), et chaque erreur a son `alert` avec une action de reprise.
