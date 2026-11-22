# Spécification produit — MVP

Version 1.0 · Périmètre : Cameroun, Goethe-Institut (B1, B2), extensible à d'autres pays et centres.

## 1. Problèmes résolus

1. **Prix sans plafond.** L'aide à la réservation se négocie sur WhatsApp, sans prix de référence ; plus la demande monte, plus c'est cher.
2. **Informations partagées à plusieurs aidants.** Le même compte circule dans plusieurs groupes ; un aidant réserve, les autres ne le savent pas et gâchent leur session sur un compte déjà servi.
3. **Règlement sans garantie.** Des candidats ne paient pas après le service, des aidants surfacturent, et rien ne trace qui a fait quoi.

Contexte vérifié : le Goethe-Institut Kamerun attribue les places dans l'ordre d'arrivée (environ 140 candidats par date) et supprime une réservation non payée dans le délai imparti. Il met aussi en garde contre les offres frauduleuses : la plateforme se présente comme un **service d'assistance transparent**, jamais comme une revente de places.

## 2. Rôles

| Rôle | Qui | Peut |
|---|---|---|
| **Candidat** | Personne qui veut une place, ou qui gère des camarades (compte groupe) | Créer ses bénéficiaires, publier des demandes, suivre, confirmer, payer, ouvrir un litige |
| **Assistant** | Personne qui a une session ouverte sur le site officiel | Voir la file, prendre **une** demande à la fois, déclarer la réservation |
| **Admin** | Équipe plateforme | Catalogue, prix, litiges, bannissements, vue temps réel, réglages |

Un même compte peut être candidat et assistant. Le rôle actif est choisi dans l'interface ; les règles s'appliquent par rôle.

## 3. Catalogue

Hiérarchie : **Pays → Centre → Niveau → Session**.

- **Pays** : devise, fuseau horaire, langue par défaut. Créé par l'admin.
- **Centre** : ex. Goethe-Institut Yaoundé, lien officiel. Créé par l'admin.
- **Niveau** (offre) : ex. B1, B2, avec ses modules. Porte les **réglages économiques** fixés par l'admin : prix standard, taux de commission, commission minimale, plafond de bonus, pas du bonus, délais.
- **Session** : une date d'examen et sa date d'ouverture des inscriptions, avec le lien officiel.
  - Créée par **tout utilisateur vérifié**, avec un formulaire unique.
  - Doublon impossible : même centre + niveau + date d'examen ⇒ « Cette session existe déjà, rejoignez-la ».
  - Statut « non vérifiée » jusqu'à **3 confirmations** d'utilisateurs ou validation par l'admin. Signalable.
  - Le prix est repris du niveau, **non modifiable** par l'utilisateur.
- **Demander un ajout** : tout utilisateur peut demander un nouveau centre, niveau ou pays (ce qui manque, lien officiel, date). L'admin le crée.

## 4. Prix, commission et bonus

Réglables par l'admin pour chaque centre × niveau. Valeurs de départ :

| Réglage | Valeur |
|---|---|
| Prix standard | fixé par l'admin (ex. 3 000 FCFA B1, 5 000 FCFA B2) |
| Commission plateforme | **10 %**, incluse dans le prix, **minimum 300 FCFA** |
| Bonus | par pas de **500 FCFA**, plafond = **prix standard** (B1 3 000 ⇒ +3 000 max) |

- Le candidat voit **un seul total**, détaillé au règlement : `Total 3 000 → Assistant 2 700 · Plateforme 300`.
- La commission s'applique aussi au bonus.
- Un changement de prix ne s'applique qu'aux **nouvelles** demandes ; une demande publiée garde son prix.
- Tri de la file : bonus décroissant, puis ancienneté.

## 5. Bénéficiaires et compte groupe

- Un compte candidat gère **jusqu'à 5 bénéficiaires** (lui-même compris).
- Chaque bénéficiaire a son profil : prénom(s) et nom(s) officiels, date et lieu de naissance, téléphone (obligatoires), ville, quartier, numéro de participant (facultatifs), identifiants du compte du centre (mot de passe chiffré).
- Une demande porte sur l'examen complet ou sur certains modules (ex. B2 Lesen + Hören) ; le prix du service est le même.
- À l'ajout d'un tiers : case obligatoire « J'ai l'accord de cette personne pour gérer ses informations ».
- **Une demande par bénéficiaire** ; chacune est prise indépendamment.
- Le titulaire confirme la réception du mail et paie pour chacun. Il est **responsable** : un impayé sur un bénéficiaire met le titulaire en liste noire.

## 6. Cycle de vie d'une demande

```
BROUILLON ─(ouverture des inscriptions)→ PUBLIÉE ─(assistant prend)→ PRISE
PRISE ─(20 min sans réservation | candidat se retire)→ PUBLIÉE (en tête de file)
PRISE ─(assistant déclare)→ RÉSERVÉE
RÉSERVÉE ─(candidat confirme le mail)→ À PAYER        [assistant libéré]
RÉSERVÉE ─(15 min en ligne | 5 min hors ligne sans réponse)→ À CONFIRMER  [assistant libéré]
À CONFIRMER ─(candidat confirme)→ À PAYER
À CONFIRMER | RÉSERVÉE ─(candidat : « pas reçu », après vérification)→ EN LITIGE
À PAYER ─(deux dépôts déclarés)→ PAIEMENT DÉCLARÉ
PAIEMENT DÉCLARÉ ─(assistant ET plateforme confirment)→ CLÔTURÉE
PAIEMENT DÉCLARÉ ─(un dépôt non reçu)→ À PAYER (le candidat est notifié)
À PAYER ─(24 h)→ IMPAYÉE  [liste noire + suspension]
EN LITIGE ─(décision admin)→ À PAYER | ANNULÉE
PUBLIÉE | BROUILLON ─(candidat annule)→ ANNULÉE
```

