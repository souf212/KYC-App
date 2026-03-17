# Documentation Utilisateur : Application KYC (Digital Counter Terminal)

Bienvenue dans le guide d'utilisation de l'application KYC (Know Your Customer) pour terminaux de guichet numérique.
Cette application est conçue pour simplifier et sécuriser l'enrôlement de nouveaux clients en agence.

## Objectif de l'Application
Le but principal est de collecter les informations d'identification d'un client rapidement et sans erreur de saisie manuelle.
Le processus est presque 100% automatisé grâce à la lecture automatique des documents (OCR) et à la vérification faciale (Biométrie).

---

## Les Étapes du Processus (Onboarding)

### Étape 1 : Bienvenue
L'écran d'accueil présente l'application au client ou à l'agent. Il suffit de cliquer sur le bouton principal pour commencer le parcours.

### Étape 2 : Scan de la Pièce d'Identité (CIN)
L'agent utilise la caméra de la tablette pour prendre en photo la Carte Nationale d'Identité (CIN) du client.
- L'application demande d'abord de capturer le **Recto** (l'avant) de la carte.
- Ensuite, elle demande le **Verso** (l'arrière).
**Astuce :** Assurez-vous d'avoir une bonne lumière et d'éviter les reflets pour que le texte soit bien lisible.

### Étape 3 : Extraction Automatique des Données (OCR)
Dans cette étape, l'application analyse intelligemment les photos de la carte d'identité via une intelligence artificielle.
- Les données comme le Nom, Prénom, Numéro de CIN, Date et Ville de naissance, ou encore le sexe sont extraites toutes seules.
- Un écran de révision s'affiche : l'agent doit vérifier que l'IA a bien lu les informations.
- Si une information est incorrecte ou manquante (comme le numéro de téléphone), l'agent peut modifier ou compléter le texte manuellement.
- *Une fois validé, le profil du client est officiellement créé dans le système central.*

### Étape 4 : Vérification Faciale (Selfie & Liveness)
Pour des raisons de sécurité, nous devons nous assurer que la personne physiquement présente est bien celle sur la carte d'identité.
- L'application passe en mode "Caméra Frontale" pour prendre un Selfie du client.
- L'IA effectue un test de "Liveness" (preuve de vie) en demandant au client de cligner des yeux ou de tourner la tête légèrement. Cela empêche l'utilisation d'une photo imprimée pour tromper le système.
- Ensuite, l'IA compare le visage scanné avec la photo de la carte d'identité (Match Facial). Un score de similarité est affiché pour l'agent.

### Étape 5 : Signature
Le client utilise l'écran tactile (Tablet) pour déposer sa signature manuelle, validant ainsi légalement les conditions générales de l'ouverture de compte. 
Cette signature numérique est sauvegardée de manière sécurisée.

### Étape 6 : Révision et Confirmation Finale
L'agent vérifie un dernier récapitulatif global du dossier (Score biométrique, informations extraites, documents scannés, signature).
Il appuie sur "Finaliser" pour valider l'onboarding et transmettre le dossier complet au serveur bancaire.

---

## En cas de problème
- **Caméra bloquée :** Si l'écran est noir, assurez-vous que vous avez autorisé l'accès à la caméra dans les paramètres de la tablette.
- **Extraction OCR ratée :** Si les textes (Nom, Prénom...) sont vides après le scan, cela signifie que la photo était floue ou trop brillante. L'agent peut soit rescanner la carte, soit taper les informations à la main.
- **Vérification Faciale refusée :** Assurez-vous que le visage du client n'est pas à contre-jour et qu'il ne porte ni lunettes de soleil, ni masque.
