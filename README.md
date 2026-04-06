# 📸 Éclats de Vue (Expo-Photo)

**Éclats de Vue** est une application web innovante conçue spécifiquement pour rendre les expositions photographiques accessibles aux personnes malvoyantes et non-voyantes, grâce à l'intervention de l'Intelligence Artificielle.

## 🌟 Le Concept
Dans une galerie physique, chaque photographie de l'exposition est accompagnée d'un **Cartel contenant un QR Code**. 
Lorsque le visiteur scanne ce code avec son smartphone, l'application s'ouvre et lit vocalement une **audiodescription riche, précise et poétique** de l'œuvre, générée et validée en amont par le photographe.

L'objectif est d'offrir l'expérience visuelle d'une photographie via les mots, en détaillant l'Aperçu, les Détails et l'Ambiance.

## 🚀 Fonctionnalités Clés
- **Espace Administrateur Sécurisé** : Gestion autonome de la bibliothèque d'œuvres par mot de passe.
- **Analyse IA Autonome** : Le pont entre l'application et Gemini 2.5 analyse les images uploadées et propose un texte structuré.
- **Édition Manuelle** : Le photographe conserve le contrôle moral sur l'œuvre et peut altérer, corriger et valider la proposition de l'IA (Titre, Numéro, Textes).
- **Générateur de Cartels A4** : Une usine interne génère de manière géométrique les cartels d'exposition finaux au format HD JPEG (comportant le scan QR), prêts à être imprimés sur des planches A4 au massicot.
- **Accessibilité Native** : Lecteur vocal automatique `TTS (Text-to-Speech)` doté d'un dictionnaire phonétique (exemple : "veston en jean" prononcé correctement et non "veston de mon ami Jean").

## 🛠️ Stack Technique
Cette maquette est bâtie sur la fine fleur des technologies modernes :
- **Framework** : [Next.js](https://nextjs.org/) (App Router) en TypeScript.
- **Style** : Tailwind CSS pour un design dynamique et moderne.
- **Base de Données et Stockage** : [Supabase](https://supabase.com/) (PostgreSQL + Storage buckets) avec règles RLS agressives pour protéger les modifications manuelles.
- **Cerveau IA** : Google Gemini-2.5-Flash via le SDK officiel de Generative AI.
- **Canva Numérique** : Utilisation de l'API HTML5 `<canvas>` couplée à `qrcode` pour le rendu graphique des étiquettes (Cartels) directement dans le navigateur du gestionnaire.

## ⚙️ Installation Globale

Pour faire tourner ce projet sur un ordinateur vierge :

1. Git Clone du projet.
2. Installer les paquets `npm install`.
3. Créer un fichier `.env.local` nécessitant 3 clés maîtresses :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_lien_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
GEMINI_API_KEY=votre_cle_google_ai_studio
ADMIN_PASSWORD=mot_de_passe_de_la_galerie
```
4. Lancer le site en mode local : `npm run dev`

---
*Projet développé avec passion pour la communauté des photo-clubs et l'accès universel à l'art.*