### 6.1 Publication
- Le candidat choisit une session et un bénéficiaire ; le profil est déjà rempli, donc la demande se crée en un clic.
- Avant l'ouverture des inscriptions, la demande reste en **brouillon** et se publie **automatiquement** à l'heure d'ouverture.
- Le candidat peut ajouter un bonus (dans le plafond) à la publication ou plus tard.
- Dans la file, la demande est **anonymisée** : niveau, module, session, montant, ancienneté, présence du candidat. Aucun nom ni contact.

### 6.2 Prise : un assistant, un client
- Un assistant ne peut avoir **qu'une seule opération active**. Tant qu'il n'est pas libéré, la file lui est masquée.
- La prise est **atomique** : si deux assistants cliquent en même temps, un seul obtient la demande ; l'autre voit « Déjà prise ».
- À la prise, la demande disparaît de la file pour tous, en temps réel, et les identifiants deviennent visibles **pour cet assistant seulement**.
- **20 minutes** sans « Réservation effectuée » ⇒ la demande revient **en tête de file** ; l'assistant reçoit un avertissement. Le candidat peut aussi **se retirer** à tout moment et augmenter son bonus.

### 6.3 Réservation et libération
- L'assistant clique « Réservation effectuée » (capture facultative). Le candidat est notifié.
- **Candidat en ligne** : 15 min pour confirmer « J'ai reçu le mail ». **Hors ligne** : 5 min. Sans réponse, l'assistant est libéré et la demande passe « à confirmer ».
- Dès la confirmation : l'assistant est libéré et les informations de paiement s'affichent pour le candidat.
- Rappel au candidat : payer les frais d'examen au centre dans le délai officiel, sinon sa réservation est supprimée par le centre.

### 6.4 « Je n'ai pas reçu le mail »
Le litige ne s'ouvre qu'après avoir coché :
- boîte de réception de **l'adresse soumise** (affichée) vérifiée ;
- spams / courriers indésirables vérifiés ;
- onglets Promotions / Notifications / Autres vérifiés ;
- connexion au compte du centre : la réservation n'apparaît pas ;
- « Je comprends qu'un litige abusif me fera pénaliser ».

En litige, l'assistant doit fournir une preuve (capture). C'est le **seul** moment où une image est stockée. L'admin tranche. Litige abusif ⇒ avertissement au candidat ; assistant fautif ⇒ avertissement à l'assistant.

### 6.5 Règlement
- Le candidat voit deux dépôts : **part assistant** (compte de l'assistant) et **commission** (compte de la plateforme), avec montant et référence d'opération.
- Il déclare chaque dépôt « effectué ».
- L'assistant confirme « reçu » ; l'admin confirme la commission. Si un dépôt n'est pas reçu, le candidat est notifié et relancé.
- L'opération est **clôturée** quand **tous** les bénéficiaires du paiement ont confirmé.
- Rappels à H+1 et H+12 ; à **24 h** sans paiement déclaré et confirmé : **liste noire** et suspension jusqu'au règlement.
- La plateforme ne détient jamais l'argent : elle affiche les comptes et trace les confirmations.

### 6.6 Clôture
- Les identifiants du centre sont **effacés**. Conseil au candidat : changer son mot de passe.
- Historique conservé (statuts, horodatages, montants), sans données sensibles.

## 7. Anonymat

- Le candidat ne voit pas l'identité de l'assistant, seulement le compte de dépôt au moment du règlement.
- L'assistant ne voit que ce qui sert à réserver, et seulement pendant la prise.
- La plateforme connaît les deux : un assistant envoie sa pièce d'identité et son numéro Mobile Money, validés par l'admin avant sa première prise.

## 8. Présence

- Indicateur en ligne / hors ligne visible des deux côtés pendant une opération.
- La présence ne bloque jamais l'autre partie : les délais automatiques libèrent l'assistant ou remettent la demande en file.

## 9. Confiance et sanctions

| Événement | Conséquence |
|---|---|
| Assistant : 20 min dépassées | Avertissement |
| Litige abusif (candidat) | Avertissement |
| Assistant fautif en litige | Avertissement |
| 3 avertissements | Suspension du compte (levée par l'admin) |
| Impayé à 24 h | Liste noire + suspension jusqu'au règlement |
| Prise sans session active, fraude, partage d'identifiants | Bannissement |
| Litige ouvert contre un assistant | Il ne peut plus prendre de demande jusqu'à la décision |

- **Liste noire** : visible par les assistants, sans données sensibles (identifiant public du compte, niveau, date). Une demande d'un compte en liste noire est marquée et ne peut pas être prise.
- **Signaler un problème** : session erronée, abus d'un utilisateur, fraude, autre.

## 10. Consentements et conditions

À l'inscription et à chaque transaction :
- acceptation des CGU (mise en relation, arbitrage, remboursement en cas de faute) ;
- consentement au traitement des identifiants du centre, limité à la réservation ;
- pour un bénéficiaire tiers, attestation de son accord.

## 11. Back-office

- Vue temps réel : demandes publiées, prises, opérations en cours, litiges, impayés.
- Catalogue et réglages économiques par centre × niveau.
- Utilisateurs : rôles, avertissements, suspension, bannissement, révocation des sessions.
- Litiges : preuves, historique, décision.
- Demandes d'ajout et signalements.
- Journal d'audit de toutes les actions admin.

## 12. Hors MVP

- Paiement intégré (Mobile Money) et séquestre.
- Application mobile native, notifications push, notifications WhatsApp ou SMS.
- Vérification automatique de la réservation sur le site du centre.
- Landing page marketing (conçue à part).
