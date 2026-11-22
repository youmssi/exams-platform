### EXM-016 — Durcissement de la connexion (retours du test de bout en bout)

**Type :** fix · **Dépendances :** EXM-002 · **Taille :** S

#### Pourquoi
Le test de bout en bout sur la preview (base `dev`, emails réels) a montré deux défauts : les codes par email étaient stockés en clair en base, et la liste des appareils affichait la chaîne technique brute du navigateur.

#### Critères d'acceptation
- [ ] Les codes par email sont stockés hachés (`storeOTP: "hashed"`) ; un code ne peut plus être lu en base.
- [ ] « Appareils connectés » affiche un libellé lisible (« Chrome · Android »), calculé par une fonction pure testée ; « Appareil inconnu » sinon.

#### Critères d'acceptation UX
- [ ] Chaque appareil est identifiable d'un coup d'œil, sans jargon technique. [CONT-02, TRUST-17]

#### Hors périmètre
Géolocalisation approximative des sessions.
