const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// Route globale pour le Dashboard
router.get('/global', statsController.getGlobalStats);

// Route hiérarchique: Cisco -> Communes
// GET /api/stats/cisco-commune/1
router.get('/cisco-commune/:cisco_id', statsController.getCiscoCommuneStats);

// Route dynamique pour gérer cisco, commune, zap, etablissement
// Exemples :
// GET /api/stats/cisco/1
// GET /api/stats/commune/2
// GET /api/stats/zap/3
router.get('/:type/:id', statsController.getStats);

module.exports = router;
