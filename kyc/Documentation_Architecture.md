# Architecture & Relation Frontend-Backend : Application KYC

Ce document vulgarise la façon dont la tablette (Frontend) et le serveur bancaire (Backend) collaborent en temps réel pour constituer un dossier KYC sécurisé.

---

## 🏗️ 1. Vue d'Ensemble de l'Architecture
Le système repose sur une architecture "Client-Serveur" standard.

- **Le Frontend (Le Client)** : C'est l'application React Native installée sur le "Digital Counter Terminal" (la tablette en agence). Son rôle est de guider l'agent, d'utiliser le matériel (Caméra, Écran Tactile) pour capturer les documents, de faire l'extraction OCR, et de packager toutes les informations.
- **Le Backend (Le Serveur)** : C'est une API sécurisée (vraisemblablement développée en ASP.NET Core) hébergée sur les serveurs locaux ou cloud de la banque. Son rôle est de recevoir les données, de les stocker de façon cryptée dans la base de données, et de contacter les systèmes centraux de la banque (Core Banking System).

---

## 🔄 2. Le Flux de Communication (Le Workflow)

L'application ne s'autorise jamais à valider un profil toute seule, elle dialogue pas à pas avec le serveur. Voici l'anatomie de cette relation :

### Étape A : Soumission des données textuelles
Dès l'écran de prévisualisation OCR (`OCRPreviewScreen`), une fois que l'agent clique sur "Confirmer", la tablette initie la relation.
- **Requête HTTP** : La tablette envoie le nom, le prénom, le n° de CIN, etc., sous format texte (`JSON`) à la route `/api/kyc/customer`.
- **Réponse du Serveur** : Le serveur crée une ligne vide dans sa base de données et donne à la tablette un "Ticket Numérique" : l'identifiant unique `customerId` (ex: `ID n° 105`).

### Étape B : Transfert Lourd (Photos & Documents)
Maintenant que la tablette a le ticket `customerId = 105`, elle va vider sa mémoire temporaire vers le serveur.
- Elle prend la photo du **Recto de la CIN** (compressée), l'attache au ticket n°105, et l'envoie via `/api/kyc/document`.
- Elle prend la photo du **Verso de la CIN**, l'attache au même ticket n°105, et l'envoie.
- *Relation : Le serveur range ces images dans des serveurs de fichiers ultra-sécurisés (Blob Storage) et lie leurs adresses à l'ID 105.*

### Étape C : Le Test d'Intelligence Artificielle (Biométrie)
Sur l'écran Selfie (`SelfieScreen`), la tablette prend une photo frontale du client.
- **Requête** : La tablette envoie ce selfie via `/api/kyc/selfie`, toujours attaché au ticket `customerId = 105`.
- **Le rôle caché du Backend** : Ici, le serveur fait un travail lourd. Il prend la photo de la CIN envoyée à l'étape B, prend le selfie envoyé à l'étape C, et utilise un moteur d'Intelligence Artificielle (souvent Azure Face API ou AWS Rekognition) pour comparer les traits des deux visages.
- **Réponse du Serveur** : Il renvoie à la tablette les notes mathématiques de similarité (ex: `98.4% Match`). La tablette utilise ces données uniquement pour l'affichage à l'agent.

### Étape D : Accords Légaux
- L'agent fait signer le client sur l'écran tactile (`SignatureScreen`). La tablette convertit le dessin de la signature en un code texte (`Base64`) et l'envoie au serveur via `/api/kyc/signature`.

### Étape E : Fermeture du Sas de Données
Sur l'écran de Révision (`ReviewScreen`), l'agent clique sur "Soumettre le Dossier".
- **Requête finale** : La tablette ping la route `/api/kyc/submit` en disant *"J'ai terminé avec le ticket n°105, tu peux le verrouiller"*.
- **La relation s'arrête ici** : Le serveur ferme le dossier pour empêcher toute modification frauduleuse ultérieure.

---

## 🛡️ 3. Sécurité de cette Relation
- **Aucun Stockage Permanent** : L'application React Native ne sauvegarde AUCUNE photo d'identité ou selfie sur la galerie ou le disque dur de la tablette une fois l'envoi réussi. La tablette n'est "qu'un tuyau" vers le serveur.
- **Réseau Restreint (Intranet)** : L'adresse IP dans `src/services/api.js` (par ex. `192.168.11.130`) prouve que la tablette et le serveur communiquent souvent en "Local" sur le réseau WiFi sécurisé de l'agence bancaire (LAN), sans forcément passer par l'Internet public.
- **Légèreté (Compression)** : Grâce à `expo-image-manipulator`, la tablette écrase la résolution des photos issues des lentilles 4K/8K avant transfert. Cela empêche de saturer la bande passante du réseau de la banque si plusieurs guichets font des KYC en même temps.

---

## 🧱 4. Outils Techniques Connectant les Deux
- L'outil de liaison : **Axios**. Il gère les envois, surveille la progression (`UploadProgress`) pour les barres de chargement, et gère les erreurs ("Timeout" de 30 secondes si le réseau de l'agence plante).
- Format d'échange : **JSON** pour le texte classique, **Multipart/Form-Data** pour les fichiers lourds (les photos et la signature).
- **Le Cas OCR Spécial** : Pour la lecture de la carte d'identité, la tablette parle temporairement à un *serveur externe public* (OCR.space). Ce serveur lit l'image de la carte, renvoie un texte, mais la banque reste la seule à recevoir et conserver les photos et ces données au final.
