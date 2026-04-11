# 📘 Manuel Technique "Éclats de Vue" : L'envers du décor

Ce manuel s'adresse aux futurs opérateurs ou administrateurs du Photoclub désirant comprendre le fonctionnement interne de l'application *Éclats de Vue / Expo-photo*, son déploiement, et son entretien.

---

## Chapitre 1 : L'Environnement Local (Votre Atelier)

Il est vital de comprendre que lorsque vous modifiez le code, vous le faites dans un **"Atelier Virtuel" local** sur votre ordinateur, invisible pour le reste du monde.

### Démarrer son atelier
Pour voir le site et tester vos modifications sans rien casser en ligne, vous devez "allumer le moteur" sur votre PC :
1. Ouvrez un **Terminal** via VS Code (Dans le menu : `Terminal > New Terminal`).
2. Assurez-vous d'être dans le dossier `Expo-photo`.
3. Tapez la commande : `npm run dev`
4. Une fois le succès indiqué, ouvrez votre navigateur internet classique et tapez l'adresse de votre atelier : **`http://localhost:3000`**

### Éteindre l'atelier
Dans le terminal où tourne le serveur, cliquez simplement à l'intérieur et appuyez sur **`Ctrl + C`** de votre clavier pour couper le moteur et libérer la mémoire.

> [!WARNING] 
> **Les secrets industriels (.env.local)**
> Le fichier nommé `.env.local` est le fichier le plus important du projet. Il contient les "mots de passe" pour se connecter à l'Intelligence Artificielle et à la Base de Données. Il n'est **JAMAIS** sauvegardé sur internet par sécurité. Si vous supprimez ce fichier, le mode local tombera en miettes.

---

## Chapitre 2 : La Machinerie (Les Technologies)

L'application repose sur quatre piliers (la "Stack" de développement) :

1. **Next.js & React (Le Moteur Web)** : C'est le chef d'orchestre. Il gère l'affichage des pages (fichiers terminant en `.tsx`) et s'occupe de faire la transition fluide entre une page d'Accueil et une page Audio sans rechargement lourd.
2. **Tailwind CSS (La Mode)** : Le langage graphique. Pensez-y comme la garde-robe du site. Dans les fichiers, les codes étranges comme `bg-slate-900` ou `text-xl` servent simplement à peindre les blocs sans faire de longs fichiers de style.
3. **Google Gemini (L'Intelligence)** : Le cerveau prêté par Google. L'application lui envoie votre photo via le fameux prompt de guidage, et il renvoie le texte d'audiodescription formaté.
4. **HTML Canvas (Le Dessinateur)** : Sous le capot de la page "Gérer la bibliothèque", l'application utilise une technologie de toile de peinture (`canvas`) pour dessiner virtuellement et télécharger les **cartels imprimables**.

---

## Chapitre 3 : La Salle des Coffres (Supabase)

Votre ordinateur ne contient aucune des photos ni aucun texte généré. Tout flotte dans la base de données cloud : **Supabase**.

- **Database (Table `artworks`)** : Là où dorment les textes, les numéros et les titres validés de vos photos sous forme d'un tableau géant.
- **Storage (Bucket `artworks`)** : Le disque dur où pèsent physiquement les images JPEG de vos créations.

### Le Gardien de Sécurité (Les "RLS")
Supabase est sécurisé par des politiques strictes appelées **RLS** (Row Level Security). Par défaut, il bloque les enregistrements ("Insert"), les suppressions ("Delete") et les modifications ("Update"). Pour permettre à votre page "Admin" d'interagir sans créer de comptes complexes, vous avez du déverrouiller ces règles dans la console SQL de Supabase (ex: `CREATE POLICY "Public can update artworks" ON artworks FOR UPDATE USING (true);`). Sans cela, la base de données aurait fait un rejet silencieux de chaque modification.

---

## Chapitre 4 : La Sauvegarde de Sécurité (GitHub)

Le code (et uniquement le code) est sauvegardé sur un coffre-fort appelé **GitHub**.

1. C'est l'outil **Git** qui s'en occupe. `git commit` ("fait une capture photo des changements") puis `git push` ("envoie les changements au nuage GitHub").
2. Vous vous demandez comment Git sait qu'il ne doit pas envoyer la base de données ou le fichier des mots de passe ?. C'est grâce au fameux fichier **`.gitignore`** qui joue le rôle de flic aux frontières et retient les fichiers lourds ou condidentiels (comme `node_modules` et `.env.local`).

---

## Chapitre 5 : L'Exposition au Public (Vercel)

Si GitHub est votre coffre-fort de sauvegarde, **Vercel** est votre Salle d'Exposition (Votre Hébergeur public).

La magie réside dans le lien entre les deux :
- **Vercel surveille GitHub 24h/24.**
- Lorsque vous modifiez du code chez vous (sur votre PC en Local), puis que vous l'expédiez sur GitHub avec un `git push`, GitHub prévient instantanément Vercel. 
- Vercel télécharge le nouveau code, le reconstruit surpuissamment (Le "Build"), et remplace la version publique du site (expo-photo.vercel.app) en moins d'une minute, sans aucune intervention de votre part !

---

## Chapitre 6 : Les Modifications Personnalisées (Où chercher ?)

Si dans quelques temps vous voulez améliorer l'outil, voici où se cachent les choses dans VS Code :

- **Le comportement de l'IA (Les limites, le ton)** : Allez dans le fichier `lib/prompt.ts`.
- **Le dessin du Cartel / PDF d'impression** : Allez dans le fichier `lib/cartel.ts`. Vous pourrez y modifier les tailles de police de la languette ou des textes d'impression.
- **La limitation de Taille des Photos téléchargées (Surcharge Admin)** : Allez dans `app/admin/page.tsx` et cherchez la ligne surveillant les "5 * 1024 * 1024".
- **Le mot de passe de la zone Espace Club** : Modifiez la variable `ADMIN_PASSWORD` dans Vercel (Environnement Variables) ET en local dans `.env.local` sur VS Code.

*— Fin de l'instruction tactique. Longue vie à votre code ! —*

<!-- Sync trigger -->
