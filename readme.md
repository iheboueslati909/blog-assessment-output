# Blog Collaboratif - MEAN Stack Test

<img width="1913" height="863" alt="login screen" src="https://github.com/user-attachments/assets/22beeaa8-b652-4263-b337-1e59d47e87aa" />


## Stack & Temps
- **Frontend**: Angular v20, Socket.io, Toastr  
- **Backend**: Node.js, Express.js, MongoDB, Redis, Microservices  
- **Architecture**: 3 microservices (Auth, Article, Notification) + 1 frontend  
- **Temps estimé**: 18h  

---

## Fonctionnalités

### 1. Authentification & Permissions
- Inscription / Connexion avec **JWT + Refresh Token**  
- **Access Token** en mémoire Angular (court-terme), sécurisé avec HttpOnly + `use-strict`  
- Rôles & permissions (Admin, Éditeur, Auteur) gérés côté **backend (middlewares)** et **frontend (guards)**  
- Admin peut gérer les rôles utilisateurs dans le backoffice (Sidebar → Manage Users)  
- Seeder Pour initialiser des utilisateurs de test
- 
### 2. Gestion des Articles
- Création d’articles avec **titre, contenu, image, tags**  
- **Éditeurs/Admins** → peuvent éditer tous les articles  
- **Auteurs** → peuvent éditer uniquement leurs propres articles  
- **Admin** → seul à pouvoir supprimer des articles  

### 3. Commentaires & Notifications
- Commentaires imbriqués (réponses incluses) stockés en base  
- **Notifications temps réel** avec Socket.io :  
  - Article-MS publie un évènement apres la création du commentaire en DB, via **Redis Event Bus**  
  - Notification-MS reçoit l’évènement et notifie le frontend via Socket.io  
  - Notifications affichées en sidebar (non persistées pour l’instant, just en memoir angular)  

### 4. Sécurité & Bonnes pratiques
- Mots de passe et tokens **hachés en base**  
- **CORS activé** 
- Upload d’images abstrait → stockage local ou cloud (S3) selon l’environnement  
- Un système de rate limiting est configuré pour limiter les abus
---

## Structure du Projet
Chaque microservice est dans un repository séparé ( pour consulter l'historique du commits ) OU code finale dans cette repository aussi :  
- **Frontend Angular** → [\[lien du repo frontend\]  ](https://github.com/iheboueslati909/blog-assessment-front)
- **Auth-MS** → [\[lien du repo auth-ms\]  ](https://github.com/iheboueslati909/auth-backend-expressjs)
- **Article-MS** → [\[lien du repo article-ms\] ](https://github.com/iheboueslati909/blog-assessment-products-api) 
- **Notification-MS** → [\[lien du repo notification-ms\]  ](https://github.com/iheboueslati909/blog-assessment-notification)

## Installation & Lancement
### Prérequis
- Node.js >= 18
- MongoDB
- Redis (dockerisé recommandé)
## Seeder
Pour initialiser des utilisateurs de test (1 par rôle), exécuter : node src/scripts/seed-users.js
Comptes créés par défaut
Admin → email: admin@example.com / password: admin123
Éditeur → email: editor@example.com / password: editor123
Lecteur → email: author@example.com / password: author123
### Commandes
- "npm i " pour installers les dépendances dans chaque projet.
- **Angular** ng serve 
- **Backends** npm run dev

