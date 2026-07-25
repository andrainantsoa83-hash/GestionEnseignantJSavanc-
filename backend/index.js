const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialisation de la base de données
const initDB = async () => {
  try {
    const [rows] = await db.query('SELECT COUNT(*) as count FROM utilisateur');
    if (rows[0].count === 0) {
      console.log('Aucun utilisateur trouvé. Création de l\'administrateur par défaut...');
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash('Admin@123', salt);
      
      await db.query(
        'INSERT INTO utilisateur (nom, role, code_service, password_hash) VALUES (?, ?, ?, ?)',
        ['Administrateur DREN', 'DIRECTEUR_DREN', 'ADMIN001', password_hash]
      );
      console.log('Administrateur DREN créé avec succès (ADMIN001 / Admin@123).');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la DB:', error);
  }
};
initDB();

// Importation des routes
const enseignantRoutes = require('./routes/enseignantRoutes');
const statistiqueRoutes = require('./routes/statistiqueRoutes');
const communeRoutes = require('./routes/communeRoutes');
const zapRoutes = require('./routes/zapRoutes');
const etablissementRoutes = require('./routes/etablissementRoutes');
const ciscoRoutes = require('./routes/ciscoRoutes');
const statsRoutes = require('./routes/statsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const authRoutes = require('./routes/authRoutes');

// Utilisation des routes
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/statistiques', statistiqueRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/communes', communeRoutes);
app.use('/api/zaps', zapRoutes);
app.use('/api/etablissements', etablissementRoutes);
app.use('/api/ciscos', ciscoRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.status(200).send('API OK');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
