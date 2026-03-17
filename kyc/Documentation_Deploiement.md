# Documentation : Déployer et Installer l'Application sur Android (APK)

Puisque l'application est construite avec **Expo** et **React Native**, la méthode la plus simple et **gratuite** pour générer une application installable (`.apk`) pour votre téléphone Android est d'utiliser les serveurs cloud d'Expo via l'outil **EAS Build** (Expo Application Services).

Voici les étapes exactes à suivre sur votre ordinateur :

---

## Étape 1 : Créer un compte Expo (Gratuit)
Si vous n'en avez pas déjà un, allez sur le site officiel d'Expo et créez un compte gratuit :
👉 [https://expo.dev/signup](https://expo.dev/signup)

## Étape 2 : Installer l'outil de Build (EAS CLI)
Ouvrez un nouveau terminal sur votre PC et installez l'outil de compilation d'Expo de manière globale sur votre machine :

```bash
npm install -g eas-cli
```

## Étape 3 : Se connecter à votre compte
Une fois l'installation terminée, connectez-vous depuis votre terminal en tapant :

```bash
eas login
```
*Il vous demandera votre nom d'utilisateur et votre mot de passe créé à l'Étape 1.*

## Étape 4 : Configurer le projet pour Android
Dans le terminal, assurez-vous d'être dans le dossier de votre projet (`kyc`) :
```bash
cd C:\Users\souf2\Desktop\Github\KYC-App\kyc
```

Puis, tapez la commande suivante pour initialiser la configuration de build :
```bash
eas build:configure
```
*L'outil va générer un fichier `eas.json` à la racine de votre projet. C'est normal.*

## Étape 5 : Lancer la création de l'APK (Le Build Cloud)
Pour générer un fichier `.apk` (qui s'installe directement via clé USB ou téléchargement au lieu du Play Store), tapez cette commande magique :

```bash
eas build -p android --profile preview
```

**Que va-t-il se passer ?**
1. Votre code va être envoyé de manière cryptée sur les serveurs d'Expo.
2. Les super-ordinateurs d'Expo vont compiler le code Android (cela prend généralement entre 5 et 10 minutes).
3. À la fin, le terminal va afficher un **Lien URL** et un **QR Code**.

---

## Étape 6 : Installer sur votre Téléphone Android

Vous avez deux options pour récupérer le fichier sur votre téléphone :
- **Option A (Le plus simple)** : Ouvrez l'appareil photo de votre téléphone Android, scannez le **QR Code** affiché dans votre terminal. Cela va ouvrir votre navigateur web et télécharger directement le fichier `kyc.apk`.
- **Option B** : Cliquez sur le lien URL dans le terminal, téléchargez le fichier `.apk` sur votre PC, puis transférez-le sur votre téléphone via un câble USB ou par email.

**L'Installation :**
1. Sur votre téléphone, cliquez sur le fichier `.apk` téléchargé.
2. Android va probablement vous afficher un message de sécurité : *"Pour votre sécurité, votre téléphone n'est pas autorisé à installer des applications inconnues de cette source"*.
3. Cliquez sur **Paramètres** et activez **"Autoriser depuis cette source"**.
4. Revenez en arrière et cliquez sur **Installer**.

C'est fait ! L'application KYC est maintenant installée comme une vraie application native sur votre téléphone d'agence.
