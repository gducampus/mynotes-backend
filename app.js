const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Important

const SECRET_KEY = "votre_cle_secrete";

// Utilisateurs avec mots de passe hachés
const users = [
  {
    id: 1,
    email: "john@example.com",
    password: bcrypt.hashSync("password123", 10),
    name: "John Doe",
  },
  {
    id: 2,
    email: "jane@example.com",
    password: bcrypt.hashSync("mypassword", 10),
    name: "Jane Smith",
  },
];

// Notes
const notes = [
  { id: 1, title: "Première note", content: "Ceci est une note de test" },
  { id: 2, title: "Deuxième note", content: "Un exemple de contenu" },
];

// ✅ Middleware JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
}

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: john@example.com
 *         password:
 *           type: string
 *           example: password123
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *     Note:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Ma première note
 *         content:
 *           type: string
 *           example: Ceci est le contenu de ma note
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification des utilisateurs
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Email ou mot de passe incorrect
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
  res.status(200).json({ token });
});

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Retourne la liste des notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
app.get('/notes', authenticateToken, (req, res) => {
  res.status(200).json(notes);
});

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Récupère une note par ID
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note récupérée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note non trouvée
 */
app.get('/notes/:id', authenticateToken, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ message: "Note non trouvée" });
  res.status(200).json(note);
});

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Crée une nouvelle note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       201:
 *         description: Note créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 */
app.post('/notes', authenticateToken, (req, res) => {
  const newNote = {
    id: notes.length + 1,
    title: req.body.title,
    content: req.body.content,
  };
  notes.push(newNote);
  res.status(201).json(newNote);
});

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Met à jour une note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Note'
 *     responses:
 *       200:
 *         description: Note mise à jour
 *       404:
 *         description: Note non trouvée
 */
app.put('/notes/:id', authenticateToken, (req, res) => {
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (!note) return res.status(404).json({ message: "Note non trouvée" });

  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;

  res.status(200).json(note);
});

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Supprime une note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note supprimée
 *       404:
 *         description: Note non trouvée
 */
app.delete('/notes/:id', authenticateToken, (req, res) => {
  const index = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Note non trouvée" });

  notes.splice(index, 1);
  res.status(200).json({ message: "Note supprimée avec succès" });
});

// Swagger config
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyNotes API',
      version: '1.0.0',
      description: 'API pour la gestion des notes personnelles',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    }
  },
  apis: ['./app.js'],
};
const openapiSpecification = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.listen(3000, () => {
  console.log('✅ Serveur lancé sur http://localhost:3000');
  console.log('📚 Swagger dispo sur http://localhost:3000/api-docs');
});
