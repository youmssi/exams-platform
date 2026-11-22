### EXM-017 — Emails réellement envoyés, politique de confidentialité, écrans allégés

**Type :** fix · **Dépendances :** EXM-002, EXM-005 · **Taille :** S

#### Pourquoi
- Les codes de connexion ne partaient pas en production : le SDK Resend ne trouvait pas son moteur de rendu une fois l'app bundlée, et Better Auth journalisait l'erreur sans la remonter.
- La vérification Google refuse l'app tant que `/privacy` n'existe pas avec un contenu suffisant.
- Retours du test de bout en bout et de l'UX : trop de texte sur les écrans ; la publication ne s'ouvrait pas après la création d'une session ; mise en page serrée sur téléphone.

#### Critères d'acceptation
- [ ] Les emails sont rendus par l'app (HTML + texte brut) puis envoyés ; l'envoi est visible dans Resend.
- [ ] `/privacy` détaille les données collectées, l'usage des données Google (périmètres openid, email, profile ; Limited Use), le partage, les sous-traitants, la conservation, la sécurité, les droits et le contact (contact@mrvin100.de) ; `/terms` séparée ; liens vers les deux depuis la connexion.
- [ ] Après « Ajouter une session », la fenêtre de publication s'ouvre sur la session créée.
- [ ] Sur téléphone, les sessions affichent badge, dates complètes et actions sans chevauchement.

#### Critères d'acceptation UX
- [ ] Textes raccourcis : un titre, au plus une phrase courte, des aides de champ de quelques mots. [CONT-11, CONT-16, CONT-14]
- [ ] Les politiques sont accessibles depuis chaque écran de consentement. [TRUST-11, TRUST-20]
- [ ] Les dates ne sont jamais tronquées. [STATE-14]
