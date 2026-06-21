const express = require('express');
const router = express.Router();
const statistiqueController = require('../controllers/statistiqueController');

// Route GET pour récupérer les statistiques (COUNT GROUP BY statut) par cisco
router.get('/cisco/:id', statistiqueController.getStatsByCisco);

// Route GET pour récupérer les besoins en recrutement (cisco, commune, zap)
// Exemple d'appel: /api/statistiques/besoin/cisco/1
router.get('/besoin/:type/:id', statistiqueController.getBesoinRecrutement);

module.exports = router;
