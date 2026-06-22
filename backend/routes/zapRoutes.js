const express = require('express');
const router = express.Router();
const zapController = require('../controllers/zapController');

// CRUD ZAP avec pagination, recherche et filtres
router.get('/', zapController.getAllZaps);
router.post('/', zapController.createZap);
router.post('/import', zapController.importExcel);
router.get('/:id', zapController.getZapById);
router.put('/:id', zapController.updateZap);
router.delete('/:id', zapController.deleteZap);

// Statistiques enseignants par ZAP (total et répartition par statut)
router.get('/:id/statistiques', zapController.getStatistiques);

// Résumé des totaux de la ZAP
router.get('/:id/resume', zapController.getResume);

// Besoin recrutement pour une ZAP

router.get('/recrutement/:id', zapController.getBesoinRecrutement);

module.exports = router;
