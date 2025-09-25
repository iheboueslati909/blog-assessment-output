# Blog Collaboratif - MEAN Stack Test

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
### Commandes
- "npm i " pour installers les dépendances dans chaque projet.
- **Angular** ng serve 
- **Backends** npm run dev

