# Documentation Technique : APIs du Projet KYC

Cette documentation décrit les requêtes API (Endpoints) utilisées dans le projet KYC.
L'application Front-End (React Native) utilise la librairie `axios` pour communiquer avec un serveur back-end (ex: ASP.NET Core).

L'URL de base (Base URL) de l'API est configurée par défaut dans `src/services/api.js` pour pointer vers le serveur de développement: `http://192.168.11.130:5283/api/kyc`.

---

## 1. Création du Profil Client
Créé le profil initial du client dans la base de données avec les informations extraites par l'OCR.

- **Endpoint :** `POST /customer`
- **Content-Type :** `application/json`
- **Payload (Body) :**
  ```json
  {
    "firstName": "SOUFIANE",
    "lastName": "EL-OTMANI",
    "cin": "SA29163",
    "birthDate": "2001-05-29T00:00:00.000Z",
    "phone": "+212600000000",
    "address": "QUARTIER OUAHDANA BENI ENSAR"
  }
  ```
- **Réponse Succès (200 OK) :**
  Retourne l'identifiant unique (`customerId`) qui devra être utilisé pour toutes les requêtes subséquentes.
  ```json
  {
    "customerId": 105,
    "status": "success",
    "message": "Customer created successfully"
  }
  ```

---

## 2. Upload des Documents (Pièces d'identité)
Permet de transférer les images compressées (Recto/Verso de la CIN) de la tablette vers le serveur sécurisé en associant les fichiers au `customerId`.

- **Endpoint :** `POST /document`
- **Content-Type :** `multipart/form-data`
- **Paramètres Form-Data :**
  - `customerId` (Text): L'ID du client (ex: `"105"`)
  - `type` (Text): Le type de document (`cin_front`, `cin_back`, `passport`, etc.)
  - `file` (File): Le fichier binaire JPEG/PNG (image blob)
- **Réponse Succès (200 OK) :**
  ```json
  {
    "documentId": 5012,
    "status": "success"
  }
  ```

---

## 3. Analyse Biométrique et Liveness
Envoie de la photo du visage prise par la tablette vers un moteur ou service d'Intelligence Artificielle côté back-end qui va attribuer un score de similarité (avec l'image CIN) et un score de "preuve de vie" (Liveness).

- **Endpoint :** `POST /selfie`
- **Content-Type :** `multipart/form-data`
- **Paramètres Form-Data :**
  - `customerId` (Text): L'ID du client.
  - `file` (File): Le selfie en format JPEG compressé.
- **Réponse Succès (200 OK) :**
  Le back-end retourne les scores calculés :
  ```json
  {
    "biometricId": "bio_8829",
    "facialScore": 98.4,
    "livenessScore": 95.1,
    "status": "verified"
  }
  ```

---

## 4. Sauvegarde de la Signature
Envoi du tracé de la signature générée sur la tablette vers le dossier du client.

- **Endpoint :** `POST /signature`
- **Content-Type :** `multipart/form-data`
- **Paramètres Form-Data :**
  - `customerId` (Text): L'ID du client.
  - `signatureBase64` (Text): Le dessin vectorisé ou raster converti en chaîne `Base64` (`data:image/png;base64,iVBORw0KGgo...`)
- **Réponse Succès (200 OK) :**
  ```json
  {
    "status": "success",
    "message": "Signature saved"
  }
  ```

---

## 5. Soumission Finale (Clôture du Dossier)
Alerte le back-end que le KYC est terminé côté tablette. C'est à la réception de cet appel que le back-end compile le dossier complet, le verrouille, et peut entamer le processus asynchrone d'ouverture de compte.

- **Endpoint :** `POST /submit`
- **Content-Type :** `application/json`
- **Payload (Body) :**
  ```json
  {
    "customerId": 105
  }
  ```
- **Réponse Succès (200 OK) :**
  ```json
  {
    "customerId": 105,
    "status": "completed",
    "decision": "APPROVED",
    "message": "Dossier validé et enregistré"
  }
  ```

---

## Intégrations API Externes
Le composant Front-End utilise également le service REST gratuit **OCR.space** pour l'extraction de texte de l'image de la CIN :

- **Endpoint :** `POST https://api.ocr.space/parse/image`
- **Headers :** `Content-Type: multipart/form-data`
- **Important:** Limite de 1Mo par image et de 500 requêtes/jour pour la clé API test. L'application compresse les images localement à 800px max avant l'envoi vers cette route.
