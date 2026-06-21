const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialisation de l'application Express
const app = express();

// Middlewares
app.use(cors()); // Autorise les requêtes Cross-Origin
app.use(express.json()); // Permet de parser le JSON dans le corps des requêtes
app.use(express.urlencoded({ extended: true }));

// Importation des routes
const enseignantRoutes = require('./routes/enseignantRoutes');

// Utilisation des routes
app.use('/api/enseignants', enseignantRoutes);

// Route de test de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API de gestion des statistiques des enseignants.' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
