const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

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
