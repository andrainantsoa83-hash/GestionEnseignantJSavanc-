const express = require('express');
const router = express.Router();
const communeController = require('../controllers/communeController');

router.get('/', communeController.getAllCommunes);
router.post('/', communeController.createCommune);
router.post('/import', communeController.importExcel);
router.get('/:id', communeController.getCommuneById);
router.put('/:id', communeController.updateCommune);
router.delete('/:id', communeController.deleteCommune);
router.get('/:id/statistiques', communeController.getStatistiques);
router.get('/:id/resume', communeController.getResume);
router.get('/recrutement/:id', communeController.getBesoinRecrutement);

module.exports = router;
