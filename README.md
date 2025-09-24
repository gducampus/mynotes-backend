# Backend MyNotes

Ce projet est le backend pour l’application **MyNotes**, destiné aux étudiants du Learning Campus pour leurs projets frontend.  
Il fournit une API RESTful sécurisée avec **JWT** pour gérer une liste de notes personnelles (CRUD complet).

## Commencer

Ces instructions vous permettront d’obtenir une copie du projet en cours d’exécution sur votre machine locale à des fins de développement et de test.

### Prérequis

Pour exécuter ce projet, vous aurez besoin de **Node.js** et **npm** installés sur votre machine.  
Vous pouvez télécharger Node.js et npm à partir d’[ici](https://nodejs.org/en/download).

### Installation

Suivez ces étapes pour configurer le backend sur votre machine locale :

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/votre-compte/MyNotesBackend
   ```

2. **Installer les dépendances**

   ```bash
   cd MyNotesBackend
   npm install
   ```

   Cette commande installera les dépendances nécessaires pour exécuter le backend.

3. **Démarrer le serveur**

   En mode normal :

   ```bash
   npm start
   ```

   En mode développement (avec rechargement automatique grâce à **nodemon**) :

   ```bash
   npm run dev
   ```

   Le serveur sera accessible localement à l’adresse :  
   👉 `http://localhost:3000`

## Utilisation

### 🔑 Authentification

- **Endpoint** : `POST /login`  
- **Corps de la requête (JSON)** :

  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **Réponse** (exemple) :

  ```json
  {
    "token": "votre_jwt_token"
  }
  ```

Le **token JWT** devra être utilisé pour accéder aux routes sécurisées.

---

### 📝 Gestion des notes (protégé par JWT)

Toutes les routes `/notes` nécessitent un **token JWT** dans l’entête HTTP :  

```
Authorization: Bearer <token>
```

#### Récupérer toutes les notes
```http
GET /notes
```

#### Créer une note
```http
POST /notes
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Nouvelle note",
  "content": "Contenu de ma note"
}
```

#### Récupérer une note par ID
```http
GET /notes/{id}
```

#### Mettre à jour une note
```http
PUT /notes/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Titre mis à jour",
  "content": "Contenu mis à jour"
}
```

#### Supprimer une note
```http
DELETE /notes/{id}
```

---

### 📚 Documentation Swagger

Une documentation interactive de l’API est disponible à l’adresse suivante après avoir démarré le serveur :  
👉 [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
